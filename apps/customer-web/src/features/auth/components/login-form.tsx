"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { FormError } from "@/src/shared/components/ui/form-error";

import { useLogin } from "@/src/features/auth/hooks/use-login";

import {
  loginSchema,
  LoginFormValues,
} from "@/src/features/auth/schemas/login.schema";

export function LoginForm() {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <>
      <style>{`
        .mcj-field { margin-bottom: 16px; }
        .mcj-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 7px;
        }
        .mcj-label {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11.5px;
          font-weight: 600;
          color: #44403C;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .mcj-label .req { color: #F59E0B; font-size: 14px; }
        .mcj-forgot-link {
          font-size: 11.5px;
          font-weight: 600;
          color: #D97706;
          text-decoration: none;
          transition: color 0.15s;
        }
        .mcj-forgot-link:hover { color: #B45309; text-decoration: underline; }
        .mcj-input-wrap { position: relative; }
        .mcj-input-wrap .ico {
          position: absolute; left: 13px; top: 50%;
          transform: translateY(-50%);
          width: 15px; height: 15px;
          color: rgba(120,113,108,0.4);
          pointer-events: none;
          transition: color 0.18s;
        }
        .mcj-input-wrap:focus-within .ico { color: #F59E0B; }
        .mcj-input-wrap input {
          width: 100% !important;
          height: 44px !important;
          padding-left: 40px !important;
          padding-right: 14px !important;
          background: #FAFAF9 !important;
          border: 1.5px solid #E7E5E4 !important;
          border-radius: 10px !important;
          color: #1C1917 !important;
          font-size: 14px !important;
          font-family: 'Inter', system-ui, sans-serif !important;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .mcj-input-wrap input::placeholder { color: rgba(120,113,108,0.38) !important; font-size: 13.5px !important; }
        .mcj-input-wrap input:focus {
          border-color: #F59E0B !important;
          background: #FFFBEB !important;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.12) !important;
        }
        .mcj-btn-wrap { margin-top: 22px; }
        .mcj-btn-wrap button {
          width: 100% !important;
          height: 46px !important;
          border-radius: 12px !important;
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%) !important;
          color: #fff !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          letter-spacing: 0.02em !important;
          border: none !important;
          cursor: pointer !important;
          box-shadow: 0 4px 16px rgba(245,158,11,0.30) !important;
          transition: opacity 0.18s, transform 0.15s, box-shadow 0.18s !important;
          font-family: 'Inter', system-ui, sans-serif !important;
          position: relative; overflow: hidden;
        }
        .mcj-btn-wrap button::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .mcj-btn-wrap button:hover:not(:disabled) {
          opacity: 0.92 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 8px 24px rgba(245,158,11,0.36) !important;
        }
        .mcj-btn-wrap button:active:not(:disabled) { transform: translateY(0) !important; }
        .mcj-btn-wrap button:disabled { opacity: 0.55 !important; cursor: not-allowed !important; }
      `}</style>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mcj-field">
          <div className="mcj-label-row">
            <label className="mcj-label">Email <span className="req">*</span></label>
          </div>
          <div className="mcj-input-wrap">
            <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <Input placeholder="Enter email" {...register("identifier")} />
          </div>
          <FormError message={errors.identifier?.message} />
        </div>

        <div className="mcj-field">
          <div className="mcj-label-row">
            <label className="mcj-label">Password <span className="req">*</span></label>
            <a href="/forgot-password" className="mcj-forgot-link">Forgot password?</a>
          </div>
          <div className="mcj-input-wrap">
            <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <Input type="password" placeholder="Enter password" {...register("password")} />
          </div>
          <FormError message={errors.password?.message} />
        </div>

        <div className="mcj-btn-wrap">
          <Button type="submit" loading={loginMutation.isPending}>
            Login
          </Button>
        </div>
      </form>
    </>
  );
}