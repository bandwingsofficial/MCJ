"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthLoadingScreen } from "@/src/shared/components/ui/auth-loading";

export default function StudentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/enrollments");
  }, [router]);

  return <AuthLoadingScreen />;
}
