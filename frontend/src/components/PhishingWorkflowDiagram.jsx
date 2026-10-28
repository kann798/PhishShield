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
          <svg className="ns-atk-icon" width="34" height="34" viewBox="0 0 28 28" fill="none">
            <rect
              x="4"
              y="5"
              width="20"
              height="13"
              rx="2"
              fill="rgba(239,68,68,0.14)"
              stroke="rgba(239,68,68,0.75)"
              strokeWidth="1.3"
            />
            <circle cx="10.5" cy="10.5" r="1.6" fill="#f87171" />
            <circle cx="17.5" cy="10.5" r="1.6" fill="#f87171" />
            <path d="M11 13.5h6" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M10 15h2.5M15.5 15h2.5" stroke="#f87171" strokeWidth="1" strokeLinecap="round" />
            <path d="M12 18h4M11 20h6" stroke="rgba(239,68,68,0.5)" strokeWidth="1.2" strokeLinecap="round" />
            <circle className="ns-type-d1" cx="4" cy="23" r="1.2" fill="#f87171" />
            <circle className="ns-type-d2" cx="8" cy="23" r="1.2" fill="#f87171" />
            <circle className="ns-type-d3" cx="12" cy="23" r="1.2" fill="#f87171" />
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
          <svg className="ns-user-icon" width="34" height="34" viewBox="0 0 28 28" fill="none">
            <circle
              cx="14"
              cy="9"
              r="5"
              fill="rgba(99,102,241,0.12)"
              stroke="rgba(200,200,225,0.7)"
              strokeWidth="1.3"
            />
            <path
              d="M5 24c0-5 4-8 9-8s9 3 9 8"
              fill="rgba(99,102,241,0.1)"
              stroke="rgba(200,200,225,0.7)"
              strokeWidth="1.3"
              strokeLinecap="round"
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
            <path
              d="M16 3L5 8v8c0 7 11 13 11 13s11-6 11-13V8L16 3z"
              fill="rgba(16,185,129,0.22)"
              stroke="#10b981"
              strokeWidth="1.7"
            />
            <path
              className="ns-shield-check"
              d="M11 16l3.5 3.5L21 12"
              stroke="#10b981"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="ns-shield-x"
              d="M12 12l8 8M20 12l-8 8"
              stroke="#f87171"
              strokeWidth="2.2"
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
