import { AdminSidebar } from "@/src/shared/components/sidebar/admin-sidebar";
import { AdminHeader } from "@/src/shared/components/header/admin-header";
import { AuthGuard } from "@/src/features/auth/components/auth-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />

        <div className="flex-1 flex flex-col">
          <AdminHeader />

          <main className="p-6 overflow-y-auto flex-1">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
