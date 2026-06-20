// src/features/enrollments/api/enrollment.helper.ts

export const buildEnrollmentQuery = (
  params: Record<
    string,
    unknown
  >,
) => {
  return Object.entries(params).reduce(
    (
      accumulator,
      [key, value],
    ) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        accumulator[key] = value;
      }

      return accumulator;
    },
    {} as Record<
      string,
      unknown
    >,
  );
};