"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/src/domains/auth/store/auth.store";

export default function StudentPage() {
  const router = useRouter();

  const user = useAuthStore(
    (s) => s.user
  );

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Welcome Student Dashboard 🚀
      </h1>
    </div>
  );
}