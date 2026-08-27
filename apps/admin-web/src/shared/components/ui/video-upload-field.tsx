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
  uploadedUrl?: string | null;
  uploadedFileName?: string | null;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string | null;
  disabled?: boolean;
  onFileSelect: (file: File | null) => void;
  onUpload?: (file: File) => Promise<void>;
}

export function VideoUploadField({
  file,
  uploadedUrl,
  uploadedFileName,
  isUploading = false,
  uploadProgress = 0,
  error,
  disabled = false,
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

  const displayName = file?.name ?? uploadedFileName;
  const hasUploaded = Boolean(uploadedUrl);

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          isDragging
            ? "border-[#2563EB] bg-blue-50/40"
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
          Drag &amp; drop video here
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
          Browse Video
        </Button>
        <p className="mt-3 text-xs text-slate-500">
          MP4 / supported video formats
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(event) => {
            void handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {displayName ? (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <p className="font-medium text-[#102A56]">{displayName}</p>
          {file ? (
            <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
          ) : null}
          {isUploading ? (
            <p className="mt-1 text-xs text-slate-600">
              Uploading... {uploadProgress}%
            </p>
          ) : null}
          {hasUploaded && !isUploading ? (
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
              <Check className="h-3.5 w-3.5" />
              Video uploaded
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
