// src/features/auth/components/forgot-password-form.tsx

"use client";

import { useState } from "react";
import { authApi } from "@/src/domains/auth/api/auth.api";

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setMsg("");

    try {
      const res = await authApi.requestPasswordReset(email);

      if (!res.data.success) {
        setError(res.data.message);
        return;
      }

      setMsg(res.data.message);
    } catch {
      setError("Failed to send OTP");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        placeholder="Enter email"
        className="w-full border p-3 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {msg && <p className="text-green-500 text-sm">{msg}</p>}

      <button className="w-full bg-black text-white p-3 rounded">
        Send OTP
      </button>
    </form>
  );
};