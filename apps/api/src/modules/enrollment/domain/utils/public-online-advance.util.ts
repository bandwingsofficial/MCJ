import { ApplicationType } from '../enums/application-type.enum';
import { EnrollmentSource } from '../enums/enrollment-source.enum';

/** Online advance collected at public enrollment checkout (INR). */
export const PUBLIC_ONLINE_ADVANCE_AMOUNT = 500;

export function isPublicOnlineAdvanceEnrollment(params: {
  source: EnrollmentSource;
  applicationType: ApplicationType;
  finalAmount: number;
}): boolean {
  return (
    params.source === EnrollmentSource.PUBLIC &&
    params.applicationType === ApplicationType.ONLINE &&
    params.finalAmount > 0
  );
}

export function hasPaidPublicOnlineAdvance(paidAmount: number): boolean {
  return paidAmount >= PUBLIC_ONLINE_ADVANCE_AMOUNT;
}

export function resolvePublicOnlineOrderAmount(params: {
  dueAmount: number;
  paidAmount: number;
  finalAmount: number;
  source: EnrollmentSource;
  applicationType: ApplicationType;
}): number {
  if (
    !isPublicOnlineAdvanceEnrollment({
      source: params.source,
      applicationType: params.applicationType,
      finalAmount: params.finalAmount,
    })
  ) {
    return params.dueAmount;
  }

  if (hasPaidPublicOnlineAdvance(params.paidAmount)) {
    return 0;
  }

  return Math.min(PUBLIC_ONLINE_ADVANCE_AMOUNT, params.dueAmount);
}
