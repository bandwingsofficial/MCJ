import { batchService } from "@/src/features/batches/services/batch.service";
import { studentService } from "@/src/features/students/services/student.service";
import {
  mapStudentToFormValues,
  toUpdateStudentRequest,
} from "@/src/features/students/utils/student-form.utils";
import type { StudentFormSchema } from "@/src/features/students/schemas/student.schema";

export async function assignBatchToBranch(
  batchId: string,
  branchId: string,
): Promise<void> {
  await batchService.updateBatch(batchId, { branchId });
}

export async function unassignBatchFromBranch(batchId: string): Promise<void> {
  await batchService.updateBatch(batchId, {
    branchId: null,
  });
}

export async function assignStudentToBranch(
  studentId: string,
  branchId: string,
): Promise<void> {
  const response = await studentService.getStudent(studentId);
  const formValues = mapStudentToFormValues(response.data);
  const payload = toUpdateStudentRequest({
    ...(formValues as StudentFormSchema),
    branchId,
  });

  await studentService.updateStudent(studentId, payload);
}
