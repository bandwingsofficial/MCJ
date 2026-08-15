export const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const;

export const DEFAULT_BLOCKED_EXTENSIONS = [
  'exe',
  'bat',
  'cmd',
  'sh',
  'php',
  'js',
  'html',
] as const;

export interface UploadConfig {
  region: string;
  bucket: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  blockedExtensions: string[];
  webpQuality: number;
  maxImageWidth: number;
  multipartThresholdBytes: number;
  signedUrlExpirySeconds: number;
  publicUrlBase: string;
}

export interface UploadEnvConfig {
  AWS_REGION?: string;
  AWS_S3_BUCKET?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  UPLOAD_MAX_SIZE_MB?: string;
  UPLOAD_ALLOWED_MIME_TYPES?: string;
  UPLOAD_BLOCKED_EXTENSIONS?: string;
  UPLOAD_WEBP_QUALITY?: string;
  UPLOAD_MAX_IMAGE_WIDTH?: string;
  UPLOAD_MULTIPART_THRESHOLD_MB?: string;
  UPLOAD_SIGNED_URL_EXPIRY_SECONDS?: string;
  UPLOAD_PUBLIC_URL_BASE?: string;
}

const parseNumber = (
  value: string | undefined,
  fallback: number,
): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseList = (
  value: string | undefined,
  fallback: readonly string[],
): string[] => {
  if (!value?.trim()) {
    return [...fallback];
  }

  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

export const createUploadConfigFromEnv = (
  env: UploadEnvConfig,
): UploadConfig => {
  const region = env.AWS_REGION?.trim() || 'ap-south-1';
  const bucket = env.AWS_S3_BUCKET?.trim() || '';
  const maxSizeMb = parseNumber(env.UPLOAD_MAX_SIZE_MB, 10);
  const multipartThresholdMb = parseNumber(
    env.UPLOAD_MULTIPART_THRESHOLD_MB,
    5,
  );

  return {
    region,
    bucket,
    accessKeyId: env.AWS_ACCESS_KEY_ID?.trim(),
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY?.trim(),
    maxSizeBytes: maxSizeMb * 1024 * 1024,
    allowedMimeTypes: parseList(
      env.UPLOAD_ALLOWED_MIME_TYPES,
      DEFAULT_ALLOWED_MIME_TYPES,
    ),
    blockedExtensions: parseList(
      env.UPLOAD_BLOCKED_EXTENSIONS,
      DEFAULT_BLOCKED_EXTENSIONS,
    ),
    webpQuality: parseNumber(env.UPLOAD_WEBP_QUALITY, 82),
    maxImageWidth: parseNumber(env.UPLOAD_MAX_IMAGE_WIDTH, 1920),
    multipartThresholdBytes:
      multipartThresholdMb * 1024 * 1024,
    signedUrlExpirySeconds: parseNumber(
      env.UPLOAD_SIGNED_URL_EXPIRY_SECONDS,
      3600,
    ),
    publicUrlBase:
      env.UPLOAD_PUBLIC_URL_BASE?.trim() ||
      (bucket
        ? `https://${bucket}.s3.${region}.amazonaws.com`
        : ''),
  };
};
