"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { authApi } from "@/src/domains/auth/api/auth.api";

export const ForgotPasswordForm = () => {
  // ==========================
  // ROUTER
  // ==========================

  const router = useRouter();

  // ==========================
  // STATE
  // ==========================

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================
  // SUBMIT
  // ==========================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const res =
        await authApi.requestPasswordReset(
          email
        );

      // ======================
      // FAILED
      // ======================

      if (!res.data.success) {
        setError(
          res.data.message ||
            "Unable to send OTP"
        );

        return;
      }

      // ======================
      // SAVE EMAIL
      // ======================

      sessionStorage.setItem(
        "reset-email",
        email
      );

      // ======================
      // REDIRECT
      // ======================

      router.push(
        `/reset-password?email=${encodeURIComponent(
          email
        )}`
      );
    } catch (err: any) {
      setError(
        err?.response?.data
          ?.message ||
          "Email not found"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // UI
  // ==========================

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        type="email"
        required
        placeholder="Enter email"
        className="w-full rounded border p-3"
        value={email}
        onChange={(e) =>
          setEmail(
            e.target.value
          )
        }
      />

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-black p-3 text-white disabled:opacity-50"
      >
        {loading
          ? "Sending OTP..."
          : "Send OTP"}
      </button>
    </form>
  );
};