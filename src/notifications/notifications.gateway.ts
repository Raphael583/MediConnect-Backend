import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket, Server } from 'socket.io';
import { Inject, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private logger = new Logger('NotificationsGateway');

  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {}

  server: Server;

  // 🔥 FIX: bind server instance
  afterInit(server: Server) {
    this.server = server;
    this.logger.log('Socket.IO server initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        this.logger.error('No token provided. Disconnecting client.');
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;

      const doctorId = payload.doctorId; // adjust if needed

      if (doctorId) {
        const room = `doctor:${doctorId}`;
        client.join(room);
        this.logger.log(`Doctor ${doctorId} joined room ${room}`);
      }

      this.logger.log('Client connected successfully.');
    } catch (err) {
      this.logger.error('Socket auth failed:', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Client disconnected');
  }

  emitToDoctor(doctorId: string, event: string, payload: any) {
    const room = `doctor:${doctorId}`;
    this.logger.log(`Emitting ${event} to room ${room}`);
    this.server.to(room).emit(event, payload);
  }
}
