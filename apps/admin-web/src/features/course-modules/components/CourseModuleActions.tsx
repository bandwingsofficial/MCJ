"use client";

import Link from "next/link";
import {
  CircleCheck,
  Pencil,
  Power,
  Settings2,
  Trash2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";

const iconBtnClass =
  "h-10 w-10 shrink-0 rounded-lg p-0";

const iconClass = "h-[1.35rem] w-[1.35rem]";

interface Props {
  courseId: string;
  module: CourseModule;
  disabled?: boolean;
  onEdit: (module: CourseModule) => void;
  onDeactivate: (module: CourseModule) => void;
  onActivate: (module: CourseModule) => void;
  onDelete: (module: CourseModule) => void;
}

export function CourseModuleActions({
  courseId,
  module,
  disabled = false,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
}: Props) {
  const isArchived = Boolean(module.isDeleted || module.deletedAt);
  const manageHref = `/courses/${courseId}/manage/modules/${module.id}`;

  if (isArchived) {
    return (
      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onActivate(module)}
          title="Activate module"
          aria-label="Activate module"
          className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
        >
          <CircleCheck className={iconClass} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onEdit(module)}
          title="Edit module"
          aria-label="Edit module"
          className={`${iconBtnClass} text-slate-700 hover:bg-slate-100`}
        >
          <Pencil className={iconClass} />
        </Button>

        <Link
          href={manageHref}
          title="Manage module"
          aria-label="Manage module"
          className={`inline-flex items-center justify-center ${iconBtnClass} text-[#2563EB] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Settings2 className={iconClass} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1 whitespace-nowrap">
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => onDeactivate(module)}
        title="Deactivate module"
        aria-label="Deactivate module"
        className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
      >
        <Power className={iconClass} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => onEdit(module)}
        title="Edit module"
        aria-label="Edit module"
        className={`${iconBtnClass} text-slate-700 hover:bg-slate-100`}
      >
        <Pencil className={iconClass} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => onDelete(module)}
        title="Delete module"
        aria-label="Delete module"
        className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
      >
        <Trash2 className={iconClass} />
      </Button>

      <Link
        href={manageHref}
        title="Manage module"
        aria-label="Manage module"
        className={`inline-flex items-center justify-center ${iconBtnClass} text-slate-700 hover:bg-slate-100`}
      >
        <Settings2 className={iconClass} />
      </Link>
    </div>
  );
}
