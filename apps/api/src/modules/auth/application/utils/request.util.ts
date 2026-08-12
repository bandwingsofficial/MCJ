// shared/utils/request.util.ts

import type { Request } from 'express';

export const getUserAgent = (req: Request): string => {
  const ua = req.headers['user-agent'];

  if (Array.isArray(ua)) {
    return ua.join(' ');
  }

  return ua ?? 'unknown';
};

export const getClientIp = (req: Request): string | undefined => {
  return req.ip ?? undefined;
};
