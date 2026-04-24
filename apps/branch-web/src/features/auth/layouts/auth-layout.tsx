"use client";

import Image from "next/image";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function AuthLayout({ children }: Props) {
  return (
    <div className="flex h-screen w-full">
      {/* LEFT PANEL */}
      <div className="w-1/2 bg-[#0B1120] flex flex-col items-center justify-center text-white px-6">
        <Image
          src="/Logo/MCJ_logo.png"
          alt="MCJ Logo"
          width={90}
          height={90}
          priority
        />

        <h1 className="mt-6 text-2xl font-semibold tracking-wide">
          Admin Login
        </h1>

        <p className="mt-2 text-sm text-gray-400 text-center max-w-xs">
          MCJ Accounting Training Institute
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/2 flex items-center justify-center bg-gray-50 px-6">
        {children}
      </div>
    </div>
  );
}