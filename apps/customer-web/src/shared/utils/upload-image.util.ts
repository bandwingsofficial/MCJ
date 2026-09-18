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
