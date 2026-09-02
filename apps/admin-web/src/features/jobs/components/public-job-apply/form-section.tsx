import type { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-[#102A56]">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs text-[#647A9B]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
