export interface TransactionalEmailPort {
  sendEmailVerificationOtp(input: {
    toEmail: string;
    recipientName?: string;
    otp: string;
  }): Promise<void>;

  sendPasswordResetEmail(input: {
    toEmail: string;
    recipientName?: string;
    resetUrl: string;
  }): Promise<void>;
}
