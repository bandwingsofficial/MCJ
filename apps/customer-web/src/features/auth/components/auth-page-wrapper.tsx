import { ReactNode } from "react";

interface AuthPageWrapperProps {
  children: ReactNode;
}

export function AuthPageWrapper({ children }: AuthPageWrapperProps) {
  return (
    <>
      <style>{`
        .mcj-page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FAFAF9;
          padding: 24px 16px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }
        .mcj-page-wrapper::before {
          content: '';
          position: fixed;
          top: -120px; right: -100px;
          width: 380px; height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .mcj-page-wrapper::after {
          content: '';
          position: fixed;
          bottom: -90px; left: -70px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .mcj-page-wrapper-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <div className="mcj-page-wrapper">
        <div className="mcj-page-wrapper-inner">
          {children}
        </div>
      </div>
    </>
  );
}