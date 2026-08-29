"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Loader } from "@/src/shared/components/ui/loader";

/** Take Attendance is a modal on /attendance — redirect legacy page. */
export default function AttendanceTakeRoutePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/attendance");
  }, [router]);
  return <Loader />;
}
