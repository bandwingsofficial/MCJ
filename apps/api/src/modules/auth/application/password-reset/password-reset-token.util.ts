export function parsePasswordResetToken(
  raw: string,
): { id: string; secret: string } | null {
  const trimmed = raw.trim();
  const dotIndex = trimmed.indexOf('.');
  if (dotIndex <= 0 || dotIndex >= trimmed.length - 1) {
    return null;
  }

  const id = trimmed.slice(0, dotIndex);
  const secret = trimmed.slice(dotIndex + 1);
  if (!id || !secret) {
    return null;
  }

  return { id, secret };
}
