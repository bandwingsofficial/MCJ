"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Laptop,
  Smartphone,
  Shield,
  LogOut,
  RefreshCw,
  Monitor,
} from "lucide-react";

import { authService } from "@/src/features/auth/services/auth.service";
import { AuthSession } from "@/src/features/auth/types/session.types";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { Button } from "@/src/shared/components/ui/button";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Loader } from "@/src/shared/components/ui/loader";
import { EmptyState } from "@/src/shared/components/ui/empty-state";

function formatRelative(dateValue: string | null): string {
  if (!dateValue) {
    return "Unknown";
  }

  const date = new Date(dateValue);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(diffMs)) {
    return "Unknown";
  }

  if (diffMs < 60_000) {
    return "Active now";
  }

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function clientLabel(session: AuthSession): string {
  switch (session.clientType) {
    case "ADMIN_WEB":
      return "Admin Web";
    case "WEB":
      return "Web";
    case "IOS":
      return "iOS";
    case "ANDROID":
      return "Android";
    default:
      return "Unknown client";
  }
}

function SessionIcon({ session }: { session: AuthSession }) {
  if (session.clientType === "IOS" || session.clientType === "ANDROID") {
    return <Smartphone className="h-5 w-5 text-amber-500" />;
  }
  if (session.device.toLowerCase().includes("desktop") || session.clientType === "ADMIN_WEB") {
    return <Monitor className="h-5 w-5 text-amber-500" />;
  }
  return <Laptop className="h-5 w-5 text-amber-500" />;
}

export function SecuritySessionsPanel() {
  const router = useRouter();
  const { logoutAll, clearUser } = useAuth();

  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.listSessions();
      setSessions(response.data.sessions ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const current = sessions.find((s) => s.isCurrent) ?? null;
  const others = sessions.filter((s) => !s.isCurrent);

  const handleRevoke = async () => {
    if (!revokeId) {
      return;
    }

    const target = sessions.find((s) => s.id === revokeId);
    const isCurrent = Boolean(target?.isCurrent);

    try {
      setRevokeLoading(true);
      await authService.revokeSession(revokeId);

      if (isCurrent) {
        authService.clearLocalAuth();
        clearUser();
        toast.success("Current session revoked");
        router.replace("/login");
        return;
      }

      toast.success("Session revoked");
      setRevokeId(null);
      await loadSessions();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRevokeLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      setLogoutAllLoading(true);
      await logoutAll();
      toast.success("Logged out from all devices");
    } catch (err) {
      toast.error(getErrorMessage(err));
      setLogoutAllLoading(false);
      setLogoutAllOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-slate-900">Security</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage devices signed in to your admin account. Revoking a session
            immediately invalidates its refresh credential on the server.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadSessions()}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => setLogoutAllOpen(true)}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out all devices
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          title="No active sessions"
          description="There are no active sessions for this account."
        />
      ) : (
        <div className="space-y-6">
          {current && (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Current session
              </p>
              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-2 shadow-sm">
                    <SessionIcon session={current} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {current.device}
                    </p>
                    <p className="text-sm text-slate-600">
                      {clientLabel(current)}
                      {current.ipAddress ? ` · ${current.ipAddress}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-emerald-700">
                      {formatRelative(current.lastUsedAt)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRevokeId(current.id)}
                >
                  Sign out this device
                </Button>
              </div>
            </section>
          )}

          <section>
            <h3 className="text-sm font-semibold text-slate-800">
              Other sessions
            </h3>

            {others.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No other devices are signed in.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {others.map((session) => (
                  <li
                    key={session.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-slate-50 p-2">
                        <SessionIcon session={session} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {session.device}
                        </p>
                        <p className="text-sm text-slate-600">
                          {clientLabel(session)}
                          {session.ipAddress ? ` · ${session.ipAddress}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Last active {formatRelative(session.lastUsedAt)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRevokeId(session.id)}
                    >
                      Revoke
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(revokeId)}
        title="Revoke this session?"
        description={
          sessions.find((s) => s.id === revokeId)?.isCurrent
            ? "This will sign you out of the current device and return you to the login page."
            : "That device will no longer be able to refresh its session or access the admin panel."
        }
        loading={revokeLoading}
        onConfirm={() => void handleRevoke()}
        onCancel={() => setRevokeId(null)}
      />

      <ConfirmDialog
        open={logoutAllOpen}
        title="Log out all devices?"
        description="Every active admin session for your account will be revoked, including this one."
        loading={logoutAllLoading}
        onConfirm={() => void handleLogoutAll()}
        onCancel={() => setLogoutAllOpen(false)}
      />
    </div>
  );
}
