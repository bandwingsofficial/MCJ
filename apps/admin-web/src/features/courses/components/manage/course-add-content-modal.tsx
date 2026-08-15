"use client";

import {
  BookOpen,
  FileText,
  HelpCircle,
  Radio,
  Video,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";

export type CourseContentType =
  | "STANDARD_LESSON"
  | "SELF_PACED_VIDEO"
  | "LIVE_CLASS"
  | "PDF_NOTES"
  | "FILE"
  | "QUIZ";

interface ContentOption {
  type: CourseContentType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const CONTENT_OPTIONS: ContentOption[] = [
  {
    type: "STANDARD_LESSON",
    label: "Standard Lesson",
    description: "Text-based lesson with description content.",
    icon: <BookOpen className="h-5 w-5 text-slate-600" />,
  },
  {
    type: "SELF_PACED_VIDEO",
    label: "Self-Paced Video",
    description: "Lesson with an on-demand video URL.",
    icon: <Video className="h-5 w-5 text-blue-600" />,
  },
  {
    type: "LIVE_CLASS",
    label: "Live Class",
    description: "Live sessions are scheduled through course batches.",
    icon: <Radio className="h-5 w-5 text-violet-600" />,
  },
  {
    type: "PDF_NOTES",
    label: "PDF / Notes",
    description: "Lesson with a PDF or notes resource attachment.",
    icon: <FileText className="h-5 w-5 text-amber-600" />,
  },
  {
    type: "FILE",
    label: "File",
    description: "Lesson with a downloadable file resource.",
    icon: <FileText className="h-5 w-5 text-slate-600" />,
  },
  {
    type: "QUIZ",
    label: "Quiz",
    description: "Lesson with an interactive quiz for assessment.",
    icon: <HelpCircle className="h-5 w-5 text-emerald-600" />,
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (type: CourseContentType) => void;
}

export function CourseAddContentModal({
  open,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal open={open} title="Add Content" onClose={onClose}>
      <div className="space-y-2">
        {CONTENT_OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            className="flex w-full items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition-colors hover:border-[#2447A8] hover:bg-slate-50"
            onClick={() => {
              onSelect(option.type);
              onClose();
            }}
          >
            <div className="mt-0.5">{option.icon}</div>
            <span>
              <span className="block text-sm font-medium text-slate-900">
                {option.label}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {option.description}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
