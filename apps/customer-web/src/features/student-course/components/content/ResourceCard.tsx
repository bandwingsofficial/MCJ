"use client";

import Link from "next/link";
import {
  Download,
  ExternalLink,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

import {
  RESOURCE_TYPE_LABELS,
} from "@/src/features/student-course/constants/course.constants";

import {
  LessonResourceType,
  type LessonResource,
} from "@/src/features/student-course/types/resource.types";

interface ResourceCardProps {
  resource: LessonResource;
}

function getResourceIcon(
  type: LessonResourceType,
) {
  switch (type) {
    case LessonResourceType.PDF:
    case LessonResourceType.DOC:
    case LessonResourceType.DOCX:
      return FileText;

    case LessonResourceType.PPT:
    case LessonResourceType.PPTX:
      return Presentation;

    case LessonResourceType.XLS:
    case LessonResourceType.XLSX:
      return FileSpreadsheet;

    case LessonResourceType.IMAGE:
      return FileImage;

    case LessonResourceType.VIDEO:
      return FileVideo;

    case LessonResourceType.ZIP:
      return FileArchive;

    default:
      return File;
  }
}

export function ResourceCard({
  resource,
}: ResourceCardProps) {
  const Icon = getResourceIcon(
    resource.type,
  );

  return (
    <Card className="flex items-center justify-between gap-4 rounded-xl p-4 transition-colors hover:bg-muted/40">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>

        <div className="min-w-0">
          <h4 className="truncate font-medium">
            {resource.title}
          </h4>

          <div className="mt-1 flex items-center gap-2">
            <Badge variant="info">
              {
                RESOURCE_TYPE_LABELS[
                  resource.type
                ]
              }
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button
        >
          <Link
            href={resource.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${resource.title}`}
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>

        <Button
        >
          <Link
            href={resource.fileUrl}
            target="_blank"
            download
            aria-label={`Download ${resource.title}`}
          >
            <Download className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}