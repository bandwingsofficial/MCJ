import type { ReactNode } from "react";
import Image from "next/image";

export default function PublicOnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#FBFDFF]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-24 -top-28 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.14)_0%,transparent_70%)]" />
        <div className="absolute -bottom-28 -left-20 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.18)_0%,transparent_70%)]" />
        <div className="absolute left-1/2 top-24 h-[240px] w-[240px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(191,219,254,0.22)_0%,transparent_70%)]" />
      </div>

      <header className="relative z-10 border-b border-[#DCE8F5] bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-4">
          <span className="relative h-10 w-10 shrink-0">
            <Image
              src="/Logo/MCJ_logo.png"
              alt="MCJ Institute"
              fill
              className="object-contain"
            />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-tight text-[#102A56]">
              MCJ Institute
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
              Admin Platform / Company Job Onboarding
            </span>
          </span>
        </div>
      </header>

      <main className="relative z-10 flex-1">{children}</main>
    </div>
  );
}
