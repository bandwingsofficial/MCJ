"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Star,
  Trash2,
  Upload,
  Video,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { cn } from "@/src/shared/lib/cn";

import type { CommunityMediaFormItem } from "@/src/features/community/utils/community-media.utils";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  createClientMediaId,
  inferCommunityMediaType,
  normalizePrimaryMediaFlags,
  reorderCommunityMediaItems,
  validateCommunityMediaFile,
} from "@/src/features/community/utils/community-media.utils";

interface Props {
  items: CommunityMediaFormItem[];
  disabled?: boolean;
  error?: string | null;
  onChange: (items: CommunityMediaFormItem[]) => void;
}

function MediaPreview({
  item,
}: {
  item: CommunityMediaFormItem;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    item.previewUrl ?? item.url ?? null,
  );

  useEffect(() => {
    if (item.file) {
      const objectUrl = URL.createObjectURL(item.file);
      setPreviewUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    setPreviewUrl(item.previewUrl ?? item.url ?? null);
  }, [item.file, item.previewUrl, item.url]);

  if (!previewUrl) {
    return (
      <div className="flex h-28 w-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-500">
        No preview
      </div>
    );
  }

  if (item.mediaType === "VIDEO") {
    return (
      <video
        src={previewUrl}
        controls
        className="h-28 w-full rounded-lg border border-slate-200 bg-black object-cover"
      />
    );
  }

  return (
    <Image
      src={previewUrl}
      alt=""
      width={320}
      height={180}
      className="h-28 w-full rounded-lg border border-slate-200 object-cover"
    />
  );
}

export function CommunityMediaCollectionField({
  items,
  disabled = false,
  error,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const accept = useMemo(
    () =>
      [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(","),
    [],
  );

  const addFiles = (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (!files.length) {
      return;
    }

    const nextItems = [...items];
    const errors: string[] = [];

    files.forEach((file) => {
      const validationError = validateCommunityMediaFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
        return;
      }

      nextItems.push({
        clientId: createClientMediaId(),
        file,
        mediaType: inferCommunityMediaType(file),
        previewUrl: null,
        displayOrder: nextItems.length,
        isPrimary: false,
      });
    });

    const normalized = reorderCommunityMediaItems(nextItems);
    if (
      normalized.some((item) => item.mediaType === "IMAGE") &&
      !normalized.some((item) => item.isPrimary)
    ) {
      const firstImage = normalized.find((item) => item.mediaType === "IMAGE");
      if (firstImage) {
        firstImage.isPrimary = true;
      }
    }

    onChange(normalizePrimaryMediaFlags(normalized));
    setLocalError(errors.length ? errors.join(" ") : null);
  };

  const removeItem = (clientId: string) => {
    const nextItems = reorderCommunityMediaItems(
      items.filter((item) => item.clientId !== clientId),
    );
    onChange(nextItems);
    setLocalError(null);
  };

  const replaceItem = (clientId: string, file: File | null) => {
    if (!file) {
      return;
    }

    const validationError = validateCommunityMediaFile(file);
    if (validationError) {
      setLocalError(`${file.name}: ${validationError}`);
      return;
    }

    onChange(
      normalizePrimaryMediaFlags(
        items.map((item) =>
          item.clientId === clientId
            ? {
                ...item,
                file,
                fileId: undefined,
                url: undefined,
                previewUrl: null,
                mediaType: inferCommunityMediaType(file),
                uploadError: null,
                isUploading: false,
                isPrimary:
                  inferCommunityMediaType(file) === "IMAGE"
                    ? item.isPrimary
                    : false,
              }
            : item,
        ),
      ),
    );
    setLocalError(null);
  };

  const setPrimary = (clientId: string) => {
    onChange(
      normalizePrimaryMediaFlags(
        items.map((item) => ({
          ...item,
          isPrimary:
            item.clientId === clientId && item.mediaType === "IMAGE",
        })),
      ),
    );
  };

  const moveItem = (clientId: string, direction: -1 | 1) => {
    const index = items.findIndex((item) => item.clientId === clientId);
    const targetIndex = index + direction;

    if (index < 0 || targetIndex < 0 || targetIndex >= items.length) {
      return;
    }

    const nextItems = [...items];
    const [moved] = nextItems.splice(index, 1);
    nextItems.splice(targetIndex, 0, moved);
    onChange(reorderCommunityMediaItems(nextItems));
  };

  const displayError = error ?? localError;

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          isDragging
            ? "border-[#2563EB] bg-blue-50/40"
            : "border-slate-300 bg-slate-50/50",
          displayError ? "border-red-300 bg-red-50/30" : undefined,
          disabled && "opacity-60",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!disabled) {
            addFiles(event.dataTransfer.files);
          }
        }}
      >
        <Upload className="mx-auto mb-3 h-8 w-8 text-[#647A9B]" aria-hidden="true" />
        <p className="text-sm font-medium text-[#102A56]">
          Drag and drop images or videos here
        </p>
        <p className="mt-1 text-xs text-[#647A9B]">
          PNG, JPG, JPEG, WEBP up to 10 MB · MP4, WEBM, MOV up to 100 MB
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          Add Media
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <input
          ref={replaceInputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            if (replaceTargetId) {
              replaceItem(replaceTargetId, file);
            }
            setReplaceTargetId(null);
            event.target.value = "";
          }}
        />
      </div>

      {displayError ? (
        <p role="alert" className="text-sm text-red-500">
          {displayError}
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-4 text-sm text-[#647A9B]">
          No media selected yet.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.clientId}
              className={cn(
                "rounded-xl border p-3",
                item.isPrimary
                  ? "border-[#2563EB] bg-[#F8FBFF]"
                  : "border-slate-200 bg-white",
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="sm:w-44">
                  <MediaPreview item={item} />
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                        item.mediaType === "VIDEO"
                          ? "bg-violet-50 text-violet-700"
                          : "bg-blue-50 text-blue-700",
                      )}
                    >
                      {item.mediaType === "VIDEO" ? (
                        <Video className="h-3.5 w-3.5" />
                      ) : (
                        <ImageIcon className="h-3.5 w-3.5" />
                      )}
                      {item.mediaType === "VIDEO" ? "Video" : "Image"}
                    </span>
                    {item.isPrimary ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#2563EB] px-2.5 py-1 text-xs font-semibold text-white">
                        <Star className="h-3.5 w-3.5" />
                        Primary Image
                      </span>
                    ) : null}
                    {item.isUploading ? (
                      <span className="text-xs text-[#647A9B]">Uploading...</span>
                    ) : null}
                  </div>

                  <p className="truncate text-sm text-[#102A56]">
                    {item.file?.name ?? item.url ?? "Existing media"}
                  </p>

                  {item.uploadError ? (
                    <p className="text-sm text-red-500">{item.uploadError}</p>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    {item.mediaType === "IMAGE" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled || item.isPrimary}
                        onClick={() => setPrimary(item.clientId)}
                      >
                        Set as Primary
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled || index === 0}
                      onClick={() => moveItem(item.clientId, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled || index === items.length - 1}
                      onClick={() => moveItem(item.clientId, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                      onClick={() => {
                        setReplaceTargetId(item.clientId);
                        replaceInputRef.current?.click();
                      }}
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                      onClick={() => removeItem(item.clientId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
