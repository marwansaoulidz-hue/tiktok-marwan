import {
  WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, ConnectedSocket, MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { config } from '../config';
import { MessagesService } from './messages.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagesGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;
  private onlineUsers = new Map<string, string>();

  constructor(
    private jwt: JwtService,
    private messages: MessagesService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) { client.disconnect(); return; }
      const payload = this.jwt.verify(token, { secret: config.jwtSecret });
      client.data.userId = payload.sub;
      this.onlineUsers.set(payload.sub, client.id);
      this.server.emit('presence', { userId: payload.sub, online: true });
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('joinConversation')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    client.join(`conv:${data.conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content?: string; gifUrl?: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;
    const message = await this.messages.sendMessage(userId, data.conversationId, data.content, data.gifUrl);
    this.server.to(`conv:${data.conversationId}`).emit('newMessage', message);
    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    client.to(`conv:${data.conversationId}`).emit('typing', { userId: client.data.userId });
  }
}
