interface FormErrorProps {
  message?: string;
}

export function FormError({
  message,
}: FormErrorProps) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="mt-1 text-sm text-red-500"
    >
      {message}
    </p>
  );
}