import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Request } from 'express';

// 👇 JWT payload typing
export interface AuthUser {
  sub: string;

  sessionId: string;

  email?: string;

  role?: string;
}

// 👇 Typed request
interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    const user = request.user;

    // 🔥 Safety check
    if (!user) {
      throw new Error('User not found in request (JWT Guard missing?)');
    }

    return user;
  },
);
