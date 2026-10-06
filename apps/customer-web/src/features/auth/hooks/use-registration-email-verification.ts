"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { authService } from "@/src/features/auth/services/auth.service";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

const RESEND_COOLDOWN_SECONDS = 30;

export function useRegistrationEmailVerification() {
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownTimerRef = useRef<number | null>(null);

  const clearCooldownTimer = useCallback(() => {
    if (cooldownTimerRef.current != null) {
      window.clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
  }, []);

  const startCooldown = useCallback(() => {
    clearCooldownTimer();
    setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
    cooldownTimerRef.current = window.setInterval(() => {
      setCooldownSeconds((current) => {
        if (current <= 1) {
          clearCooldownTimer();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }, [clearCooldownTimer]);

  useEffect(() => clearCooldownTimer, [clearCooldownTimer]);

  const syncEmail = useCallback(
    (email: string) => {
      const normalized = email.trim().toLowerCase();
      if (verifiedEmail && normalized !== verifiedEmail) {
        setVerifiedEmail(null);
        setOtpSent(false);
        setOtp("");
      }
    },
    [verifiedEmail],
  );

  const sendOtp = useCallback(
    async (email: string) => {
      const normalized = email.trim().toLowerCase();
      if (!normalized) {
        toast.error("Enter a valid email first");
        return;
      }

      setIsSending(true);
      try {
        await authService.sendRegistrationEmailOtp(normalized);
        setOtpSent(true);
        setOtp("");
        startCooldown();
        toast.success("Verification code sent to your email");
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsSending(false);
      }
    },
    [startCooldown],
  );

  const verifyOtp = useCallback(
    async (email: string) => {
      const normalized = email.trim().toLowerCase();
      if (!/^\d{6}$/.test(otp.trim())) {
        toast.error("Enter the 6-digit OTP");
        return;
      }

      setIsVerifying(true);
      try {
        await authService.verifyRegistrationEmailOtp(normalized, otp.trim());
        setVerifiedEmail(normalized);
        toast.success("Email verified");
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsVerifying(false);
      }
    },
    [otp],
  );

  const isVerifiedFor = useCallback(
    (email: string) =>
      verifiedEmail != null &&
      verifiedEmail === email.trim().toLowerCase(),
    [verifiedEmail],
  );

  return {
    verifiedEmail,
    otpSent,
    otp,
    setOtp,
    isSending,
    isVerifying,
    cooldownSeconds,
    syncEmail,
    sendOtp,
    verifyOtp,
    isVerifiedFor,
  };
}
