type UploadFilePayload = {
  fileId?: string;
  id?: string;
};

type UploadResponseLike = {
  data?: UploadFilePayload;
};

export function getUploadFileId(
  uploadResponse: UploadResponseLike,
): string {
  const fileId =
    uploadResponse?.data?.fileId ?? uploadResponse?.data?.id;

  if (!fileId) {
    throw new Error("Upload did not return a file ID.");
  }

  return fileId;
}

export function withImageCacheBust(
  url: string,
  version?: string | null,
): string {
  if (!version) {
    return url;
  }

  const encodedVersion = encodeURIComponent(version);

  if (url.includes(`v=${encodedVersion}`)) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}v=${encodedVersion}`;
}

export function resolvePersistedImageUrl(
  url: string | null | undefined,
  version?: string | null,
): string | null {
  if (!url?.trim()) {
    return null;
  }

  return withImageCacheBust(url.trim(), version);
}
