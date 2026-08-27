import { redirect } from "next/navigation";

export default function JobApplicationsRedirect() {
  redirect("/jobs?tab=applications");
}
