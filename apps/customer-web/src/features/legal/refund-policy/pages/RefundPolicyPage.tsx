"use client";

import { LegalLayout } from "../../components/LegalLayout";

export function RefundPolicyPage() {
  return (
    <LegalLayout title="Refund Policy">

      <section>
        <h2 className="font-semibold text-[#0f2044] mb-2">1. Refund Eligibility</h2>
        <p>
          Refunds are processed only under valid conditions.
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-[#0f2044] mb-2">2. Timeline</h2>
        <p>
          Refunds will be processed within 7-10 business days.
        </p>
      </section>

    </LegalLayout>
  );
}