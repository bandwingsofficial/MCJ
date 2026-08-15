"use client";

import { BookOpen, Radio, Video } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";

export type CourseLessonType =
  | "NORMAL_LESSON"
  | "SELF_PACED_VIDEO"
  | "LIVE_RECORDED_VIDEO";

interface LessonOption {
  type: CourseLessonType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const LESSON_OPTIONS: LessonOption[] = [
  {
    type: "NORMAL_LESSON",
    label: "Normal Lesson",
    description: "Text-based lesson with description content.",
    icon: <BookOpen className="h-5 w-5 text-slate-600" />,
  },
  {
    type: "SELF_PACED_VIDEO",
    label: "Self-Paced Video",
    description: "On-demand video lesson for learners.",
    icon: <Video className="h-5 w-5 text-blue-600" />,
  },
  {
    type: "LIVE_RECORDED_VIDEO",
    label: "Live Recorded Video",
    description: "Recorded video from a live session.",
    icon: <Radio className="h-5 w-5 text-violet-600" />,
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (type: CourseLessonType) => void;
}

export function CourseAddLessonModal({
  open,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal open={open} title="Add Lesson" onClose={onClose}>
      <div className="space-y-2">
        {LESSON_OPTIONS.map((option) => (
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
