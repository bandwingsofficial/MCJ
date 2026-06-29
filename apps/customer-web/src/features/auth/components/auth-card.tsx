import { ReactNode } from "react";
import { Card } from "@/src/shared/components/ui/card";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <>
      <style>{`
        .mcj-auth-card-shell {
          width: 100%;
          max-width: 440px;
          background: #FFFFFF;
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 1px 3px rgba(0,0,0,0.06),
            0 8px 32px rgba(0,0,0,0.09),
            0 0 0 1px rgba(245,158,11,0.10);
          animation: cardIn 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .mcj-card-header-strip {
          padding: 26px 30px 22px;
          background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 60%, #FDE68A 100%);
          border-bottom: 1px solid rgba(245,158,11,0.15);
        }
        .mcj-card-header-strip h1 {
          font-size: 22px;
          font-weight: 800;
          color: #1C1917;
          letter-spacing: -0.025em;
          margin: 0 0 4px;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .mcj-card-header-strip p {
          font-size: 13px;
          color: rgba(120,100,70,0.7);
          margin: 0;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .mcj-card-body-wrap {
          padding: 24px 30px 28px;
        }
      `}</style>

      <div className="mcj-auth-card-shell">
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