// application/ports/totp.port.ts

export interface TotpPort {
  // 🔐 verify authenticator code
  verify(params: {
    secret: string;

    token: string;
  }): Promise<boolean>;
}
