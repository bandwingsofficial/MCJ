import type { Metadata } from "next";

import { HomePage } from "@/src/features/home/home-page";

export const metadata: Metadata = {
  title: {
    absolute: "Accounting Training Institute in Bangalore | MCJ Academy",
  },
  description:
    "Looking for an accounting training institute in Bangalore? Join MCJ Academy for practical training in Tally Prime, GST, Income Tax, TDS, Excel, Payroll and Zoho Books with placement assistance.",
};

export default function Page() {
  return <HomePage />;
}