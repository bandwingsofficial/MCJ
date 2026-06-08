"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  LoginFormValues,
} from "@/src/features/auth/schemas/login.schema";
import { useLogin } from "@/src/features/auth/hooks/use-login";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";

export function LoginForm() {
  const { login, isLoading } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
    } catch {
      // already handled in hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="identifier" className="text-xs font-semibold text-slate-700 tracking-wide">
          Email
        </Label>
        <div className="relative">
          <Input
            id="identifier"
            placeholder="Enter email"
            autoComplete="email"
            className="h-11 px-4 border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            {...register("identifier")}
          />
        </div>
        {errors.identifier && (
          <p className="text-[11px] text-red-500 font-medium tracking-wide">
            {errors.identifier.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-semibold text-slate-700 tracking-wide">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            placeholder="Enter password"
            autoComplete="current-password"
            className="h-11 px-4 border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-[11px] text-red-500 font-medium tracking-wide">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 mt-2 bg-gradient-to-r from-[#4f46e5] to-[#2563eb] hover:from-[#4338ca] hover:to-[#1d4ed8] text-white text-sm font-bold rounded-lg shadow-md shadow-indigo-200/50 transition-all active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Signing In...
          </span>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}