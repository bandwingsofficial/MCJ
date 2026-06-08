// src/shared/components/ui/heading.tsx

import { cn } from "@/src/shared/lib/cn";

interface HeadingProps {
  title: string;

  subtitle?: string;

  align?: "left" | "center";

  className?: string;
}

export function Heading({
  title,
  subtitle,
  align = "left",
  className,
}: HeadingProps) {
  return (
    <div
      className={cn(
        align === "center"
          ? "text-center"
          : "text-left",
        className
      )}
    >
      <h2
        className="
          text-3xl
          md:text-4xl
          font-bold
          tracking-tight
          text-gray-900
          leading-tight
        "
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className="
            mt-4
            text-base
            md:text-lg
            text-gray-600
            leading-relaxed
            max-w-2xl
          "
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}