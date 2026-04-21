import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TaskDocument } from '../tasks/domain/task.schema';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  handleConnection(client: Socket): void {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { workspaceId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const room = `workspace:${data.workspaceId}`;
    void client.join(room);
    this.logger.log(`Cliente ${client.id} entrou na sala ${room}`);
  }

  @SubscribeMessage('leave')
  handleLeave(
    @MessageBody() data: { workspaceId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const room = `workspace:${data.workspaceId}`;
    void client.leave(room);
    this.logger.log(`Cliente ${client.id} saiu da sala ${room}`);
  }

  emitTaskUpdated(workspaceId: string, task: TaskDocument): void {
    this.server.to(`workspace:${workspaceId}`).emit('task:updated', task);
  }
}
