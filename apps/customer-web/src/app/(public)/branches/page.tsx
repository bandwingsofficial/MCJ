import type { Metadata } from "next";

import { BranchesPage } from "@/src/features/branches/pages/branches-page";

export const metadata: Metadata = {
  title: "MCJ Academy Branches | Find a Training Center Near You",
  description:
    "Explore MCJ Academy branches and find a convenient training center for practical accounting, Tally, GST and finance courses with career-focused learning.",
};

export default function Page() {
  return <BranchesPage />;
}