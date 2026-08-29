import { EnrollmentStatus } from '../enums/enrollment-status.enum';
import { Enrollment } from './enrollment.entity';

describe('Enrollment current vs historical statuses', () => {
  it('treats pending, pending-approval, admitted and active as current', () => {
    expect(Enrollment.currentStatuses()).toEqual([
      EnrollmentStatus.PENDING,
      EnrollmentStatus.PENDING_APPROVAL,
      EnrollmentStatus.ADMITTED,
      EnrollmentStatus.ACTIVE,
    ]);
    expect(Enrollment.isCurrentStatus(EnrollmentStatus.ADMITTED)).toBe(true);
    expect(Enrollment.isCurrentStatus(EnrollmentStatus.ACTIVE)).toBe(true);
  });

  it('treats completed, dropped, cancelled and rejected as historical', () => {
    expect(Enrollment.isCurrentStatus(EnrollmentStatus.COMPLETED)).toBe(false);
    expect(Enrollment.isCurrentStatus(EnrollmentStatus.DROPPED)).toBe(false);
    expect(Enrollment.isCurrentStatus(EnrollmentStatus.CANCELLED)).toBe(false);
    expect(Enrollment.isCurrentStatus(EnrollmentStatus.REJECTED)).toBe(false);
  });

  it('does not occupy a batch seat for completed or cancelled enrollments', () => {
    expect(Enrollment.statusOccupiesSeat(EnrollmentStatus.ADMITTED)).toBe(true);
    expect(Enrollment.statusOccupiesSeat(EnrollmentStatus.ACTIVE)).toBe(true);
    expect(Enrollment.statusOccupiesSeat(EnrollmentStatus.COMPLETED)).toBe(
      false,
    );
    expect(Enrollment.statusOccupiesSeat(EnrollmentStatus.CANCELLED)).toBe(
      false,
    );
    expect(Enrollment.statusOccupiesSeat(EnrollmentStatus.PENDING)).toBe(false);
  });
});
