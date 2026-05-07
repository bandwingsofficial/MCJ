// src/features/auth/components/auth-layout.tsx

import Image from "next/image";
import Link from "next/link";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode; // 🔥 optional footer (links)
}

export const AuthLayout = ({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      
      {/* 🔥 LOGO + BRAND */}
      <div className="flex items-center gap-2 mb-6">
        <Image
          src="/logo/MCJ_logo.png"
          alt="MCJ Logo"
          width={40}
          height={40}
          style={{ height: "auto" }} // fix warning
        />
        <span className="text-lg font-semibold text-gray-900">
          MCJ Institute
        </span>
      </div>

      {/* 🔥 CARD */}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        
        {/* TITLE */}
        <h1 className="text-2xl font-bold text-gray-900">
          {title}
        </h1>

        {/* SUBTITLE */}
        {subtitle && (
          <p className="text-gray-500 mt-1 text-sm">
            {subtitle}
          </p>
        )}

        {/* FORM */}
        <div className="mt-6">{children}</div>

        {/* 🔥 FOOTER LINKS */}
        {footer && (
          <div className="mt-6 border-t pt-4 text-sm text-center text-gray-600">
            {footer}
          </div>
        )}
      </div>

      {/* 🔥 BACK TO HOME */}
      <Link
        href="/"
        className="mt-6 text-sm text-gray-500 hover:text-black"
      >
        ← Back to Home
      </Link>
    </div>
  );
};