import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;

  description?: string;

  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-[30px] font-bold tracking-tight text-[#102A56]">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-sm text-[#647A9B]">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}