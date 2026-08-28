"use client";

import { ReactNode } from "react";

import { AuthGuard } from "@/src/core/guards/auth.guard";
import { RoleGuard } from "@/src/core/guards/role.guard";
import { BranchSidebar } from "@/src/shared/components/sidebar/admin-sidebar";
import { AdminHeader } from "@/src/shared/components/header/admin-header";
import { AdminFooter } from "@/src/shared/components/footer/admin-footer";

interface Props {
  children: ReactNode;
}

export default function BranchLayout({ children }: Props) {
  return (
    <AuthGuard>
      <RoleGuard>
        <div className="flex h-screen min-h-0 bg-[#FBFDFF]">
          <BranchSidebar />

          <div className="admin-shell flex min-h-0 min-w-0 flex-1 flex-col">
            <AdminHeader />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
              <main className="min-w-0 flex-1 bg-[#FBFDFF] p-8">{children}</main>
              <AdminFooter />
            </div>
          </div>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
