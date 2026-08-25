"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

export interface ModuleDeleteContentCounts {
  lessons: number;
  resources: number;
  quizzes: number;
  assignments: number;
}

interface Props {
  open: boolean;
  moduleTitle?: string;
  contentCounts?: ModuleDeleteContentCounts;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function hasAssociatedContent(counts: ModuleDeleteContentCounts): boolean {
  return (
    counts.lessons > 0 ||
    counts.resources > 0 ||
    counts.quizzes > 0 ||
    counts.assignments > 0
  );
}

function buildDeleteDescription(
  moduleTitle: string | undefined,
  contentCounts?: ModuleDeleteContentCounts,
): string {
  const title = moduleTitle?.trim() || "this module";
  const lines = [
    `Are you sure you want to permanently delete "${title}"?`,
    "",
    "This action cannot be undone. The module will be removed from the course.",
  ];

  if (contentCounts && hasAssociatedContent(contentCounts)) {
    lines.push(
      "",
      "This module contains associated content that will also be permanently deleted:",
    );

    if (contentCounts.lessons > 0) {
      lines.push(
        `• ${contentCounts.lessons} lesson${contentCounts.lessons === 1 ? "" : "s"}`,
      );
    }

    if (contentCounts.resources > 0) {
      lines.push(
        `• ${contentCounts.resources} resource${contentCounts.resources === 1 ? "" : "s"}`,
      );
    }

    if (contentCounts.quizzes > 0) {
      lines.push(
        `• ${contentCounts.quizzes} quiz${contentCounts.quizzes === 1 ? "" : "zes"}`,
      );
    }

    if (contentCounts.assignments > 0) {
      lines.push(
        `• ${contentCounts.assignments} assignment${contentCounts.assignments === 1 ? "" : "s"}`,
      );
    }

    lines.push(
      "",
      "Lessons may include videos and other linked materials that will be removed as well.",
    );
  }

  return lines.join("\n");
}

export function CourseModuleDeleteDialog({
  open,
  moduleTitle,
  contentCounts,
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete Module?"
      description={buildDeleteDescription(moduleTitle, contentCounts)}
      confirmLabel="Delete Module"
      loadingLabel="Deleting..."
      confirmVariant="danger"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}
