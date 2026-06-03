import { toast } from "sonner";

export const appToast = {
  success: (message: string) =>
    toast.success(message),

  error: (message: string) =>
    toast.error(message),

  info: (message: string) =>
    toast.info(message),

  warning: (message: string) =>
    toast.warning(message),

  loading: (message: string) =>
    toast.loading(message),

  dismiss: (toastId?: string | number) =>
    toast.dismiss(toastId),

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },

  confirm(
    title: string,
    onConfirm: () => void
  ) {
    return toast(title, {
      duration: 10000,

      action: {
        label: "Confirm",
        onClick: onConfirm,
      },

      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  },
};