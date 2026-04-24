"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Input } from "@/src/shared/components/ui/input";
import { Button } from "@/src/shared/components/ui/button";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;

    try {
      setLoading(true);

      // TEMP (until backend ready)
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-5">
      <h2 className="text-2xl font-semibold text-center text-gray-800">
        Login
      </h2>

      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button
        className="w-full bg-purple-600 hover:bg-purple-700 transition-all"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </Button>
    </div>
  );
}