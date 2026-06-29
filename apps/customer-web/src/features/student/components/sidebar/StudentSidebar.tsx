"use client";

import {
  BriefcaseBusiness,
  LayoutDashboard,
  User,
} from "lucide-react";

import { StudentSidebarItem } from "./StudentSidebarItem";

export function StudentSidebar() {
  return (
    <>
      <style>{`
        .stu-sidebar {
          width: 240px;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #FFFFFF;
          border-right: 1px solid #F1F0EF;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          flex-shrink: 0;
          user-select: none;
        }

        /* Header */
        .stu-sidebar-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 20px;
          height: 64px;
          border-bottom: 1px solid #F1F0EF;
          flex-shrink: 0;
        }
        .stu-sidebar-header-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: linear-gradient(135deg, #F59E0B, #D97706);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stu-sidebar-header-icon svg {
          width: 14px;
          height: 14px;
          color: #fff;
        }
        .stu-sidebar-header-text {
          font-size: 11px;
          font-weight: 700;
          color: #1C1917;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        /* Nav */
        .stu-nav {
          flex: 1;
          padding: 16px 12px 12px;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .stu-nav::-webkit-scrollbar { display: none; }

        .stu-section-label {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C4B89A;
          padding: 0 8px;
          margin-bottom: 8px;
        }

        /* Footer */
        .stu-sidebar-footer {
          padding: 14px 20px;
          border-top: 1px solid #F1F0EF;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .stu-version {
          font-size: 11px;
          font-weight: 500;
          color: #C4B5A5;
          letter-spacing: 0.04em;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .stu-online-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 0 2px rgba(16,185,129,0.15);
        }
      `}</style>

      <aside className="stu-sidebar">
        {/* Header */}
        <div className="stu-sidebar-header">
          <div className="stu-sidebar-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <span className="stu-sidebar-header-text">Student Panel</span>
        </div>

        {/* Nav */}
        <nav className="stu-nav">
          <div className="stu-section-label">Core</div>

          <StudentSidebarItem href="/student" icon={LayoutDashboard} label="Dashboard" />
          <StudentSidebarItem href="/student/profile" icon={User} label="Profile" />
          <StudentSidebarItem href="/student/applications" icon={BriefcaseBusiness} label="My Applications" />
          <StudentSidebarItem href="/student/placement" icon={BriefcaseBusiness} label="Placement" />
        </nav>

        {/* Footer */}
        <div className="stu-sidebar-footer">
          <span className="stu-version">Version 1.0.0</span>
          <span className="stu-online-dot" />
        </div>
      </aside>
    </>
  );
}