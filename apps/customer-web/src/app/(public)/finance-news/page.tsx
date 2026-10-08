import type { Metadata } from "next";

import { FinanceNewsListPage } from "@/src/features/finance-news/pages/finance-news-list-page";

export const metadata: Metadata = {
  title: "Finance News & Market Updates | MCJ Academy",
  description:
    "Stay updated with the latest finance news, Indian stock market updates, business developments and financial insights from MCJ Academy.",
};

export default function FinanceNewsRoutePage() {
  return <FinanceNewsListPage />;
}