"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";

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

interface ResumeUploadFieldProps {
  file: File | null;
  error?: string | null;
  disabled?: boolean;
  onFileSelect: (file: File | null) => void;
}

export function ResumeUploadField({
  file,
  error,
  disabled = false,
  onFileSelect,
}: ResumeUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const selected = files?.[0];
      if (selected) {
        onFileSelect(selected);
      }
    },
    [onFileSelect],
  );

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload resume"
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/30",
          error
            ? "border-red-300 bg-red-50/30"
            : isDragging
              ? "border-[#2563EB] bg-blue-50/40"
              : file
                ? "border-emerald-400 bg-emerald-50/20"
                : "border-slate-300 bg-slate-50/50",
          disabled && "pointer-events-none opacity-60",
        )}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
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
            handleFiles(event.dataTransfer.files);
          }
        }}
      >
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-7 w-7 text-emerald-600" />
            <p className="text-sm font-medium text-[#102A56]">{file.name}</p>
            <p className="text-xs text-[#647A9B]">{formatFileSize(file.size)}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onFileSelect(null);
              }}
            >
              <X className="mr-1 h-4 w-4" />
              Remove
            </Button>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-7 w-7 text-slate-400" />
            <p className="mt-2 text-sm font-medium text-[#102A56]">
              Drag & drop your resume here
            </p>
            <p className="mt-1 text-sm text-[#647A9B]">or click to browse</p>
            <p className="mt-2 text-xs text-slate-400">PDF, DOC, DOCX · Max 10MB</p>
          </>
        )}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}
