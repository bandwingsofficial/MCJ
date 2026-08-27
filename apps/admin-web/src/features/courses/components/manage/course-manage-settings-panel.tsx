"use client";

import { useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { Label } from "@/src/shared/components/ui/label";
import { AppSelect } from "@/src/shared/components/ui/select";
import { appToast } from "@/src/shared/components/ui/toast";

import { courseService } from "@/src/features/courses/services/course.service";
import type {
  CourseDetails,
  CourseStatus,
} from "@/src/features/courses/types/course.types";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface Props {
  course: CourseDetails;
  disabled?: boolean;
  onCourseUpdated: (course: CourseDetails) => void;
}

const STATUS_OPTIONS: Array<{ label: string; value: CourseStatus }> = [
  { label: "Draft", value: "DRAFT" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Archived", value: "ARCHIVED" },
];

export function CourseManageSettingsPanel({
  course,
  disabled = false,
  onCourseUpdated,
}: Props) {
  const [status, setStatus] = useState<CourseStatus>(course.status);
  const [isFeatured, setIsFeatured] = useState(course.isFeatured);
  const [isPopular, setIsPopular] = useState(course.isPopular);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await courseService.updateCourse(course.id, {
        status,
        isFeatured,
        isPopular,
      });
      onCourseUpdated(response.data);
      appToast.success("Course settings updated");
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-[#102A56]">Course Settings</h2>
      <p className="mt-1 text-xs text-slate-500">
        Manage visibility and featured flags for this course.
      </p>

      <div className="mt-4 space-y-4">
        <div className="max-w-xs space-y-2">
          <Label>Status</Label>
          <AppSelect
            value={status}
            disabled={disabled}
            options={STATUS_OPTIONS.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            onValueChange={(value) => setStatus(value as CourseStatus)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <Checkbox
              checked={isFeatured}
              disabled={disabled}
              onCheckedChange={(checked) => setIsFeatured(Boolean(checked))}
            />
            Featured course
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <Checkbox
              checked={isPopular}
              disabled={disabled}
              onCheckedChange={(checked) => setIsPopular(Boolean(checked))}
            />
            Popular course
          </label>
        </div>

        <Button
          type="button"
          size="sm"
          loading={isSaving}
          disabled={disabled}
          onClick={() => {
            void handleSave();
          }}
        >
          Save Settings
        </Button>
      </div>
    </Card>
  );
}
