"use client";

import { LegalLayout } from "../../components/LegalLayout";

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#0f2044]">
            Privacy Policy
          </h1>
          <p className="text-gray-500 mt-2">
            Last Updated: {new Date().getFullYear()}
          </p>
        </div>

        {/* CONTENT */}
        <div className="space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-[#0f2044] mb-2">
              1. Introduction
            </h2>
            <p>
              We value your privacy and are committed to protecting your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f2044] mb-2">
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Name, email, phone number</li>
              <li>Login & account details</li>
              <li>Course preferences</li>
              <li>Payment details</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0f2044] mb-2">
              3. Usage
            </h2>
            <p>
              Your data is used to provide services, improve experience, and communicate updates.
            </p>
          </section>

        </div>
      </div>
    </LegalLayout>
  );
}