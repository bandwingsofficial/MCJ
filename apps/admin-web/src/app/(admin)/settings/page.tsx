"use client";

import { SecuritySessionsPanel } from "@/src/features/auth/components/security-sessions-panel";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-[30px] font-bold tracking-tight text-[#102A56]">Settings</h1>
        <p className="mt-2 text-[#647A9B]">
          Manage account security and signed-in devices for your admin access.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E1EBF5] bg-white p-6 shadow-[0_2px_10px_rgba(16,42,86,0.05)]">
        <SecuritySessionsPanel />
      </div>
    </div>
  );
}
