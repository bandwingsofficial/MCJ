"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Tooltip } from "@/src/shared/components/ui/tooltip";
import { cn } from "@/src/shared/lib/cn";

import {
  BRANCH_ICON_BUTTON_CLASS,
  BRANCH_ICON_CLASS,
} from "./branch-manage-section";

interface Props {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  destructive?: boolean;
  primary?: boolean;
  success?: boolean;
  className?: string;
}

export function BranchIconAction({
  icon: Icon,
  label,
  onClick,
  href,
  disabled = false,
  destructive = false,
  primary = false,
  success = false,
  className,
}: Props) {
  const buttonClass = cn(
    BRANCH_ICON_BUTTON_CLASS,
    primary && "text-blue-900",
    success && "text-green-800",
    destructive && "text-red-800",
    !primary && !success && !destructive && "text-blue-900",
    disabled && "pointer-events-none opacity-40",
    className,
  );

  const content = href ? (
    <Link
      href={href}
      aria-label={label}
      className={buttonClass}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
        }
      }}
    >
      <Icon className={BRANCH_ICON_CLASS} aria-hidden="true" />
    </Link>
  ) : (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      className={buttonClass}
      onClick={onClick}
    >
      <Icon className={BRANCH_ICON_CLASS} aria-hidden="true" />
    </button>
  );

  return <Tooltip content={label}>{content}</Tooltip>;
}
