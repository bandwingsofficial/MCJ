"use client";

import { ReactNode } from "react";

import { AuthGuard } from "@/src/core/guards/auth.guard";

import { BranchSidebar } from "@/src/shared/components/sidebar/admin-sidebar";

import { AdminHeader } from "@/src/shared/components/header/admin-header";

interface Props {
  children: ReactNode;
}

export default function BranchLayout({
  children,
}: Props) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <BranchSidebar />

        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader />

          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}