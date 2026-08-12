// domain/enums/client-type.enum.ts

export enum ClientType {
  WEB = 'WEB',
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  ADMIN_WEB = 'ADMIN_WEB',
  UNKNOWN = 'UNKNOWN',
}

export const CLIENT_TYPES = Object.values(ClientType);

export function parseClientType(
  value?: string | null,
): ClientType {
  if (!value) {
    return ClientType.UNKNOWN;
  }

  const normalized = value.trim().toUpperCase();

  if (CLIENT_TYPES.includes(normalized as ClientType)) {
    return normalized as ClientType;
  }

  return ClientType.UNKNOWN;
}
