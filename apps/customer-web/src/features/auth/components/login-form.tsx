"use client";

import { useState } from "react";

import { useLogin } from "@/src/domains/auth/hooks/useLogin";

import { useRouter } from "next/navigation";

import Link from "next/link";

export const LoginForm = () => {
  const { login } = useLogin();

  const router = useRouter();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const isEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value
    );

  const validate = () => {
    if (!form.identifier.trim()) {
      return "Email is required";
    }

    if (!isEmail(form.identifier)) {
      return "Enter valid email";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return null;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);

      return;
    }

    setLoading(true);

    try {
      const payload = {
        identifier: form.identifier
          .trim()
          .toLowerCase(),

        password: form.password,
      };

      const res = await login(payload);

      if (!res.success) {
        setError(res.message);

        return;
      }

      router.push("/student");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          placeholder="Email"
          className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          value={form.identifier}
          onChange={(e) =>
            setForm({
              ...form,
              identifier: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>
      </form>

      <div className="flex justify-between text-sm">
        <Link
          href="/forgot-password"
          className="text-blue-600"
        >
          Forgot Password?
        </Link>

        <Link
          href="/register"
          className="text-blue-600"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
};