import React from 'react';

/**
 * PhishingWorkflowDiagram (redesigned visuals)
 * Same workflow, same class names, same animation phases as the original.
 * Only the SVG artwork has changed. Attacker and User labels are now black.
 * The PHISHSHIELD label is unchanged.
 */
const LABEL_BLACK = { color: '#000000' };

export default function PhishingWorkflowDiagram({ className = '' }) {
  return (
    <div className={`ns-wrap ${className}`} aria-hidden="true">
      <div className="ns-scene">
        {/* Dotted connecting tracks */}
        <div className="ns-track-l"></div>
        <div className="ns-track-r"></div>

        {/* 1. ATTACKER (left) - hooded figure at a laptop */}
        <div className="ns-char ns-atk-char">
          <div className="ns-atk-glow"></div>
          <svg className="ns-atk-icon" width="34" height="34" viewBox="0 0 32 32" fill="none">
            {/* Hood */}
            <path
              d="M16 2.5 C10.5 2.5 7.5 7 7.5 11.5 C7.5 14.5 8.8 16.5 10.5 17.5 H21.5 C23.2 16.5 24.5 14.5 24.5 11.5 C24.5 7 21.5 2.5 16 2.5 Z"
              fill="#7F1D1D"
              stroke="#B91C1C"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Dark face opening */}
            <ellipse cx="16" cy="11" rx="5" ry="4.6" fill="#1C0A0A" />
            {/* Glowing eyes */}
            <circle cx="14" cy="10.6" r="1" fill="#F87171" />
            <circle cx="18" cy="10.6" r="1" fill="#F87171" />
            {/* Laptop screen (back view) */}
            <path
              d="M8 19 H24 L22.8 25 H9.2 Z"
              fill="#991B1B"
              stroke="#DC2626"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="22" r="1.2" fill="#FCA5A5" />
            {/* Laptop base */}
            <rect x="5.5" y="25" width="21" height="2" rx="1" fill="#DC2626" />
            {/* Typing dots */}
            <circle className="ns-type-d1" cx="13" cy="29.8" r="1.1" fill="#DC2626" />
            <circle className="ns-type-d2" cx="16" cy="29.8" r="1.1" fill="#DC2626" />
            <circle className="ns-type-d3" cx="19" cy="29.8" r="1.1" fill="#DC2626" />
          </svg>
          <span className="ns-char-lbl ns-atk-lbl" style={LABEL_BLACK}>Attacker</span>
        </div>

        {/* 2. EMAIL 1: Attacker -> User (red, malicious) - envelope with hook */}
        <div className="ns-email ns-email-1">
          <div className="ns-email-trail"></div>
          <svg width="24" height="18" viewBox="0 0 22 16" fill="none">
            <path
              d="M2 2.5 H20 A1.5 1.5 0 0 1 21.5 4 V13 A1.5 1.5 0 0 1 20 14.5 H2 A1.5 1.5 0 0 1 0.5 13 V4 A1.5 1.5 0 0 1 2 2.5 Z"
              fill="#FEE2E2"
              stroke="#EF4444"
              strokeWidth="1.2"
            />
            <path d="M1 4 L11 10 L21 4" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Fish-hook style bait mark */}
            <path
              d="M11 0.5 V3.5 A1.6 1.6 0 1 1 8.4 4.7"
              stroke="#B91C1C"
              strokeWidth="1.1"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* 3. USER (center) - round avatar badge */}
        <div className="ns-char ns-user-char">
          <div className="ns-user-worry-ring"></div>
          <svg className="ns-user-icon" width="34" height="34" viewBox="0 0 32 32" fill="none">
            {/* Avatar disc */}
            <circle cx="16" cy="16" r="14" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.8" />
            {/* Head */}
            <circle cx="16" cy="12.5" r="4.6" fill="#2563EB" />
            {/* Shoulders clipped to disc */}
            <path
              d="M6.2 25.2 C7.6 20.6 11.4 18.6 16 18.6 C20.6 18.6 24.4 20.6 25.8 25.2 C23.2 27.8 19.8 29.2 16 29.2 C12.2 29.2 8.8 27.8 6.2 25.2 Z"
              fill="#2563EB"
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
          <span className="ns-char-lbl ns-user-lbl" style={LABEL_BLACK}>User</span>
        </div>

        {/* 4. EMAIL 2: User -> PHISHSHIELD (amber, forwarded for verification) */}
        <div className="ns-email ns-email-2">
          <svg width="24" height="18" viewBox="0 0 22 16" fill="none">
            <path
              d="M2 2.5 H20 A1.5 1.5 0 0 1 21.5 4 V13 A1.5 1.5 0 0 1 20 14.5 H2 A1.5 1.5 0 0 1 0.5 13 V4 A1.5 1.5 0 0 1 2 2.5 Z"
              fill="#FEF3C7"
              stroke="#F59E0B"
              strokeWidth="1.2"
            />
            <path d="M1 4 L11 10 L21 4" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Forward arrow */}
            <path d="M8 1 L11 0 L11 2 Z" fill="#D97706" />
          </svg>
        </div>

        {/* 5. PHISHSHIELD (right) - hexagonal shield */}
        <div className="ns-char ns-shield-char">
          <div className="ns-scan-ring ns-ring-1"></div>
          <div className="ns-scan-ring ns-ring-2"></div>
          <div className="ns-shield-pulse"></div>
          <svg className="ns-shield-icon" width="40" height="40" viewBox="0 0 32 32" fill="none">
            {/* Hex-top shield outer */}
            <path
              d="M16 2 L26 6 V15 C26 21.5 21.8 26.6 16 30 C10.2 26.6 6 21.5 6 15 V6 Z"
              fill="#064E3B"
              stroke="#10B981"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Inner panel */}
            <path
              d="M16 5.2 L23 8 V15 C23 19.8 20 23.6 16 26.2 C12 23.6 9 19.8 9 15 V8 Z"
              fill="#059669"
              opacity="0.55"
            />
            {/* Checkmark */}
            <path
              className="ns-shield-check"
              d="M11.5 15.5 L14.8 18.8 L21 12"
              stroke="#ECFDF5"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Threat cross */}
            <path
              className="ns-shield-x"
              d="M12 11.5 L20 19.5 M20 11.5 L12 19.5"
              stroke="#FCA5A5"
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