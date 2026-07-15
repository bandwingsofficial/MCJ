"use client";

import {
  BriefcaseBusiness,
  LayoutDashboard,
  User,
} from "lucide-react";

import { StudentSidebarItem } from "./StudentSidebarItem";

/**
 * NOTE ON THE STICKY FIX
 * -----------------------
 * The previous version scrolled away because `.stu-sidebar` had
 * `height: 100vh` but no positioning — so it was just a normal block
 * element that scrolled along with the rest of the page.
 *
 * `position: sticky; top: var(--stu-navbar-offset)` pins it to the
 * viewport as the page scrolls, as long as the page itself (body/html)
 * is the scrolling container.
 *
 * If your top navbar is `position: fixed`/`sticky` and sits ABOVE this
 * sidebar with its own height, set --stu-navbar-offset to that height
 * (default below assumes ~92px based on your screenshots — adjust to
 * match your actual navbar). If the sidebar sits in its own flex
 * column below the navbar (i.e. the navbar is out of this component's
 * stacking context), set it to 0.
 */

export function StudentSidebar() {
  return (
    <>
      <style>{`
        .stu-sidebar {
          --stu-navbar-offset: 0px; /* adjust if a fixed navbar sits above this component */

          position: sticky;
          top: var(--stu-navbar-offset);

          width: 240px;
          height: calc(100vh - var(--stu-navbar-offset));
          display: flex;
          flex-direction: column;
          background: #FFFFFF;
          border-right: 1px solid #F1F0EF;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          flex-shrink: 0;
          align-self: flex-start;
          user-select: none;
          z-index: 10;
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

        /* Nav items (rendered by StudentSidebarItem) */
        .stu-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          margin-bottom: 2px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 500;
          color: #78716C;
          text-decoration: none;
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .stu-nav-item:hover {
          background: #FAFAF9;
          color: #292524;
        }
        .stu-nav-item:focus-visible {
          outline: 2px solid #D97706;
          outline-offset: 2px;
        }
        .stu-nav-icon {
          width: 17px;
          height: 17px;
          flex-shrink: 0;
          color: #A8A29E;
          transition: color 0.15s ease;
        }
        .stu-nav-item:hover .stu-nav-icon {
          color: #57534E;
        }
        .stu-nav-item.is-active {
          background: #FFF7ED;
          color: #C2410C;
          font-weight: 600;
        }
        .stu-nav-item.is-active .stu-nav-icon {
          color: #EA580C;
        }
        .stu-nav-indicator {
          position: absolute;
          left: -12px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 18px;
          border-radius: 0 3px 3px 0;
          background: linear-gradient(180deg, #F59E0B, #D97706);
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
        }
        .stu-online-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 0 2px rgba(16,185,129,0.15);
        }

        @media (prefers-reduced-motion: reduce) {
          .stu-nav-item { transition: none; }
        }
      `}</style>

      <aside className="stu-sidebar">
        <div className="stu-sidebar-header">
          <div className="stu-sidebar-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <span className="stu-sidebar-header-text">Student Panel</span>
        </div>

        <nav className="stu-nav">
          <div className="stu-section-label">Core</div>
          <StudentSidebarItem href="/student" icon={LayoutDashboard} label="Dashboard" />
          <StudentSidebarItem href="/student/profile" icon={User} label="Profile" />
          <StudentSidebarItem href="/student/applications" icon={BriefcaseBusiness} label="My Applications" />
          <StudentSidebarItem href="/student/placement" icon={BriefcaseBusiness} label="Placement" />
          <StudentSidebarItem href="/student/enrollments" icon={BriefcaseBusiness} label="My Enrollment" />
          <StudentSidebarItem href="/student/my-learning" icon={BriefcaseBusiness} label="My Learnings" />
        </nav>

        <div className="stu-sidebar-footer">
          <span className="stu-version">Version 1.0.0</span>
          <span className="stu-online-dot" />
        </div>
      </aside>
    </>
  );
}