import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import type { JobApplicationDetailView } from '../../domain/repositories/job-application.repository';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

export function resolveApplicationEmail(
  item: Pick<
    JobApplicationDetailView,
    'applicantEmail' | 'user' | 'student'
  >,
): string | null {
  const email =
    item.applicantEmail?.trim() ||
    item.user?.email?.trim() ||
    item.student?.email?.trim() ||
    null;

  return email ? email : null;
}

export async function resolveJobApplicationStudentLink(
  applicationRepo: JobApplicationRepository,
  studentRepo: StudentRepository,
  item: JobApplicationDetailView,
): Promise<boolean> {
  if (item.student?.studentCode) {
    return false;
  }

  const email = resolveApplicationEmail(item);

  if (!email) {
    return false;
  }

  const student = await studentRepo.findByEmail(email);

  if (!student) {
    return false;
  }

  const existing = await applicationRepo.findByJobAndStudent(
    item.jobId,
    student.id,
  );

  if (existing && existing.id !== item.id) {
    return false;
  }

  if (item.studentId === student.id) {
    return false;
  }

  await applicationRepo.updateStudentId(item.id, student.id);

  return true;
}

export async function resolveJobApplicationStudentLinks(
  applicationRepo: JobApplicationRepository,
  studentRepo: StudentRepository,
  items: JobApplicationDetailView[],
): Promise<void> {
  for (const item of items) {
    await resolveJobApplicationStudentLink(
      applicationRepo,
      studentRepo,
      item,
    );
  }
}
