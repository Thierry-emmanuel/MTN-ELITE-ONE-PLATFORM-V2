import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class WebsocketGateway {
  @WebSocketServer()
  server: Server;

  // Rooms are named `award-${id}` so vote tallies can be scoped per award
  // instead of broadcast to every connected client. Public VotingPanel and
  // the admin nominations panel both call this when they open an award.
  @SubscribeMessage('join_award')
  joinAward(@ConnectedSocket() client: Socket, @MessageBody() awardId: number) {
    client.join(`award-${awardId}`);
  }

  @SubscribeMessage('leave_award')
  leaveAward(@ConnectedSocket() client: Socket, @MessageBody() awardId: number) {
    client.leave(`award-${awardId}`);
  }
}