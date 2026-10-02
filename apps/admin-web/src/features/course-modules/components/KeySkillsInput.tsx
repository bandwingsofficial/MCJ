"use client";

import { Sparkles } from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import {
  ValidatedField,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";

import { COURSE_MODULE_CONSTANTS } from "@/src/features/course-modules/constants/course-module.constants";

interface KeySkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  disabled?: boolean;
  errorMessage?: string;
  fieldState?: FieldVisualState;
}

function parseKeySkillsInput(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, COURSE_MODULE_CONSTANTS.MAX_KEY_SKILLS)
    .map((skill) =>
      skill.slice(0, COURSE_MODULE_CONSTANTS.MAX_KEY_SKILL_LENGTH),
    );
}

export function KeySkillsInput({
  value,
  onChange,
  disabled = false,
  errorMessage,
  fieldState = "neutral",
}: KeySkillsInputProps) {
  return (
    <ValidatedField
      label="Key Skills (Optional)"
      leftIcon={<Sparkles className="h-4 w-4" aria-hidden />}
      state={fieldState}
      errorMessage={errorMessage}
    >
      <Input
        id="keySkills"
        placeholder="Understand Python basics, Build REST APIs"
        className={validatedFieldInputClass(fieldState, undefined, {
          leftIcon: true,
        })}
        value={value.join(", ")}
        disabled={disabled}
        onChange={(event) => onChange(parseKeySkillsInput(event.target.value))}
      />
      <p className="mt-1 text-xs text-slate-500">
        Enter up to {COURSE_MODULE_CONSTANTS.MAX_KEY_SKILLS} skills, separated
        by commas. Shown under &quot;What You&apos;ll Learn&quot; on the course
        page.
      </p>
    </ValidatedField>
  );
}
