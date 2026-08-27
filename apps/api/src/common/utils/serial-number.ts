export function buildNextSerialNumber(
  latest: string | null | undefined,
  kind: 'JOB' | 'APP',
  pad: number,
): string {
  const year = new Date().getFullYear();
  const prefix = `${kind}-${year}-`;

  if (!latest?.startsWith(prefix)) {
    return `${prefix}${String(1).padStart(pad, '0')}`;
  }

  const current = Number.parseInt(latest.slice(prefix.length), 10);
  const next = Number.isFinite(current) ? current + 1 : 1;

  return `${prefix}${String(next).padStart(pad, '0')}`;
}
