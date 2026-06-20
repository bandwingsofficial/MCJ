import { z } from "zod";

import {
  EnrollmentStatus,
} from "../types";

export const updateEnrollmentStatusSchema =
  z.object({
    status: z.nativeEnum(
      EnrollmentStatus,
    ),
  });

export type UpdateEnrollmentStatusForm =
  z.infer<
    typeof updateEnrollmentStatusSchema
  >;