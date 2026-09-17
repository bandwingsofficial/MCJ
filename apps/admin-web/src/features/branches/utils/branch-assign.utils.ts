import { branchService } from "@/src/features/branches/services/branch.service";
import { studentService } from "@/src/features/students/services/student.service";
import {
  mapStudentToFormValues,
  toUpdateStudentRequest,
} from "@/src/features/students/utils/student-form.utils";

export async function assignBatchToBranch(
  batchId: string,
  branchId: string,
): Promise<void> {
  await branchService.assignBatches(branchId, [batchId]);
}

export async function unassignBatchFromBranch(
  branchId: string,
  batchId: string,
): Promise<void> {
  await branchService.unassignBatch(branchId, batchId);
}

export async function assignStudentToBranch(
  studentId: string,
  branchId: string,
): Promise<void> {
  const response = await studentService.getStudent(studentId);
  const formValues = mapStudentToFormValues(response.data);
  const payload = toUpdateStudentRequest({
    ...formValues,
    branchId,
  });

  await studentService.updateStudent(studentId, payload);
}
