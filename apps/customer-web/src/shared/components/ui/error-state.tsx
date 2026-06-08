import { Button } from "@/src/shared/components/ui/button";

interface ErrorStateProps {
  title?: string;

  description?: string;

  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "Unable to load data.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 py-12 text-center">
      <h3 className="text-lg font-semibold text-red-600">
        {title}
      </h3>

      <p className="mt-2 text-sm text-red-500">
        {description}
      </p>

      {onRetry && (
        <Button
          className="mt-4"
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </div>
  );
}