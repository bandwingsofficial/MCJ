"use client";

import { useCallback, useState } from "react";
import { Check, Mail, MessageCircle, Share2 } from "lucide-react";

import { cn } from "@/src/shared/lib/cn";

interface FinanceNewsShareActionsProps {
  title: string;
  className?: string;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.062 2.062 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function FinanceNewsShareActions({
  title,
  className,
}: FinanceNewsShareActionsProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = useCallback(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.location.href;
  }, []);

  const openShareWindow = useCallback((url: string) => {
    window.open(url, "_blank", "noopener,noreferrer,width=640,height=480");
  }, []);

  const handleNativeShare = useCallback(async () => {
    const shareUrl = getShareUrl();

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch {
        // Fall through to copy link.
      }
    }

    if (!shareUrl || typeof navigator === "undefined") {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable.
    }
  }, [getShareUrl, title]);

  const shareLinks = useCallback(() => {
    const shareUrl = encodeURIComponent(getShareUrl());
    const shareTitle = encodeURIComponent(title);

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      x: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
      email: `mailto:?subject=${shareTitle}&body=${shareUrl}`,
    };
  }, [getShareUrl, title]);

  const buttonClass =
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => void handleNativeShare()}
        className={cn(buttonClass, "bg-[#2563EB] focus-visible:outline-[#2563EB]")}
        aria-label={copied ? "Link copied" : "Share article"}
      >
        {copied ? (
          <Check className="h-4 w-4" aria-hidden />
        ) : (
          <Share2 className="h-4 w-4" aria-hidden />
        )}
      </button>

      <button
        type="button"
        onClick={() => openShareWindow(shareLinks().facebook)}
        className={cn(buttonClass, "bg-[#1877F2] focus-visible:outline-[#1877F2]")}
        aria-label="Share on Facebook"
      >
        <FacebookIcon className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => openShareWindow(shareLinks().x)}
        className={cn(buttonClass, "bg-[#0F1419] focus-visible:outline-[#0F1419]")}
        aria-label="Share on X"
      >
        <XIcon className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => openShareWindow(shareLinks().linkedin)}
        className={cn(buttonClass, "bg-[#0A66C2] focus-visible:outline-[#0A66C2]")}
        aria-label="Share on LinkedIn"
      >
        <LinkedInIcon className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => openShareWindow(shareLinks().whatsapp)}
        className={cn(buttonClass, "bg-[#25D366] focus-visible:outline-[#25D366]")}
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
      </button>

      <a
        href={shareLinks().email}
        onClick={(event) => {
          const url = getShareUrl();
          if (!url) {
            event.preventDefault();
            return;
          }

          event.currentTarget.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        }}
        className={cn(buttonClass, "bg-[#64748B] focus-visible:outline-[#64748B]")}
        aria-label="Share by email"
      >
        <Mail className="h-4 w-4" aria-hidden />
      </a>
    </div>
  );
}
