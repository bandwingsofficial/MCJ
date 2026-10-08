"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthModal } from "@/src/features/auth/components/auth-modal";
import {
  AuthModalControllerContext,
  useAuthModalController,
  type AuthModalDismiss,
  type AuthModalMode,
  type OpenAuthModalInput,
} from "@/src/features/auth/components/auth-modal-context";

interface AuthModalRequest {
  mode: AuthModalMode;
  redirectTo?: string;
  referralCode?: string;
  dismiss: AuthModalDismiss;
}

function getSafeRedirect(value: string | null | undefined): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }

  return value;
}

export function AuthModalControllerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [request, setRequest] = useState<AuthModalRequest | null>(null);
  const requestRef = useRef<AuthModalRequest | null>(null);
  requestRef.current = request;

  const openAuthModal = useCallback((input: OpenAuthModalInput = {}) => {
    setRequest((current) => ({
      mode: input.mode ?? current?.mode ?? "login",
      redirectTo:
        input.redirectTo !== undefined
          ? getSafeRedirect(input.redirectTo)
          : current?.redirectTo,
      referralCode:
        input.referralCode !== undefined
          ? input.referralCode.trim() || undefined
          : current?.referralCode,
      dismiss: input.dismiss ?? current?.dismiss ?? "hide",
    }));
  }, []);

  const hideAuthModal = useCallback(() => {
    setRequest(null);
  }, []);

  const closeAuthModal = useCallback(() => {
    const dismiss = requestRef.current?.dismiss ?? "hide";
    setRequest(null);

    if (dismiss === "home") {
      router.replace("/");
      return;
    }

    if (dismiss === "back") {
      router.back();
    }
  }, [router]);

  const setAuthModalMode = useCallback((mode: AuthModalMode) => {
    setRequest((current) => (current ? { ...current, mode } : current));
  }, []);

  return (
    <AuthModalControllerContext.Provider
      value={{
        isOpen: request !== null,
        mode: request?.mode ?? "login",
        redirectTo: request?.redirectTo,
        referralCode: request?.referralCode,
        openAuthModal,
        closeAuthModal,
        hideAuthModal,
        setAuthModalMode,
      }}
    >
      {children}
      {request ? (
        <AuthModal
          mode={request.mode}
          redirectTo={request.redirectTo}
          initialReferralCode={request.referralCode}
          onClose={closeAuthModal}
          onHide={hideAuthModal}
          onSwitchMode={setAuthModalMode}
        />
      ) : null}
    </AuthModalControllerContext.Provider>
  );
}

export function AuthRouteModalBridge({
  mode,
  dismiss,
}: {
  mode: AuthModalMode;
  dismiss: Exclude<AuthModalDismiss, "hide">;
}) {
  const searchParams = useSearchParams();
  const { openAuthModal, hideAuthModal } = useAuthModalController();
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  useEffect(() => {
    const params = searchParamsRef.current;
    openAuthModal({
      mode,
      dismiss,
      redirectTo: getSafeRedirect(params.get("redirect")),
      referralCode: params.get("ref")?.trim() || undefined,
    });

    return () => {
      hideAuthModal();
    };
  }, [dismiss, hideAuthModal, mode, openAuthModal]);

  return null;
}
