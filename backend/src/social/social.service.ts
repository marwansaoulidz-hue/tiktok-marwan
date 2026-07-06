import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  async toggleLike(userId: string, videoId: string) {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Vidéo introuvable');

    const existing = await this.prisma.like.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });
    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      return { liked: false };
    }
    await this.prisma.like.create({ data: { userId, videoId } });
    return { liked: true };
  }

  async addComment(userId: string, videoId: string, content: string) {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Vidéo introuvable');
    return this.prisma.comment.create({
      data: { userId, videoId, content },
      include: { user: { include: { profile: true } } },
    });
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Commentaire introuvable');
    if (comment.userId !== userId) throw new ForbiddenException();
    await this.prisma.comment.delete({ where: { id: commentId } });
    return { ok: true };
  }

  async getComments(videoId: string) {
    return this.prisma.comment.findMany({
      where: { videoId },
      orderBy: { createdAt: 'desc' },
      include: { user: { include: { profile: true } } },
    });
  }

  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) throw new ConflictException('Impossible de vous suivre');
    const target = await this.prisma.user.findUnique({ where: { id: followingId } });
    if (!target) throw new NotFoundException('Utilisateur introuvable');

    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (existing) {
      await this.prisma.follow.delete({ where: { id: existing.id } });
      return { following: false };
    }
    await this.prisma.follow.create({ data: { followerId, followingId } });
    return { following: true };
  }

  async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) throw new ConflictException();
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });
    if (existing) throw new ConflictException('Demande déjà existante');
    return this.prisma.friendship.create({ data: { senderId, receiverId } });
  }

  async respondFriendRequest(userId: string, requestId: string, accept: boolean) {
    const req = await this.prisma.friendship.findUnique({ where: { id: requestId } });
    if (!req || req.receiverId !== userId) throw new NotFoundException();
    return this.prisma.friendship.update({
      where: { id: requestId },
      data: { status: accept ? 'ACCEPTED' : 'BLOCKED' },
    });
  }

  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
    });
    return friendships.map(f => f.senderId === userId ? f.receiver : f.sender);
  }

  async report(userId: string, videoId: string, reason: string) {
    return this.prisma.report.create({ data: { reporterId: userId, videoId, reason } });
  }
}
