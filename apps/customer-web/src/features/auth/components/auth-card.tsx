import { ReactNode } from "react";
import { Card } from "@/src/shared/components/ui/card";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  variant?: "default" | "wide";
  onClose?: () => void;
}

export function AuthCard({
  title,
  description,
  children,
  variant = "default",
  onClose,
}: AuthCardProps) {
  const isWide = variant === "wide";
  return (
    <>
      <style>{`
        .mcj-auth-card-shell {
          position: relative;
          width: 100%;
          max-width: ${isWide ? "820px" : "440px"};
          background: #FFFFFF;
          border-radius: 20px;
          overflow: hidden;
          margin-left: auto;
          margin-right: auto;
          box-shadow:
            0 1px 3px rgba(15,32,68,0.08),
            0 16px 40px rgba(15,32,68,0.18),
            0 0 0 1px rgba(47,107,229,0.16);
          animation: cardIn 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .mcj-card-header-strip {
          padding: 26px ${onClose ? "56px" : "30px"} 22px 30px;
          background: linear-gradient(135deg, #2F6BE5 0%, #1E49A8 100%);
          border-bottom: 1px solid rgba(255,255,255,0.14);
        }
        .mcj-card-header-strip h1 {
          font-size: 22px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.025em;
          margin: 0 0 4px;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .mcj-card-header-strip p {
          font-size: 13px;
          color: rgba(255,255,255,0.82);
          margin: 0;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .mcj-card-body-wrap {
          padding: 24px 30px 28px;
        }
      `}</style>

      <div className="mcj-auth-card-shell">
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/20"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        ) : null}
        <div className="mcj-card-header-strip">
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        <div className="mcj-card-body-wrap">
          {children}
        </div>
      </div>
    </>
  );
}