import {
  BranchStatus,
} from "@/src/features/branches/types/branch.types";

export const BRANCH_STATUS_OPTIONS: {
  label: string;
  value: BranchStatus;
}[] = [
  {
    label: "Active",
    value: "ACTIVE",
  },
  {
    label: "Inactive",
    value: "INACTIVE",
  },
];