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
  pdfOnly?: boolean;
  onFileSelect: (file: File | null) => void;
}

export function ResumeUploadField({
  file,
  error,
  disabled = false,
  pdfOnly = false,
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
          "cursor-pointer rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/30",
          error
            ? "border-red-300 bg-red-50/30"
            : isDragging
              ? "border-[#2563EB] bg-[#EFF6FF]"
              : file
                ? "border-emerald-400 bg-emerald-50/30"
                : "border-[#BFDBFE] bg-white/80",
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
            <FileText className="h-8 w-8 text-emerald-600" />
            <p className="text-sm font-semibold text-[#0B1F3A]">{file.name}</p>
            <p className="text-xs text-slate-500">
              PDF · {formatFileSize(file.size)}
            </p>
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF]">
              <Upload className="h-6 w-6 text-[#2563EB]" />
            </div>
            <p className="mt-3 text-sm font-semibold text-[#0B1F3A]">
              Drag & drop your resume here
            </p>
            <p className="mt-1 text-sm text-slate-500">or click to browse</p>
            <p className="mt-2 text-xs font-medium text-[#2563EB]">
              {pdfOnly ? "PDF only · Required" : "PDF, DOC, DOCX"}
            </p>
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
        accept={
          pdfOnly
            ? ".pdf,application/pdf"
            : ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }
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
