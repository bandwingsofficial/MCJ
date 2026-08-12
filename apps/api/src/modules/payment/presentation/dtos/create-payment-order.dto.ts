import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentOrderDto {
  @ApiProperty()
  @IsUUID()
  enrollmentId!: string;
}
