import { Global, Module, OnModuleInit } from '@nestjs/common';

import { AuthModule } from '../../modules/auth/auth.module';

import { RealtimeGateway } from './realtime.gateway';
import { bindRealtimePublisher } from './realtime-notify';
import { RealtimePublisher } from './realtime.publisher';

@Global()
@Module({
  imports: [AuthModule],
  providers: [RealtimeGateway, RealtimePublisher],
  exports: [RealtimePublisher],
})
export class RealtimeModule implements OnModuleInit {
  constructor(private readonly realtimePublisher: RealtimePublisher) {}

  onModuleInit(): void {
    bindRealtimePublisher(this.realtimePublisher);
  }
}
