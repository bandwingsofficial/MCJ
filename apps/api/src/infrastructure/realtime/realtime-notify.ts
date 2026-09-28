import type { RealtimeDomainMutationPayload } from '@mcj/shared-constants';

import type { RealtimePublisher } from './realtime.publisher';

let publisher: RealtimePublisher | null = null;

export function bindRealtimePublisher(next: RealtimePublisher): void {
  publisher = next;
}

export function notifyDomainMutation(
  payload: RealtimeDomainMutationPayload,
): void {
  publisher?.publishDomainMutation(payload);
}
