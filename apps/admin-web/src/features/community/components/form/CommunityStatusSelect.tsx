"use client";

import { AppSelect } from "@/src/shared/components/ui/select";

import { COMMUNITY_POST_STATUSES } from "@/src/features/community/constants/community.constants";

interface CommunityStatusSelectProps {
  value: string;

  onValueChange: (value: string) => void;
}

export function CommunityStatusSelect({
  value,
  onValueChange,
}: CommunityStatusSelectProps) {
  return (
    <AppSelect
      value={value}
      onValueChange={onValueChange}
      options={COMMUNITY_POST_STATUSES}
    />
  );
}