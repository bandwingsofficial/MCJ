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
      return Promise.reject(error);
    }
  );
};