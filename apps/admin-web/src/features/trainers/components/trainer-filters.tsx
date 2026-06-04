"use client";

import {
  SearchInput,
} from "@/src/shared/components/ui/search-input";

import { AppSelect } from "@/src/shared/components/ui/select";

import { Button } from "@/src/shared/components/ui/button";

import {
  TRAINER_STATUSES,
  TRAINER_TYPES,
} from "@/src/features/trainers/constants/trainer.constants";

import type {
  TrainerFilters,
} from "@/src/features/trainers/types/trainer.types";

interface Props {
  filters: TrainerFilters;

  onChange: (
    filters: TrainerFilters
  ) => void;
}

export function TrainerFilters({
  filters,
  onChange,
}: Props) {
  return (
    <div
      className="
        flex
        flex-col
        gap-4
        lg:flex-row
      "
    >
      <div className="flex-1">
        <SearchInput
          value={
            filters.search
          }
          onChange={(
            value
          ) =>
            onChange({
              ...filters,
              search:
                value,
            })
          }
        />
      </div>

      <AppSelect
        value={
          filters.trainerType
        }
        onValueChange={(
          value
        ) =>
          onChange({
            ...filters,
            trainerType:
              value as never,
          })
        }
        options={TRAINER_TYPES.map(
          (
            type
          ) => ({
            label:
              type.replaceAll(
                "_",
                " "
              ),
            value:
              type,
          })
        )}
      />

      <AppSelect
        value={
          filters.status
        }
        onValueChange={(
          value
        ) =>
          onChange({
            ...filters,
            status:
              value as never,
          })
        }
        options={TRAINER_STATUSES.map(
          (
            status
          ) => ({
            label:
              status,
            value:
              status,
          })
        )}
      />

      <Button
        variant="outline"
        onClick={() =>
          onChange({
            search: "",
            branchId:
              undefined,
            trainerType:
              undefined,
            status:
              undefined,
            includeDeleted:
              false,
            skip: 0,
            take: 10,
          })
        }
      >
        Reset
      </Button>
    </div>
  );
}