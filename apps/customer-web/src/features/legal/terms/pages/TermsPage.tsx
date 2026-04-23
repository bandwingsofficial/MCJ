"use client";

import { LegalLayout } from "../../components/LegalLayout";

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">

      <section>
        <h2 className="font-semibold text-[#0f2044] mb-2">1. Acceptance</h2>
        <p>
          By using our platform, you agree to these terms and conditions.
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-[#0f2044] mb-2">2. Services</h2>
        <p>
          We provide accounting training and related services.
        </p>
      </section>

    </LegalLayout>
  );
}