import { AdminSidebar } from "@/src/shared/components/sidebar/admin-sidebar";
import { AdminHeader } from "@/src/shared/components/header/admin-header";
import { AdminFooter } from "@/src/shared/components/footer/admin-footer";
import { AuthGuard } from "@/src/features/auth/components/auth-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="admin-app-viewport flex min-h-0 w-full min-w-0 bg-[#FBFDFF]">
        <AdminSidebar />

        <div className="admin-shell flex min-h-0 min-w-0 flex-1 flex-col">
          <AdminHeader />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
            <main className="min-w-0 flex-1 bg-[#FBFDFF] p-8">
              {children}
            </main>

            <AdminFooter />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
