"use client";

import { SecuritySessionsPanel } from "@/src/features/auth/components/security-sessions-panel";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-2 text-slate-600">
          Manage account security and signed-in devices for your admin access.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SecuritySessionsPanel />
      </div>
    </div>
  );
}
