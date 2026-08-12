// shared/utils/device.util.ts

import { createHash } from 'crypto';

import { DeviceType } from '../../domain/enums/device-type.enum';

// =====================
// 📱 DEVICE DETECTION
// =====================

export const parseDeviceType = (userAgent?: string | null): DeviceType => {
  if (!userAgent) {
    return DeviceType.UNKNOWN;
  }

  const ua = userAgent.toLowerCase();

  // 📱 mobile
  if (
    ua.includes('mobile') ||
    ua.includes('android') ||
    ua.includes('iphone') ||
    ua.includes('phone')
  ) {
    return DeviceType.MOBILE;
  }

  // 📲 tablet
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return DeviceType.TABLET;
  }

  // 💻 desktop
  if (
    ua.includes('windows') ||
    ua.includes('macintosh') ||
    ua.includes('linux') ||
    ua.includes('x11')
  ) {
    return DeviceType.DESKTOP;
  }

  return DeviceType.UNKNOWN;
};

// =====================
// 🧠 FINGERPRINT
// =====================

export const buildFingerprint = (params: {
  ipAddress?: string | null;
  userAgent?: string | null;
}): string => {
  const raw = [
    params.ipAddress ?? 'unknown-ip',
    params.userAgent ?? 'unknown-agent',
  ].join('::');

  return createHash('sha256').update(raw).digest('hex');
};

// =====================
// 🌐 CLIENT IP
// =====================

export const normalizeIpAddress = (ip?: string | null): string | null => {
  if (!ip) {
    return null;
  }

  // IPv6 localhost → IPv4
  if (ip === '::1') {
    return '127.0.0.1';
  }

  // IPv6 mapped IPv4
  if (ip.startsWith('::ffff:')) {
    return ip.replace('::ffff:', '');
  }

  return ip.trim();
};

// =====================
// 🔍 DEVICE SUMMARY
// =====================

export const getDeviceSummary = (params: {
  userAgent?: string | null;
  ipAddress?: string | null;
}) => {
  return {
    type: parseDeviceType(params.userAgent),

    fingerprint: buildFingerprint({
      ipAddress: normalizeIpAddress(params.ipAddress),

      userAgent: params.userAgent,
    }),
  };
};
