import {
  ClipboardList,
  FileText,
  PlayCircle,
  Radio,
} from "lucide-react";

import { cn } from "@/src/shared/lib/cn";

interface LessonTypeIconProps {
  contentType: string;
  hasVideo: boolean;
  hasQuiz: boolean;
  className?: string;
}

export function LessonTypeIcon({
  contentType,
  hasVideo,
  hasQuiz,
  className,
}: LessonTypeIconProps) {
  const normalized = contentType.toLowerCase();

  if (hasQuiz) {
    return <ClipboardList className={cn("h-4 w-4 text-violet-600", className)} />;
  }

  if (hasVideo || normalized.includes("video") || normalized.includes("record")) {
    return normalized.includes("live") ? (
      <Radio className={cn("h-4 w-4 text-orange-600", className)} />
    ) : (
      <PlayCircle className={cn("h-4 w-4 text-[#2563EB]", className)} />
    );
  }

  return <FileText className={cn("h-4 w-4 text-slate-500", className)} />;
}
