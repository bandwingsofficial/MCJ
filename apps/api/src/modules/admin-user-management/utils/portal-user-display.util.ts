const PLACEHOLDER_STUDENT_EMAIL = /@students\.local$/i;
const TOMBSTONE_EMAIL = /^deleted\+.+\@deleted\.mcj\.local$/i;

export type PortalUserDisplaySource = {
  name: string;
  email: string;
  phone: string | null;
  referralCode: string | null;
  student?: {
    firstName: string;
    lastName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  userDeletionRecord?: {
    originalEmailNormalized: string;
    originalPhone: string | null;
    originalEmail?: string | null;
    originalName?: string | null;
  } | null;
};

export function isInternalPortalEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) {
    return false;
  }

  return (
    PLACEHOLDER_STUDENT_EMAIL.test(trimmed) ||
    TOMBSTONE_EMAIL.test(trimmed)
  );
}

export function resolvePortalUserDisplay(
  source: PortalUserDisplaySource,
): {
  name: string;
  email: string;
  phone: string | null;
  referralCode: string | null;
} {
  let name = source.name?.trim() ?? '';
  let email = source.email?.trim() ?? '';
  let phone = source.phone?.trim() || null;

  if (source.student) {
    const studentName = [source.student.firstName, source.student.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (studentName) {
      name = studentName;
    }

    if (source.student.email?.trim()) {
      email = source.student.email.trim();
    }

    if (source.student.phone?.trim()) {
      phone = source.student.phone.trim();
    }
  }

  if (
    (TOMBSTONE_EMAIL.test(source.email) || name === 'Deleted User') &&
    source.userDeletionRecord
  ) {
    const record = source.userDeletionRecord;
    email =
      record.originalEmail?.trim() ||
      record.originalEmailNormalized?.trim() ||
      email;
    phone = record.originalPhone?.trim() ?? phone;

    if (record.originalName?.trim()) {
      name = record.originalName.trim();
    }
  }

  if (isInternalPortalEmail(email)) {
    email = '';
  }

  return {
    name: name || 'User',
    email,
    phone,
    referralCode: source.referralCode,
  };
}
