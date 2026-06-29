"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";

import { useForgotPassword } from "@/src/features/auth/hooks/use-forgot-password";

import {
  forgotPasswordSchema,
  ForgotPasswordFormValues,
} from "@/src/features/auth/schemas/forgot-password.schema";

export function ForgotPasswordForm() {
  const mutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    mutation.mutate(data);
  };

  return (
    <>
      <style>{`
        .fp-hint-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #FFFBEB;
          border: 1px solid rgba(245,158,11,0.25);
          border-radius: 10px;
          padding: 11px 14px;
          margin-bottom: 20px;
        }
        .fp-hint-box svg { flex-shrink: 0; margin-top: 1px; color: #D97706; }
        .fp-hint-box p {
          font-size: 12.5px;
          color: #92400E;
          margin: 0;
          line-height: 1.55;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .mcj-field { margin-bottom: 16px; }
        .mcj-label {
          display: block;
          font-size: 11.5px;
          font-weight: 600;
          color: #44403C;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 7px;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .mcj-label .req { color: #F59E0B; font-size: 14px; margin-left: 2px; vertical-align: middle; }
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
        {/* Hint banner */}
        <div className="fp-hint-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>We'll send a one-time password to your registered email address.</p>
        </div>

        <div className="mcj-field">
          <label className="mcj-label">
            Email Address <span className="req">*</span>
          </label>
          <div className="mcj-input-wrap">
            <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <Input placeholder="Enter your email address" {...register("email")} />
          </div>
          <FormError message={errors.email?.message} />
        </div>

        <div className="mcj-btn-wrap">
          <Button type="submit" loading={mutation.isPending}>
            Send OTP
          </Button>
        </div>
      </form>
    </>
  );
}