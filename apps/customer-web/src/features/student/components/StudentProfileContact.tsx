"use client";

import { Globe, Home, MapPin, MapPinned } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";

import type { StudentProfile } from "@/src/features/student/types";

interface StudentProfileContactProps {
  profile: StudentProfile | null;
}

export function StudentProfileContact({
  profile,
}: StudentProfileContactProps) {
  return (
    <Card
      className="animate-fade-up border-0 shadow-sm ring-1 ring-border/50"
    >
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Home className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold leading-none tracking-tight">
              Address Information
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Current residential address details.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <InfoItem
            icon={<Home className="h-3.5 w-3.5" />}
            label="Address Line 1"
            value={profile?.addressLine1}
          />
          <InfoItem
            icon={<Home className="h-3.5 w-3.5" />}
            label="Address Line 2"
            value={profile?.addressLine2}
          />
          <InfoItem
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="City"
            value={profile?.city}
          />
          <InfoItem
            icon={<MapPinned className="h-3.5 w-3.5" />}
            label="State"
            value={profile?.state}
          />
          <InfoItem
            icon={<Globe className="h-3.5 w-3.5" />}
            label="Country"
            value={profile?.country}
          />
          <InfoItem
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Postal Code"
            value={profile?.postalCode}
          />
        </div>
      </div>
    </Card>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="rounded-lg border border-border/70 p-4 transition-colors duration-200 hover:border-primary/40 hover:bg-primary/[0.03]">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="break-words text-sm font-semibold text-foreground">
        {value || <span className="font-normal text-muted-foreground/50">Not provided</span>}
      </p>
    </div>
  );
}