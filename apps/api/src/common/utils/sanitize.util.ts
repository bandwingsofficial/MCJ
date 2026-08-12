export class SanitizeUtil {
  static trim(value?: string | null): string | undefined {
    const normalized = value?.trim();
    return normalized || undefined;
  }

  static lower(value?: string | null): string | undefined {
    return SanitizeUtil.trim(value)?.toLowerCase();
  }

  static fileSegment(value: string): string {
    return value
      .trim()
      .replace(/\\/g, '/')
      .split('/')
      .filter(Boolean)
      .map((segment) =>
        segment.replace(/[^a-zA-Z0-9._-]/g, '-'),
      )
      .join('/');
  }
}
