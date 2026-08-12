// infrastructure/services/otplib-totp.service.ts

import { Injectable } from '@nestjs/common';

import { authenticator } from '@otplib/preset-default';

import type { TotpPort } from '../../application/ports/totp.port';

@Injectable()
export class OtplibTotpService implements TotpPort {
  verify(params: {
    secret: string;

    token: string;
  }): Promise<boolean> {
    const isValid = authenticator.verify({
      secret: params.secret,

      token: params.token,
    });

    return Promise.resolve(isValid);
  }
}
