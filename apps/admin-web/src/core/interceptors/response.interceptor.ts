import {
  AxiosError,
  AxiosInstance,
} from "axios";

export const setupResponseInterceptor = (
  api: AxiosInstance
): void => {
  api.interceptors.response.use(
    (response) => response,

    (error: AxiosError) => {
      const message =
        (error.response?.data as { message?: string })?.message ??
        (error.response?.data as { error?: string })?.error ??
        error.message ??
        "Something went wrong";

      return Promise.reject(
        new Error(message)
      );
    }
  );
};