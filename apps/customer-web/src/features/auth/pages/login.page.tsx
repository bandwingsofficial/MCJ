"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { AuthLayout } from "@/src/features/auth/components/auth-layout";

import { LoginForm } from "@/src/features/auth/components/login-form";

import { useAuthStore } from "@/src/domains/auth/store/auth.store";

export const LoginPage = () => {
  // ==========================
  // ROUTER
  // ==========================

  const router = useRouter();

  // ==========================
  // AUTH STORE
  // ==========================

  const user = useAuthStore(
    (s) => s.user
  );

  // ==========================
  // REDIRECT IF LOGGED IN
  // ==========================

  useEffect(() => {
    if (user) {
      router.replace(
        "/student"
      );
    }
  }, [user, router]);

  // ==========================
  // PREVENT LOGIN FLASH
  // ==========================

  if (user) {
    return null;
  }

  // ==========================
  // UI
  // ==========================

  return (
    <AuthLayout title="Login">
      <LoginForm />
    </AuthLayout>
  );
};