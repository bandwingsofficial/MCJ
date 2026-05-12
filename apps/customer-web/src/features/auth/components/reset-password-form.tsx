"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { authApi } from "@/src/domains/auth/api/auth.api";

export const ResetPasswordForm = () => {
  // ==========================
  // ROUTER
  // ==========================

  const router = useRouter();

  const searchParams =
    useSearchParams();

  // ==========================
  // QUERY EMAIL
  // ==========================

  const queryEmail =
    searchParams.get(
      "email"
    ) || "";

  // ==========================
  // STATE
  // ==========================

  const [form, setForm] =
    useState({
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ==========================
  // PREFILL EMAIL
  // ==========================

  useEffect(() => {
    if (queryEmail) {
      setForm((prev) => ({
        ...prev,
        email: queryEmail,
      }));
    }
  }, [queryEmail]);

  // ==========================
  // SUBMIT
  // ==========================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ======================
    // PASSWORD MATCH
    // ======================

    if (
      form.newPassword !==
      form.confirmPassword
    ) {
      setError(
        "Passwords do not match"
      );

      return;
    }

    // ======================
    // VALIDATION
    // ======================

    if (
      form.newPassword.length < 6
    ) {
      setError(
        "Password must be at least 6 characters"
      );

      return;
    }

    try {
      setLoading(true);

      // ====================
      // RESET PASSWORD
      // ====================

      const res =
        await authApi.confirmPasswordReset(
          {
            email:
              form.email,
            otp: form.otp,
            newPassword:
              form.newPassword,
          }
        );

      // ====================
      // FAILED
      // ====================

      if (!res.data.success) {
        setError(
          res.data.message ||
            "Failed to reset password"
        );

        return;
      }

      // ====================
      // SUCCESS
      // ====================

      setSuccess(
        "Password reset successful"
      );

      // ====================
      // CLEAN STORAGE
      // ====================

      sessionStorage.removeItem(
        "reset-email"
      );

      // ====================
      // REDIRECT LOGIN
      // ====================

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(
        err?.response?.data
          ?.message ||
          "Failed to reset password"
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
        placeholder="Email"
        value={form.email}
        readOnly
        className="w-full rounded border bg-gray-100 p-3"
      />

      <input
        type="text"
        placeholder="Enter OTP"
        className="w-full rounded border p-3"
        value={form.otp}
        onChange={(e) =>
          setForm({
            ...form,
            otp: e.target.value,
          })
        }
        required
      />

      <input
        type="password"
        placeholder="New Password"
        className="w-full rounded border p-3"
        value={
          form.newPassword
        }
        onChange={(e) =>
          setForm({
            ...form,
            newPassword:
              e.target.value,
          })
        }
        required
      />

      <input
        type="password"
        placeholder="Confirm Password"
        className="w-full rounded border p-3"
        value={
          form.confirmPassword
        }
        onChange={(e) =>
          setForm({
            ...form,
            confirmPassword:
              e.target.value,
          })
        }
        required
      />

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-500">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-black p-3 text-white disabled:opacity-50"
      >
        {loading
          ? "Resetting..."
          : "Reset Password"}
      </button>
    </form>
  );
};