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
        gap-3
        sm:flex-row
        sm:items-center
        w-full
      "
    >
      <div className="flex-1 min-w-[200px]">
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

      <div className="w-full sm:w-[180px]">
        <AppSelect
          placeholder="Select Type"
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
      </div>

      <div className="w-full sm:w-[180px]">
        <AppSelect
          placeholder="Select Status"
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
      </div>

      <Button
        variant="outline"
        className="h-10 px-4 w-full sm:w-auto shrink-0"
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