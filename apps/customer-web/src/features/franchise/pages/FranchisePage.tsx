"use client";

import { useState, useEffect, useRef } from "react";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

function useCounter(end: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(p * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

function AnimCounter({ value, suffix = "+", label }: { value: number, suffix?: string, label: string }) {
  const [ref, inView] = useInView();
  const n = useCounter(value, 1800, inView);
  return (
    <div ref={ref} className="anim-stat">
      <span className="anim-num">{n}{suffix}</span>
      <span className="anim-lbl">{label}</span>
    </div>
  );
}

export function FranchisePage() {
  const [activeStep, setActiveStep] = useState(0);

  const pillars = [
    { icon: "📋", color: "blue",  title: "Zero Curriculum Work",      desc: "Every course — Tally, GST, Financial Accounting — is fully developed, tested, and ready to deliver. You teach from day one." },
    { icon: "🎓", color: "gold",  title: "Faculty Training Program",    desc: "MCJ trains your team before your center opens. Methodology, delivery, and student engagement — all covered." },
    { icon: "📣", color: "navy",  title: "Brand & Admission Support",   desc: "Leverage MCJ's digital presence, social campaigns, and reputation to drive student inquiries from launch day." },
    { icon: "💼", color: "blue",  title: "Placement Network Access",    desc: "Your students plug into MCJ's 5,000+ alumni and employer network — making your placement record strong from day one." },
    { icon: "🖥️", color: "gold",  title: "Technology & LMS",            desc: "Access our student management platform, digital classrooms, and attendance tools without building anything yourself." },
    { icon: "🤝", color: "navy",  title: "Dedicated Partner Manager",   desc: "A single point of contact who knows your center, your city, and your goals — available whenever you need support." },
  ];

  const steps = [
    { num: "01", title: "Express Interest", icon: "✉️", short: "Fill the inquiry or call us directly.", detail: "Tell us your city, background, and vision. Our franchise team reviews every application personally within 48 hours and follows up the same day." },
    { num: "02", title: "Discovery Call",   icon: "📞", short: "One-on-one consultation with our team.", detail: "We understand your local market, walk you through the opportunity in detail, and assess mutual fit — no pressure, no commitment, just an honest conversation." },
    { num: "03", title: "Agreement & Setup", icon: "📄", short: "Formalize the partnership.", detail: "Sign the franchise agreement and kick off center setup. MCJ provides infrastructure guidance, branding kits, signage, and complete staff training." },
    { num: "04", title: "Grand Launch",     icon: "🚀", short: "Open with MCJ's full support behind you.", detail: "Launch your center backed by a full admissions drive, digital campaign, and our ongoing operational and academic support through year one and beyond." },
  ];

  const whys = [
    { label: "Accounting is evergreen",  sub: "Every business needs Tally-proficient staff. Demand never dips." },
    { label: "Brand trust is built-in",  sub: "MCJ's name converts enquiries faster than any new institute." },
    { label: "Low execution risk",       sub: "Curriculum, faculty training, and admission tools are already ready." },
    { label: "Community impact",         sub: "You create employment and transform careers in your own city." },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        :root {
          --navy:      #0f2044;
          --navy-mid:  #1a3570;
          --gold:      #b8922a;
          --gold-lt:   #d4a843;
          --gold-pale: #fef9ee;
          --blue:      #2563eb;
          --blue-lt:   #3b82f6;
          --blue-pale: #eff6ff;
          --white:     #ffffff;
          --off:       #f8f8f6;
          --border:    #e5e2da;
          --text:      #374151;
          --muted:     #6b7280;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .fp { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--white); color: var(--navy); overflow-x: hidden; }

        .hero { background: var(--white); padding: 40px 40px 72px; }

        .hero-inner {
          max-width: 1180px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 460px; gap: 72px; align-items: center;
        }

        .eyebrow-pill {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          color: var(--blue); border: 1px solid rgba(37,99,235,0.22); background: var(--blue-pale);
          padding: 6px 14px; border-radius: 100px; margin-bottom: 24px;
        }
        .eyebrow-pill::before { content:''; width:6px; height:6px; border-radius:50%; background:var(--blue); }

        .hero-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(46px, 5vw, 72px); font-weight: 700; line-height: 1.06; color: var(--navy);
          margin-bottom: 22px;
        }
        .hero-h1 em { font-style: italic; color: var(--gold); }

        .hero-sub {
          font-size: 15.5px; line-height: 1.82; color: var(--text); font-weight: 300;
          max-width: 500px; margin-bottom: 36px;
        }

        .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; }

        .btn-navy {
          background: var(--navy); color: var(--white); font-weight: 600; font-size: 14px;
          padding: 14px 28px; border-radius: 8px; border: none; cursor: pointer; transition: all .25s;
        }
        .btn-navy:hover { background: var(--navy-mid); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15,32,68,.2); }

        .btn-gold-out {
          background: transparent; color: var(--gold); font-weight: 600; font-size: 14px;
          padding: 13px 28px; border-radius: 8px; border: 2px solid var(--gold); cursor: pointer; transition: all .25s;
        }
        .btn-gold-out:hover { background: var(--gold-pale); transform: translateY(-2px); }

        .hero-card {
          background: var(--navy); border-radius: 24px; padding: 36px;
          position: relative; overflow: hidden;
        }
        .hero-card::before {
          content:''; position:absolute; bottom:-60px; right:-60px;
          width:200px; height:200px; border-radius:50%;
          background: radial-gradient(ellipse, rgba(184,146,42,.18) 0%, transparent 70%);
        }
        .hero-card::after {
          content:''; position:absolute; top:-40px; left:-40px;
          width:140px; height:140px; border-radius:50%;
          background: radial-gradient(ellipse, rgba(37,99,235,.14) 0%, transparent 70%);
        }

        .hc-tag { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--gold-lt); margin-bottom:16px; position:relative; z-index:2; }

        .hc-title {
          font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:700;
          color:var(--white); line-height:1.25; margin-bottom:24px; position:relative; z-index:2;
        }

        .hc-list { display:flex; flex-direction:column; gap:10px; position:relative; z-index:2; }

        .hc-item {
          display:flex; align-items:flex-start; gap:12px;
          padding:13px 15px; background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.08); border-radius:10px; transition:.2s;
        }
        .hc-item:hover { background:rgba(255,255,255,.1); }

        .hc-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; margin-top:5px; }
        .d-gold { background:var(--gold-lt); }
        .d-blue { background:var(--blue-lt); }
        .d-white { background:rgba(255,255,255,.45); }

        .hc-item-t { font-size:13px; font-weight:600; color:var(--white); margin-bottom:2px; }
        .hc-item-s { font-size:11px; color:rgba(255,255,255,.4); font-family:'DM Mono',monospace; }

        .hc-footer {
          display:flex; align-items:center; gap:10px; margin-top:22px;
          padding-top:20px; border-top:1px solid rgba(255,255,255,.1); position:relative; z-index:2;
        }
        .hc-green { width:7px; height:7px; border-radius:50%; background:#4ade80; animation:pulse 2s infinite; }
        .hc-footer span { font-size:10px; color:rgba(255,255,255,.5); font-family:'DM Mono',monospace; letter-spacing:1px; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }

        .stats-band { background:var(--off); border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:52px 40px; }

        .stats-inner { max-width:1000px; margin:0 auto; display:grid; grid-template-columns:repeat(4,1fr); }

        .anim-stat { text-align:center; padding:0 20px; border-right:1px solid var(--border); }
        .anim-stat:last-child { border-right:none; }

        .anim-num { display:block; font-family:'Cormorant Garamond',serif; font-size:54px; font-weight:700; color:var(--navy); line-height:1; margin-bottom:8px; }
        .anim-lbl { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); }

        .sec { padding:96px 40px; }
        .sec-inner { max-width:1180px; margin:0 auto; }

        .eyebrow {
          display:flex; align-items:center; gap:10px;
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:2.5px; text-transform:uppercase;
          color:var(--gold); margin-bottom:12px;
        }
        .eyebrow::before { content:''; width:22px; height:1px; background:var(--gold); }
        .ey-blue { color:var(--blue); }
        .ey-blue::before { background:var(--blue); }

        .sec-h2 { font-family:'Cormorant Garamond',serif; font-size:clamp(32px,3.5vw,50px); font-weight:700; line-height:1.1; color:var(--navy); }
        .sec-h2 em { font-style:italic; color:var(--gold); }

        .sec-lead { font-size:15px; line-height:1.82; color:var(--text); font-weight:300; max-width:520px; margin-top:14px; }

        .pillars-bg { background:var(--white); }

        .pillars-top { display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:end; margin-bottom:60px; }

        .pillars-grid {
          display:grid; grid-template-columns:repeat(3,1fr);
          border:1px solid var(--border); border-radius:20px; overflow:hidden;
          background:var(--border); gap:1px;
        }

        .pillar { background:var(--white); padding:34px 28px; transition:.25s; position:relative; }
        .pillar:hover { background:var(--off); }

        .pillar::after {
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
          transform:scaleX(0); transform-origin:left; transition:transform .3s;
        }
        .p-blue::after { background:var(--blue); }
        .p-gold::after { background:var(--gold); }
        .p-navy::after { background:var(--navy); }
        .pillar:hover::after { transform:scaleX(1); }

        .p-icon { font-size:26px; margin-bottom:14px; display:block; }
        .p-title { font-size:15px; font-weight:700; color:var(--navy); margin-bottom:9px; }
        .p-desc { font-size:13px; line-height:1.75; color:var(--text); font-weight:300; }

        .process-bg { background:var(--off); }

        .process-layout { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:start; margin-top:52px; }

        .step-tabs { display:flex; flex-direction:column; gap:4px; }

        .step-tab {
          display:flex; align-items:center; gap:16px; padding:18px 20px;
          border-radius:12px; cursor:pointer; transition:.25s; border:1px solid transparent;
        }
        .step-tab:hover { background:var(--white); border-color:var(--border); }
        .step-tab.active { background:var(--white); border-color:rgba(37,99,235,.2); box-shadow:0 4px 16px rgba(37,99,235,.07); }

        .st-num { font-family:'DM Mono',monospace; font-size:12px; color:var(--muted); flex-shrink:0; transition:.25s; width:28px; }
        .step-tab.active .st-num { color:var(--blue); }

        .st-title { font-size:14px; font-weight:600; color:var(--navy); }
        .st-short { font-size:12px; color:var(--muted); font-weight:300; margin-top:2px; }

        .st-arrow { margin-left:auto; color:var(--border); font-size:16px; transition:.25s; }
        .step-tab.active .st-arrow { color:var(--blue); transform:translateX(3px); }

        .step-detail {
          background:var(--white); border:1px solid var(--border); border-radius:22px;
          padding:44px 40px; position:sticky; top:90px;
        }

        .sd-bignum {
          font-family:'Cormorant Garamond',serif; font-size:80px; font-weight:700;
          color:var(--blue-pale); line-height:1; margin-bottom:6px; display:block;
        }
        .sd-icon { font-size:30px; margin-bottom:14px; display:block; }
        .sd-title { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:700; color:var(--navy); margin-bottom:14px; }
        .sd-text { font-size:14px; line-height:1.82; color:var(--text); font-weight:300; }

        .sd-dots { display:flex; gap:6px; margin-top:32px; }
        .sd-dot { width:6px; height:6px; border-radius:50%; background:var(--border); transition:.3s; }
        .sd-dot.on { background:var(--blue); width:18px; border-radius:3px; }

        .why-bg { background:var(--white); }

        .why-grid { display:grid; grid-template-columns:1fr 1fr; gap:72px; align-items:center; }

        .why-img-wrap { position:relative; }
        .why-img { width:100%; height:480px; object-fit:cover; border-radius:22px; display:block; }

        .why-badge {
          position:absolute; bottom:24px; right:-16px;
          background:var(--blue); color:var(--white); border-radius:14px; padding:16px 20px;
          box-shadow:0 10px 36px rgba(37,99,235,.3);
        }
        .wb-big { display:block; font-size:30px; font-family:'Cormorant Garamond',serif; font-weight:700; }
        .wb-small { font-size:9px; font-family:'DM Mono',monospace; letter-spacing:1.5px; opacity:.7; }

        .why-items { margin-top:32px; display:flex; flex-direction:column; gap:14px; }

        .why-item {
          display:flex; gap:16px; padding:18px 22px;
          border:1px solid var(--border); border-radius:12px; transition:.25s; align-items:flex-start;
        }
        .why-item:hover { border-color:rgba(184,146,42,.35); background:var(--gold-pale); }

        .wi-n { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:700; color:var(--gold); line-height:1; flex-shrink:0; width:30px; }
        .wi-t { font-size:14px; font-weight:600; color:var(--navy); margin-bottom:3px; }
        .wi-s { font-size:13px; color:var(--text); font-weight:300; line-height:1.6; }

        .partner-sec { background:var(--navy); }

        .partner-inner { max-width:1180px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:72px; align-items:center; }
        .partner-inner .sec-h2 { color:var(--white); }
        .partner-inner .sec-lead { color:rgba(255,255,255,.5); max-width:100%; }
        .partner-inner .eyebrow { color:var(--gold-lt); }
        .partner-inner .eyebrow::before { background:var(--gold-lt); }

        .p-cards { display:grid; grid-template-columns:1fr 1fr; gap:14px; }

        .p-card {
          background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08);
          border-radius:16px; padding:22px 18px; transition:.25s;
        }
        .p-card:hover { background:rgba(255,255,255,.08); border-color:rgba(184,146,42,.3); }

        .pc-icon { font-size:22px; margin-bottom:10px; display:block; }
        .pc-title { font-size:14px; font-weight:600; color:var(--white); margin-bottom:5px; }
        .pc-desc { font-size:12px; color:rgba(255,255,255,.4); line-height:1.65; font-weight:300; }

        .contact-bg { background:var(--white); }

        .contact-grid { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:start; margin-top:52px; }

        .info-box { background:var(--off); border:1px solid var(--border); border-radius:22px; padding:44px; }

        .info-label { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--gold); margin-bottom:5px; }
        .info-val { font-size:14px; color:var(--text); line-height:1.75; font-weight:400; margin-bottom:24px; }

        .info-divider { height:1px; background:var(--border); margin:22px 0; }

        .map-box {
          width:100%; height:200px; border-radius:16px;
          background:var(--navy); display:flex; flex-direction:column;
          align-items:center; justify-content:center; gap:8px; margin-top:4px;
        }
        .map-pin-big { font-size:32px; }
        .map-txt { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,.5); text-align:center; }
        .map-addr { font-size:12px; color:rgba(255,255,255,.75); text-align:center; line-height:1.5; }

        .contact-cards { display:flex; flex-direction:column; gap:14px; }

        .contact-intro { font-size:15px; color:var(--text); line-height:1.8; font-weight:300; margin-bottom:8px; }

        .c-card {
          display:flex; align-items:center; gap:18px; padding:22px 24px;
          border:1px solid var(--border); border-radius:14px; transition:.25s; background:var(--white);
        }
        .c-card:hover { border-color:rgba(37,99,235,.28); box-shadow:0 6px 24px rgba(37,99,235,.07); transform:translateX(4px); }

        .c-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
        .ci-blue { background:var(--blue-pale); }
        .ci-gold { background:var(--gold-pale); }
        .ci-navy { background:#eef1f8; }

        .c-lbl { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); margin-bottom:3px; }
        .c-val { font-size:15px; font-weight:600; color:var(--navy); line-height:1.4; }
        .c-sub { font-size:12px; color:var(--muted); font-weight:300; margin-top:1px; }

        .c-arr { margin-left:auto; color:var(--blue); font-size:16px; opacity:0; transition:.25s; }
        .c-card:hover .c-arr { opacity:1; transform:translateX(4px); }

        .final-cta {
          padding:96px 40px; text-align:center;
          background:linear-gradient(135deg, var(--navy-mid) 0%, var(--navy) 100%);
          position:relative; overflow:hidden;
        }
        .final-cta::before {
          content:''; position:absolute; top:-80px; left:50%; transform:translateX(-50%);
          width:480px; height:280px;
          background:radial-gradient(ellipse, rgba(184,146,42,.14) 0%, transparent 70%);
        }

        .final-inner { max-width:620px; margin:0 auto; position:relative; z-index:2; }

        .final-h2 { font-family:'Cormorant Garamond',serif; font-size:clamp(36px,4.5vw,56px); font-weight:700; color:var(--white); line-height:1.1; margin-bottom:18px; }
        .final-h2 em { font-style:italic; color:var(--gold-lt); }

        .final-sub { font-size:15px; color:rgba(255,255,255,.5); line-height:1.8; font-weight:300; margin-bottom:40px; }

        .final-btns { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; }

        .btn-gold-solid {
          background:linear-gradient(135deg,var(--gold) 0%,var(--gold-lt) 100%);
          color:var(--navy); font-weight:700; font-size:14px;
          padding:15px 34px; border-radius:8px; border:none; cursor:pointer; transition:.25s;
          box-shadow:0 8px 28px rgba(184,146,42,.35);
        }
        .btn-gold-solid:hover { transform:translateY(-2px); box-shadow:0 12px 36px rgba(184,146,42,.5); }

        .btn-wht-out {
          background:transparent; color:var(--white); font-weight:600; font-size:14px;
          padding:14px 34px; border-radius:8px; border:1px solid rgba(255,255,255,.25); cursor:pointer; transition:.25s;
        }
        .btn-wht-out:hover { background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.45); }

        @media (max-width:960px) {
          .hero-inner { grid-template-columns:1fr; gap:44px; padding:64px 24px 56px; }
          .stats-inner { grid-template-columns:1fr 1fr; }
          .anim-stat { border-right:none; border-bottom:1px solid var(--border); padding:16px 0; }
          .pillars-top { grid-template-columns:1fr; gap:20px; }
          .pillars-grid { grid-template-columns:1fr; }
          .process-layout { grid-template-columns:1fr; gap:36px; }
          .step-detail { position:static; }
          .why-grid { grid-template-columns:1fr; gap:44px; }
          .why-badge { right:12px; }
          .partner-inner { grid-template-columns:1fr; gap:44px; }
          .p-cards { grid-template-columns:1fr; }
          .contact-grid { grid-template-columns:1fr; gap:36px; }
          .sec { padding:64px 24px; }
          .stats-band { padding:44px 24px; }
          .final-cta { padding:72px 24px; }
          .final-btns { flex-direction:column; align-items:center; }
          .partner-sec { padding:64px 24px; }
        }
      `}</style>

      <div className="fp">
        {/* Top bar removed as requested */}

        <section className="hero">
          <div className="hero-inner">
            <div>
              <div className="eyebrow-pill">Franchise Partnership · 2025</div>
              <h1 className="hero-h1">
                Open an MCJ Center<br />in <em>Your City</em>
              </h1>
              <p className="hero-sub">
                India's most in-demand accounting skills — Tally, GST, Financial Accounting —
                delivered through your center, backed by MCJ's proven curriculum, brand, and
                placement network. You bring the vision; we provide everything else.
              </p>
              <div className="hero-btns">
                <button className="btn-navy" onClick={() => document.getElementById('contact-sec')?.scrollIntoView({ behavior: 'smooth' })}>
                  Apply for Franchise →
                </button>
                <button className="btn-gold-out" onClick={() => document.getElementById('process-sec')?.scrollIntoView({ behavior: 'smooth' })}>
                  How It Works
                </button>
              </div>
            </div>

            <div className="hero-card">
              <div className="hc-tag">MCJ Franchise Advantage</div>
              <h3 className="hc-title">What You Get<br />From Day One</h3>
              <div className="hc-list">
                {[
                  { dot: "d-gold",  t: "Complete Curriculum Package",       s: "Tally · GST · Financial Accounting" },
                  { dot: "d-blue",  t: "Faculty Training & Certification",   s: "Before you open — not after" },
                  { dot: "d-gold",  t: "Branding & Marketing Kit",           s: "Digital + physical · Ready to deploy" },
                  { dot: "d-white", t: "Placement Network Access",           s: "5,000+ alumni · Live employer tie-ups" },
                  { dot: "d-blue",  t: "Dedicated Relationship Manager",     s: "Ongoing · Not just at launch" },
                ].map((item, i) => (
                  <div key={i} className="hc-item">
                    <div className={`hc-dot ${item.dot}`} />
                    <div>
                      <div className="hc-item-t">{item.t}</div>
                      <div className="hc-item-s">{item.s}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hc-footer">
                <div className="hc-green" />
                <span>ACCEPTING APPLICATIONS · PAN INDIA</span>
              </div>
            </div>
          </div>
        </section>

        <div className="stats-band">
          <div className="stats-inner">
            <AnimCounter value={5000} suffix="+" label="Students Trained" />
            <AnimCounter value={12}   suffix="+" label="Active Centers" />
            <AnimCounter value={98}   suffix="%" label="Placement Rate" />
            <AnimCounter value={8}    suffix="+" label="Years of Excellence" />
          </div>
        </div>

        <section className="sec pillars-bg">
          <div className="sec-inner">
            <div className="pillars-top">
              <div>
                <div className="eyebrow">Partnership Benefits</div>
                <h2 className="sec-h2">Everything Already<br /><em>Built for You</em></h2>
              </div>
              <p className="sec-lead">
                MCJ partners inherit a decade of curriculum refinement, placement relationships,
                and brand equity that students already trust. You focus on running your center —
                we've done the groundwork.
              </p>
            </div>
            <div className="pillars-grid">
              {pillars.map((p, i) => (
                <div key={i} className={`pillar p-${p.color}`}>
                  <span className="p-icon">{p.icon}</span>
                  <h3 className="p-title">{p.title}</h3>
                  <p className="p-desc">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec process-bg" id="process-sec">
          <div className="sec-inner">
            <div className="eyebrow ey-blue">The Journey</div>
            <h2 className="sec-h2">From Enquiry to<br /><em>Opening Day</em></h2>
            <div className="process-layout">
              <div className="step-tabs">
                {steps.map((s, i) => (
                  <div key={i} className={`step-tab ${activeStep === i ? "active" : ""}`} onClick={() => setActiveStep(i)}>
                    <span className="st-num">{s.num}</span>
                    <div>
                      <div className="st-title">{s.title}</div>
                      <div className="st-short">{s.short}</div>
                    </div>
                    <span className="st-arrow">→</span>
                  </div>
                ))}
              </div>
              <div className="step-detail">
                <span className="sd-bignum">{steps[activeStep].num}</span>
                <span className="sd-icon">{steps[activeStep].icon}</span>
                <h3 className="sd-title">{steps[activeStep].title}</h3>
                <p className="sd-text">{steps[activeStep].detail}</p>
                <div className="sd-dots">
                  {steps.map((_, i) => <div key={i} className={`sd-dot ${i === activeStep ? "on" : ""}`} />)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec why-bg">
          <div className="sec-inner">
            <div className="why-grid">
              <div className="why-img-wrap">
                <img
                  className="why-img"
                  src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&q=80"
                  alt="MCJ partner center"
                />
                <div className="why-badge">
                  <strong className="wb-big">100%</strong>
                  <span className="wb-small">PLACEMENT GUARANTEE</span>
                </div>
              </div>
              <div>
                <div className="eyebrow">Why This Works</div>
                <h2 className="sec-h2">A Business Built on<br /><em>Proven Demand</em></h2>
                <p className="sec-lead">
                  Every business in India needs accounting-trained staff. The demand for Tally,
                  GST, and finance skills has only grown — and MCJ centers are the trusted answer
                  in every city they serve.
                </p>
                <div className="why-items">
                  {whys.map((w, i) => (
                    <div key={i} className="why-item">
                      <span className="wi-n">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <div className="wi-t">{w.label}</div>
                        <div className="wi-s">{w.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec partner-sec">
          <div className="partner-inner">
            <div>
              <div className="eyebrow">Who We're Looking For</div>
              <h2 className="sec-h2">The Ideal<br /><em>MCJ Partner</em></h2>
              <p className="sec-lead">
                You don't need an education background — you need drive, local knowledge, and
                the ambition to build something meaningful in your city. MCJ provides everything else.
              </p>
            </div>
            <div className="p-cards">
              {[
                { icon: "🏙️", title: "Local Presence",   desc: "You know your city's student market, colleges, and business community well." },
                { icon: "📈", title: "Growth Mindset",   desc: "Committed to building long-term, not just filling seats short-term." },
                { icon: "👥", title: "People Skills",    desc: "Able to lead a small team and communicate MCJ's value to students and parents." },
                { icon: "🎯", title: "Mission-Aligned",  desc: "Genuinely wants to improve career outcomes for young people in your area." },
              ].map((c, i) => (
                <div key={i} className="p-card">
                  <span className="pc-icon">{c.icon}</span>
                  <div className="pc-title">{c.title}</div>
                  <div className="pc-desc">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec contact-bg" id="contact-sec">
          <div className="sec-inner">
            <div className="eyebrow ey-blue">Get in Touch</div>
            <h2 className="sec-h2">Start the<br /><em>Conversation</em></h2>
            <div className="contact-grid">
              <div className="info-box">
                <div className="info-label">Headquarters</div>
                <div className="info-val">
                  #258/1, 1st Floor, Near 31E Bus Stop Rd,<br />
                  2nd Block, Thyagaraja Nagar,<br />
                  Bengaluru, Karnataka — 560028
                </div>
                <div className="info-divider" />
                <div className="info-label">Working Hours</div>
                <div className="info-val">Monday – Saturday &nbsp;·&nbsp; 9:00 AM – 6:00 PM</div>
                <div className="map-box">
                  <div className="map-pin-big">📍</div>
                  <div className="map-txt">MCJ Institute of Accounting</div>
                  <div className="map-addr">Thyagaraja Nagar, Bengaluru 560028</div>
                </div>
              </div>

              <div className="contact-cards">
                <p className="contact-intro">
                  Reach out directly and our franchise team will connect with you within 48 hours.
                  We're happy to answer any question before you make any decision.
                </p>
                {[
                  { icon: "📞", cls: "ci-blue",  label: "Call Us",    val: "+91 888 000 7484",         sub: "+91 966 337 0950" },
                  { icon: "✉️", cls: "ci-gold",  label: "Email Us",   val: "support@mcjinstitute.com", sub: "We respond within 24 hours" },
                  { icon: "💬", cls: "ci-navy",  label: "WhatsApp",   val: "+91 888 000 7484",         sub: "Quick queries, quick answers" },
                ].map((c, i) => (
                  <div key={i} className="c-card">
                    <div className={`c-icon ${c.cls}`}>{c.icon}</div>
                    <div>
                      <div className="c-lbl">{c.label}</div>
                      <div className="c-val">{c.val}</div>
                      {c.sub && <div className="c-sub">{c.sub}</div>}
                    </div>
                    <div className="c-arr">→</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="final-inner">
            <h2 className="final-h2">Your City Is Waiting<br />for a <em>Great Institute</em></h2>
            <p className="final-sub">
              MCJ has built the curriculum, brand, and placement track record. All that's missing
              is the right partner in your city. Let's talk.
            </p>
            <div className="final-btns">
              <button className="btn-gold-solid" onClick={() => document.getElementById('contact-sec')?.scrollIntoView({ behavior: 'smooth' })}>
                Contact Franchise Team →
              </button>
              <button className="btn-wht-out">Download Partner Brochure</button>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}