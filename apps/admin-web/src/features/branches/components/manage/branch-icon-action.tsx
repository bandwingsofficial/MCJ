"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import { cn } from "@/src/shared/lib/cn";

const iconBtnClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900";

interface Props {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  destructive?: boolean;
  className?: string;
}

export function BranchIconAction({
  icon: Icon,
  label,
  onClick,
  href,
  disabled = false,
  destructive = false,
  className,
}: Props) {
  const buttonClass = cn(
    iconBtnClass,
    destructive && "text-red-600 hover:bg-red-50 hover:text-red-700",
    disabled && "pointer-events-none opacity-50",
    className,
  );

  const content = href ? (
    <Link href={href} aria-label={label} className={buttonClass}>
      <Icon className="h-4 w-4" />
    </Link>
  ) : (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={disabled}
      aria-label={label}
      className={buttonClass}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return <Tooltip content={label}>{content}</Tooltip>;
}
