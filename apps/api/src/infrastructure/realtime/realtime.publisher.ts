import { Injectable, Logger } from '@nestjs/common';
import {
  REALTIME_EVENT,
  type RealtimeDomainMutationPayload,
} from '@mcj/shared-constants';

import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class RealtimePublisher {
  private readonly logger = new Logger(RealtimePublisher.name);

  constructor(private readonly gateway: RealtimeGateway) {}

  publishDomainMutation(payload: RealtimeDomainMutationPayload): void {
    try {
      this.gateway.broadcast(REALTIME_EVENT.DOMAIN_MUTATION, payload);
    } catch (error) {
      this.logger.warn(
        `Failed to publish realtime event for ${payload.domain}:${payload.action}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
