"use client";

import { useCallback, useRef, useState } from "react";
import { Check, Upload, X } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { cn } from "@/src/shared/lib/cn";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  file: File | null;
  existingFileName?: string | null;
  existingFileUrl?: string | null;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string | null;
  disabled?: boolean;
  accept?: string;
  hint?: string;
  browseLabel?: string;
  readyLabel?: string;
  onFileSelect: (file: File | null) => void;
  onUpload?: (file: File) => Promise<void>;
}

export function FileUploadField({
  file,
  existingFileName,
  existingFileUrl,
  isUploading = false,
  uploadProgress = 0,
  error,
  disabled = false,
  accept,
  hint = "Supported file types",
  browseLabel = "Browse File",
  readyLabel = "Ready to upload",
  onFileSelect,
  onUpload,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const selected = files?.[0];
      if (!selected) {
        return;
      }

      onFileSelect(selected);
      if (onUpload) {
        await onUpload(selected);
      }
    },
    [onFileSelect, onUpload],
  );

  const displayName =
    file?.name ?? existingFileName ?? getNameFromUrl(existingFileUrl);
  const hasExisting = Boolean(existingFileUrl && !file);
  const hasSelection = Boolean(file || hasExisting);

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          isDragging
            ? "border-[#2447A8] bg-blue-50/40"
            : "border-slate-300 bg-slate-50/50",
          Boolean(error) && "border-red-300 bg-red-50/30",
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
            void handleFiles(event.dataTransfer.files);
          }
        }}
      >
        <Upload className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-2 text-sm font-medium text-slate-700">
          Drag &amp; drop file here
        </p>
        <p className="mt-1 text-xs text-slate-500">or</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {browseLabel}
        </Button>
        <p className="mt-3 text-xs text-slate-500">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(event) => {
            void handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {hasSelection ? (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <p className="font-medium text-slate-900">{displayName}</p>
          {file ? (
            <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
          ) : null}
          {isUploading ? (
            <p className="mt-1 text-xs text-slate-600">
              Uploading... {uploadProgress}%
            </p>
          ) : null}
          {!isUploading && (file || hasExisting) ? (
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
              <Check className="h-3.5 w-3.5" />
              {file ? readyLabel : "File attached"}
            </p>
          ) : null}
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => onFileSelect(null)}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function getNameFromUrl(url?: string | null): string | null {
  if (!url?.trim()) {
    return null;
  }

  try {
    const pathname = new URL(url).pathname;
    const segment = pathname.split("/").pop();
    return segment || url;
  } catch {
    const segment = url.split("/").pop();
    return segment || url;
  }
}
