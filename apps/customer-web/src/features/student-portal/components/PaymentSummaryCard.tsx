"use client";

import { Wallet, IndianRupee } from "lucide-react";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import type { StudentPortalEnrollment, StudentPortalPaymentSummary } from "@/src/features/student-portal/types/student-portal.types";

interface PaymentSummaryCardProps {
  enrollment: StudentPortalEnrollment;
  paymentSummary: StudentPortalPaymentSummary;
}

export function PaymentSummaryCard({ enrollment, paymentSummary }: PaymentSummaryCardProps) {
  const Row = ({ label, value, highlight = false }: any) => (
    <div className="flex justify-between py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "font-bold" : "font-medium"}>{value}</span>
    </div>
  );

  return (
    <Card className="p-5 shadow-none h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Payments</h3>
        </div>
        <Badge variant={enrollment.paymentStatus === "PAID" ? "default" : "default"}>
          {enrollment.paymentStatus}
        </Badge>
      </div>

      <div className="space-y-1">
        <Row label="Course Fee" value={`₹${paymentSummary.feeAmount}`} />
        <Row label="Discount" value={`-₹${paymentSummary.discountAmount}`} />
        <div className="border-t my-2" />
        <Row label="Total" value={`₹${paymentSummary.finalAmount}`} highlight />
        <Row label="Paid" value={`₹${paymentSummary.paidAmount}`} />
        <Row label="Due" value={`₹${paymentSummary.dueAmount}`} />
      </div>
    </Card>
  );
}