import { toast } from "sonner";

export interface ToastOptions {
  description?: string;
  duration?: number;
}

export interface ConfirmToastOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
}

export const appToast = {
  success: (
    title: string,
    options?: ToastOptions
  ): void => {
    toast.success(title, {
      description: options?.description,
      duration: options?.duration ?? 3000,
    });
  },

  error: (
    title: string,
    options?: ToastOptions
  ): void => {
    toast.error(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
    });
  },

  warning: (
    title: string,
    options?: ToastOptions
  ): void => {
    toast.warning(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
    });
  },

  info: (
    title: string,
    options?: ToastOptions
  ): void => {
    toast.info(title, {
      description: options?.description,
      duration: options?.duration ?? 3000,
    });
  },

  loading: (
    message: string
  ): string | number => {
    return toast.loading(message);
  },

  dismiss: (
    toastId?: string | number
  ): void => {
    toast.dismiss(toastId);
  },

  promise: async <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: () => messages.success,
      error: () => messages.error,
    });
  },

  confirm: ({
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
  }: ConfirmToastOptions): void => {
    toast(title, {
      description,
      duration: 10000,

      action: {
        label: confirmLabel,
        onClick: async () => {
          await onConfirm();
        },
      },

      cancel: {
        label: cancelLabel,
        onClick: () => {},
      },
    });
  },
};