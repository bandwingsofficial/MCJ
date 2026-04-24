"use client";

import { LegalLayout } from "../../components/LegalLayout";

export default function Page() {
  return (
    <LegalLayout title="Return Policy">
      <div className="max-w-4xl mx-auto px-4 py-10">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#0f2044]">
            Return Policy
          </h1>
          <p className="text-gray-500 mt-2">
            Last Updated: {new Date().getFullYear()}
          </p>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-[#0f2044] mb-2">
              1. Eligibility for Returns
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Return requests must be raised within 7 days</li>
              <li>Applicable only for eligible services or products</li>
              <li>Valid proof is required for processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f2044] mb-2">
              2. Return Process
            </h2>
            <p>
              To initiate a return, contact our support team with relevant details.
              Our team will review and guide you through the process.
            </p>
          </section>

        </div>
      </div>
    </LegalLayout>
  );
}