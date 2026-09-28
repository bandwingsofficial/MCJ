"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { useDebounce } from "@/src/shared/hooks/use-debounce";

import { useRegister } from "@/src/features/auth/hooks/use-register";
import {
  AVAILABILITY_DEBOUNCE_MS,
  useRegistrationEmailCheck,
  useRegistrationPhoneCheck,
} from "@/src/features/auth/hooks/use-registration-field-check";
import { useReferralCodePreview } from "@/src/features/auth/hooks/use-referral-code-preview";
import {
  RegisterFieldFeedback,
  RegisterInputIcon,
  registerInputStatusClass,
} from "@/src/features/auth/components/register-field-feedback";

import {
  registerSchema,
  RegisterFormValues,
} from "@/src/features/auth/schemas/register.schema";

function fieldReadyForAsyncCheck(
  value: string,
  debouncedValue: string,
  hasSchemaError: boolean,
  isFormatValid: boolean,
): boolean {
  return (
    !hasSchemaError &&
    isFormatValid &&
    value.trim() === debouncedValue.trim() &&
    debouncedValue.trim().length > 0
  );
}

export function RegisterForm({
  redirectTo,
  initialReferralCode,
}: {
  redirectTo?: string;
  initialReferralCode?: string;
}) {
  const registerMutation = useRegister(redirectTo);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      referralCode: initialReferralCode ?? "",
    },
  });

  const watchedEmail = useWatch({ control, name: "email" }) ?? "";
  const watchedPhone = useWatch({ control, name: "phone" }) ?? "";
  const watchedReferral = useWatch({ control, name: "referralCode" }) ?? "";

  const debouncedEmail = useDebounce(watchedEmail, AVAILABILITY_DEBOUNCE_MS);
  const debouncedPhone = useDebounce(watchedPhone, AVAILABILITY_DEBOUNCE_MS);
  const debouncedReferral = useDebounce(
    watchedReferral,
    AVAILABILITY_DEBOUNCE_MS,
  );

  const emailFormatValid = registerSchema.shape.email.safeParse(
    debouncedEmail.trim(),
  ).success;
  const phoneFormatValid = registerSchema.shape.phone.safeParse(
    debouncedPhone.trim(),
  ).success;
  const referralFormatValid =
    debouncedReferral.trim() === "" ||
    registerSchema.shape.referralCode.safeParse(debouncedReferral.trim())
      .success;

  const emailCheckEnabled = fieldReadyForAsyncCheck(
    watchedEmail,
    debouncedEmail,
    Boolean(errors.email),
    emailFormatValid,
  );
  const phoneCheckEnabled = fieldReadyForAsyncCheck(
    watchedPhone,
    debouncedPhone,
    Boolean(errors.phone),
    phoneFormatValid,
  );
  const referralCheckEnabled =
    debouncedReferral.trim().length > 0 &&
    fieldReadyForAsyncCheck(
      watchedReferral,
      debouncedReferral,
      Boolean(errors.referralCode),
      referralFormatValid && /^[A-Za-z0-9]{6,12}$/.test(debouncedReferral.trim()),
    );

  const emailCheck = useRegistrationEmailCheck(
    debouncedEmail,
    emailCheckEnabled,
  );
  const phoneCheck = useRegistrationPhoneCheck(
    debouncedPhone,
    phoneCheckEnabled,
  );
  const referralPreview = useReferralCodePreview(
    debouncedReferral,
    watchedEmail,
    referralCheckEnabled,
  );

  const emailAsyncState = useMemo(() => {
    if (!emailCheckEnabled) return "idle" as const;
    if (emailCheck.isFetching) return "checking" as const;
    if (emailCheck.data?.available) return "success" as const;
    if (emailCheck.data && !emailCheck.data.available) return "error" as const;
    if (emailCheck.isError) return "error" as const;
    return "idle" as const;
  }, [emailCheckEnabled, emailCheck]);

  const phoneAsyncState = useMemo(() => {
    if (!phoneCheckEnabled) return "idle" as const;
    if (phoneCheck.isFetching) return "checking" as const;
    if (phoneCheck.data?.available) return "success" as const;
    if (phoneCheck.data && !phoneCheck.data.available) return "error" as const;
    if (phoneCheck.isError) return "error" as const;
    return "idle" as const;
  }, [phoneCheckEnabled, phoneCheck]);

  const referralAsyncState = useMemo(() => {
    if (!referralCheckEnabled) return "idle" as const;
    if (referralPreview.isFetching) return "checking" as const;
    if (referralPreview.data?.valid) return "success" as const;
    if (referralPreview.data && !referralPreview.data.valid) {
      return "error" as const;
    }
    if (referralPreview.isError) return "error" as const;
    return "idle" as const;
  }, [referralCheckEnabled, referralPreview]);

  const onSubmit = (data: RegisterFormValues) => {
    const referralCode = data.referralCode?.trim();
    registerMutation.mutate({
      ...data,
      referralCode: referralCode || undefined,
    });
  };

  const referredUser =
    referralPreview.data?.valid === true ? referralPreview.data.referrer : null;

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
        .mcj-field-status-icon {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          pointer-events: none;
        }
        .mcj-input-wrap input {
          width: 100% !important;
          height: 44px !important;
          padding-left: 40px !important;
          padding-right: 40px !important;
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
        .mcj-input-wrap input.mcj-input-status-success {
          border-color: #10B981 !important;
          background: #F0FDF4 !important;
        }
        .mcj-input-wrap input.mcj-input-status-success:focus {
          box-shadow: 0 0 0 3px rgba(16,185,129,0.15) !important;
        }
        .mcj-input-wrap input.mcj-input-status-error {
          border-color: #EF4444 !important;
          background: #FEF2F2 !important;
        }
        .mcj-input-wrap input.mcj-input-status-error:focus {
          box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important;
        }
        .mcj-referrer-panel {
          margin-top: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #D1FAE5;
          background: #F0FDF4;
        }
        .mcj-referrer-panel dt {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #047857;
          margin-bottom: 2px;
        }
        .mcj-referrer-panel dd {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #1C1917;
        }
        .mcj-referrer-panel dd:last-child { margin-bottom: 0; }
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
        .mcj-register-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0 20px;
        }
        @media (min-width: 768px) {
          .mcj-register-grid {
            grid-template-columns: 1fr 1fr;
          }
          .mcj-field-span-2 {
            grid-column: 1 / -1;
          }
        }
      `}</style>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mcj-register-grid">
          <div className="mcj-field">
            <label className="mcj-label">
              Full Name <span className="req">*</span>
            </label>
            <div className="mcj-input-wrap">
              <svg
                className="ico"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <Input placeholder="Enter full name" {...register("name")} />
            </div>
            <RegisterFieldFeedback schemaMessage={errors.name?.message} />
          </div>

          <div className="mcj-field">
            <label className="mcj-label">
              Email <span className="req">*</span>
            </label>
            <div className="mcj-input-wrap">
              <svg
                className="ico"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <Input
                placeholder="Enter email"
                className={registerInputStatusClass(
                  emailAsyncState,
                  Boolean(errors.email),
                )}
                {...register("email")}
              />
              <RegisterInputIcon
                asyncState={emailAsyncState}
                hasSchemaError={Boolean(errors.email)}
              />
            </div>
            <RegisterFieldFeedback
              schemaMessage={errors.email?.message}
              asyncState={emailAsyncState}
              asyncMessage={
                emailAsyncState === "success"
                  ? "Email is available"
                  : emailCheck.data?.message ??
                    (emailCheck.isError ? "Unable to verify email" : undefined)
              }
            />
          </div>

          <div className="mcj-field">
            <label className="mcj-label">
              Phone Number <span className="req">*</span>
            </label>
            <div className="mcj-input-wrap">
              <svg
                className="ico"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <Input
                placeholder="Enter phone number"
                className={registerInputStatusClass(
                  phoneAsyncState,
                  Boolean(errors.phone),
                )}
                {...register("phone")}
              />
              <RegisterInputIcon
                asyncState={phoneAsyncState}
                hasSchemaError={Boolean(errors.phone)}
              />
            </div>
            <RegisterFieldFeedback
              schemaMessage={errors.phone?.message}
              asyncState={phoneAsyncState}
              asyncMessage={
                phoneAsyncState === "success"
                  ? "Phone number is available"
                  : phoneCheck.data?.message ??
                    (phoneCheck.isError
                      ? "Unable to verify phone number"
                      : undefined)
              }
            />
          </div>

          <div className="mcj-field">
            <label className="mcj-label">
              Password <span className="req">*</span>
            </label>
            <div className="mcj-input-wrap">
              <svg
                className="ico"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <Input
                type="password"
                placeholder="Enter password"
                {...register("password")}
              />
            </div>
            <RegisterFieldFeedback schemaMessage={errors.password?.message} />
          </div>

          <div className="mcj-field mcj-field-span-2">
            <label className="mcj-label">
              Referral Code{" "}
              <span className="font-normal normal-case tracking-normal text-stone-400">
                (Optional)
              </span>
            </label>
            <div className="mcj-input-wrap">
              <Input
                placeholder="AKS7X92P"
                className={registerInputStatusClass(
                  referralAsyncState,
                  Boolean(errors.referralCode),
                )}
                style={{ paddingLeft: "14px" }}
                {...register("referralCode")}
              />
              <RegisterInputIcon
                asyncState={referralAsyncState}
                hasSchemaError={Boolean(errors.referralCode)}
              />
            </div>
            <RegisterFieldFeedback
              schemaMessage={errors.referralCode?.message}
              asyncState={referralAsyncState}
              asyncMessage={
                referralAsyncState === "success"
                  ? "Referral code verified"
                  : referralPreview.data && !referralPreview.data.valid
                    ? referralPreview.data.message
                    : referralPreview.isError
                      ? "Unable to verify referral code"
                      : undefined
              }
            />
            {referredUser ? (
              <div className="mcj-referrer-panel" aria-live="polite">
                <dl>
                  <div>
                    <dt>Referred by — Name</dt>
                    <dd>{referredUser.name}</dd>
                  </div>
                  <div>
                    <dt>Referred by — Email</dt>
                    <dd>{referredUser.email}</dd>
                  </div>
                </dl>
              </div>
            ) : null}
          </div>
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
