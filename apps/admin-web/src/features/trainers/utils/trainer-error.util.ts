import axios from "axios";

interface ApiErrorResponse {
  code?: string;

  message?: string;

  errors?: Record<
    string,
    string[]
  >;
}

export const getTrainerErrorMessage =
  (
    error: unknown
  ): string => {
    if (
      axios.isAxiosError(error)
    ) {
      const data =
        error.response
          ?.data as ApiErrorResponse;

      if (
        data?.errors
      ) {
        const messages =
          Object.values(
            data.errors
          )
            .flat()
            .join(", ");

        if (messages) {
          return messages;
        }
      }

      if (data?.message) {
        return data.message;
      }
    }

    if (
      error instanceof Error
    ) {
      return error.message;
    }

    return "Something went wrong";
  };