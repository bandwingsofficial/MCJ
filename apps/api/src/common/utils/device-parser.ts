import { UAParser } from 'ua-parser-js';

export function parseDevice(userAgent?: string | null): string {
  if (!userAgent) return 'Unknown device';

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const browser = result.browser.name || 'Unknown Browser';
  const browserVersion = result.browser.version
    ? ` ${result.browser.version.split('.')[0]}`
    : '';

  const os = result.os.name || 'Unknown OS';
  const deviceType = result.device.type;
  const deviceModel = result.device.model;

  // 📱 Mobile / Tablet (prefer model if available)
  if (deviceType === 'mobile' || deviceType === 'tablet') {
    if (deviceModel) {
      return `${browser}${browserVersion} on ${deviceModel}`;
    }

    return `${browser}${browserVersion} on ${os}`;
  }

  // 💻 Desktop / fallback
  return `${browser}${browserVersion} on ${os}`;
}
