"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { StudentSidebar } from "@/src/features/student";

import { useAuthStore } from "@/src/features/auth/store/auth.store";

interface StudentLayoutProps {
  children: ReactNode;
}

export default function StudentLayout({
  children,
}: StudentLayoutProps) {
  const router = useRouter();

  const user = useAuthStore(
    (state) => state.user,
  );

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [router, user]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50 antialiased text-slate-900">
      {/* Sidebar Area */}
      <StudentSidebar />

      {/* Main Content Workspace */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="mx-auto max-w-7xl w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
}