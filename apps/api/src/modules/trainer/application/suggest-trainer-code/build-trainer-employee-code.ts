export const TRAINER_EMPLOYEE_CODE_PREFIX = 'TR';

export function buildTrainerEmployeeCode(maxSuffix: number): string {
  return `${TRAINER_EMPLOYEE_CODE_PREFIX}${String(maxSuffix + 1).padStart(3, '0')}`;
}
