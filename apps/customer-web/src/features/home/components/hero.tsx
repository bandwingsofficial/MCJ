"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: "5000+", label: "Students Placed" },
  { value: "98%", label: "Pass Rate" },
  { value: "12+", label: "Years of Excellence" },
  { value: "200+", label: "Hiring Partners" },
];

const badges = [
  { label: "OFFLINE COURSES", color: "badge-default" },
  { label: "LIVE CLASSES", color: "badge-blue" },
  { label: "100% PLACEMENT", color: "badge-gold" },
];

export function HeroSection() {
  const [visible, setVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --navy: #0f2044;
          --navy-mid: #1a3460;
          --gold: #b8922a;
          --gold-light: #d4a84b;
          --gold-pale: #f5edd8;
          --gold-bg: #fdf8ef;
          --white: #ffffff;
          --gray-text: #5a6478;
          --border: #e8e0cf;
        }

        .hero-root {
          font-family: 'DM Sans', sans-serif;
          background: var(--white);
          padding: 0;
          position: relative;
          overflow: hidden;
        }

        /* Geometric background accents */
        .hero-root::before {
          content: '';
          position: absolute;
          top: -120px;
          right: -100px;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle at 60% 40%, #f5edd8 0%, #fdf8ef 55%, transparent 75%);
          z-index: 0;
        }

        .hero-root::after {
          content: '';
          position: absolute;
          bottom: -80px;
          left: -60px;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          background: radial-gradient(circle, #e8f0fa 0%, transparent 70%);
          z-index: 0;
        }

        .hero-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 24px 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
          position: relative;
          z-index: 1;
          width: 100%;
          box-sizing: border-box;
        }

        /* LEFT CONTENT */
        .hero-left {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .badge-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 28px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .badge-row.show { opacity: 1; transform: translateY(0); }

        .badge {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.08em;
          padding: 5px 12px;
          border-radius: 20px;
          text-transform: uppercase;
          border: 1px solid transparent;
        }
        .badge-default {
          background: #f0f2f5;
          color: #4a5568;
          border-color: #dde1e8;
        }
        .badge-blue {
          background: #e8f0fa;
          color: var(--navy-mid);
          border-color: #c5d8f5;
        }
        .badge-gold {
          background: var(--gold-pale);
          color: var(--gold);
          border-color: #e2cc99;
        }

        .hero-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 4.5vw, 58px);
          font-weight: 700;
          line-height: 1.12;
          color: var(--navy);
          margin: 0 0 6px 0;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s;
        }
        .hero-headline.show { opacity: 1; transform: translateY(0); }

        .hero-headline .highlight {
          color: var(--gold);
          position: relative;
          display: inline-block;
        }
        .hero-headline .highlight::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, var(--gold-light), transparent);
          border-radius: 2px;
        }

        .hero-subtitle-line {
          font-family: 'Playfair Display', serif;
          font-size: clamp(18px, 2.2vw, 26px);
          font-weight: 400;
          font-style: italic;
          color: var(--navy-mid);
          margin: 4px 0 0 0;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.55s ease 0.18s, transform 0.55s ease 0.18s;
        }
        .hero-subtitle-line.show { opacity: 1; transform: translateY(0); }

        .divider {
          width: 56px;
          height: 2px;
          background: linear-gradient(90deg, var(--gold), transparent);
          margin: 24px 0;
          border-radius: 1px;
          opacity: 0;
          transition: opacity 0.5s ease 0.26s;
        }
        .divider.show { opacity: 1; }

        .hero-desc {
          font-size: 15px;
          line-height: 1.75;
          color: var(--gray-text);
          max-width: 440px;
          margin: 0 0 32px 0;
          font-weight: 300;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s;
        }
        .hero-desc.show { opacity: 1; transform: translateY(0); }

        .cta-row {
          display: flex;
          gap: 14px;
          align-items: center;
          flex-wrap: wrap;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.5s ease 0.38s, transform 0.5s ease 0.38s;
        }
        .cta-row.show { opacity: 1; transform: translateY(0); }

        .btn-primary {
          background: var(--navy);
          color: var(--white);
          border: none;
          padding: 14px 30px;
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          letter-spacing: 0.02em;
          position: relative;
          overflow: hidden;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(212,168,75,0.18) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .btn-primary:hover { background: var(--navy-mid); transform: translateY(-1px); }
        .btn-primary:hover::before { opacity: 1; }
        .btn-primary:active { transform: translateY(0); }

        .btn-outline {
          background: transparent;
          color: var(--navy);
          border: 1.5px solid var(--border);
          padding: 13px 26px;
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s, transform 0.15s;
        }
        .btn-outline:hover {
          border-color: var(--gold-light);
          color: var(--gold);
          transform: translateY(-1px);
        }

        /* STATS ROW */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          margin-top: 48px;
          border-top: 1px solid var(--border);
          padding-top: 32px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.5s ease 0.46s, transform 0.5s ease 0.46s;
        }
        .stats-row.show { opacity: 1; transform: translateY(0); }

        .stat-item {
          padding-right: 20px;
          border-right: 1px solid var(--border);
        }
        .stat-item:last-child { border-right: none; padding-left: 20px; padding-right: 0; }
        .stat-item:not(:first-child) { padding-left: 20px; }

        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: var(--navy);
          line-height: 1;
          margin-bottom: 4px;
        }
        .stat-value span { color: var(--gold); }

        .stat-label {
          font-size: 11px;
          color: var(--gray-text);
          letter-spacing: 0.04em;
          font-weight: 400;
          text-transform: uppercase;
        }

        /* RIGHT VISUAL */
        .hero-right {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateX(24px);
          transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
        }
        .hero-right.show { opacity: 1; transform: translateX(0); }

        .visual-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 36px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 2px 40px rgba(15, 32, 68, 0.07), 0 1px 4px rgba(15,32,68,0.04);
          position: relative;
          overflow: hidden;
        }

        .visual-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--gold), var(--navy-mid));
        }

        .vc-top {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 28px;
        }
        .vc-logo {
          width: 48px;
          height: 48px;
          background: var(--navy);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--gold-light);
          letter-spacing: -0.5px;
          flex-shrink: 0;
        }
        .vc-title {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 600;
          color: var(--navy);
          line-height: 1.2;
        }
        .vc-tagline {
          font-size: 12px;
          color: var(--gray-text);
          margin-top: 2px;
        }

        .course-list { display: flex; flex-direction: column; gap: 12px; }

        .course-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--gold-bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 16px;
          transition: border-color 0.2s;
        }
        .course-item:hover { border-color: var(--gold-light); }

        .course-icon {
          width: 36px;
          height: 36px;
          background: var(--navy);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .course-info { flex: 1; min-width: 0; }
        .course-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--navy);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .course-meta {
          font-size: 11px;
          color: var(--gray-text);
          margin-top: 2px;
        }

        .course-pill {
          font-size: 10px;
          font-weight: 500;
          padding: 3px 9px;
          border-radius: 20px;
          background: var(--gold-pale);
          color: var(--gold);
          border: 1px solid #e2cc99;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .placement-banner {
          margin-top: 16px;
          background: var(--navy);
          border-radius: 10px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .placement-icon {
          width: 36px;
          height: 36px;
          background: rgba(212,168,75,0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .placement-text {
          font-size: 13px;
          font-weight: 500;
          color: var(--gold-light);
        }
        .placement-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.55);
          margin-top: 1px;
        }

        /* Floating accent card */
        .float-card {
          position: absolute;
          top: -20px;
          right: -24px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 20px rgba(15,32,68,0.1);
          z-index: 2;
        }
        .float-dot {
          width: 8px; height: 8px;
          background: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
        }
        .float-text { font-size: 12px; font-weight: 500; color: var(--navy); }

        @media (max-width: 900px) {
          .hero-inner { grid-template-columns: 1fr; gap: 48px; padding: 32px 24px 48px; }
          .hero-right { display: none; }
          .stats-row { grid-template-columns: repeat(2, 1fr); row-gap: 24px; }
          .stat-item:nth-child(2) { border-right: none; }
          .stat-item:nth-child(3) { border-right: 1px solid var(--border); padding-left: 0; }
        }
      `}</style>

      <section className="hero-root" ref={heroRef}>
        <div className="hero-inner">
          {/* LEFT */}
          <div className="hero-left">
            <div className={`badge-row ${visible ? "show" : ""}`}>
              {badges.map((b) => (
                <span key={b.label} className={`badge ${b.color}`}>
                  {b.label}
                </span>
              ))}
            </div>

            <h1 className={`hero-headline ${visible ? "show" : ""}`}>
              Master Accounting<br />
              with <span className="highlight">MCJ Institute</span>
            </h1>

            <p className={`hero-subtitle-line ${visible ? "show" : ""}`}>
              Where Precision Meets Opportunity
            </p>

            <div className={`divider ${visible ? "show" : ""}`} />

            <p className={`hero-desc ${visible ? "show" : ""}`}>
              Industry-aligned programs in Tally, GST, and financial accounting.
              Earn certifications that open doors — with hands-on training and
              guaranteed placement support from day one.
            </p>

            <div className={`cta-row ${visible ? "show" : ""}`}>
              <button className="btn-primary">Explore Courses</button>
              <button className="btn-outline">Talk to an Advisor →</button>
            </div>

            <div className={`stats-row ${visible ? "show" : ""}`}>
              {stats.map((s) => (
                <div className="stat-item" key={s.label}>
                  <div className="stat-value">
                    {s.value.replace(/\d+/, (n) => (
                      `${n}`
                    ))}
                    <span style={{ fontSize: 16 }}></span>
                  </div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className={`hero-right ${visible ? "show" : ""}`}>
            <div className="float-card">
              <div className="float-dot" />
              <div className="float-text">Admissions Open 2025</div>
            </div>

            <div className="visual-card">
              <div className="vc-top">
                <div className="vc-logo">MCJ</div>
                <div>
                  <div className="vc-title">MCJ Institute of Accounting</div>
                  <div className="vc-tagline">Professional · Certified · Trusted</div>
                </div>
              </div>

              <div className="course-list">
                {[
                  { name: "Tally Prime & ERP 9", meta: "3 Months · Offline + Live", tag: "Popular" },
                  { name: "GST & Taxation Expert", meta: "2 Months · Live Batch", tag: "New" },
                  { name: "Financial Accounting", meta: "4 Months · Comprehensive", tag: "Certified" },
                ].map((course) => (
                  <div className="course-item" key={course.name}>
                    <div className="course-icon">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#d4a84b" />
                        <rect x="10" y="2" width="6" height="6" rx="1.5" fill="rgba(212,168,75,0.5)" />
                        <rect x="2" y="10" width="6" height="6" rx="1.5" fill="rgba(212,168,75,0.5)" />
                        <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#d4a84b" />
                      </svg>
                    </div>
                    <div className="course-info">
                      <div className="course-name">{course.name}</div>
                      <div className="course-meta">{course.meta}</div>
                    </div>
                    <div className="course-pill">{course.tag}</div>
                  </div>
                ))}
              </div>

              <div className="placement-banner">
                <div className="placement-icon">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2L11 7H16L12 10.5L13.5 16L9 13L4.5 16L6 10.5L2 7H7L9 2Z" fill="#d4a84b" />
                  </svg>
                </div>
                <div>
                  <div className="placement-text">100% Placement Guarantee</div>
                  <div className="placement-sub">5000+ alumni placed across India</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}