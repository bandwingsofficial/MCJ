"use client";

export function StudentDashboardPage() {
  return (
    <>
      <style>{`
        .stu-dash {
          padding: 32px 36px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          max-width: 900px;
        }

        /* ── Page heading ── */
        .stu-dash-heading {
          margin-bottom: 28px;
        }
        .stu-dash-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #D97706;
          background: #FFFBEB;
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 20px;
          padding: 3px 10px;
          margin-bottom: 12px;
        }
        .stu-dash-eyebrow-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #F59E0B;
        }
        .stu-dash-title {
          font-size: 26px;
          font-weight: 800;
          color: #1C1917;
          letter-spacing: -0.03em;
          margin: 0 0 6px;
          line-height: 1.15;
        }
        .stu-dash-subtitle {
          font-size: 14px;
          color: #A8A29E;
          margin: 0;
          font-weight: 400;
        }

        /* ── Stats row ── */
        .stu-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 28px;
        }
        .stu-stat-card {
          background: #FFFFFF;
          border: 1px solid #F1F0EF;
          border-radius: 14px;
          padding: 20px 22px;
        }
        .stu-stat-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #A8A29E;
          margin-bottom: 10px;
        }
        .stu-stat-value {
          font-size: 28px;
          font-weight: 800;
          color: #1C1917;
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 6px;
        }
        .stu-stat-value.gold { color: #D97706; }
        .stu-stat-sub {
          font-size: 12px;
          color: #C4B5A5;
          font-weight: 400;
        }
        .stu-stat-icon {
          width: 34px; height: 34px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }
        .stu-stat-icon.amber { background: #FFFBEB; color: #D97706; }
        .stu-stat-icon.blue  { background: #EFF6FF; color: #3B82F6; }
        .stu-stat-icon.green { background: #F0FDF4; color: #10B981; }
        .stu-stat-icon svg { width: 16px; height: 16px; }

        /* ── Two-col section ── */
        .stu-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        /* ── Section card ── */
        .stu-section-card {
          background: #FFFFFF;
          border: 1px solid #F1F0EF;
          border-radius: 14px;
          padding: 20px 22px;
        }
        .stu-section-card-title {
          font-size: 13px;
          font-weight: 700;
          color: #1C1917;
          letter-spacing: -0.01em;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .stu-section-card-title-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #F59E0B;
          flex-shrink: 0;
        }

        /* Quick links list */
        .stu-quick-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .stu-quick-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 9px;
          background: #FAFAF9;
          text-decoration: none;
        }
        .stu-quick-item-icon {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: #FFFBEB;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: #D97706;
        }
        .stu-quick-item-icon svg { width: 13px; height: 13px; }
        .stu-quick-item-label {
          font-size: 13px;
          font-weight: 500;
          color: #44403C;
        }
        .stu-quick-item-arrow {
          margin-left: auto;
          color: #D4C5B5;
        }
        .stu-quick-item-arrow svg { width: 13px; height: 13px; }

        /* Activity list */
        .stu-activity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .stu-activity-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .stu-activity-line-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          padding-top: 3px;
        }
        .stu-activity-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #F59E0B;
          flex-shrink: 0;
        }
        .stu-activity-dot.muted { background: #E7E5E4; }
        .stu-activity-connector {
          width: 1px; height: 20px;
          background: #F1F0EF;
          margin-top: 3px;
        }
        .stu-activity-text {
          font-size: 12.5px;
          color: #78716C;
          line-height: 1.5;
        }
        .stu-activity-text strong {
          color: #1C1917;
          font-weight: 600;
        }
        .stu-activity-time {
          font-size: 11px;
          color: #C4B5A5;
          margin-top: 1px;
        }

        /* ── Empty / placeholder state ── */
        .stu-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 28px 16px;
          text-align: center;
        }
        .stu-empty-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: #FAFAF9;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 12px;
          color: #D4C5B5;
        }
        .stu-empty-icon svg { width: 18px; height: 18px; }
        .stu-empty-text {
          font-size: 13px;
          color: #C4B5A5;
          line-height: 1.5;
        }

        @media (max-width: 700px) {
          .stu-dash { padding: 20px 16px; }
          .stu-stats-row { grid-template-columns: 1fr; }
          .stu-two-col { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="stu-dash">

        {/* ── Heading ── */}
        <div className="stu-dash-heading">
          <div className="stu-dash-eyebrow">
            <span className="stu-dash-eyebrow-dot" />
            MCJ Institute
          </div>
          <h1 className="stu-dash-title">User Dashboard</h1>
          <p className="stu-dash-subtitle">Here's what's happening with your learning journey.</p>
        </div>

        {/* ── Stats ── */}
        <div className="stu-stats-row">
          <div className="stu-stat-card">
            <div className="stu-stat-icon amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div className="stu-stat-label">Enrolled Courses</div>
            <div className="stu-stat-value gold">0</div>
            <div className="stu-stat-sub">No active courses yet</div>
          </div>

          <div className="stu-stat-card">
            <div className="stu-stat-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <div className="stu-stat-label">Applications</div>
            <div className="stu-stat-value">0</div>
            <div className="stu-stat-sub">No applications submitted</div>
          </div>

          <div className="stu-stat-card">
            <div className="stu-stat-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="stu-stat-label">Placement Status</div>
            <div className="stu-stat-value" style={{ fontSize: 16, paddingTop: 6 }}>Not placed</div>
            <div className="stu-stat-sub">Profile under review</div>
          </div>
        </div>

        {/* ── Two-col ── */}
        <div className="stu-two-col">

          {/* Quick links */}
          <div className="stu-section-card">
            <div className="stu-section-card-title">
              <span className="stu-section-card-title-dot" />
              Quick Links
            </div>
            <div className="stu-quick-list">
              {[
                { label: "My Profile", href: "/student/profile", icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>, iconExtra: <circle cx="12" cy="7" r="4"/> },
                { label: "My Applications", href: "/student/applications", icon: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></> },
                { label: "Placement", href: "/student/placement", icon: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></> },
              ].map((item) => (
                <a key={item.href} href={item.href} className="stu-quick-item">
                  <div className="stu-quick-item-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {item.icon}
                    </svg>
                  </div>
                  <span className="stu-quick-item-label">{item.label}</span>
                  <span className="stu-quick-item-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="stu-section-card">
            <div className="stu-section-card-title">
              <span className="stu-section-card-title-dot" />
              Recent Activity
            </div>
            <div className="stu-empty">
              <div className="stu-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <p className="stu-empty-text">No recent activity yet.<br/>Start exploring your courses.</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}