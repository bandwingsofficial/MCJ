"use client";

import { LegalLayout } from "../../components/LegalLayout";

export function ReturnPolicyPage() {
  return (
    <LegalLayout title="Return Policy">

      <section>
        <h2 className="font-semibold text-[#0f2044] mb-2">1. Eligibility</h2>
        <p>
          Returns are applicable only under specific conditions.
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-[#0f2044] mb-2">2. Process</h2>
        <p>
          Contact support within 7 days to initiate a return.
        </p>
      </section>

    </LegalLayout>
  );
}