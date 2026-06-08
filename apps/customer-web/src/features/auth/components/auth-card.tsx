// src/features/auth/components/auth-card.tsx

import { ReactNode } from "react";

import { Card } from "@/src/shared/components/ui/card";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthCard({
  title,
  description,
  children,
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-md p-6">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-semibold">
          {title}
        </h1>

        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {children}
    </Card>
  );
}