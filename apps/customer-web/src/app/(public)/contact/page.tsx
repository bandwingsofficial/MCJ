import type { Metadata } from "next";

import { ContactPage } from "@/src/features/contact/page/ContactPage";

export const metadata: Metadata = {
  title: "Contact MCJ Academy | Admissions & Course Enquiries",
  description:
    "Get in touch with MCJ Academy for course information, admissions, batch schedules, branch details and other accounting and Tally training enquiries.",
};

export default function Page() {
  return <ContactPage />;
}