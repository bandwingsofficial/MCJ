// src/features/auth/components/reset-password-form.tsx

"use client";

import { useState } from "react";
import { authApi } from "@/src/domains/auth/api/auth.api";

export const ResetPasswordForm = () => {
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const res = await authApi.confirmPasswordReset(form);

      if (!res.data.success) {
        setError(res.data.message);
        return;
      }

      setMsg("Password reset successful");
    } catch {
      setError("Failed to reset password");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input
        placeholder="Email"
        className="w-full border p-3 rounded"
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />

      <input
        placeholder="OTP"
        className="w-full border p-3 rounded"
        onChange={(e) =>
          setForm({ ...form, otp: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="New Password"
        className="w-full border p-3 rounded"
        onChange={(e) =>
          setForm({ ...form, newPassword: e.target.value })
        }
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {msg && <p className="text-green-500 text-sm">{msg}</p>}

      <button className="w-full bg-black text-white p-3 rounded">
        Reset Password
      </button>
    </form>
  );
};