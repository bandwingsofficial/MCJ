"use client";

import { ReactNode } from "react";

import { AuthGuard } from "@/src/core/guards/auth.guard";
import { RoleGuard } from "@/src/core/guards/role.guard";
import { BranchAppShell } from "@/src/shared/components/layout/branch-app-shell";

interface Props {
  children: ReactNode;
}

export default function BranchLayout({ children }: Props) {
  return (
    <AuthGuard>
      <RoleGuard>
        <BranchAppShell>{children}</BranchAppShell>
      </RoleGuard>
    </AuthGuard>
  );
}
