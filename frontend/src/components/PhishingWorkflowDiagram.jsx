import React, { useEffect, useRef, useState } from 'react';

/**
 * PhishingWorkflowDiagram (v6 - final)
 * - Same workflow, same ns-* class names, same 14s phase timing (driven by your style.css).
 * - Realistic, self-animated icons (attacker, user, emails, shield).
 * - Dotted tracks between Attacker / User / PHISHSHIELD are hidden (visibility only,
 *   so the spacing between the three stays exactly the same).
 * - Phase text is now short and shown as a compact step pill that is placed
 *   automatically BELOW the name labels, so nothing overlaps.
 * - Attacker / User labels follow the theme: black in light mode, light in dark mode
 *   (theme is auto-detected from the background color, so it works with any dark-mode switch).
 */

const CSS = `
/* ---------- layout fixes ---------- */
.ns-wrap .ns-scene{position:relative}

/* hide the dotted lines but keep their space (distance stays identical) */
.ns-wrap .ns-track-l,
.ns-wrap .ns-track-r{visibility:hidden!important}

/* ---------- label colors (light / dark) ---------- */
.ns-wrap{--pw-label:#000000;--pw-pill-bg:rgba(255,255,255,.92);--pw-pill-fg:#26352b;--pw-pill-bd:rgba(63,90,71,.22);--pw-pill-sh:0 2px 8px rgba(30,50,36,.12)}
.ns-wrap[data-pw-theme="dark"]{--pw-label:#f1f5f2;--pw-pill-bg:rgba(20,28,23,.94);--pw-pill-fg:#e6eee8;--pw-pill-bd:rgba(160,190,168,.28);--pw-pill-sh:0 2px 10px rgba(0,0,0,.45)}
.ns-wrap .ns-atk-lbl,
.ns-wrap .ns-user-lbl{color:var(--pw-label)!important}

/* ---------- phase text -> compact step pill ---------- */
.ns-wrap .ns-desc{
  position:absolute!important;left:50%!important;right:auto!important;
  transform:translateX(-50%)!important;bottom:0;
  display:grid!important;justify-items:center;align-items:center;
  width:max-content;max-width:100%;pointer-events:none;z-index:4;margin:0!important;padding:0!important;
  background:none!important;border:0!important;box-shadow:none!important;
}
.ns-wrap .ns-desc .ns-d{
  grid-area:1/1;position:static!important;inset:auto!important;transform:none!important;margin:0!important;
  display:inline-flex;align-items:center;gap:6px;white-space:nowrap;
  padding:1px 9px 1px 2px;border-radius:999px;
  background:var(--pw-pill-bg);border:1px solid var(--pw-pill-bd);box-shadow:var(--pw-pill-sh);
  color:var(--pw-pill-fg)!important;
  font:600 9px/1.2 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  letter-spacing:.05em;text-transform:uppercase;
}
.pw-chip{
  display:inline-flex;align-items:center;justify-content:center;
  width:13px;height:13px;border-radius:50%;
  font:700 9px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-style:normal;color:#fff;
}
.pw-c1,.pw-c2{background:#d64545}
.pw-c3{background:#e0a020}
.pw-c4{background:#4f7fb8}
.pw-c5{background:#2f9e6b}

/* ---------- icon idle animations ---------- */
.pw-blink{transform-box:fill-box;transform-origin:center;animation:pwBlink 4.2s infinite}
@keyframes pwBlink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
.pw-breathe{transform-box:fill-box;transform-origin:50% 100%;animation:pwBreathe 3.6s ease-in-out infinite}
@keyframes pwBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.025,1.035)}}
.pw-bob{transform-box:fill-box;transform-origin:50% 100%;animation:pwBob 3.6s ease-in-out infinite}
@keyframes pwBob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-.6px) rotate(-1.2deg)}}
.pw-eye{animation:pwEye 2.4s infinite}
@keyframes pwEye{0%,100%{opacity:1}8%{opacity:.35}12%{opacity:1}55%{opacity:.85}60%{opacity:.3}64%{opacity:1}}
.pw-pulse{transform-box:fill-box;transform-origin:center;animation:pwPulse 1.8s ease-in-out infinite}
@keyframes pwPulse{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.35);opacity:.45}}
.pw-flutter{transform-box:fill-box;transform-origin:50% 0;animation:pwFlutter 1.6s ease-in-out infinite}
@keyframes pwFlutter{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.82)}}
.pw-sway{transform-box:fill-box;transform-origin:center;animation:pwSway 2.2s ease-in-out infinite}
@keyframes pwSway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
.pw-wind{stroke-dasharray:3 3;animation:pwWind .8s linear infinite}
@keyframes pwWind{to{stroke-dashoffset:-6}}
.pw-tilt{transform-box:fill-box;transform-origin:center;animation:pwTilt 1.4s ease-in-out infinite}
@keyframes pwTilt{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-1.2px) rotate(3deg)}}
.pw-code{animation:pwCode 1.4s steps(1) infinite}
@keyframes pwCode{0%{opacity:1}33%{opacity:.35}66%{opacity:.8}100%{opacity:1}}
@media (prefers-reduced-motion: reduce){
  .pw-blink,.pw-breathe,.pw-bob,.pw-eye,.pw-pulse,.pw-flutter,.pw-sway,.pw-code,.pw-wind,.pw-tilt{animation:none!important}
}
`;

