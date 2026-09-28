import { AuthGuard } from "@/src/features/auth/components/auth-guard";
import { AdminAppShell } from "@/src/shared/components/layout/admin-app-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AdminAppShell>{children}</AdminAppShell>
    </AuthGuard>
  );
}
