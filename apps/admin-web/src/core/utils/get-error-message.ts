import { AxiosError } from "axios";

interface ApiErrorResponse {
  success: false;

  code: string;

  message: string;
}

export const getErrorMessage = (
  error: unknown
): string => {
  if (
    error instanceof AxiosError &&
    error.response?.data
  ) {
    const data =
      error.response.data as ApiErrorResponse;

    return (
      data.message ??
      "Something went wrong"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};