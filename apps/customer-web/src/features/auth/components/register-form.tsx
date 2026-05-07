// src/features/auth/components/register-form.tsx

"use client";

import { useState } from "react";
import { useRegister } from "@/src/domains/auth/hooks/useRegister";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const RegisterForm = () => {
  const { register } = useRegister();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Strict validation (aligned with backend)
  const validate = () => {
    if (!form.name.trim()) return "Name is required";

    const email = form.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid email";

    if (form.password.length < 6)
      return "Password must be at least 6 characters";

    // allow user to type with or without +91 or leading 0
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length !== 10)
      return "Phone must be 10 digits";

    // must start with 6–9 (India mobile rule)
    if (!/^[6-9]\d{9}$/.test(digits))
      return "Enter valid Indian mobile number";

    return null;
  };

  // 🔥 Normalize phone → +91XXXXXXXXXX
  const normalizePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
    return `+91${digits}`;
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
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: normalizePhone(form.phone), // 🔥 critical fix
      };

      // 🔍 debug once if needed
      // console.log("REGISTER PAYLOAD:", payload);

      const res = await register(payload);

      if (!res.success) {
        setError(res.message);
        return;
      }

      router.push("/login");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* NAME */}
        <input
          placeholder="Full Name"
          className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email Address"
          className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {/* PHONE */}
        <input
          placeholder="Phone Number (10 digits)"
          className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {/* BUTTON */}
        <button
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Register"}
        </button>
      </form>

      {/* LOGIN LINK */}
      <p className="text-sm text-center text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-blue-600 hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
};