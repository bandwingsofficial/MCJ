"use client";

import Link from "next/link";
import {
  CircleCheck,
  Pencil,
  Power,
  Settings2,
  Trash2,
} from "lucide-react";

import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

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
      <div className="flex items-center justify-end gap-2">
        <Tooltip content="Activate module">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onActivate(module)}
            aria-label="Activate module"
            className={`${iconButtonClass} text-green-800`}
          >
            <CircleCheck className={iconClass} />
          </button>
        </Tooltip>

        <Tooltip content="Edit module">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onEdit(module)}
            aria-label="Edit module"
            className={`${iconButtonClass} text-blue-900`}
          >
            <Pencil className={iconClass} />
          </button>
        </Tooltip>

        <Tooltip content="Manage module">
          <Link
            href={manageHref}
            aria-label="Manage module"
            className={`${iconButtonClass} text-blue-900`}
          >
            <Settings2 className={iconClass} />
          </Link>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Tooltip content="Deactivate module">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDeactivate(module)}
          aria-label="Deactivate module"
          className={`${iconButtonClass} text-orange-700`}
        >
          <Power className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip content="Edit module">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onEdit(module)}
          aria-label="Edit module"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Pencil className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip content="Delete module">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(module)}
          aria-label="Delete module"
          className={`${iconButtonClass} text-red-800`}
        >
          <Trash2 className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip content="Manage module">
        <Link
          href={manageHref}
          aria-label="Manage module"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Settings2 className={iconClass} />
        </Link>
      </Tooltip>
    </div>
  );
}
