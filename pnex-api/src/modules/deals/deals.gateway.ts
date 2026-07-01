import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/deals',
})
export class DealsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(DealsGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  broadcastDealCreated(deal: any) {
    this.server.emit('deal.created', { deal });
  }

  broadcastOfferPlaced(dealId: string, offer: { userId: string; price: number }) {
    this.server.emit('deal.offer.placed', { dealId, offer });
  }

  broadcastOfferAccepted(deal: any) {
    this.server.emit('deal.closed', {
      dealId: deal.id || deal._id?.toString(),
      deal,
    });
  }

  broadcastDealCancelled(dealId: string) {
    this.server.emit('deal.cancelled', { dealId });
  }
}
