"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import { jobApplicationService } from "@/src/features/job-applications/services/job-application.service";
import type { JobApplicationResume } from "@/src/features/job-applications/types/job-application.types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ApplicationResumeSectionProps {
  resumeFileId: string | null;
}

export function ApplicationResumeSection({
  resumeFileId,
}: ApplicationResumeSectionProps) {
  const [resume, setResume] = useState<JobApplicationResume | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resumeFileId) {
      setResume(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const upload = await jobApplicationService.getResumeUpload(resumeFileId);
        if (!cancelled) {
          setResume(upload);
        }
      } catch (err) {
        if (!cancelled) {
          setResume(null);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load resume details.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [resumeFileId]);

  if (!resumeFileId) {
    return (
      <p className="text-sm text-[#647A9B]">No resume uploaded</p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#647A9B]">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading resume...
      </div>
    );
  }

  if (error || !resume?.url) {
    return (
      <p className="text-sm text-red-600">
        {error || "Resume file is unavailable."}
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-[#E8F1FF] bg-[#F8FBFF] px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#102A56]">
              {resume.originalName || "Resume"}
            </p>
            <p className="text-xs text-[#647A9B]">
              {formatFileSize(resume.size)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => {
              window.open(resume.url, "_blank", "noopener,noreferrer");
            }}
          >
            <ExternalLink className="mr-1.5 h-4 w-4" />
            View
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => {
              const link = document.createElement("a");
              link.href = resume.url;
              link.download = resume.originalName || "resume";
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              document.body.appendChild(link);
              link.click();
              link.remove();
            }}
          >
            <Download className="mr-1.5 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
