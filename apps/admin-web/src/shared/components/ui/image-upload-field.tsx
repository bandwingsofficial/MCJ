"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { Check, ImageIcon, Upload, X } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { cn } from "@/src/shared/lib/cn";
import type { FieldVisualState } from "@/src/shared/components/ui/validated-field";

interface Props {
  previewUrl?: string | null;
  file: File | null;
  disabled?: boolean;
  isUploading?: boolean;
  error?: string | null;
  state?: FieldVisualState;
  accept?: string;
  hint?: string;
  entityLabel?: string;
  previewAlt?: string;
  onFileSelect: (file: File | null) => void;
  onRemove: () => void;
  validateFile?: (file: File) => string | null;
}

export function ImageUploadField({
  previewUrl,
  file,
  disabled = false,
  isUploading = false,
  error,
  state = "neutral",
  accept = "image/png,image/jpeg,image/webp",
  hint = "PNG, JPG, JPEG, WEBP",
  entityLabel = "course",
  previewAlt,
  onFileSelect,
  onRemove,
  validateFile,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [imageBroken, setImageBroken] = useState(false);

  useEffect(() => {
    if (!file) {
      setLocalPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setImageBroken(false);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const displayUrl = localPreview ?? previewUrl ?? null;
  const hasPreview = Boolean(displayUrl && !imageBroken);
  const visualState: FieldVisualState = error ? "invalid" : state;

  const handleFile = (nextFile: File | null) => {
    if (!nextFile) {
      return;
    }

    onFileSelect(nextFile);
  };

  const borderClass =
    visualState === "valid"
      ? "border-emerald-400 bg-emerald-50/20"
      : visualState === "invalid"
        ? "border-red-300 bg-red-50/30"
        : isDragging
          ? "border-[#2447A8] bg-blue-50/40"
          : "border-slate-300 bg-slate-50/50";

  return (
    <div className="min-w-0 max-w-full space-y-2">
      {hasPreview ? (
        <div
          className={cn(
            "rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors",
            borderClass,
            disabled && "opacity-60",
          )}
        >
          <div className="mx-auto mb-3 h-40 w-full max-w-sm overflow-hidden rounded-lg border border-slate-200 bg-white">
            <Image
              src={displayUrl!}
              alt={previewAlt ?? `${entityLabel} image preview`}
              width={480}
              height={270}
              className="h-full w-full object-cover"
              onError={() => setImageBroken(true)}
            />
          </div>

          <div className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <Check className="h-4 w-4" />
            {file ? "Image selected" : "Image uploaded"}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => inputRef.current?.click()}
            >
              Replace Image
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={onRemove}
            >
              <X className="mr-1 h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "cursor-pointer rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors",
            borderClass,
            (disabled || isUploading) && "pointer-events-none opacity-60",
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled && !isUploading) {
              setIsDragging(true);
            }
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            if (disabled || isUploading) {
              return;
            }
            handleFile(event.dataTransfer.files?.[0] ?? null);
          }}
        >
          {isUploading ? (
            <p className="text-sm font-medium text-slate-700">
              Uploading image...
            </p>
          ) : (
            <>
              <Upload className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-700">
                Drag & drop {entityLabel} image here
              </p>
              <p className="mt-1 text-sm text-slate-500">or Browse</p>
              <p className="mt-3 text-xs text-slate-400">{hint}</p>
            </>
          )}
        </div>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(event) => {
          handleFile(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />

      {imageBroken && previewUrl ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <ImageIcon className="h-4 w-4" />
          Unable to preview the existing image.
        </div>
      ) : null}
    </div>
  );
}
