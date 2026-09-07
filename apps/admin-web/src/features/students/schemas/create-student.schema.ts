import { z } from "zod";

import { studentSchema } from "@/src/features/students/schemas/student.schema";

export const createStudentSchema = studentSchema.omit({
  emergencyContactName: true,
  emergencyContactPhone: true,
  admissionDate: true,
});

export type CreateStudentFormValues = z.infer<typeof createStudentSchema>;
