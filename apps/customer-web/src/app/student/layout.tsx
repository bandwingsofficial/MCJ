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

export default function StudentLayout({ children }: StudentLayoutProps) {
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
    // Removed h-screen and overflow-hidden to allow natural page scrolling
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      
      <Header />

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar: Fixed display on desktop */}
        <div className="hidden md:block w-[240px] flex-shrink-0">
          <div className="sticky top-0">
            <StudentSidebar />
          </div>
        </div>

        {/* Content: Will naturally push the footer down */}
        <main className="flex-1 w-full">
          <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}