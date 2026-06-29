"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Header } from "@/src/shared/components/header/header";
import { Footer } from "@/src/shared/components/footer/footer";

import { StudentSidebar } from "@/src/features/student";

import { useAuthStore } from "@/src/features/auth/store/auth.store";

interface StudentLayoutProps {
  children: ReactNode;
}

export default function StudentLayout({
  children,
}: StudentLayoutProps) {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [router, user]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <Header />

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <StudentSidebar />

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}