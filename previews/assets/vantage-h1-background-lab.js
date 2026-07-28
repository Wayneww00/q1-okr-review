/*
 * Vantage H1 Background Lab
 *
 * Assumptions approved by the reviewer:
 * - Replace every fixed orange V-light background inside the formal H1 report.
 * - Preserve the formal page, its data, typography, layout, video and interactions.
 * - Explore three distinct background systems with restrained 8–12 second motion.
 * - This file is loaded only by independent review demos; production files are untouched.
 */
(() => {
  const variant = document.body.dataset.variant || "a";
  const hostFrame = document.getElementById("h1Prototype");

  const variants = {
    a: {
      title: "A · 精密数据场",
      base: "#050403",
      shell: "#050403",
    },
    b: {
      title: "B · 空气动力学",
      base: "#050302",
      shell: "#050302",
    },
    c: {
      title: "C · 高管黑曜石",
      base: "#050505",
      shell: "#050505",
    },
  };

  const activeVariant = variants[variant] || variants.a;
  document.title = `Vantage H1 Background Demo — ${activeVariant.title}`;

  const installStyle = (doc, id, css) => {
    let style = doc.getElementById(id);
    if (!style) {
      style = doc.createElement("style");
      style.id = id;
      doc.head.appendChild(style);
    }
    style.textContent = css;
  };

  const backgroundMarkup = `
    <span class="lab-grid"></span>
    <span class="lab-scan"></span>
    <span class="lab-orbit lab-orbit-1"></span>
    <span class="lab-orbit lab-orbit-2"></span>
    <span class="lab-ribbon lab-ribbon-1"></span>
    <span class="lab-ribbon lab-ribbon-2"></span>
    <span class="lab-ribbon lab-ribbon-3"></span>
    <span class="lab-facet lab-facet-1"></span>
    <span class="lab-facet lab-facet-2"></span>
    <span class="lab-facet lab-facet-3"></span>
    <span class="lab-facet lab-facet-4"></span>
    <span class="lab-specular"></span>
  `;

  const innerCss = `
    :root {
      --lab-orange: #f36b16;
      --lab-orange-soft: #ff9a55;
      --lab-red: #d34835;
      --lab-paper: #f5f2ec;
      --lab-base: ${activeVariant.base};
      --lab-ease: cubic-bezier(.16, 1, .3, 1);
    }

    html, body {
      background: var(--lab-base) !important;
    }

    body::after {
      opacity: 0 !important;
    }

    #root {
      position: relative;
      z-index: 1;
    }

    .vantage-dashboard-surface {
      background: transparent !important;
    }

    .vantage-old-light {
      display: none !important;
    }

    .vantage-background-lab {
      position: fixed;
      inset: 0;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
      background: var(--lab-base);
      contain: paint;
    }

    .vantage-background-lab > span {
      position: absolute;
      display: block;
      pointer-events: none;
    }

    .vantage-background-lab .lab-grid,
    .vantage-background-lab .lab-scan,
    .vantage-background-lab .lab-orbit,
    .vantage-background-lab .lab-ribbon,
    .vantage-background-lab .lab-facet,
    .vantage-background-lab .lab-specular {
      opacity: 0;
    }

    /* A · Precision Data Field — Pentagram-style information architecture. */
    .vantage-background-lab--a {
      background:
        radial-gradient(circle at 73% 18%, rgba(243,107,22,.095), transparent 23%),
        radial-gradient(circle at 22% 78%, rgba(211,72,53,.045), transparent 30%),
        linear-gradient(118deg, #040403 0%, #080604 50%, #030303 100%);
    }

    .vantage-background-lab--a .lab-grid {
      inset: -8%;
      opacity: .72;
      background-image:
        linear-gradient(rgba(245,242,236,.026) 1px, transparent 1px),
        linear-gradient(90deg, rgba(245,242,236,.022) 1px, transparent 1px);
      background-size: 72px 72px, 96px 96px;
      mask-image: radial-gradient(ellipse at 64% 46%, #000 0%, rgba(0,0,0,.82) 45%, transparent 83%);
      transform: perspective(1400px) rotateX(57deg) translateY(17%);
      transform-origin: 50% 100%;
    }

    .vantage-background-lab--a .lab-scan {
      left: 0;
      right: 0;
      height: 18vh;
      top: -22vh;
      opacity: .14;
      background: linear-gradient(180deg, transparent, rgba(243,107,22,.08) 54%, rgba(255,154,85,.22) 64%, transparent 75%);
      mix-blend-mode: screen;
      animation: labScanA 10s var(--lab-ease) infinite;
    }

    .vantage-background-lab--a .lab-orbit {
      width: 78vw;
      height: 78vw;
      right: -32vw;
      top: -45vw;
      border: 1px solid rgba(243,107,22,.13);
      border-radius: 50%;
      opacity: .55;
      box-shadow:
        0 0 0 9vw rgba(243,107,22,.012),
        0 0 0 18vw rgba(243,107,22,.009);
    }

    .vantage-background-lab--a .lab-orbit-2 {
      width: 34vw;
      height: 34vw;
      right: 8vw;
      top: 8vh;
      opacity: .26;
      border-color: rgba(255,255,255,.15);
      box-shadow: none;
    }

    @keyframes labScanA {
      0%, 8% { transform: translateY(0); opacity: 0; }
      18% { opacity: .13; }
      72% { opacity: .09; }
      92%, 100% { transform: translateY(136vh); opacity: 0; }
    }

    /* B · Aerodynamic Flow — Field.io-style movement without repeating a car. */
    .vantage-background-lab--b {
      background:
        radial-gradient(ellipse at 82% 48%, rgba(243,107,22,.23), transparent 31%),
        radial-gradient(ellipse at 54% 102%, rgba(211,72,53,.13), transparent 39%),
        radial-gradient(ellipse at 18% 34%, rgba(255,154,85,.07), transparent 25%),
        linear-gradient(122deg, #030303 0%, #0a0401 54%, #030202 100%);
    }

    .vantage-background-lab--b::before {
      content: "";
      position: absolute;
      width: 120vw;
      height: 46vh;
      left: -14vw;
      top: 22vh;
      border-top: 1px solid rgba(255,174,108,.62);
      border-radius: 50%;
      transform: rotate(-8deg) skewX(-13deg);
      box-shadow:
        0 -2px 28px rgba(243,107,22,.28),
        0 -14px 72px rgba(243,107,22,.16),
        inset 0 1px 0 rgba(255,255,255,.09);
      opacity: .84;
      filter: saturate(1.18);
      animation: labFlowB 10.8s cubic-bezier(.45, 0, .18, 1) infinite;
    }

    .vantage-background-lab--b::after {
      content: "";
      position: absolute;
      inset: 0;
      background:
        repeating-linear-gradient(166deg, transparent 0 74px, rgba(255,170,105,.042) 75px, transparent 76px 116px);
      mask-image: linear-gradient(90deg, transparent 0%, #000 24%, #000 82%, transparent 100%);
      opacity: .68;
      animation: labLinesB 12s ease-in-out infinite;
    }

    .vantage-background-lab--b .lab-scan {
      display: block;
      width: 62vw;
      height: 132vh;
      left: -48vw;
      top: -30vh;
      border-radius: 50%;
      opacity: 0;
      background:
        linear-gradient(90deg,
          transparent 0%,
          rgba(243,107,22,.025) 30%,
          rgba(243,107,22,.19) 48%,
          rgba(255,166,101,.34) 55%,
          rgba(243,107,22,.11) 64%,
          transparent 82%);
      filter: blur(24px) saturate(1.2);
      mix-blend-mode: screen;
      transform: rotate(24deg);
      transform-origin: center;
      will-change: transform, opacity;
      animation: labWakeB 10.8s cubic-bezier(.45, 0, .18, 1) infinite;
    }

    .vantage-background-lab--b .lab-specular {
      display: block;
      width: 31vw;
      height: 146vh;
      left: -38vw;
      top: -34vh;
      border-radius: 50%;
      opacity: 0;
      background:
        linear-gradient(90deg,
          transparent,
          rgba(255,154,85,.08) 34%,
          rgba(255,184,126,.34) 49%,
          rgba(243,107,22,.22) 58%,
          transparent 78%);
      filter: blur(18px);
      mix-blend-mode: screen;
      transform: rotate(27deg);
      transform-origin: center;
      will-change: transform, opacity;
      animation: labSpecularB 10.8s cubic-bezier(.45, 0, .18, 1) infinite;
    }

    .vantage-background-lab--b .lab-ribbon {
      display: block;
      left: -18vw;
      width: 132vw;
      height: 25vh;
      border-top: 1px solid rgba(255,133,56,.46);
      border-radius: 50%;
      opacity: .72;
      transform: rotate(-10deg) skewX(-10deg);
      transform-origin: center;
      filter:
        drop-shadow(0 0 11px rgba(255,154,85,.23))
        drop-shadow(0 -10px 28px rgba(243,107,22,.1));
      animation: labRibbonB 10.8s cubic-bezier(.45, 0, .18, 1) infinite;
    }

    .vantage-background-lab--b .lab-ribbon-1 { top: 31vh; }
    .vantage-background-lab--b .lab-ribbon-2 {
      top: 43vh;
      opacity: .47;
      animation-delay: -2.4s;
    }
    .vantage-background-lab--b .lab-ribbon-3 {
      top: 56vh;
      opacity: .28;
      border-color: rgba(211,72,53,.58);
      animation-delay: -4.8s;
    }

    @keyframes labFlowB {
      0%, 100% { transform: translate3d(-28px, 8px, 0) rotate(-8deg) skewX(-13deg); opacity: .56; }
      42% { transform: translate3d(30px, -8px, 0) rotate(-7.5deg) skewX(-13deg); opacity: .94; }
      64% { transform: translate3d(58px, -14px, 0) rotate(-7.1deg) skewX(-13deg); opacity: .76; }
    }

    @keyframes labLinesB {
      0%, 100% { transform: translate3d(-28px, 0, 0); opacity: .36; }
      46% { transform: translate3d(38px, -9px, 0); opacity: .72; }
      68% { transform: translate3d(52px, -12px, 0); opacity: .52; }
    }

    @keyframes labRibbonB {
      0%, 100% {
        transform: translate3d(-34px, 2px, 0) rotate(-10deg) skewX(-10deg) scaleX(.985);
        filter: drop-shadow(0 0 8px rgba(255,154,85,.14)) drop-shadow(0 -8px 22px rgba(243,107,22,.07));
      }
      43% {
        transform: translate3d(32px, -13px, 0) rotate(-9.2deg) skewX(-10deg) scaleX(1.02);
        filter: drop-shadow(0 0 16px rgba(255,154,85,.38)) drop-shadow(0 -14px 38px rgba(243,107,22,.18));
      }
      68% {
        transform: translate3d(58px, -18px, 0) rotate(-8.9deg) skewX(-10deg) scaleX(1.012);
        filter: drop-shadow(0 0 11px rgba(255,154,85,.23)) drop-shadow(0 -10px 28px rgba(243,107,22,.1));
      }
    }

    @keyframes labWakeB {
      0%, 11% {
        transform: translate3d(-4vw, 4vh, 0) rotate(24deg) scaleX(.82);
        opacity: 0;
      }
      27% { opacity: .38; }
      47% {
        transform: translate3d(92vw, -5vh, 0) rotate(24deg) scaleX(1.08);
        opacity: .7;
      }
      72% { opacity: .22; }
      88%, 100% {
        transform: translate3d(174vw, -10vh, 0) rotate(24deg) scaleX(.94);
        opacity: 0;
      }
    }

    @keyframes labSpecularB {
      0%, 18% {
        transform: translate3d(0, 0, 0) rotate(27deg) scaleX(.72);
        opacity: 0;
      }
      33% { opacity: .34; }
      47% {
        transform: translate3d(108vw, -4vh, 0) rotate(27deg) scaleX(1);
        opacity: .78;
      }
      58% { opacity: .32; }
      76%, 100% {
        transform: translate3d(176vw, -8vh, 0) rotate(27deg) scaleX(.82);
        opacity: 0;
      }
    }

    /* C · Executive Obsidian — quiet, faceted, material and boardroom-ready. */
    .vantage-background-lab--c {
      background:
        radial-gradient(ellipse at 72% 24%, rgba(243,107,22,.075), transparent 28%),
        radial-gradient(ellipse at 18% 86%, rgba(211,72,53,.035), transparent 34%),
        linear-gradient(135deg, #030303 0%, #080706 48%, #020202 100%);
    }

    .vantage-background-lab--c .lab-facet {
      display: block;
      inset: -8%;
      opacity: .78;
      border: 1px solid rgba(255,255,255,.025);
      transform: translateZ(0);
    }

    .vantage-background-lab--c .lab-facet-1 {
      clip-path: polygon(0 0, 58% 0, 42% 66%, 0 100%);
      background: linear-gradient(132deg, rgba(255,255,255,.025), transparent 58%);
    }
    .vantage-background-lab--c .lab-facet-2 {
      clip-path: polygon(58% 0, 100% 0, 100% 48%, 42% 66%);
      background: linear-gradient(148deg, rgba(243,107,22,.052), rgba(255,255,255,.012) 46%, transparent 74%);
    }
    .vantage-background-lab--c .lab-facet-3 {
      clip-path: polygon(0 100%, 42% 66%, 72% 100%);
      background: linear-gradient(24deg, rgba(211,72,53,.026), transparent 62%);
    }
    .vantage-background-lab--c .lab-facet-4 {
      clip-path: polygon(42% 66%, 100% 48%, 100% 100%, 72% 100%);
      background: linear-gradient(156deg, rgba(255,255,255,.022), transparent 52%);
    }

    .vantage-background-lab--c .lab-specular {
      display: block;
      width: 24vw;
      height: 156vh;
      top: -28vh;
      left: -30vw;
      opacity: 0;
      transform: rotate(24deg);
      background: linear-gradient(90deg, transparent, rgba(255,154,85,.11), rgba(255,255,255,.045), transparent);
      filter: blur(18px);
      mix-blend-mode: screen;
      animation: labSpecularC 12s var(--lab-ease) infinite;
    }

    @keyframes labSpecularC {
      0%, 14% { transform: translate3d(0, 0, 0) rotate(24deg); opacity: 0; }
      22% { opacity: .52; }
      68% { opacity: .2; }
      82%, 100% { transform: translate3d(168vw, 0, 0) rotate(24deg); opacity: 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .vantage-background-lab *,
      .vantage-background-lab::before,
      .vantage-background-lab::after {
        animation: none !important;
      }
    }
  `;

  const outerCss = `
    .report-scene,
    .report-frame-wrap,
    .report-frame {
      background: ${activeVariant.shell} !important;
    }
  `;

  const applyToReport = (reportFrame) => {
    const reportDoc = reportFrame.contentDocument;
    if (!reportDoc || !reportDoc.head || !reportDoc.body) return;

    installStyle(reportDoc, "vantage-background-lab-style", innerCss);

    let background = reportDoc.getElementById("vantageBackgroundLab");
    if (!background) {
      background = reportDoc.createElement("div");
      background.id = "vantageBackgroundLab";
      background.className = `vantage-background-lab vantage-background-lab--${variant}`;
      background.setAttribute("aria-hidden", "true");
      background.innerHTML = backgroundMarkup;
      reportDoc.body.prepend(background);
    }

    const markLegacyBackground = () => {
      reportDoc.querySelectorAll("div[style]").forEach((element) => {
        if (element.style.position === "fixed" && element.style.mixBlendMode === "screen") {
          element.classList.add("vantage-old-light");
        }
      });

      const firstDashboard = reportDoc.querySelector(".dash-page");
      const dashboardSurface = firstDashboard?.parentElement?.parentElement;
      if (dashboardSurface) dashboardSurface.classList.add("vantage-dashboard-surface");
    };

    markLegacyBackground();
    [240, 720, 1400].forEach((delay) => window.setTimeout(markLegacyBackground, delay));
  };

  const applyToShell = () => {
    const shellDoc = hostFrame.contentDocument;
    if (!shellDoc || !shellDoc.head) return;

    installStyle(shellDoc, "vantage-background-lab-shell-style", outerCss);

    const reportFrame = shellDoc.getElementById("reportFrame");
    if (!reportFrame) return;
    reportFrame.addEventListener("load", () => applyToReport(reportFrame), { once: false });

    if (reportFrame.contentDocument?.readyState === "complete") {
      applyToReport(reportFrame);
    }
  };

  hostFrame.addEventListener("load", applyToShell, { once: false });
  if (hostFrame.contentDocument?.readyState === "complete") applyToShell();
})();
