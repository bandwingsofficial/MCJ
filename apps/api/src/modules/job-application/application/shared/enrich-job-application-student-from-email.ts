import type { Student } from '@modules/student/domain/entities/student.entity';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import type {
  JobApplicationDetailView,
  JobApplicationStudentView,
} from '../../domain/repositories/job-application.repository';
import { resolveApplicationEmail } from './resolve-job-application-student-link';

function mapStudentToView(student: Student): JobApplicationStudentView {
  return {
    id: student.id,
    studentCode: student.studentCode.getValue(),
    firstName: student.firstName.getValue(),
    lastName: student.lastName?.getValue() ?? null,
    email: student.email.getValue(),
    phone: student.phone.getValue(),
    gender: student.gender,
    dateOfBirth: student.dateOfBirth,
    addressLine1: student.address.addressLine1,
    addressLine2: student.address.addressLine2,
    city: student.address.city,
    state: student.address.state,
    country: student.address.country,
    postalCode: student.address.postalCode,
    qualification: student.qualification.getValue(),
    collegeName: student.collegeName,
    specialization: student.specialization,
    passingYear: student.passingYear,
    parentName: student.parentName?.getValue() ?? null,
    parentPhone: student.parentPhone.getValue(),
    emergencyContactName: student.emergencyContactName?.getValue() ?? null,
    emergencyContactPhone: student.emergencyContactPhone.getValue(),
    notes: student.notes,
    status: student.status,
    jobStatus: student.jobStatus,
  };
}

async function resolveStudentByEmail(
  studentRepo: StudentRepository,
  emailCache: Map<string, Student | null>,
  email: string,
): Promise<Student | null> {
  const normalized = email.trim().toLowerCase();

  if (!emailCache.has(normalized)) {
    emailCache.set(normalized, await studentRepo.findByEmail(email));
  }

  return emailCache.get(normalized) ?? null;
}

export async function enrichJobApplicationStudentFromEmail(
  studentRepo: StudentRepository,
  item: JobApplicationDetailView,
  emailCache = new Map<string, Student | null>(),
): Promise<JobApplicationDetailView> {
  if (item.student?.studentCode) {
    return item;
  }

  const email = resolveApplicationEmail(item);

  if (!email) {
    return item;
  }

  const student = await resolveStudentByEmail(studentRepo, emailCache, email);

  if (!student) {
    return item;
  }

  return {
    ...item,
    resolvedStudentCode: student.studentCode.getValue(),
    student: mapStudentToView(student),
  };
}

export async function enrichJobApplicationStudentsFromEmail(
  studentRepo: StudentRepository,
  items: JobApplicationDetailView[],
): Promise<JobApplicationDetailView[]> {
  const emailCache = new Map<string, Student | null>();

  return Promise.all(
    items.map((item) =>
      enrichJobApplicationStudentFromEmail(studentRepo, item, emailCache),
    ),
  );
}
