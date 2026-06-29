"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Checkbox } from "@/src/shared/components/ui/checkbox";

import {
  COMMUNITY_POST_STATUSES,
  COMMUNITY_POST_TYPES,
} from "@/src/features/community/constants/community.constants";

export interface CommunityFiltersValue {
  search: string;

  status: string;

  type: string;

  includeDeleted: boolean;
}

interface CommunityFiltersProps {
  value: CommunityFiltersValue;

  onChange: (
    filters: CommunityFiltersValue,
  ) => void;
}

export function CommunityFilters({
  value,
  onChange,
}: CommunityFiltersProps) {
  return (
    <div className="grid gap-4 rounded-lg border bg-white p-4 md:grid-cols-4">
      <SearchInput
        value={value.search}
        onChange={(search) =>
          onChange({
            ...value,
            search,
          })
        }
      />

      <AppSelect
        value={value.status}
        onValueChange={(status) =>
          onChange({
            ...value,
            status,
          })
        }
        placeholder="Status"
        options={[
          {
            label: "All Status",
            value: "",
          },
          ...COMMUNITY_POST_STATUSES,
        ]}
      />

      <AppSelect
        value={value.type}
        onValueChange={(type) =>
          onChange({
            ...value,
            type,
          })
        }
        placeholder="Type"
        options={[
          {
            label: "All Types",
            value: "",
          },
          ...COMMUNITY_POST_TYPES,
        ]}
      />

      <div className="flex items-center gap-3">
        <Checkbox
          checked={
            value.includeDeleted
          }
          onCheckedChange={(
            checked,
          ) =>
            onChange({
              ...value,
              includeDeleted:
                Boolean(checked),
            })
          }
        />

        <span className="text-sm">
          Show Deleted
        </span>
      </div>
    </div>
  );
}