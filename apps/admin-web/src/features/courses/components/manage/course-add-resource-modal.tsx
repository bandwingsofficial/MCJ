"use client";

import { FileText } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";

export type CourseResourceAddType = "PDF_NOTES" | "FILE";

interface ResourceOption {
  type: CourseResourceAddType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const RESOURCE_OPTIONS: ResourceOption[] = [
  {
    type: "PDF_NOTES",
    label: "PDF / Notes",
    description: "Upload a PDF or notes document for this module.",
    icon: <FileText className="h-5 w-5 text-amber-600" />,
  },
  {
    type: "FILE",
    label: "File",
    description: "Upload a downloadable file resource.",
    icon: <FileText className="h-5 w-5 text-slate-600" />,
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (type: CourseResourceAddType) => void;
}

export function CourseAddResourceModal({
  open,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal open={open} title="Add Resource" onClose={onClose}>
      <div className="space-y-2">
        {RESOURCE_OPTIONS.map((option) => (
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
