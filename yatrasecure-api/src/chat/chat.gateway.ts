import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
}

interface JoinRoomPayload {
  tripId: string;
}

interface SendMessagePayload {
  tripId: string;
  content: string;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private chatService: ChatService,
    private prisma: PrismaService,
  ) {}

  // Client connects
  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromSocket(client);
      if (!token) return client.disconnect();

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          username: true,
        },
      });

      if (!user) {
        client.disconnect();
        return;
      }

      (client as any).user = user;
      client.emit('connected', { userId: user.id, username: user.username });
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // optional: broadcast user offline
  }

  private extractTokenFromSocket(client: Socket): string | null {
    // Expect token in query ?token=... OR auth header
    const tokenFromQuery = client.handshake.query?.token;
    if (typeof tokenFromQuery === 'string') return tokenFromQuery;

    const authHeader = client.handshake.headers['authorization'];
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }

    return null;
  }

  // Client joins a trip room
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomPayload,
  ) {
    const user = (client as any).user;
    if (!user) return client.disconnect();

    const { tripId } = data;

    // ensure membership
    const member = await this.prisma.tripMember.findUnique({
      where: {
        tripId_userId: { tripId, userId: user.id },
      },
    });

    if (!member) {
      return client.emit('error', { message: 'Not a member of this trip' });
    }

    client.join(tripId);
    client.emit('joinedRoom', { tripId });
  }

  // Client sends message
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessagePayload,
  ) {
    const user = (client as any).user;
    if (!user) return client.disconnect();

    const { tripId, content } = data;

    await this.chatService.ensureIsMember(tripId, user.id);

    // Save to DB (Mongo)
    const msg = await this.chatService.sendMessage(tripId, user.id, user.username, content);

    // Broadcast to everyone in this trip room
    const obj = msg.toObject ? msg.toObject() : (msg as any);

this.server.to(tripId).emit('newMessage', {
  id: obj._id?.toString?.() ?? obj._id,
  tripId: obj.tripId,
  userId: obj.userId,
  username: obj.username,
  content: obj.content,
  createdAt: obj.createdAt,
});

  }
}
