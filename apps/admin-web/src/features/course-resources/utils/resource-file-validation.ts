import type { ResourceTypeValue } from "@/src/features/course-resources/constants/course-resource.constants";

/** Matches backend default UPLOAD_MAX_SIZE_MB when env is unset. */
export const DEFAULT_UPLOAD_MAX_SIZE_BYTES = 10 * 1024 * 1024;

interface ResourceFileRules {
  accept: string;
  mimeTypes: string[];
  extensions: string[];
  label: string;
}

const RESOURCE_FILE_RULES: Record<ResourceTypeValue, ResourceFileRules> = {
  PDF: {
    accept: ".pdf,application/pdf",
    mimeTypes: ["application/pdf"],
    extensions: ["pdf"],
    label: "PDF",
  },
  PPT: {
    accept:
      ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
    mimeTypes: [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
    extensions: ["ppt", "pptx"],
    label: "presentation",
  },
  DOC: {
    accept:
      ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    mimeTypes: [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    extensions: ["doc", "docx"],
    label: "document",
  },
  ZIP: {
    accept: ".zip,.rar,application/zip,application/x-zip-compressed",
    mimeTypes: ["application/zip", "application/x-zip-compressed"],
    extensions: ["zip", "rar"],
    label: "archive",
  },
  IMAGE: {
    accept: "image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif",
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    extensions: ["jpg", "jpeg", "png", "webp", "avif"],
    label: "image",
  },
  VIDEO: {
    accept: "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov",
    mimeTypes: ["video/mp4", "video/webm", "video/quicktime"],
    extensions: ["mp4", "webm", "mov"],
    label: "video",
  },
  LINK: {
    accept: "",
    mimeTypes: [],
    extensions: [],
    label: "link",
  },
  CODE: {
    accept: ".txt,.md,.json,.js,.ts,.py,.java,.c,.cpp,.html,.css,.xml,.sql,.zip",
    mimeTypes: [
      "text/plain",
      "application/json",
      "text/javascript",
      "application/javascript",
    ],
    extensions: [
      "txt",
      "md",
      "json",
      "js",
      "ts",
      "py",
      "java",
      "c",
      "cpp",
      "html",
      "css",
      "xml",
      "sql",
    ],
    label: "code file",
  },
  OTHER: {
    accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.jpg,.jpeg,.png,.mp4",
    mimeTypes: [],
    extensions: [],
    label: "file",
  },
};

export function getResourceFileRules(type: string): ResourceFileRules {
  return (
    RESOURCE_FILE_RULES[type as ResourceTypeValue] ??
    RESOURCE_FILE_RULES.OTHER
  );
}

export function isResourceTypeLink(type: string): boolean {
  return type === "LINK";
}

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

export function validateResourceFileForType(
  file: File,
  type: string,
  maxSizeBytes = DEFAULT_UPLOAD_MAX_SIZE_BYTES,
): string | null {
  if (isResourceTypeLink(type)) {
    return "Select a resource type other than Link to upload a file.";
  }

  if (file.size > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
    return `File size must not exceed ${maxMb} MB.`;
  }

  const rules = getResourceFileRules(type);
  const extension = getFileExtension(file.name);
  const mimeMatches =
    rules.mimeTypes.length === 0 ||
    rules.mimeTypes.includes(file.type);
  const extensionMatches =
    rules.extensions.length === 0 ||
    rules.extensions.includes(extension);

  if (!mimeMatches && !extensionMatches) {
    return `Selected file does not match resource type ${type}. Upload a supported ${rules.label} file.`;
  }

  return null;
}

export function getResourceUploadHint(type: string): string {
  if (isResourceTypeLink(type)) {
    return "Enter a valid URL for link resources.";
  }

  const rules = getResourceFileRules(type);
  if (rules.extensions.length > 0) {
    return `Supported: ${rules.extensions.map((ext) => ext.toUpperCase()).join(", ")}`;
  }

  return "Supported file types";
}
