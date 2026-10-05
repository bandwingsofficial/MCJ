import { Suspense } from "react";

import { ReferralRewardsAdminPage } from "@/src/features/referral-rewards/pages/referral-rewards-admin-page";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ReferralRewardsAdminPage />
    </Suspense>
  );
}
