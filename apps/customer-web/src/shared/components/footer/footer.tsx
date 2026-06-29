"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaTwitter, FaWhatsapp } from "react-icons/fa";

export function Footer() {
  return (
    <>
      <style>{`
        .mcj-footer {
          background: #0B1120;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Top gold accent line */
        .mcj-footer::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #F59E0B 30%, #D97706 60%, transparent 100%);
        }

        /* Ambient glow */
        .mcj-footer::after {
          content: '';
          position: absolute;
          top: -80px; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 200px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(245,158,11,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── MAIN GRID ── */
        .mcj-footer-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 56px 32px 48px;
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1.2fr 1.4fr;
          gap: 40px;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 1100px) {
          .mcj-footer-main { grid-template-columns: 1fr 1fr 1fr; }
        }
        @media (max-width: 680px) {
          .mcj-footer-main { grid-template-columns: 1fr 1fr; padding: 40px 20px 32px; gap: 28px; }
        }
        @media (max-width: 420px) {
          .mcj-footer-main { grid-template-columns: 1fr; }
        }

        /* ── BRAND COL ── */
        .mcj-footer-brand-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }
        .mcj-footer-logo-ring {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #F59E0B, #D97706);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 14px rgba(245,158,11,0.3);
          flex-shrink: 0;
          overflow: hidden;
        }
        .mcj-footer-brand-name {
          font-size: 15px;
          font-weight: 700;
          color: #F8FAFF;
          letter-spacing: -0.01em;
        }
        .mcj-footer-brand-desc {
          font-size: 12.5px;
          color: rgba(148,163,184,0.65);
          line-height: 1.65;
          margin-bottom: 20px;
        }

        /* Social icons */
        .mcj-social-row {
          display: flex;
          gap: 10px;
        }
        .mcj-social-btn {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: rgba(148,163,184,0.7);
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          flex-shrink: 0;
        }
        .mcj-social-btn:hover { background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.3); color: #F59E0B; }
        .mcj-social-btn svg { width: 15px; height: 15px; }

        /* ── COLUMN HEADINGS ── */
        .mcj-footer-col-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #F59E0B;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .mcj-footer-col-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(245,158,11,0.25), transparent);
        }

        /* ── LINK LIST ── */
        .mcj-footer-links {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .mcj-footer-link-item {
          position: relative;
          width: fit-content;
        }
        .mcj-footer-link-item a {
          font-size: 13px;
          color: rgba(148,163,184,0.7);
          text-decoration: none;
          transition: color 0.2s;
          line-height: 1;
        }
        .mcj-footer-link-item a:hover {
          color: #F8FAFF;
        }
        .mcj-footer-link-underline {
          position: absolute;
          left: 0; bottom: -2px;
          height: 1px; width: 0;
          background: linear-gradient(90deg, #F59E0B, #D97706);
          transition: width 0.25s ease;
        }
        .mcj-footer-link-item:hover .mcj-footer-link-underline {
          width: 100%;
        }

        /* ── BRANCH LIST ── */
        .mcj-branch-list {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .mcj-branch-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          color: rgba(148,163,184,0.65);
          transition: color 0.2s, transform 0.2s;
        }
        .mcj-branch-item:hover { color: #F8FAFF; transform: translateX(3px); }
        .mcj-branch-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #F59E0B;
          flex-shrink: 0;
          opacity: 0.5;
        }

        /* ── CONTACT ── */
        .mcj-contact-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 20px;
        }
        .mcj-contact-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .mcj-contact-icon {
          width: 28px; height: 28px;
          border-radius: 7px;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.15);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
          color: #D97706;
        }
        .mcj-contact-icon svg { width: 13px; height: 13px; }
        .mcj-contact-text {
          font-size: 12.5px;
          color: rgba(148,163,184,0.65);
          line-height: 1.6;
          transition: color 0.2s;
        }
        .mcj-contact-row:hover .mcj-contact-text { color: #F8FAFF; }

        /* App buttons */
        .mcj-app-btns {
          display: flex;
          gap: 8px;
        }
        .mcj-app-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(148,163,184,0.8);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .mcj-app-btn svg { width: 13px; height: 13px; flex-shrink: 0; }
        .mcj-app-btn:hover {
          background: rgba(245,158,11,0.1);
          border-color: rgba(245,158,11,0.25);
          color: #F8FAFF;
        }

        /* ── BOTTOM BAR ── */
        .mcj-footer-bottom {
          position: relative;
          z-index: 1;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .mcj-footer-bottom-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .mcj-footer-copy {
          font-size: 12px;
          color: rgba(148,163,184,0.45);
          transition: color 0.2s;
        }
        .mcj-footer-copy:hover { color: rgba(148,163,184,0.75); }
        .mcj-footer-made {
          font-size: 12px;
          color: rgba(148,163,184,0.35);
          transition: color 0.2s;
        }
        .mcj-footer-made:hover { color: rgba(148,163,184,0.65); }
      `}</style>

      <footer className="mcj-footer">

        {/* ── MAIN GRID ── */}
        <div className="mcj-footer-main">

          {/* COLUMN 1 — BRAND */}
          <div>
            <div className="mcj-footer-brand-row">
              <div className="mcj-footer-logo-ring">
                <Image src="/logo/MCJ_logo.png" alt="MCJ Logo" width={38} height={38} style={{ height: "auto" }} />
              </div>
              <span className="mcj-footer-brand-name">MCJ Institute</span>
            </div>

            <p className="mcj-footer-brand-desc">
              Empowering students with practical accounting skills, real-world
              training, and placement support to build successful careers.
            </p>

            <div className="mcj-social-row">
              <div className="mcj-social-btn"><FaInstagram /></div>
              <div className="mcj-social-btn"><FaTwitter /></div>
              <div className="mcj-social-btn"><FaWhatsapp /></div>
            </div>
          </div>

          {/* COLUMN 2 — COMPANY */}
          <div>
            <div className="mcj-footer-col-title">Company</div>
            <ul className="mcj-footer-links">
              {[
                { name: "About Us", href: "/about" },
                { name: "Contact Us", href: "/contact" },
                { name: "Careers", href: "/jobs" },
                { name: "Success Stories", href: "/success-stories" },
              ].map((item) => (
                <li key={item.name} className="mcj-footer-link-item">
                  <Link href={item.href}>{item.name}</Link>
                  <span className="mcj-footer-link-underline" />
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3 — LEGAL */}
          <div>
            <div className="mcj-footer-col-title">Legal</div>
            <ul className="mcj-footer-links">
              {[
                { name: "Privacy Policy", href: "/legal/privacy-policy" },
                { name: "Terms of Service", href: "/legal/terms" },
                { name: "Return Policy", href: "/legal/return-policy" },
                { name: "Refund Policy", href: "/legal/refund-policy" },
                { name: "FAQ", href: "/faq" },
              ].map((item) => (
                <li key={item.name} className="mcj-footer-link-item">
                  <Link href={item.href}>{item.name}</Link>
                  <span className="mcj-footer-link-underline" />
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4 — BRANCHES */}
          <div>
            <div className="mcj-footer-col-title">Branches</div>
            <ul className="mcj-branch-list">
              {[
                "Basavanagudi, Bangalore",
                "Malleshwaram, Bangalore",
                "BTM Layout, Bangalore",
                "Raja Rajeshwari Nagar, Bangalore",
                "Marathahalli, Bangalore",
                "Vijayanagar, Bangalore",
              ].map((item) => (
                <li key={item} className="mcj-branch-item">
                  <span className="mcj-branch-dot" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 5 — CONTACT */}
          <div>
            <div className="mcj-footer-col-title">Contact</div>

            <div className="mcj-contact-list">
              <div className="mcj-contact-row">
                <div className="mcj-contact-icon"><MapPin /></div>
                <p className="mcj-contact-text">
                  #258/1, 1st Floor, Near 31E Bus Stop Rd,<br />
                  2nd Block, Thyagaraja Nagar,<br />
                  Bengaluru, Karnataka 560028
                </p>
              </div>

              <div className="mcj-contact-row">
                <div className="mcj-contact-icon"><Phone /></div>
                <p className="mcj-contact-text">
                  +91 888 000 7484 / +91 966 337 0950
                </p>
              </div>

              <div className="mcj-contact-row">
                <div className="mcj-contact-icon"><Mail /></div>
                <p className="mcj-contact-text">support@mcjinstitute.com</p>
              </div>
            </div>

            <div className="mcj-app-btns">
              <button className="mcj-app-btn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.18 23.76c.3.17.64.24.99.2l12.87-12.89-3.54-3.54L3.18 23.76zM20.54 10.6L17.9 9.1l-3.32 3.32 3.32 3.32 2.65-1.5c.76-.43.76-1.62-.01-2.64zM.63.37C.24.79 0 1.43 0 2.27v19.46c0 .84.24 1.48.63 1.9l.1.09 10.9-10.9v-.26L.73.28.63.37zm13.2 9.09L3.18.28c-.3-.17-.64-.24-.99-.2l12.87 9.38h-1.23z"/>
                </svg>
                Google Play
              </button>
              <button className="mcj-app-btn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                App Store
              </button>
            </div>
          </div>

        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="mcj-footer-bottom">
          <div className="mcj-footer-bottom-inner">
            <p className="mcj-footer-copy">© 2026 MCJ Institute. All rights reserved.</p>
            <p className="mcj-footer-made">Made with ❤️ in India</p>
          </div>
        </div>

      </footer>
    </>
  );
}