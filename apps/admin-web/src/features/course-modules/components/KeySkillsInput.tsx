"use client";

import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";

import { COURSE_MODULE_CONSTANTS } from "@/src/features/course-modules/constants/course-module.constants";

interface KeySkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  disabled?: boolean;
  errorMessage?: string;
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
}: KeySkillsInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="keySkills">
        Key Skills
        <span className="ml-1 font-normal text-slate-500">
          (shown under &quot;What You&apos;ll Learn&quot; on the course page)
        </span>
      </Label>

      <Input
        id="keySkills"
        placeholder="Understand Python basics, Build REST APIs"
        value={value.join(", ")}
        disabled={disabled}
        onChange={(event) => onChange(parseKeySkillsInput(event.target.value))}
      />

      <p className="text-xs text-slate-500">
        Enter up to {COURSE_MODULE_CONSTANTS.MAX_KEY_SKILLS} skills, separated
        by commas.
      </p>

      {errorMessage ? (
        <p className="text-xs text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}
