import { ApplicationType } from '../enums/application-type.enum';
import { EnrollmentSource } from '../enums/enrollment-source.enum';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';
import {
  hasPaidPublicOnlineAdvance,
  isPublicOnlineAdvanceEnrollment,
} from './public-online-advance.util';

/** Ghost enrollments created before payment-first checkout must not appear in lists. */
export function isUnpaidPublicOnlineCheckoutEnrollment(params: {
  source: EnrollmentSource | string;
  applicationType: ApplicationType | string;
  status: EnrollmentStatus | string;
  finalAmount: number;
  paidAmount: number;
}): boolean {
  if (
    !isPublicOnlineAdvanceEnrollment({
      source: params.source as EnrollmentSource,
      applicationType: params.applicationType as ApplicationType,
      finalAmount: params.finalAmount,
    })
  ) {
    return false;
  }

  if (
    params.status !== EnrollmentStatus.PENDING &&
    params.status !== EnrollmentStatus.PENDING_APPROVAL
  ) {
    return false;
  }

  return !hasPaidPublicOnlineAdvance(params.paidAmount);
}

export function shouldExposeEnrollmentInCustomerAndAdminLists(params: {
  source: EnrollmentSource | string;
  applicationType: ApplicationType | string;
  status: EnrollmentStatus | string;
  finalAmount: number;
  paidAmount: number;
  isDeleted: boolean;
}): boolean {
  if (params.isDeleted) {
    return false;
  }

  return !isUnpaidPublicOnlineCheckoutEnrollment(params);
}
