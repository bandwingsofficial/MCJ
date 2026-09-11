export const STUDENT_NOT_FOUND_MESSAGE =
  "Student could not be found.";

export class StudentNotFoundError extends Error {
  readonly isStudentNotFound = true;

  constructor(message = STUDENT_NOT_FOUND_MESSAGE) {
    super(message);
    this.name = "StudentNotFoundError";
  }
}

export function isStudentNotFoundError(
  error: unknown,
): error is StudentNotFoundError {
  if (error instanceof StudentNotFoundError) {
    return true;
  }

  if (error instanceof Error) {
    return (
      error.message === STUDENT_NOT_FOUND_MESSAGE ||
      error.message === "Student profile not found." ||
      error.message === "Student not found"
    );
  }

  return false;
}
