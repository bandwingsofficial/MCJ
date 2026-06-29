"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card } from "@/src/shared/components/ui/card";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";

import {
  totpSchema,
  TotpFormValues,
} from "@/src/features/auth/schemas/auth.schema";

import { useVerifyTotp } from "@/src/features/auth/hooks/use-verify-totp";
import { AuthStorage } from "@/src/features/auth/utils/auth-storage";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

export const TotpForm = () => {
  const router = useRouter();
  const { setUser } = useAuth();
  const { verifyTotp, loading } = useVerifyTotp();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TotpFormValues>({
    resolver: zodResolver(totpSchema),
  });

  useEffect(() => {
    const token = AuthStorage.getMfaToken();

    if (!token) {
      router.replace("/admin/login");
    }
  }, [router]);

  const onSubmit = async (values: TotpFormValues) => {
    try {
      const mfaToken = AuthStorage.getMfaToken();

      if (!mfaToken) {
        return;
      }

      const response = await verifyTotp({
        mfaToken,
        totpCode: values.totpCode,
      });

      setUser({
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        role: response.data.role,
      });

      AuthStorage.clearMfaToken();
      router.replace("/dashboard");
    } catch (error) {
      setError("root", {
        message: getErrorMessage(error),
      });
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.04); }
        }
        @keyframes scan-line {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        @keyframes float-in {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes dot-blink {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }

        .login-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #060A14;
          padding: 1.5rem;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Ambient background glow */
        .login-wrapper::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%);
          top: -100px;
          left: -100px;
          pointer-events: none;
        }
        .login-wrapper::after {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
          bottom: -80px;
          right: 0px;
          pointer-events: none;
        }

        .login-card {
          display: flex;
          width: 100%;
          max-width: 900px;
          min-height: 580px;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(79,70,229,0.18);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 32px 80px rgba(0,0,0,0.7),
            0 0 60px rgba(79,70,229,0.08);
          animation: fade-in 0.6s ease both;
          position: relative;
          z-index: 1;
        }

        /* ── LEFT PANEL ───────────────────────────── */
        .left-panel {
          display: none;
          position: relative;
          overflow: hidden;
          background: linear-gradient(145deg, #0D1226 0%, #0A0F1E 60%, #0E1330 100%);
          border-right: 1px solid rgba(79,70,229,0.14);
        }
        @media (min-width: 1024px) {
          .left-panel { display: flex; width: 50%; flex-direction: column; align-items: center; justify-content: center; }
        }

        /* Grid dot pattern */
        .left-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(79,70,229,0.18) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
          pointer-events: none;
        }

        .orbital-container {
          position: relative;
          width: 280px;
          height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Pulse rings */
        .pulse-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(79,70,229,0.2);
          animation: pulse-ring 3.5s ease-in-out infinite;
        }
        .pulse-ring:nth-child(1) { width: 260px; height: 260px; animation-delay: 0s; }
        .pulse-ring:nth-child(2) { width: 220px; height: 220px; animation-delay: 0.6s; }
        .pulse-ring:nth-child(3) { width: 180px; height: 180px; animation-delay: 1.2s; }

        /* Outer spinning arc */
        .orbit-outer {
          position: absolute;
          width: 240px;
          height: 240px;
          border-radius: 50%;
          border: 1.5px solid transparent;
          border-top-color: rgba(99,102,241,0.7);
          border-right-color: rgba(99,102,241,0.2);
          animation: spin-slow 8s linear infinite;
        }
        .orbit-outer::after {
          content: '';
          position: absolute;
          top: 4px;
          right: 4px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #6366F1;
          box-shadow: 0 0 12px 3px rgba(99,102,241,0.8);
        }

        /* Inner spinning arc */
        .orbit-inner {
          position: absolute;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          border: 1px solid transparent;
          border-bottom-color: rgba(139,92,246,0.6);
          border-left-color: rgba(139,92,246,0.15);
          animation: spin-reverse 5s linear infinite;
        }
        .orbit-inner::after {
          content: '';
          position: absolute;
          bottom: 3px;
          left: 3px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #8B5CF6;
          box-shadow: 0 0 8px 2px rgba(139,92,246,0.8);
        }

        /* Center lock icon */
        .center-icon {
          position: relative;
          z-index: 2;
          width: 72px;
          height: 72px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(79,70,229,0.3) 0%, rgba(99,102,241,0.15) 100%);
          border: 1px solid rgba(99,102,241,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(79,70,229,0.3), 0 0 0 1px rgba(255,255,255,0.06) inset;
        }
        .center-icon svg {
          width: 32px;
          height: 32px;
          color: #A5B4FC;
          filter: drop-shadow(0 0 8px rgba(99,102,241,0.6));
        }

        /* Scan line */
        .scan-line {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 140px;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.8), transparent);
          animation: scan-line 3s ease-in-out infinite;
          pointer-events: none;
        }

        .left-label {
          margin-top: 36px;
          text-align: center;
          animation: float-in 0.8s 0.4s ease both;
        }
        .left-label-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(165,180,252,0.7);
          margin-bottom: 6px;
        }
        .left-label-sub {
          font-size: 10px;
          letter-spacing: 0.12em;
          color: rgba(148,163,184,0.4);
          text-transform: uppercase;
        }

        /* Status dots */
        .status-row {
          display: flex;
          gap: 6px;
          margin-top: 20px;
          align-items: center;
        }
        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #6366F1;
          box-shadow: 0 0 6px rgba(99,102,241,0.6);
          animation: dot-blink 1.6s ease-in-out infinite;
        }
        .status-dot:nth-child(2) { animation-delay: 0.2s; background: #8B5CF6; }
        .status-dot:nth-child(3) { animation-delay: 0.4s; background: #A78BFA; }
        .status-text {
          font-size: 9px;
          letter-spacing: 0.18em;
          color: rgba(148,163,184,0.35);
          text-transform: uppercase;
          margin-left: 4px;
        }

        /* ── RIGHT PANEL ──────────────────────────── */
        .right-panel {
          width: 100%;
          background: #0A0F1E;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 40px;
          position: relative;
        }
        @media (min-width: 1024px) {
          .right-panel { width: 50%; padding: 56px 48px; }
        }

        /* Subtle top-right glow on form panel */
        .right-panel::before {
          content: '';
          position: absolute;
          top: -60px;
          right: -60px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .form-inner {
          width: 100%;
          max-width: 340px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* Header */
        .form-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 28px;
          animation: float-in 0.6s 0.1s ease both;
        }
        .eyebrow-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(99,102,241,0.5), transparent);
        }
        .eyebrow-badge {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(99,102,241,0.7);
          padding: 3px 8px;
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 20px;
          background: rgba(79,70,229,0.08);
        }
        .eyebrow-line-right {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.2));
        }

        .form-heading {
          margin-bottom: 6px;
          animation: float-in 0.6s 0.2s ease both;
        }
        .form-heading h1 {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #F8FAFF;
          line-height: 1.1;
          margin: 0;
        }
        .form-heading h1 span {
          background: linear-gradient(135deg, #818CF8, #C4B5FD);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .form-subheading {
          font-size: 12px;
          color: rgba(148,163,184,0.55);
          margin-bottom: 36px;
          letter-spacing: 0.01em;
          animation: float-in 0.6s 0.3s ease both;
        }

        /* Field group */
        .field-group {
          margin-bottom: 18px;
          animation: float-in 0.6s ease both;
        }
        .field-group:nth-of-type(1) { animation-delay: 0.35s; }

        .field-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(148,163,184,0.6);
          margin-bottom: 8px;
        }

        .field-input-wrap {
          position: relative;
        }
        .field-input-wrap svg.field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 15px;
          height: 15px;
          color: rgba(99,102,241,0.5);
          pointer-events: none;
          transition: color 0.2s;
        }

        /* Override shadcn Input to match design */
        .field-input-wrap input {
          width: 100%;
          height: 46px;
          padding-left: 40px;
          padding-right: 14px;
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(99,102,241,0.18) !important;
          border-radius: 10px !important;
          color: #F8FAFF !important;
          font-size: 13.5px !important;
          transition: border-color 0.25s, box-shadow 0.25s, background 0.25s !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .field-input-wrap input::placeholder {
          color: rgba(148,163,184,0.3) !important;
          font-size: 13px !important;
        }
        .field-input-wrap input:focus {
          border-color: rgba(99,102,241,0.55) !important;
          background: rgba(99,102,241,0.07) !important;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.1) !important;
        }
        .field-input-wrap:focus-within svg.field-icon {
          color: rgba(99,102,241,0.8);
        }

        /* Submit button */
        .submit-wrap {
          margin-top: 28px;
          animation: float-in 0.6s 0.55s ease both;
        }
        .submit-wrap button {
          width: 100%;
          height: 48px;
          border-radius: 12px !important;
          background: linear-gradient(135deg, #4F46E5, #6366F1) !important;
          color: #fff !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          letter-spacing: 0.08em !important;
          text-transform: uppercase !important;
          border: none !important;
          cursor: pointer !important;
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s !important;
          box-shadow: 0 4px 24px rgba(79,70,229,0.35) !important;
        }
        .submit-wrap button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%);
          pointer-events: none;
        }
        .submit-wrap button:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px) !important;
          box-shadow: 0 8px 32px rgba(79,70,229,0.45) !important;
        }
        .submit-wrap button:active:not(:disabled) {
          transform: translateY(0px) !important;
        }
        .submit-wrap button:disabled {
          opacity: 0.55 !important;
        }

        /* Footer */
        .form-footer {
          margin-top: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          animation: float-in 0.6s 0.65s ease both;
        }
        .footer-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(99,102,241,0.4);
        }
        .footer-text {
          font-size: 10px;
          color: rgba(148,163,184,0.3);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .orbit-outer, .orbit-inner { animation: none; }
          .pulse-ring { animation: none; }
          .scan-line { animation: none; }
          .float-in, .field-group, .form-eyebrow, .form-heading,
          .form-subheading, .submit-wrap, .left-label, .form-footer {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="login-wrapper">
        <div className="login-card">

          {/* ── LEFT PANEL ── */}
          <div className="left-panel">
            <div className="orbital-container">
              <div className="pulse-ring" />
              <div className="pulse-ring" />
              <div className="pulse-ring" />
              <div className="orbit-outer" />
              <div className="orbit-inner" />
              <div className="scan-line" />

              {/* Lock icon center */}
              <div className="center-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  <circle cx="12" cy="16" r="1.2" fill="currentColor" />
                </svg>
              </div>
            </div>

            <div className="left-label">
              <div className="left-label-title">Secure Access Portal</div>
              <div className="left-label-sub">Branch Management System</div>
              <div className="status-row" style={{ justifyContent: "center" }}>
                <div className="status-dot" />
                <div className="status-dot" />
                <div className="status-dot" />
                <span className="status-text">Auth system online</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="right-panel">
            <div className="form-inner">

              <div className="form-eyebrow">
                <div className="eyebrow-line" />
                <div className="eyebrow-badge">MFA Admin</div>
                <div className="eyebrow-line-right" />
              </div>

              <div className="form-heading">
                <h1>Verification<span>.</span></h1>
              </div>
              <p className="form-subheading">Two-Factor Authentication Setup</p>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="field-group">
                  <label className="field-label">Verification Code</label>
                  <div className="field-input-wrap">
                    <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <Input
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      {...register("totpCode")}
                    />
                  </div>
                  <FormError message={errors.totpCode?.message} />
                </div>

                <FormError message={errors.root?.message} />

                <div className="submit-wrap">
                  <Button type="submit" loading={loading}>
                    Verify
                  </Button>
                </div>
              </form>

              <div className="form-footer">
                <div className="footer-dot" />
                <span className="footer-text">Protected by multi-factor authentication</span>
                <div className="footer-dot" />
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
};