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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <style>{`
        .custom-input-focus:focus-within {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.06) !important;
          background-color: #fff !important;
        }
      `}</style>

      {/* Corporate Email field wrapper */}
      <div className="space-y-1">
        <Label htmlFor="identifier" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
          Corporate Email
        </Label>
        <div className="relative custom-input-focus flex items-center border border-slate-200 rounded-lg bg-slate-50/50 overflow-hidden px-3 group transition-all duration-150">
          <svg className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
          </svg>
          <Input
            id="identifier"
            placeholder="name@company.com"
            autoComplete="email"
            className="h-10 border-none bg-transparent text-xs font-medium text-slate-800 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none w-full pl-2.5 pr-0"
            {...register("identifier")}
          />
        </div>
        {errors.identifier && (
          <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 pl-0.5 mt-0.5">
            {errors.identifier.message}
          </p>
        )}
      </div>

      {/* Access Password field wrapper */}
      <div className="space-y-1">
        <Label htmlFor="password" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
          Access Password
        </Label>
        <div className="relative custom-input-focus flex items-center border border-slate-200 rounded-lg bg-slate-50/50 overflow-hidden px-3 group transition-all duration-150">
          <svg className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <Input
            id="password"
            type="password"
            placeholder="••••••••••••"
            autoComplete="current-password"
            className="h-10 border-none bg-transparent text-xs font-medium text-slate-800 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none w-full pl-2.5 pr-0"
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 pl-0.5 mt-0.5">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Core Action Button Trigger */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-10 mt-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wider uppercase rounded-lg transition-all active:scale-[0.99] disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Connecting...
          </span>
        ) : (
          "Initialize Workspace"
        )}
      </Button>
    </form>
  );
}