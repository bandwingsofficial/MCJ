import type {
  PlacementStatus,
} from "@/src/features/placements/types/placement.types";

export const PLACEMENT_STATUS_OPTIONS: {
  label: string;
  value: PlacementStatus;
}[] = [
  {
    label: "Pending",
    value: "PENDING",
  },
  {
    label: "Joined",
    value: "JOINED",
  },
];

export const PLACEMENT_DEFAULT_REMARKS =
  "";

export const PLACEMENT_DEFAULT_JOINING_DATE =
  "";

export const PLACEMENT_TABLE_PAGE_SIZE =
  10;