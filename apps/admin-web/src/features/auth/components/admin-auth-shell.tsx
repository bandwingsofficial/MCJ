"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

import { cn } from "@/src/shared/lib/cn";

interface AdminAuthShellProps {
  eyebrow?: string;
  title: string;
  titleHighlight?: string;
  description: string;
  footerNote?: string;
  sideTagline?: string;
  /** Login page: MCJ security/brand visual in the left panel */
  sideVisualSrc?: string;
  sideVisualAlt?: string;
  /** Login: centered logo on the form panel, no Secure Sign-In badge */
  showFormBrandLogo?: boolean;
  children: ReactNode;
  className?: string;
}

export function AdminAuthShell({
  eyebrow = "Admin access",
  title,
  titleHighlight,
  description,
  footerNote = "Protected by multi-factor authentication",
  sideTagline = "Manage your academy from one secure place.",
  sideVisualSrc,
  sideVisualAlt = "MCJ Academy",
  showFormBrandLogo = false,
  children,
  className,
}: AdminAuthShellProps) {
  const titleParts = titleHighlight
    ? title.split(titleHighlight)
    : [title];

  const hasLoginVisual = Boolean(sideVisualSrc);

  return (
    <div className="admin-auth-page flex h-[100dvh] max-h-[100dvh] min-h-0 items-center justify-center overflow-hidden px-4 py-3 sm:px-5 sm:py-4">
      <div className="admin-auth-page-wash" aria-hidden="true" />

      <div
        className={cn(
          "flex w-full flex-col overflow-hidden rounded-2xl border border-[#DCE8F5] bg-white shadow-[0_20px_50px_rgba(16,42,86,0.08)] lg:flex-row",
          hasLoginVisual
            ? "max-w-[820px] max-h-[min(660px,calc(100dvh-1.25rem))]"
            : "max-w-[920px] max-h-[min(640px,calc(100dvh-1.5rem))]",
          className,
        )}
      >
        {hasLoginVisual && sideVisualSrc ? (
          <aside className="relative hidden min-h-[220px] shrink-0 overflow-hidden bg-gradient-to-br from-[#EEF6FF] via-[#E8F1FF] to-[#DBEAFE] lg:flex lg:w-[48%] lg:border-r lg:border-[#E8F1FF]">
            <Image
              src={sideVisualSrc}
              alt={sideVisualAlt}
              fill
              className="object-cover object-center"
              sizes="(min-width: 1024px) 400px, 0px"
              priority
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#F8FBFF]/35 via-transparent to-[#2563EB]/10"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.2]"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(37, 99, 235, 0.14) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 via-black/15 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 via-black/20 to-transparent"
              aria-hidden
            />

            <div className="relative z-[1] flex h-full min-h-0 flex-col justify-end p-5 sm:p-6">
              <div className="flex max-w-[calc(100%-0.25rem)] items-center gap-2 rounded-xl bg-white/75 px-2.5 py-2 backdrop-blur-md ring-1 ring-white/60">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-50/95 text-emerald-600">
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
                </div>
                <p className="min-w-0 text-[10px] font-semibold leading-snug text-emerald-700">
                  {footerNote}
                </p>
              </div>
            </div>
          </aside>
        ) : (
          <aside className="relative hidden min-h-0 shrink-0 flex-col overflow-hidden border-[#E8F1FF] bg-gradient-to-br from-[#F8FBFF] via-[#EEF6FF] to-[#E4F2FF] lg:flex lg:w-[44%] lg:border-r">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.32]"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(37, 99, 235, 0.11) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
              aria-hidden
            />
            <div className="pointer-events-none absolute -left-12 top-4 h-40 w-40 rounded-full bg-[#DBEAFE]/55 blur-3xl" />
            <div className="pointer-events-none absolute -right-6 bottom-2 h-32 w-32 rounded-full bg-[#E0E7FF]/45 blur-3xl" />

            <div className="relative z-[1] flex min-h-0 flex-1 flex-col p-5 sm:p-6">
              <div className="flex shrink-0 items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_2px_10px_rgba(37,99,235,0.1)] ring-1 ring-[#DCE8F5]">
                  <Image
                    src="/Logo/MCJ_logo.png"
                    alt="MCJ Academy"
                    width={40}
                    height={40}
                    className="h-8 w-8 object-contain"
                    priority
                  />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight text-[#0B1F3A]">
                    MCJ Academy
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
                    Admin Platform
                  </p>
                </div>
              </div>

              <p className="relative mt-4 max-w-[260px] text-sm leading-snug text-slate-600">
                {sideTagline}
              </p>

              <div className="relative mt-auto flex shrink-0 items-center gap-2.5 rounded-xl border border-emerald-200/80 bg-white/90 px-3 py-2.5 shadow-sm backdrop-blur-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <p className="min-w-0 text-[10px] font-semibold leading-snug text-emerald-700">
                  {footerNote}
                </p>
              </div>
            </div>
          </aside>
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center overflow-y-auto px-5 py-5 sm:px-8 sm:py-6 lg:px-8 lg:py-6">
          {hasLoginVisual && sideVisualSrc ? (
            <div className="relative mb-4 overflow-hidden rounded-xl lg:hidden">
              <div className="relative h-36 w-full sm:h-40">
                <Image
                  src={sideVisualSrc}
                  alt={sideVisualAlt}
                  fill
                  className="object-cover object-center"
                  sizes="100vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-white/60" />
              </div>
            </div>
          ) : (
            <div className="mb-4 flex items-center gap-2.5 lg:hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F8FBFF] ring-1 ring-[#DCE8F5]">
                <Image
                  src="/Logo/MCJ_logo.png"
                  alt="MCJ Academy"
                  width={36}
                  height={36}
                  className="h-7 w-7 object-contain"
                  priority
                />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0B1F3A]">MCJ Academy</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
                  Admin Platform
                </p>
              </div>
            </div>
          )}

          {showFormBrandLogo ? (
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#F8FBFF] ring-1 ring-[#DCE8F5]">
                <Image
                  src="/Logo/MCJ_logo.png"
                  alt="MCJ Academy"
                  width={56}
                  height={56}
                  className="h-11 w-11 object-contain"
                  priority
                />
              </div>
            </div>
          ) : null}

          {!showFormBrandLogo ? (
            <div className="mb-1.5 inline-flex w-fit items-center rounded-full border border-[#BFDBFE] bg-[#F8FBFF] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
              {eyebrow}
            </div>
          ) : null}

          <h1
            className={cn(
              "text-xl font-bold tracking-tight text-[#0B1F3A] sm:text-2xl",
              showFormBrandLogo && "text-center",
            )}
          >
            {titleHighlight && titleParts.length > 1 ? (
              <>
                {titleParts[0]}
                <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
                  {titleHighlight}
                </span>
                {titleParts.slice(1).join(titleHighlight)}
              </>
            ) : (
              title
            )}
          </h1>

          <p
            className={cn(
              "mt-1.5 text-sm leading-snug text-slate-600",
              showFormBrandLogo && "text-center",
            )}
          >
            {description}
          </p>

          <div className={cn("mt-5 min-h-0", showFormBrandLogo && "mx-auto w-full max-w-[340px]")}>
            {children}
          </div>

          {footerNote ? (
            <p
              className={cn(
                "mt-5 shrink-0 text-center text-[10px] font-semibold tracking-[0.06em]",
                showFormBrandLogo
                  ? "text-emerald-600"
                  : "font-medium uppercase tracking-[0.1em] text-[#647A9B]/85",
              )}
            >
              {footerNote}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
