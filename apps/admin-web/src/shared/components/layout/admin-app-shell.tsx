"use client";

import { useCallback, useState, type ReactNode } from "react";

import { AdminFooter } from "@/src/shared/components/footer/admin-footer";
import { AdminHeader } from "@/src/shared/components/header/admin-header";
import { AdminSidebar } from "@/src/shared/components/sidebar/admin-sidebar";

interface AdminAppShellProps {
  children: ReactNode;
}

export function AdminAppShell({ children }: AdminAppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  return (
    <div className="admin-app-viewport flex min-h-0 w-full min-w-0 bg-[#FBFDFF]">
      <div className="hidden h-full shrink-0 lg:flex">
        <AdminSidebar />
      </div>

      {mobileNavOpen ? (
        <>
          <button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 z-40 bg-[#0B1F3A]/40 lg:hidden"
            onClick={closeMobileNav}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex lg:hidden">
            <AdminSidebar mobile onNavigate={closeMobileNav} />
          </div>
        </>
      ) : null}

      <div className="admin-shell flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminHeader onOpenMobileNav={() => setMobileNavOpen(true)} />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          <main className="min-w-0 flex-1 bg-[#FBFDFF] p-4 sm:p-6 lg:p-8">
            {children}
          </main>

          <AdminFooter />
        </div>
      </div>
    </div>
  );
}
