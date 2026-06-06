"use client";

import { Card } from "@/src/shared/components/ui/card";

import { LoginForm } from "@/src/features/auth/components/login-form";

export function LoginCard() {
  return (
    <Card className="w-full max-w-md p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">
          Branch Portal
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to continue
        </p>
      </div>

      <LoginForm />
    </Card>
  );
}