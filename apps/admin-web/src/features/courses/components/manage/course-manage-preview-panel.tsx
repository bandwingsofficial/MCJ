"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";

interface Props {
  courseId: string;
  courseTitle: string;
}

export function CourseManagePreviewPanel({
  courseId,
  courseTitle,
}: Props) {
  return (
    <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">
        Learner Preview
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Open a read-only preview of how learners will see “{courseTitle}”.
      </p>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-5">
        <p className="text-sm text-slate-700">
          The preview shows course modules, lessons, videos, and downloadable
          resources without admin controls.
        </p>
        <Link
          href={`/courses/${courseId}/preview`}
          className="mt-4 inline-flex h-9 items-center rounded-lg bg-[#2447A8] px-4 text-sm font-medium text-white hover:bg-[#1d3a8a]"
        >
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
          Open Preview
        </Link>
      </div>
    </Card>
  );
}
