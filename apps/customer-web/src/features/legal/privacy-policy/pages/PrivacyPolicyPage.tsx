"use client";

import { LegalLayout } from "../../components/LegalLayout";

export function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy">

      <section>
        <h2 className="font-semibold text-[#0f2044] mb-2">1. Introduction</h2>
        <p>
          We value your privacy and are committed to protecting your personal information.
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-[#0f2044] mb-2">2. Information We Collect</h2>
        <p>
          We may collect personal information such as name, email, phone number, and course preferences.
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-[#0f2044] mb-2">3. Usage</h2>
        <p>
          Your data is used to provide services, improve experience, and communicate updates.
        </p>
      </section>

    </LegalLayout>
  );
}