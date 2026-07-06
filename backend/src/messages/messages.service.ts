import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { config } from '../config';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            members: { include: { user: { include: { profile: true } } } },
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
    });

    return memberships.map(m => {
      const other = m.conversation.members.find(mem => mem.userId !== userId);
      const lastMsg = m.conversation.messages[0];
      const unread = lastMsg && (!m.lastReadAt || lastMsg.createdAt > m.lastReadAt) && lastMsg.senderId !== userId;
      return {
        id: m.conversation.id,
        otherUser: other?.user,
        lastMessage: lastMsg,
        unread,
      };
    });
  }

  async getOrCreateConversation(userId: string, otherUserId: string) {
    const existing = await this.prisma.conversation.findFirst({
      where: {
        members: { every: { userId: { in: [userId, otherUserId] } } },
        AND: [{ members: { some: { userId } } }, { members: { some: { userId: otherUserId } } }],
      },
      include: { members: { include: { user: { include: { profile: true } } } } },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        members: {
          create: [{ userId }, { userId: otherUserId }],
        },
      },
      include: { members: { include: { user: { include: { profile: true } } } } },
    });
  }

  async getMessages(userId: string, conversationId: string) {
    const member = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!member) throw new ForbiddenException();

    await this.prisma.conversationMember.update({
      where: { id: member.id },
      data: { lastReadAt: new Date() },
    });

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { include: { profile: true } } },
    });
  }

  async sendMessage(userId: string, conversationId: string, content?: string, gifUrl?: string) {
    const member = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!member) throw new ForbiddenException();
    if (!content && !gifUrl) throw new NotFoundException('Message vide');

    const message = await this.prisma.message.create({
      data: { conversationId, senderId: userId, content, gifUrl },
      include: { sender: { include: { profile: true } } },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async searchGifs(q: string) {
    if (!config.giphyApiKey) {
      return { data: [], meta: { msg: 'GIPHY_API_KEY non configurée' } };
    }
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${config.giphyApiKey}&q=${encodeURIComponent(q)}&limit=20&rating=pg-13`;
    const res = await fetch(url);
    const json = await res.json();
    return {
      data: (json.data || []).map((g: any) => ({
        id: g.id,
        url: g.images.fixed_height.url,
        preview: g.images.preview_gif.url,
      })),
    };
  }
}
