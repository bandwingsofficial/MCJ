import type { Metadata } from "next";

import { AboutPage } from "@/src/features/about/pages/AboutPage";

export const metadata: Metadata = {
  title: "About MCJ Academy | Practical Accounting & Tally Education",
  description:
    "Discover MCJ Academy's practical approach to accounting, Tally, GST and finance education, helping students develop industry-ready skills and build successful careers.",
};

export default function Page() {
  return <AboutPage />;
}