export default function PhishingWorkflowDiagram({ className = '' }) {
  const wrapRef = useRef(null);
  const [dark, setDark] = useState(false);
  const [descTop, setDescTop] = useState(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    // Detect dark mode from the real background behind the diagram
    const detect = () => {
      let n = wrap;
      let rgb = null;
      while (n && n.nodeType === 1) {
        const m = getComputedStyle(n).backgroundColor.match(/[\d.]+/g);
        if (m) {
          const a = m.length > 3 ? parseFloat(m[3]) : 1;
          if (a > 0.5) {
            rgb = m.slice(0, 3).map(Number);
            break;
          }
        }
        n = n.parentElement;
      }
      const lum = rgb ? 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2] : 255;
      setDark(lum < 120);
    };

    // Put the step pill right under the name labels (never overlapping them)
    const layout = () => {
      const scene = wrap.querySelector('.ns-scene');
      if (!scene) return;
      const sceneRect = scene.getBoundingClientRect();
      let labelBottom = 0;
      scene.querySelectorAll('.ns-char-lbl').forEach((l) => {
        labelBottom = Math.max(labelBottom, l.getBoundingClientRect().bottom);
      });
      if (!labelBottom) return;

      // Lowest visible edge: scene, any clipping ancestor, and the header bar
      let clip = sceneRect.bottom;
      let n = scene.parentElement;
      while (n && n !== document.body) {
        const cs = getComputedStyle(n);
        if (cs.overflow !== 'visible' || cs.overflowY !== 'visible') {
          clip = Math.min(clip, n.getBoundingClientRect().bottom);
        }
        n = n.parentElement;
      }
      const bar = wrap.closest('header, [class*="header"], [class*="topbar"], [class*="navbar"]');
      if (bar) clip = Math.min(clip, bar.getBoundingClientRect().bottom);

      const pill = scene.querySelector('.ns-desc .ns-d');
      const pillH = (pill && pill.offsetHeight) || 17;

      const wanted = labelBottom + 2;          // just under the labels
      const maxTop = clip - pillH - 3;         // keep the whole pill visible
      const topPx = Math.max(labelBottom - 6, Math.min(wanted, maxTop));
      setDescTop(Math.round(topPx - sceneRect.top));
    };

    const run = () => {
      detect();
      layout();
    };

    const timers = [];
    const later = () => {
      timers.push(setTimeout(run, 60));
      timers.push(setTimeout(run, 450)); // after theme transitions finish
    };

    run();
    const mo = new MutationObserver(later);
    const opts = {
      attributes: true,
      attributeFilter: ['class', 'style', 'data-theme', 'data-bs-theme', 'data-mode'],
    };
    mo.observe(document.documentElement, opts);
    mo.observe(document.body, opts);
    window.addEventListener('resize', run);
    const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    if (mq && mq.addEventListener) mq.addEventListener('change', later);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);

    return () => {
      mo.disconnect();
      window.removeEventListener('resize', run);
      if (mq && mq.removeEventListener) mq.removeEventListener('change', later);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`ns-wrap ${className}`}
      data-pw-theme={dark ? 'dark' : 'light'}
      aria-hidden="true"
    >
      <style>{CSS}</style>

      <div className="ns-scene">
        {/* Dotted tracks (kept for spacing, hidden by CSS) */}
        <div className="ns-track-l"></div>
        <div className="ns-track-r"></div>

        {/* 1. ATTACKER (left) */}
        <div className="ns-char ns-atk-char">
          <div className="ns-atk-glow"></div>
          <svg className="ns-atk-icon" width="40" height="44" viewBox="0 0 48 52" fill="none">
            <defs>
              <radialGradient id="pwAtkAura" cx="50%" cy="55%" r="55%">
                <stop offset="0" stopColor="#ef4444" stopOpacity="0.45" />
                <stop offset="1" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="pwHoodie" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#4a1616" />
                <stop offset="1" stopColor="#140505" />
              </linearGradient>
              <linearGradient id="pwHood" x1="0.2" y1="0" x2="0.8" y2="1">
                <stop offset="0" stopColor="#5a1c1c" />
                <stop offset="0.6" stopColor="#2a0a0a" />
                <stop offset="1" stopColor="#120404" />
              </linearGradient>
              <linearGradient id="pwLid" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#4b4b52" />
                <stop offset="1" stopColor="#17171b" />
              </linearGradient>
              <radialGradient id="pwFaceGlow" cx="50%" cy="100%" r="80%">
                <stop offset="0" stopColor="#ff6b6b" stopOpacity="0.5" />
                <stop offset="1" stopColor="#ff6b6b" stopOpacity="0" />
              </radialGradient>
              <filter id="pwGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="1.1" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle cx="24" cy="24" r="23" fill="url(#pwAtkAura)">
              <animate attributeName="r" values="21;24;21" dur="2.4s" repeatCount="indefinite" />
            </circle>

            <path d="M5 42 C5 33 12 29.5 24 29.5 C36 29.5 43 33 43 42 V44 H5 Z" fill="url(#pwHoodie)" stroke="#7f1d1d" strokeWidth="1" />
            <path d="M20.5 31 V37 M27.5 31 V37" stroke="#9b2c2c" strokeWidth="0.9" strokeLinecap="round" />
            <circle cx="20.5" cy="37.4" r="0.8" fill="#b84040" />
            <circle cx="27.5" cy="37.4" r="0.8" fill="#b84040" />

            <path d="M24 4 C15.4 4 11 10.6 11 18.6 C11 24 13 28 16.5 30.5 H31.5 C35 28 37 24 37 18.6 C37 10.6 32.6 4 24 4 Z" fill="url(#pwHood)" stroke="#8b2222" strokeWidth="1" />
            <path d="M14.5 12 C16.5 7.5 20 5.6 24 5.6" stroke="#ff8a8a" strokeOpacity="0.35" strokeWidth="0.9" strokeLinecap="round" />

            <ellipse cx="24" cy="19.2" rx="8.4" ry="9.6" fill="#050101" />
            <ellipse cx="24" cy="26.2" rx="7" ry="3.6" fill="url(#pwFaceGlow)" className="pw-code" />

            <g filter="url(#pwGlow)" className="pw-eye">
              <path d="M17.6 18.6 Q19.8 16.9 22 18.6 Q19.8 19.9 17.6 18.6 Z" fill="#ff3b3b" />
              <path d="M26 18.6 Q28.2 16.9 30.4 18.6 Q28.2 19.9 26 18.6 Z" fill="#ff3b3b" />
            </g>
            <path d="M19.5 23.6 Q24 26.2 28.5 23.6" stroke="#ef4444" strokeOpacity="0.7" strokeWidth="0.9" strokeLinecap="round" />

            <path d="M10 33.5 H38 L40.5 44.5 H7.5 Z" fill="url(#pwLid)" stroke="#6b6b73" strokeWidth="0.9" strokeLinejoin="round" />
            <path d="M11.2 34.6 H36.8" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="0.8" />
            <circle cx="24" cy="39.4" r="2.1" fill="#ef4444" className="pw-pulse" filter="url(#pwGlow)" />
            <circle cx="24" cy="39.4" r="0.9" fill="#fecaca" />
            <rect x="6.5" y="44.5" width="35" height="1.8" rx="0.9" fill="#2a2a30" stroke="#55555c" strokeWidth="0.6" />

            <circle className="ns-type-d1" cx="19" cy="49.4" r="1.2" fill="#DC2626" />
            <circle className="ns-type-d2" cx="24" cy="49.4" r="1.2" fill="#DC2626" />
            <circle className="ns-type-d3" cx="29" cy="49.4" r="1.2" fill="#DC2626" />
          </svg>
          <span className="ns-char-lbl ns-atk-lbl">Attacker</span>
        </div>

        {/* 2. EMAIL 1: Attacker -> User */}
        <div className="ns-email ns-email-1">
          <div className="ns-email-trail"></div>
          <svg width="30" height="24" viewBox="0 0 30 24" fill="none">
            <defs>
              <linearGradient id="pwPaper1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#f3d4d4" />
              </linearGradient>
              <radialGradient id="pwWax" cx="35%" cy="30%" r="75%">
                <stop offset="0" stopColor="#ff6b6b" />
                <stop offset="1" stopColor="#8f1414" />
              </radialGradient>
            </defs>
            <rect x="1.5" y="3.5" width="27" height="18" rx="2.5" fill="url(#pwPaper1)" stroke="#d65a5a" strokeWidth="1" />
            <path d="M2 21 L12.5 12 M28 21 L17.5 12" stroke="#e29a9a" strokeWidth="0.8" />
            <g className="pw-flutter">
              <path d="M1.8 4.2 L15 14 L28.2 4.2 Z" fill="#fbe3e3" stroke="#d65a5a" strokeWidth="1" strokeLinejoin="round" />
            </g>
            <g className="pw-sway">
              <circle cx="15" cy="14" r="4.4" fill="url(#pwWax)" stroke="#6e0e0e" strokeWidth="0.6" />
              <circle cx="13.7" cy="12.7" r="1.1" fill="#ffffff" fillOpacity="0.35" />
              <path d="M13 13.2 L17 16.4 M17 13.2 L13 16.4" stroke="#ffe3e3" strokeWidth="0.9" strokeLinecap="round" />
            </g>
          </svg>
        </div>

        {/* 3. USER (center) */}
        <div className="ns-char ns-user-char">
          <div className="ns-user-worry-ring"></div>
          <svg className="ns-user-icon" width="40" height="44" viewBox="0 0 48 52" fill="none">
            <defs>
              <linearGradient id="pwSkin" x1="0.2" y1="0" x2="0.8" y2="1">
                <stop offset="0" stopColor="#ffdcb8" />
                <stop offset="1" stopColor="#d99a6a" />
              </linearGradient>
              <linearGradient id="pwShirt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#5d8a6a" />
                <stop offset="1" stopColor="#2c4636" />
              </linearGradient>
              <linearGradient id="pwHair" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#4a3424" />
                <stop offset="1" stopColor="#1c120b" />
              </linearGradient>
              <linearGradient id="pwScreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#d4f5e2" />
                <stop offset="1" stopColor="#7bc9a0" />
              </linearGradient>
            </defs>

            <circle cx="24" cy="26" r="22.5" fill="#7C9A68" fillOpacity="0.14" />

            <g className="pw-breathe">
              <path d="M5.5 51 C5.5 40 13 34 24 34 C35 34 42.5 40 42.5 51 Z" fill="url(#pwShirt)" stroke="#243a2d" strokeWidth="0.8" />
              <path d="M18.5 34.8 L24 41 L29.5 34.8" stroke="#e9f3ec" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 44 C11 41 13 39.5 15 38.8" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" strokeLinecap="round" />
            </g>

            <g className="pw-bob">
              <path d="M20.6 28.5 V34.6 C22.4 36 25.6 36 27.4 34.6 V28.5 Z" fill="#c98a5c" />
              <ellipse cx="14.6" cy="19.2" rx="1.5" ry="2.4" fill="#e2a878" />
              <ellipse cx="33.4" cy="19.2" rx="1.5" ry="2.4" fill="#e2a878" />
              <path d="M15.4 17.5 C15.4 11.6 19 8.6 24 8.6 C29 8.6 32.6 11.6 32.6 17.5 C32.6 24.6 29 29.6 24 29.6 C19 29.6 15.4 24.6 15.4 17.5 Z" fill="url(#pwSkin)" />
              <path d="M14.6 16.8 C14 10.4 18.2 6.2 24.4 6.2 C30.4 6.2 34.4 10 33.4 16.8 C32 13.6 29.4 12.2 26.4 11.8 C22.4 12.8 18 12.6 14.6 16.8 Z" fill="url(#pwHair)" />
              <path d="M19 8.8 C21 7.6 24 7.2 26.6 7.8" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="0.8" strokeLinecap="round" />
              <path d="M18.4 15 L21.8 16.2 M29.6 15 L26.2 16.2" stroke="#3a2618" strokeWidth="1" strokeLinecap="round" />
              <g className="pw-blink">
                <ellipse cx="20.2" cy="18.6" rx="1.3" ry="1.7" fill="#1a1a1a" />
                <ellipse cx="27.8" cy="18.6" rx="1.3" ry="1.7" fill="#1a1a1a" />
                <circle cx="20.6" cy="18" r="0.45" fill="#ffffff" />
                <circle cx="28.2" cy="18" r="0.45" fill="#ffffff" />
              </g>
              <path d="M24 19.6 C23.6 21 23.4 21.8 24.4 22" stroke="#b9774a" strokeWidth="0.8" strokeLinecap="round" />
              <path d="M21.6 25.6 Q24 24.2 26.4 25.6" stroke="#8b4a2e" strokeWidth="1" strokeLinecap="round" />
            </g>

            <g>
              <rect x="30" y="31" width="12" height="19.5" rx="2.8" fill="#0d1512" stroke="#a9c2b0" strokeWidth="0.9" />
              <rect x="31.4" y="33.6" width="9.2" height="14" rx="1.4" fill="url(#pwScreen)">
                <animate attributeName="opacity" values="1;0.7;1" dur="1.8s" repeatCount="indefinite" />
              </rect>
              <rect x="34.2" y="32" width="3.6" height="0.9" rx="0.45" fill="#2b3a33" />
              <rect x="33" y="38.2" width="6" height="4.4" rx="0.8" fill="#ffffff" stroke="#2f7d57" strokeWidth="0.7" />
              <path d="M33.3 38.7 L36 40.8 L38.7 38.7" stroke="#2f7d57" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="39.4" cy="37.6" r="1.5" fill="#ef4444" className="pw-pulse" />
              <ellipse cx="29.6" cy="42" rx="1.5" ry="2.2" fill="#e2a878" />
              <ellipse cx="29.8" cy="46.2" rx="1.4" ry="1.9" fill="#d99a6a" />
            </g>
          </svg>
          <div className="ns-user-qmark">?</div>
          <div className="ns-user-safe-badge">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <polyline points="2,6 5,9 10,3" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="ns-char-lbl ns-user-lbl">User</span>
        </div>

        {/* 4. EMAIL 2: User -> PHISHSHIELD */}
        <div className="ns-email ns-email-2">
          {/* Paper plane (User -> PHISHSHIELD) */}
          <svg width="32" height="26" viewBox="0 0 32 26" fill="none">
            <defs>
              <linearGradient id="pwPlaneTop" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffe29a" />
                <stop offset="1" stopColor="#f5a623" />
              </linearGradient>
              <linearGradient id="pwPlaneLow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f0a020" />
                <stop offset="1" stopColor="#b86a08" />
              </linearGradient>
            </defs>
            {/* Wind lines */}
            <g className="pw-wind" stroke="#f5a623" strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round">
              <path d="M1 12 H8" />
              <path d="M3 16.5 H9.5" />
              <path d="M2 7.5 H7" />
            </g>
            <g className="pw-tilt">
              {/* Upper wing */}
              <path d="M10 13 L30 2.5 L19.5 23 L16 15.5 Z" fill="url(#pwPlaneTop)" stroke="#b86a08" strokeWidth="0.9" strokeLinejoin="round" />
              {/* Lower fold */}
              <path d="M16 15.5 L19.5 23 L18.2 17.6 Z" fill="url(#pwPlaneLow)" stroke="#9c5806" strokeWidth="0.7" strokeLinejoin="round" />
              {/* Center crease */}
              <path d="M30 2.5 L16 15.5" stroke="#9c5806" strokeWidth="0.9" strokeLinecap="round" />
              {/* Highlight */}
              <path d="M12.5 12.4 L26 5.2" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="0.8" strokeLinecap="round" />
            </g>
          </svg>
        </div>

        {/* 5. PHISHSHIELD (right) */}
        <div className="ns-char ns-shield-char">
          <div className="ns-scan-ring ns-ring-1"></div>
          <div className="ns-scan-ring ns-ring-2"></div>
          <div className="ns-shield-pulse"></div>
          <svg className="ns-shield-icon" width="40" height="44" viewBox="0 0 48 52" fill="none">
            <defs>
              <linearGradient id="pwShOuter" x1="0.1" y1="0" x2="0.9" y2="1">
                <stop offset="0" stopColor="#c7dcb2" />
                <stop offset="0.45" stopColor="#7C9A68" />
                <stop offset="1" stopColor="#2f4a38" />
              </linearGradient>
              <linearGradient id="pwShInner" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#6f9163" />
                <stop offset="1" stopColor="#23402f" />
              </linearGradient>
              <radialGradient id="pwRadar" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#d6ffe6" stopOpacity="0.55" />
                <stop offset="1" stopColor="#d6ffe6" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="pwShine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.55" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <clipPath id="pwShClip">
                <path d="M24 3 L40 9 V24 C40 34 33.6 41.4 24 46 C14.4 41.4 8 34 8 24 V9 Z" />
              </clipPath>
              <filter id="pwShDrop" x="-30%" y="-30%" width="160%" height="170%">
                <feDropShadow dx="0" dy="1.4" stdDeviation="1.4" floodColor="#10281a" floodOpacity="0.45" />
              </filter>
            </defs>

            <g filter="url(#pwShDrop)">
              <path d="M24 3 L40 9 V24 C40 34 33.6 41.4 24 46 C14.4 41.4 8 34 8 24 V9 Z" fill="url(#pwShOuter)" stroke="#e4f1d8" strokeWidth="1.2" strokeLinejoin="round" />
            </g>
            <path d="M24 7 L36.4 11.6 V24 C36.4 31.8 31.4 37.8 24 41.6 C16.6 37.8 11.6 31.8 11.6 24 V11.6 Z" fill="url(#pwShInner)" stroke="#1b3324" strokeOpacity="0.6" strokeWidth="0.8" />

            <g clipPath="url(#pwShClip)">
              <g>
                <circle cx="24" cy="25" r="11" stroke="#d6ffe6" strokeOpacity="0.35" strokeWidth="0.6" />
                <circle cx="24" cy="25" r="6" stroke="#d6ffe6" strokeOpacity="0.3" strokeWidth="0.6" />
                <path d="M24 25 L24 13 A12 12 0 0 1 33 17 Z" fill="url(#pwRadar)">
                  <animateTransform attributeName="transform" type="rotate" from="0 24 25" to="360 24 25" dur="3.2s" repeatCount="indefinite" />
                </path>
              </g>
              <rect x="-14" y="0" width="14" height="52" fill="url(#pwShine)" transform="skewX(-18)">
                <animateTransform attributeName="transform" type="translate" additive="sum" values="0 0; 70 0; 70 0" keyTimes="0;0.55;1" dur="3.6s" repeatCount="indefinite" />
              </rect>
            </g>

            <path d="M12 11 L24 6.6 L36 11" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />

            <path className="ns-shield-check" d="M16.4 25 L21.6 30.2 L31.6 19" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path className="ns-shield-x" d="M17 18.8 L31 32.8 M31 18.8 L17 32.8" stroke="#ff9d9d" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="ns-char-lbl">PHISHSHIELD</span>
        </div>

        {/* 6. VERDICT BADGE above shield */}
        <div className="ns-verdict-phish">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>PHISHING</span>
        </div>

        {/* 7. Phase descriptions: short text in a step pill (placed below the labels) */}
        <div className="ns-desc" style={descTop != null ? { top: descTop, bottom: 'auto' } : undefined}>
          <span className="ns-d ns-d1"><i className="pw-chip pw-c1">1</i>Crafting phishing email</span>
          <span className="ns-d ns-d2"><i className="pw-chip pw-c2">2</i>Email sent to victim</span>
          <span className="ns-d ns-d3"><i className="pw-chip pw-c3">3</i>Sent to PHISHSHIELD</span>
          <span className="ns-d ns-d4"><i className="pw-chip pw-c4">4</i>Scanning for threats</span>
          <span className="ns-d ns-d5"><i className="pw-chip pw-c5">✓</i>Verdict ready · User safe</span>
        </div>
      </div>
    </div>
  );
}