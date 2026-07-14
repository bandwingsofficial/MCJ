"use client";

import { Home, MapPin, MapPinned, Globe } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";

import type { StudentProfile } from "@/src/features/student/types";

interface StudentProfileContactProps {
  profile: StudentProfile | null;
}

export function StudentProfileContact({
  profile,
}: StudentProfileContactProps) {
  return (
    <Card className="border-0 shadow-sm">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Address Information
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Current residential address details.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <InfoItem
            icon={<Home className="h-4 w-4" />}
            label="Address Line 1"
            value={profile?.addressLine1}
          />

          <InfoItem
            icon={<Home className="h-4 w-4" />}
            label="Address Line 2"
            value={profile?.addressLine2}
          />

          <InfoItem
            icon={<MapPin className="h-4 w-4" />}
            label="City"
            value={profile?.city}
          />

          <InfoItem
            icon={<MapPinned className="h-4 w-4" />}
            label="State"
            value={profile?.state}
          />

          <InfoItem
            icon={<Globe className="h-4 w-4" />}
            label="Country"
            value={profile?.country}
          />

          <InfoItem
            icon={<MapPin className="h-4 w-4" />}
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

function InfoItem({
  icon,
  label,
  value,
}: InfoItemProps) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>

      <p className="text-sm font-semibold break-words">
        {value || "-"}
      </p>
    </div>
  );
}