"use client";

import Link from "next/link";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-rose-500">
          403
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Access Denied</h1>
        <p className="mt-3 text-sm text-slate-500">
          Your role does not have permission to open this module.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block">
          <Button>Go to dashboard</Button>
        </Link>
      </Card>
    </div>
  );
}
