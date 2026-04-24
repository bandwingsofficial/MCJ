"use client";

import { LegalLayout } from "../../components/LegalLayout";

export default function Page() {
  return (
    <LegalLayout title="Terms of Service">
      <div className="max-w-4xl mx-auto px-4 py-10">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#0f2044]">
            Terms of Service
          </h1>
          <p className="text-gray-500 mt-2">
            Last Updated: {new Date().getFullYear()}
          </p>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-[#0f2044] mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using our platform, you agree to comply with these terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f2044] mb-2">
              2. Services Provided
            </h2>
            <p>
              We offer accounting training, educational content, and related services through our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f2044] mb-2">
              3. User Responsibilities
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide accurate information</li>
              <li>Maintain account confidentiality</li>
              <li>Use services ethically and legally</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f2044] mb-2">
              4. Limitation of Liability
            </h2>
            <p>
              We are not liable for any indirect or incidental damages arising from platform usage.
            </p>
          </section>

        </div>
      </div>
    </LegalLayout>
  );
}