import React from 'react';

/**
 * PhishingWorkflowDiagram
 * Exact reproduction of the CENTER STORY ANIMATION from:
 * chandureddy142/Phishing-email-detection-using-ML-project (app/templates/index.html & app/static/style.css)
 * 
 * Includes:
 * - Attacker monitor SVG with typing dots (ns-type-d1, ns-type-d2, ns-type-d3) & pulsing red aura
 * - Email 1 flying from Attacker → User with gradient speed trail (ns-email-trail)
 * - User character with amber worry ring, floating '?' badge, and emerald safe checkmark badge
 * - Email 2 flying from User → PhishGuard
 * - PhishGuard security shield with radar scan rings (ns-ring-1, ns-ring-2), red threat X, and checkmark
 * - Floating '⚠ PHISHING' verdict pill above shield
 * - 5 synchronized narrative phase descriptions across 14s CSS keyframe loop
 */
export default function PhishingWorkflowDiagram({ className = '' }) {
  return (
    <div className={`ns-wrap ${className}`} aria-hidden="true">
      <div className="ns-scene">
        {/* Dotted connecting tracks */}
        <div className="ns-track-l"></div>
        <div className="ns-track-r"></div>

        {/* 1. ATTACKER (left) */}
        <div className="ns-char ns-atk-char">
          <div className="ns-atk-glow"></div>
          <svg className="ns-atk-icon" width="34" height="34" viewBox="0 0 32 32" fill="none">
            {/* Monitor screen */}
            <rect
              x="3.5"
              y="3.5"
              width="25"
              height="17"
              rx="2.5"
              fill="rgba(220,38,38,0.12)"
              stroke="#DC2626"
              strokeWidth="1.8"
            />
            {/* Screen top title bar */}
            <line x1="3.5" y1="7.5" x2="28.5" y2="7.5" stroke="#DC2626" strokeWidth="1" opacity="0.4" />
            <circle cx="6.5" cy="5.5" r="0.9" fill="#DC2626" />
            <circle cx="9" cy="5.5" r="0.9" fill="#DC2626" opacity="0.6" />
            {/* Hooded hacker silhouette inside screen */}
            <path
              d="M16 8.5 C13.2 8.5 11.2 10.4 11.2 13 C11.2 14.8 12.2 16.2 13.5 16.8 C11.8 17.5 10.5 19 10.5 20.5 H21.5 C21.5 19 20.2 17.5 18.5 16.8 C19.8 16.2 20.8 14.8 20.8 13 C20.8 10.4 18.8 8.5 16 8.5 Z"
              fill="rgba(220,38,38,0.25)"
              stroke="#DC2626"
              strokeWidth="1.4"
            />
            {/* Glowing hacker visor / eye slit */}
            <path d="M13.5 12.8 H18.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
            {/* Monitor stand */}
            <path
              d="M13.5 20.5 L12 24.5 H20 L18.5 20.5"
              fill="rgba(220,38,38,0.15)"
              stroke="#DC2626"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* Base / Keyboard console with typing dots */}
            <path d="M7.5 25.5 H24.5" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" />
            <circle className="ns-type-d1" cx="13" cy="28.5" r="1.1" fill="#DC2626" />
            <circle className="ns-type-d2" cx="16" cy="28.5" r="1.1" fill="#DC2626" />
            <circle className="ns-type-d3" cx="19" cy="28.5" r="1.1" fill="#DC2626" />
          </svg>
          <span className="ns-char-lbl ns-atk-lbl">Attacker</span>
        </div>

        {/* 2. EMAIL 1: Attacker → User (red, malicious) */}
        <div className="ns-email ns-email-1">
          <div className="ns-email-trail"></div>
          <svg width="24" height="18" viewBox="0 0 22 16" fill="none">
            <rect
              x="1"
              y="1"
              width="20"
              height="14"
              rx="2"
              fill="rgba(239,68,68,0.18)"
              stroke="rgba(239,68,68,0.85)"
              strokeWidth="1.3"
            />
            <path
              d="M1 3l10 7 10-7"
              stroke="rgba(239,68,68,0.85)"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <circle cx="11" cy="9" r="1.4" fill="#f87171" />
          </svg>
        </div>

        {/* 3. USER (center) */}
        <div className="ns-char ns-user-char">
          <div className="ns-user-worry-ring"></div>
          <svg className="ns-user-icon" width="34" height="34" viewBox="0 0 32 32" fill="none">
            {/* User head */}
            <circle
              cx="16"
              cy="9.5"
              r="5.5"
              fill="rgba(37,99,235,0.15)"
              stroke="#2563EB"
              strokeWidth="1.8"
            />
            {/* User shoulders/body */}
            <path
              d="M6 26.5 C6 20.5 10.5 17 16 17 C21.5 17 26 20.5 26 26.5"
              fill="rgba(37,99,235,0.12)"
              stroke="#2563EB"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Modern collar detail */}
            <path
              d="M12.8 17.5 L16 21.2 L19.2 17.5"
              stroke="#2563EB"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <div className="ns-user-qmark">?</div>
          <div className="ns-user-safe-badge">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <polyline
                points="2,6 5,9 10,3"
                stroke="#10b981"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="ns-char-lbl ns-user-lbl">User</span>
        </div>

        {/* 4. EMAIL 2: User → PHISHSHIELD (amber, forwarded for verification) */}
        <div className="ns-email ns-email-2">
          <svg width="24" height="18" viewBox="0 0 22 16" fill="none">
            <rect
              x="1"
              y="1"
              width="20"
              height="14"
              rx="2"
              fill="rgba(251,191,36,0.16)"
              stroke="rgba(251,191,36,0.75)"
              strokeWidth="1.3"
            />
            <path
              d="M1 3l10 7 10-7"
              stroke="rgba(251,191,36,0.75)"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path d="M8 8l4 3 4-3" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>

        {/* 5. PHISHSHIELD SHIELD (right) */}
        <div className="ns-char ns-shield-char">
          <div className="ns-scan-ring ns-ring-1"></div>
          <div className="ns-scan-ring ns-ring-2"></div>
          <div className="ns-shield-pulse"></div>
          <svg className="ns-shield-icon" width="40" height="40" viewBox="0 0 32 32" fill="none">
            {/* Security shield body */}
            <path
              d="M16 2.8 L5 7.5 V15.5 C5 22.5 9.8 27.2 16 29.5 C22.2 27.2 27 22.5 27 15.5 V7.5 L16 2.8 Z"
              fill="rgba(5,150,105,0.18)"
              stroke="#059669"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Inner shield bevel / depth reflection */}
            <path
              d="M16 5.2 V27 C20.5 24.8 24.5 20.8 24.5 15.5 V9 L16 5.2 Z"
              fill="rgba(16,185,129,0.12)"
            />
            {/* Clear, bold checkmark */}
            <path
              className="ns-shield-check"
              d="M10.5 16.2 L14.5 20.2 L21.5 12.8"
              stroke="#059669"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Threat detection cross */}
            <path
              className="ns-shield-x"
              d="M12 12 L20 20 M20 12 L12 20"
              stroke="#DC2626"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </svg>
          <span className="ns-char-lbl">PHISHSHIELD</span>
        </div>

        {/* 6. VERDICT BADGE above shield */}
        <div className="ns-verdict-phish">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f87171"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>PHISHING</span>
        </div>

        {/* 7. Phase descriptions */}
        <div className="ns-desc">
          <span className="ns-d ns-d1">Attacker crafting phishing email...</span>
          <span className="ns-d ns-d2">Malicious email sent to victim...</span>
          <span className="ns-d ns-d3">User submits email to PHISHSHIELD...</span>
          <span className="ns-d ns-d4">Scanning &amp; analyzing threats...</span>
          <span className="ns-d ns-d5">✓ Verdict delivered · User is safe</span>
        </div>
      </div>
    </div>
  );
}
