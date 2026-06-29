"use client";

import { AppSelect } from "@/src/shared/components/ui/select";

import { COMMUNITY_POST_TYPES } from "@/src/features/community/constants/community.constants";

interface CommunityTypeSelectProps {
  value: string;

  onValueChange: (value: string) => void;
}

export function CommunityTypeSelect({
  value,
  onValueChange,
}: CommunityTypeSelectProps) {
  return (
    <AppSelect
      value={value}
      onValueChange={onValueChange}
      options={COMMUNITY_POST_TYPES}
    />
  );
}