import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface BrevoSendPayload {
  sender: { name: string; email: string };
  to: Array<{ email: string; name?: string }>;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

@Injectable()
export class BrevoEmailService {
  private readonly logger = new Logger(BrevoEmailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendEmailVerificationOtp(input: {
    toEmail: string;
    recipientName?: string;
    otp: string;
  }): Promise<void> {
    const subject = 'Verify your MCJ Academy email';
    const htmlContent = `
      <p>Hello${input.recipientName ? ` ${this.escapeHtml(input.recipientName)}` : ''},</p>
      <p>Your email verification code is:</p>
      <p style="font-size:24px;font-weight:700;letter-spacing:4px;">${this.escapeHtml(input.otp)}</p>
      <p>This code expires in 5 minutes. If you did not request this, you can ignore this email.</p>
    `;
    const textContent = `Your MCJ Academy verification code is ${input.otp}. It expires in 5 minutes.`;

    await this.sendTransactionalEmail({
      toEmail: input.toEmail,
      toName: input.recipientName,
      subject,
      htmlContent,
      textContent,
    });
  }

  async sendPasswordResetOtp(input: {
    toEmail: string;
    recipientName?: string;
    otp: string;
  }): Promise<void> {
    const subject = 'Your MCJ Academy password reset code';
    const htmlContent = `
      <p>Hello${input.recipientName ? ` ${this.escapeHtml(input.recipientName)}` : ''},</p>
      <p>Your password reset code is:</p>
      <p style="font-size:24px;font-weight:700;letter-spacing:4px;">${this.escapeHtml(input.otp)}</p>
      <p>This code expires in 5 minutes. If you did not request a password reset, you can ignore this email.</p>
    `;
    const textContent = `Your MCJ Academy password reset code is ${input.otp}. It expires in 5 minutes.`;

    await this.sendTransactionalEmail({
      toEmail: input.toEmail,
      toName: input.recipientName,
      subject,
      htmlContent,
      textContent,
    });
  }

  async sendPasswordResetEmail(input: {
    toEmail: string;
    recipientName?: string;
    resetUrl: string;
  }): Promise<void> {
    const subject = 'Reset your MCJ Academy password';
    const htmlContent = `
      <p>Hello${input.recipientName ? ` ${this.escapeHtml(input.recipientName)}` : ''},</p>
      <p>We received a request to reset your password. Click the link below to choose a new password:</p>
      <p><a href="${this.escapeHtml(input.resetUrl)}">Reset password</a></p>
      <p>This link expires in 60 minutes and can only be used once. If you did not request a reset, ignore this email.</p>
    `;
    const textContent = `Reset your password: ${input.resetUrl} (expires in 60 minutes)`;

    await this.sendTransactionalEmail({
      toEmail: input.toEmail,
      toName: input.recipientName,
      subject,
      htmlContent,
      textContent,
    });
  }

  private async sendTransactionalEmail(input: {
    toEmail: string;
    toName?: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
  }): Promise<void> {
    const apiKey = this.config.get<string>('BREVO_API_KEY')?.trim();
    const senderEmail = this.config.get<string>('BREVO_SENDER_EMAIL')?.trim();
    const senderName =
      this.config.get<string>('BREVO_SENDER_NAME')?.trim() || 'MCJ Academy';

    if (!apiKey || !senderEmail) {
      this.logger.error('Brevo email is not configured (BREVO_API_KEY / BREVO_SENDER_EMAIL)');
      throw new Error('EMAIL_DELIVERY_UNAVAILABLE');
    }

    const payload: BrevoSendPayload = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: input.toEmail, name: input.toName }],
      subject: input.subject,
      htmlContent: input.htmlContent,
      textContent: input.textContent,
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(
        `Brevo send failed (${response.status}): ${body.slice(0, 500)}`,
      );
      throw new Error('EMAIL_DELIVERY_FAILED');
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  
async sendBranchEnquiryEmail(input: {
  branchName: string;
  branchEmail: string;
  studentName: string;
  phone: string;
  courseName?: string;
  batchName?: string;
  notes?: string;
}): Promise<void> {
  const escape = (value: string) => this.escapeHtml(value);

  const subject = `New Enquiry - ${input.branchName}`;

  const rows = [
    ["Branch", input.branchName],
    ["Student Name", input.studentName],
    ["Phone Number", input.phone],
    ["Interested Course", input.courseName || "Not specified"],
    ["Preferred Batch", input.batchName || "Not specified"],
    ["Additional Notes", input.notes || "None"],
  ];

  const htmlContent = `
    <h2>New Student Enquiry</h2>
    <p>A new enquiry has been submitted through the MCJ Academy website.</p>
    <table cellpadding="8" cellspacing="0" border="1"
      style="border-collapse:collapse;border-color:#ddd;width:100%">
      ${rows
        .map(
          ([label, value]) => `
            <tr>
              <td><strong>${escape(label)}</strong></td>
              <td>${escape(value)}</td>
            </tr>
          `,
        )
        .join("")}
    </table>
  `;

  const textContent = rows
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

  await this.sendTransactionalEmail({
    toEmail: input.branchEmail,
    toName: input.branchName,
    subject,
    htmlContent,
    textContent,
  });
}

async sendContactEnquiryEmail(input: {
  fullName: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<void> {
  const recipientEmail = this.config
    .get<string>('MCJ_CONTACT_EMAIL')
    ?.trim();

  if (!recipientEmail) {
    this.logger.error('MCJ_CONTACT_EMAIL is not configured');
    throw new Error('EMAIL_DELIVERY_UNAVAILABLE');
  }

  const rows = [
    ['Full Name', input.fullName],
    ['Email Address', input.email],
    ['Phone Number', input.phone?.trim() || 'Not provided'],
    ['Message', input.message],
  ];

  const htmlContent = `
    <h2>New Contact Enquiry - MCJ Academy</h2>
    <p>A new message has been submitted through the Contact page.</p>
    <table cellpadding="8" cellspacing="0" border="1"
      style="border-collapse:collapse;border-color:#ddd;width:100%">
      ${rows
        .map(
          ([label, value]) => `
            <tr>
              <td><strong>${this.escapeHtml(label)}</strong></td>
              <td>${this.escapeHtml(value)}</td>
            </tr>
          `,
        )
        .join('')}
    </table>
  `;

  const textContent = rows
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');

  await this.sendTransactionalEmail({
    toEmail: recipientEmail,
    subject: `New Contact Enquiry from ${input.fullName}`,
    htmlContent,
    textContent,
  });
}
}
