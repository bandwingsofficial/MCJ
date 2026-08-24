"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";

import { useRegister } from "@/src/features/auth/hooks/use-register";

import {
  registerSchema,
  RegisterFormValues,
} from "@/src/features/auth/schemas/register.schema";

export function RegisterForm({
  redirectTo,
}: {
  redirectTo?: string;
}) {
  const registerMutation = useRegister(redirectTo);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <>
      <style>{`
        .mcj-field { margin-bottom: 15px; }
        .mcj-label {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11.5px;
          font-weight: 600;
          color: #44403C;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 7px;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .mcj-label .req { color: #F59E0B; font-size: 14px; }
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
        {/* Full Name */}
        <div className="mcj-field">
          <label className="mcj-label">Full Name <span className="req">*</span></label>
          <div className="mcj-input-wrap">
            <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <Input placeholder="Enter full name" {...register("name")} />
          </div>
          <FormError message={errors.name?.message} />
        </div>

        {/* Email */}
        <div className="mcj-field">
          <label className="mcj-label">Email <span className="req">*</span></label>
          <div className="mcj-input-wrap">
            <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <Input placeholder="Enter email" {...register("email")} />
          </div>
          <FormError message={errors.email?.message} />
        </div>

        {/* Phone */}
        <div className="mcj-field">
          <label className="mcj-label">Phone Number <span className="req">*</span></label>
          <div className="mcj-input-wrap">
            <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <Input placeholder="Enter phone number" {...register("phone")} />
          </div>
          <FormError message={errors.phone?.message} />
        </div>

        {/* Password */}
        <div className="mcj-field">
          <label className="mcj-label">Password <span className="req">*</span></label>
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
          <Button type="submit" loading={registerMutation.isPending}>
            Create Account
          </Button>
        </div>
      </form>
    </>
  );
}