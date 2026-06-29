import Image from "next/image";
import Link from "next/link";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => {
  return (
    <>
      <style>{`
        .mcj-layout-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #FAFAF9;
          padding: 24px 16px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }
        /* Ambient blobs */
        .mcj-layout-page::before {
          content: '';
          position: fixed;
          top: -120px; right: -100px;
          width: 380px; height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .mcj-layout-page::after {
          content: '';
          position: fixed;
          bottom: -90px; left: -70px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .mcj-layout-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        /* Card */
        .mcj-layout-card {
          width: 100%;
          background: #FFFFFF;
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 1px 3px rgba(0,0,0,0.06),
            0 8px 32px rgba(0,0,0,0.09),
            0 0 0 1px rgba(245,158,11,0.10);
          animation: mcjLayoutIn 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes mcjLayoutIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        /* Header strip */
        .mcj-layout-header {
          position: relative;
          padding: 26px 30px 22px;
          background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 55%, #FDE68A 100%);
          border-bottom: 1px solid rgba(245,158,11,0.15);
          overflow: hidden;
        }
        .mcj-layout-header::after {
          content: '';
          position: absolute;
          bottom: -28px; right: -28px;
          width: 90px; height: 90px;
          border-radius: 50%;
          background: rgba(245,158,11,0.12);
          pointer-events: none;
        }
        /* Brand row */
        .mcj-brand-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .mcj-brand-logo-wrap {
          width: 36px; height: 36px;
          border-radius: 9px;
          background: linear-gradient(135deg, #F59E0B, #D97706);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(245,158,11,0.35);
          flex-shrink: 0;
          overflow: hidden;
        }
        .mcj-brand-name {
          font-size: 13px;
          font-weight: 700;
          color: #92400E;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }
        .mcj-brand-tag {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: rgba(146,64,14,0.55);
          text-transform: uppercase;
        }
        .mcj-layout-title {
          font-size: 22px;
          font-weight: 800;
          color: #1C1917;
          letter-spacing: -0.025em;
          margin: 0 0 4px;
          line-height: 1.15;
        }
        .mcj-layout-subtitle {
          font-size: 13px;
          color: rgba(120,100,70,0.7);
          margin: 0;
          line-height: 1.5;
        }
        /* Body */
        .mcj-layout-body {
          padding: 24px 30px 26px;
        }
        /* Footer */
        .mcj-layout-footer {
          padding: 14px 30px 18px;
          border-top: 1px solid #F5F5F4;
          text-align: center;
          font-size: 13px;
          color: #78716C;
          animation: mcjFadeUp 0.4s 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
        .mcj-layout-footer a {
          color: #D97706;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s;
        }
        .mcj-layout-footer a:hover { color: #B45309; text-decoration: underline; }
        /* Back link */
        .mcj-back-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 18px;
          font-size: 12.5px;
          color: rgba(120,113,108,0.55);
          text-decoration: none;
          transition: color 0.15s;
          animation: mcjFadeUp 0.4s 0.35s cubic-bezier(0.22,1,0.36,1) both;
        }
        .mcj-back-link:hover { color: #D97706; }
        @keyframes mcjFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mcj-layout-card, .mcj-layout-footer, .mcj-back-link {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      <div className="mcj-layout-page">
        <div className="mcj-layout-inner">
          <div className="mcj-layout-card">

            {/* Header strip with brand + title */}
            <div className="mcj-layout-header">
              <div className="mcj-brand-row">
                <div className="mcj-brand-logo-wrap">
                  <Image
                    src="/logo/MCJ_logo.png"
                    alt="MCJ Logo"
                    width={36}
                    height={36}
                    style={{ height: "auto" }}
                  />
                </div>
                <div>
                  <div className="mcj-brand-name">MCJ Institute</div>
                  <div className="mcj-brand-tag">Learning Platform</div>
                </div>
              </div>
              <h1 className="mcj-layout-title">{title}</h1>
              {subtitle && <p className="mcj-layout-subtitle">{subtitle}</p>}
            </div>

            {/* Form body */}
            <div className="mcj-layout-body">{children}</div>

            {/* Footer links */}
            {footer && <div className="mcj-layout-footer">{footer}</div>}
          </div>

          {/* Back to home */}
          <Link href="/" className="mcj-back-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
};