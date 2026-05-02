import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// 👇 Strong typing (reuse everywhere)
export interface AuthUser {
  sub: string;
  sessionId: string;
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user;

    // 🔥 Safety check (prevents silent crashes)
    if (!user) {
      throw new Error('User not found in request (JWT Guard missing?)');
    }

    return user;
  },
);