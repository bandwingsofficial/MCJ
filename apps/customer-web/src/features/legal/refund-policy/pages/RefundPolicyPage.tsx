"use client";

import { LegalLayout } from "../../components/LegalLayout";

export default function Page() {
  return (
    <LegalLayout title="Refund Policy">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#0f2044]">
            Refund Policy
          </h1>
          <p className="text-gray-500 mt-2">
            Last Updated: {new Date().getFullYear()}
          </p>
        </div>

        {/* CONTENT */}
        <div className="space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-[#0f2044] mb-2">
              1. Refund Eligibility
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Refunds are applicable only for valid and verified cases</li>
              <li>Duplicate payments are eligible for full refund</li>
              <li>Technical errors during payment may qualify</li>
              <li>Requests must be raised within 7 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f2044] mb-2">
              2. Refund Process
            </h2>
            <p>
              Users must contact our support team with payment proof and details.
              After verification, refunds will be initiated to the original payment method.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f2044] mb-2">
              3. Refund Timeline
            </h2>
            <p>
              Approved refunds are processed within 7–10 business days depending on the payment provider.
            </p>
          </section>

        </div>
      </div>
    </LegalLayout>
  );
}