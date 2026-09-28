import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  REALTIME_SOCKET_NAMESPACE,
  type RealtimeEventName,
} from '@mcj/shared-constants';
import type { Server, Socket } from 'socket.io';

type RealtimeJwtPayload = {
  sub?: string;
  typ?: string;
  type?: string;
};

@WebSocketGateway({
  namespace: REALTIME_SOCKET_NAMESPACE,
  cors: {
    origin: true,
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket): Promise<void> {
    const token = this.extractAccessToken(client);

    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<RealtimeJwtPayload>(
        token,
        { algorithms: ['HS256'] },
      );

      const tokenType = payload.typ ?? payload.type;
      if (tokenType && tokenType !== 'access') {
        client.disconnect(true);
        return;
      }

      if (payload.sub) {
        client.data.userId = payload.sub;
      }

      await client.join('authenticated');
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Realtime client disconnected: ${client.id}`);
  }

  broadcast<TPayload extends object>(
    event: RealtimeEventName,
    payload: TPayload,
  ): void {
    if (!this.server) {
      return;
    }

    this.server.to('authenticated').emit(event, payload);
  }

  private extractAccessToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) {
      return authToken.trim();
    }

    const header = client.handshake.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice('Bearer '.length).trim();
    }

    return null;
  }
}
