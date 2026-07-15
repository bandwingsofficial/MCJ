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

  const user =
    useAuthStore(
      (state) =>
        state.user,
    );

  useEffect(() => {
    if (!user) {
      router.replace(
        "/login",
      );
    }
  }, [
    router,
    user,
  ]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />

      <div className="flex flex-1">
        <div className="hidden w-[240px] flex-shrink-0 md:block">
          <div className="sticky top-0">
            <StudentSidebar />
          </div>
        </div>

        <main className="w-full flex-1">
          <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}