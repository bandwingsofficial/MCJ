"use client";

import { GraduationCap, Calendar, Clock3, Laptop, MapPin, Users } from "lucide-react";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import type { StudentPortalBatch, StudentPortalTrainer } from "@/src/features/student-portal/types/student-portal.types";

interface BatchSummaryCardProps {
  batch: StudentPortalBatch;
  trainers: StudentPortalTrainer[];
}

export function BatchSummaryCard({ batch, trainers }: BatchSummaryCardProps) {
  const InfoItem = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );

  return (
    <Card className="p-5 shadow-none h-full">
      <div className="flex items-center gap-2 mb-6">
        <GraduationCap className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Batch Details</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-y-4 gap-x-2">
        <InfoItem icon={Laptop} label="Batch" value={batch.name} />
        <InfoItem icon={MapPin} label="Code" value={batch.code} />
        <InfoItem icon={Calendar} label="Start" value={new Date(batch.startDate).toLocaleDateString()} />
        <InfoItem icon={Calendar} label="End" value={new Date(batch.endDate).toLocaleDateString()} />
        <InfoItem icon={Clock3} label="Timing" value={`${batch.startTime} - ${batch.endTime}`} />
        <div className="flex items-center gap-3">
           <Laptop className="h-4 w-4 text-muted-foreground" />
           <div>
            <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Mode</p>
            <Badge variant="default" className="text-[10px]">{batch.mode}</Badge>
           </div>
        </div>
      </div>

      {trainers.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs font-semibold mb-3 flex items-center gap-2"><Users className="h-3 w-3" /> Trainers</p>
          {trainers.map((t) => (
            <div key={t.id} className="text-sm border rounded p-3 mb-2">
              <p className="font-medium">{t.firstName} {t.lastName}</p>
              <p className="text-xs text-muted-foreground">{t.specialization}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}