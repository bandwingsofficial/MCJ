import { z } from "zod";

import {
  PLACEMENT_STATUSES,
} from "@/src/features/placements/types/placement.types";

export const updatePlacementSchema =
  z.object({
    status: z.enum(
      PLACEMENT_STATUSES,
      {
        error: "Please select a valid status.",
      },
    ),

    joiningDate: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),

    remarks: z
      .string()
      .trim()
      .max(
        500,
        "Remarks cannot exceed 500 characters.",
      )
      .optional(),
  });

export type UpdatePlacementFormValues =
  z.infer<
    typeof updatePlacementSchema
  >;