// src/app/(branch)/layout.tsx

import { BranchSidebar  } from "@/src/shared/components/sidebar/admin-sidebar";
import { AdminHeader } from "@/src/shared/components/header/admin-header";

export default function BranchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <BranchSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}