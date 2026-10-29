import React, { useState, useRef } from 'react';
import {
  Compass,
  Globe,
  Mail,
  BarChart3,
  History,
  Eye,
  Download,
  ArrowRight,
  Shield,
  Lightbulb,
  X,
  ExternalLink,
} from 'lucide-react';

export default function HelpResources({ setActivePage }) {
  const [hoveredGuideId, setHoveredGuideId] = useState(null);
  const [isHoveringModal, setIsHoveringModal] = useState(false);
  const [pinnedGuideId, setPinnedGuideId] = useState(null);
  const leaveTimerRef = useRef(null);

  const guides = [
    {
      id: 'url',
      title: 'How to Analyze a URL',
      icon: Globe,
      accent: {
        badge: 'bg-[#E8F6ED] text-[#16794B] border-[#B7E3C7]',
        iconBg: 'bg-[#E8F6ED] text-[#16794B] border-[#B7E3C7]',
        stepBg: 'bg-[#16794B]',
        borderHover: 'hover:border-[#16794B]',
        activeBorder: 'border-[#16794B] ring-2 ring-[#16794B]/20',
        titleHover: 'group-hover:text-[#16794B]',
      },
      description: 'Learn how to scan and analyze suspicious URLs using deterministic regex heuristics.',
      targetPage: 'url',
      targetLabel: 'Launch URL Analyzer',
      steps: [
        {
          step: 1,
          title: 'Copy the Target URL',
          detail: 'Safely copy the full link address (e.g. from an SMS, chat message, or browser bar). Do not open the link in your browser.',
        },
        {
          step: 2,
          title: 'Navigate to URL Analyzer',
          detail: 'Click "URL Analyzer" in the left sidebar navigation of PhishShield.',
        },
        {
          step: 3,
          title: 'Paste or Select Quick Presets',
          detail: 'Paste the link into the inspection field, or click one of the synthetic test samples (e.g. Raw IP Host, Brand Typosquatting) to practice.',
        },
        {
          step: 4,
          title: 'Run Heuristics Inspection',
          detail: 'Click "Analyze URL Target". PhishShield evaluates domain structures, TLDs, and path keywords offline without making external HTTP requests.',
        },
        {
          step: 5,
          title: 'Review Findings & Evidence',
          detail: 'Inspect the circular risk meter, verdict badge, and the "Why This URL Was Flagged" table. Click "View Evidence" to see exact character breakdowns.',
        },
      ],
      tips: [
        'Legitimate banking portals almost never use raw IP hostnames (e.g. http://192.168.1.1).',
        'Watch out for lookalike domains (e.g. "paypa1.com" using the digit 1 instead of the letter l).',
      ],
    },
    {
      id: 'email',
      title: 'How to Analyze an Email',
      icon: Mail,
      accent: {
        badge: 'bg-[#EAF4FC] text-[#1D6FA5] border-[#B8DDF5]',
        iconBg: 'bg-[#EAF4FC] text-[#1D6FA5] border-[#B8DDF5]',
        stepBg: 'bg-[#1D6FA5]',
        borderHover: 'hover:border-[#1D6FA5]',
        activeBorder: 'border-[#1D6FA5] ring-2 ring-[#1D6FA5]/20',
        titleHover: 'group-hover:text-[#1D6FA5]',
      },
      description: 'Learn how to inspect raw email headers, body content, and wire transfer lures.',
      targetPage: 'email',
      targetLabel: 'Launch Email Analyzer',
      steps: [
        {
          step: 1,
          title: 'Copy Raw Email Text & Headers',
          detail: 'In your email client (Outlook, Gmail), choose "Show Original" or "View Headers", and copy headers (From, Reply-To, Subject) and body.',
        },
        {
          step: 2,
          title: 'Open Email Analyzer',
          detail: 'Select "Email Analyzer" in the navigation sidebar.',
        },
        {
          step: 3,
          title: 'Paste Email Content',
          detail: 'Paste content into the text area. You can also click synthetic email test presets (e.g. CEO BEC Wire Transfer, Microsoft 365 Spoof).',
        },
        {
          step: 4,
          title: 'Inspect Email',
          detail: 'Click "Analyze Email Content". The NLP and heuristic engines evaluate sender mismatches, urgency triggers, and embedded links.',
        },
        {
          step: 5,
          title: 'Examine Results',
          detail: 'Review the 5-section analysis results layout: Threat Summary, Flagged Issues table, AI/ML summary, and Recommended Next Actions.',
        },
      ],
      tips: [
        'Check if the Reply-To domain differs from the sender domain; attackers frequently spoof display names.',
        'Beware of artificial urgency (e.g. "account suspension in 24 hours") designed to cause panic.',
      ],
    },
    {
      id: 'scores',
      title: 'Understanding Risk Scores',
      icon: BarChart3,
      accent: {
        badge: 'bg-[#FFF1DB] text-[#B54708] border-[#F5D08A]',
        iconBg: 'bg-[#FFF1DB] text-[#B54708] border-[#F5D08A]',
        stepBg: 'bg-[#B54708]',
        borderHover: 'hover:border-[#B54708]',
        activeBorder: 'border-[#B54708] ring-2 ring-[#B54708]/20',
        titleHover: 'group-hover:text-[#B54708]',
      },
      description: 'Understand the 0-100 threat score metric and heuristic classification tiers.',
      targetPage: 'dashboard',
      targetLabel: 'View Dashboard Metrics',
      steps: [
        {
          step: 1,
          title: 'The 0-100 Threat Scale',
          detail: 'Every scan calculates a total score from 0 (completely benign baseline) to 100 (confirmed active malicious threat).',
        },
        {
          step: 2,
          title: 'Low Risk Tier (0–34)',
          detail: 'Color: Emerald Green. Standard heuristic traits pass cleanly. Normal security awareness applies.',
        },
        {
          step: 3,
          title: 'Medium Risk Tier (35–64)',
          detail: 'Color: Amber Yellow. Structural anomalies or mild coercion detected (such as shortened URLs or generic urgency). Exercise caution.',
        },
        {
          step: 4,
          title: 'High Risk Tier (65–84)',
          detail: 'Color: Coral Orange. Multiple dangerous indicators found (e.g. typosquatting domain, sender mismatch). Avoid interacting.',
        },
        {
          step: 5,
          title: 'Critical Risk Tier (85–100)',
          detail: 'Color: Crimson Red. Severe phishing attempt detected (e.g. raw IP login portals, wire transfer requests). Block immediately.',
        },
      ],
      tips: [
        'Scores combine deterministic rule weights with trained machine-learning model confidence.',
        'Even with a Low Risk score, never disclose passwords or MFA codes to unverified contacts.',
      ],
    },
    {
      id: 'history',
      title: 'Viewing Previous Scans',
      icon: History,
      accent: {
        badge: 'bg-[#F5F0FB] text-[#7E22CE] border-[#D8C7F0]',
        iconBg: 'bg-[#F5F0FB] text-[#7E22CE] border-[#D8C7F0]',
        stepBg: 'bg-[#7E22CE]',
        borderHover: 'hover:border-[#7E22CE]',
        activeBorder: 'border-[#7E22CE] ring-2 ring-[#7E22CE]/20',
        titleHover: 'group-hover:text-[#7E22CE]',
      },
      description: 'Find, filter, inspect, and manage your historical scan records stored in SQLite.',
      targetPage: 'history',
      targetLabel: 'Open Scan History',
      steps: [
        {
          step: 1,
          title: 'Open Scan History Page',
          detail: 'Click "Scan History" in the sidebar to view all historical inspections stored in local SQLite.',
        },
        {
          step: 2,
          title: 'Filter by Category & Risk',
          detail: 'Use the dropdown filters to isolate URL scans, Email scans, or filter by specific risk classifications (Critical, High, Medium, Low).',
        },
        {
          step: 3,
          title: 'Search Logs',
          detail: 'Type into the search box to find past scans by target domain, sender email, or subject snippet.',
        },
        {
          step: 4,
          title: 'Inspect or Delete Records',
          detail: 'Click the Eye icon to open the complete inspection modal, or click the Trash icon to delete obsolete records.',
        },
      ],
      tips: [
        'The Last Scan Summary on the Dashboard is synchronized with your newest record in Scan History.',
        'Use "Clear All History" if you need to wipe local records for audit privacy.',
      ],
    },
    {
      id: 'inspect',
      title: 'Inspecting Detailed Results',
      icon: Eye,
      accent: {
        badge: 'bg-[#FEECEC] text-[#D92D20] border-[#F5B7BD]',
        iconBg: 'bg-[#FEECEC] text-[#D92D20] border-[#F5B7BD]',
        stepBg: 'bg-[#D92D20]',
        borderHover: 'hover:border-[#D92D20]',
        activeBorder: 'border-[#D92D20] ring-2 ring-[#D92D20]/20',
        titleHover: 'group-hover:text-[#D92D20]',
      },
      description: 'Deep-dive into regex evidence strings, anatomy features, and ML probability vectors.',
      targetPage: 'dashboard',
      targetLabel: 'View Recent Telemetry',
      steps: [
        {
          step: 1,
          title: 'Click "Inspect" or "View Evidence"',
          detail: 'From the Dashboard table or Scan History, click "Inspect". In analyzer result pages, click "View Evidence" on any row.',
        },
        {
          step: 2,
          title: 'Review Triggered Indicators',
          detail: 'Each finding displays the issue name, plain-language description, severity level, and point weight.',
        },
        {
          step: 3,
          title: 'Examine Supporting Evidence',
          detail: 'Inspect the captured regex match strings, extracted headers, or domain anatomy that caused the indicator to trigger.',
        },
        {
          step: 4,
          title: 'Expand Advanced Analysis',
          detail: 'Expand the collapsible bottom drawer to view raw ML model predictions, phishing probabilities, and telemetry vectors.',
        },
      ],
      tips: [
        'Use the "Copy Evidence" button to easily copy forensic details when reporting incidents to your IT helpdesk.',
      ],
    },
    {
      id: 'reports',
      title: 'Exporting Reports',
      icon: Download,
      accent: {
        badge: 'bg-[#EEF3EC] text-[#355B43] border-[#404E3B]/20',
        iconBg: 'bg-[#EEF3EC] text-[#355B43] border-[#404E3B]/20',
        stepBg: 'bg-[#355B43]',
        borderHover: 'hover:border-[#355B43]',
        activeBorder: 'border-[#355B43] ring-2 ring-[#355B43]/20',
        titleHover: 'group-hover:text-[#355B43]',
      },
      description: 'Download and share executive audit memos in PDF, structured JSON, or CSV format.',
      targetPage: 'reports',
      targetLabel: 'Go to Reports & Export',
      steps: [
        {
          step: 1,
          title: 'Navigate to Reports & Export',
          detail: 'Click "Reports & Export" in the sidebar navigation.',
        },
        {
          step: 2,
          title: 'Select Export Format',
          detail: 'Choose between an Executive Security PDF (for management / team reviews) or structured JSON/CSV logs (for SIEM data ingestion).',
        },
        {
          step: 3,
          title: 'Filter Target Range',
          detail: 'Generate a report for the latest inspection, or download bulk audit trails across all past scans.',
        },
        {
          step: 4,
          title: 'Download File',
          detail: 'Click "Download PDF Report". The report generates client-side with full summary tables, risk meters, and security recommendations.',
        },
      ],
      tips: [
        'PDF reports are rendered entirely in your browser with zero external tracking.',
        'You can also click "Download PDF" directly from inside the Scan Detail modal.',
      ],
    },
  ];

  // Hover handlers that show/hide the center overlay without disturbing grid cards
  const handleCardMouseEnter = (id) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setHoveredGuideId(id);
  };

  const handleCardMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      if (!isHoveringModal) {
        setHoveredGuideId(null);
      }
    }, 300);
  };

  const handleModalMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setIsHoveringModal(true);
  };

  const handleModalMouseLeave = () => {
    setIsHoveringModal(false);
    if (!pinnedGuideId) {
      setHoveredGuideId(null);
    }
  };

  const activeGuideId = pinnedGuideId || hoveredGuideId;
  const activeGuide = guides.find((g) => g.id === activeGuideId);

  return (
    <div className="space-y-6 w-full pb-8 animate-fadeIn relative">
      {/* Page Header */}
      <div className="border-b border-[#404E3B]/15 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#7B9669]/20 border border-[#7B9669]/40 rounded-2xl text-[#404E3B] dark:text-[#BAC8B1] shadow-sm">
            <Compass className="w-5 h-5 text-[#404E3B] dark:text-[#BAC8B1]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1C2518] dark:text-white font-heading">
              HELP &amp; <span className="text-[#7B9669] dark:text-[#9FC48A]">RESOURCES</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#404E3B]/80 dark:text-[#BAC8B1] mt-0.5 font-sans font-medium page-subtitle">
              Move cursor over any guide to preview full instructions in the center of the screen without disturbing other cards.
            </p>
          </div>
        </div>
      </div>

      {/* Instructions Banner */}
      <div className="bg-[#EEF3EC] border border-[#7B9669]/30 rounded-2xl px-5 py-3 flex items-center justify-between text-xs font-mono text-[#243D2E] shadow-2xs">
        <span className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#7B9669] shrink-0" />
          <span>
            <strong>Interactive Guide Previews:</strong> Hover cursor over any card to view its complete guide in the center of the screen. Content disappears when cursor is removed. Click card to pin open.
          </span>
        </span>
        {pinnedGuideId && (
          <button
            onClick={() => setPinnedGuideId(null)}
            className="text-[11px] font-bold text-[#D92D20] hover:underline cursor-pointer ml-3 shrink-0"
          >
            Close Guide
          </button>
        )}
      </div>

      {/* 6 Fixed Step-by-Step Guide Cards (Layout remains undisturbed at all times in 2 rows of 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {guides.map((guide) => {
          const Icon = guide.icon;
          const isCurrentActive = activeGuideId === guide.id;

          return (
            <div
              key={guide.id}
              id={`guide-card-${guide.id}`}
              onMouseEnter={() => handleCardMouseEnter(guide.id)}
              onMouseLeave={handleCardMouseLeave}
              onPointerEnter={() => handleCardMouseEnter(guide.id)}
              onPointerLeave={handleCardMouseLeave}
              onClick={() => setPinnedGuideId((prev) => (prev === guide.id ? null : guide.id))}
              className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-sm relative overflow-hidden flex flex-col justify-between transition-all duration-200 cursor-pointer group h-[200px] ${
                isCurrentActive
                  ? `${guide.accent.activeBorder} shadow-md`
                  : `border-[#404E3B]/15 ${guide.accent.borderHover}`
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-2xs transition-transform group-hover:scale-105 ${guide.accent.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                    isCurrentActive
                      ? guide.accent.badge
                      : 'bg-[#F4F7F4] text-[#6C8480] border-[#404E3B]/15'
                  }`}>
                    {isCurrentActive ? 'Active Preview' : 'Hover to view'}
                  </span>
                </div>

                <h3 className={`text-base font-bold text-[#1C2518] font-sans tracking-wide mb-1.5 transition-colors ${guide.accent.titleHover}`}>
                  {guide.title}
                </h3>

                <p className="text-xs text-[#52665A] font-sans leading-relaxed line-clamp-2">
                  {guide.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#404E3B]/10 flex items-center justify-between text-xs font-mono font-bold text-[#7B9669]">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#7B9669]" />
                  <span>Hover to display in center</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Center Screen Floating Guide Display (Displays over fields without disturbing the grid; disappears when cursor is removed) */}
      {activeGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
        >
          {/* Backdrop: transparent to pointer events during hover so card under mouse keeps receiving events; clicks dismiss when pinned */}
          <div
            className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 ${
              pinnedGuideId ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            onClick={() => {
              setPinnedGuideId(null);
              setHoveredGuideId(null);
            }}
          />

          {/* Center Floating Guide Card with min-h-0 and max-h-[80vh] so header and footer NEVER cut off */}
          <div
            id="center-guide-modal"
            onMouseEnter={handleModalMouseEnter}
            onMouseLeave={handleModalMouseLeave}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1C281F] rounded-2xl border-2 border-[#7B9669] max-w-2xl w-full max-h-[82vh] h-auto flex flex-col min-h-0 shadow-2xl overflow-hidden animate-scaleUp text-[#202B21] dark:text-[#E6E6E6] relative z-10 pointer-events-auto"
          >
            {/* Sticky Fixed Header - ALWAYS FULLY VISIBLE AT TOP */}
            <div className="px-6 py-4 border-b border-[#404E3B]/10 dark:border-[#BAC8B1]/15 flex items-center justify-between gap-4 bg-[#F8FAF7] dark:bg-[#253629] shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-2xs shrink-0 ${activeGuide.accent.iconBg}`}>
                  <activeGuide.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-[#1C2518] dark:text-white font-sans tracking-tight truncate">
                      {activeGuide.title}
                    </h3>
                    {pinnedGuideId && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E8F6ED] text-[#16794B] border border-[#B7E3C7] font-bold shrink-0">
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#52665A] dark:text-[#BAC8B1] font-sans mt-0.5 line-clamp-1">
                    {activeGuide.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPinnedGuideId(null);
                  setHoveredGuideId(null);
                }}
                aria-label="Close Guide"
                className="p-1.5 rounded-lg bg-white dark:bg-[#1E2B20] text-[#404E3B] dark:text-[#BAC8B1] hover:bg-[#BAC8B1]/40 border border-[#404E3B]/15 dark:border-[#BAC8B1]/20 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body with min-h-0 flex-1 - Contains ALL 5 steps and pro tips completely */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-4 font-sans">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#243D2E] dark:text-[#BAC8B1] flex items-center gap-1.5 block">
                <span className={`w-2 h-2 rounded-full ${activeGuide.accent.stepBg}`}></span>
                <span>Step-by-Step Instructions:</span>
              </span>

              <div className="space-y-3 font-sans">
                {activeGuide.steps.map((st) => (
                  <div
                    key={st.step}
                    className="p-3.5 rounded-xl bg-[#F4F7F4] dark:bg-[#243527] border border-[#404E3B]/10 dark:border-[#BAC8B1]/15 flex items-start gap-3 shadow-2xs"
                  >
                    <span className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 shadow-2xs ${activeGuide.accent.stepBg}`}>
                      {st.step}
                    </span>
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-[#1C2518] dark:text-white font-mono">{st.title}</h5>
                      <p className="text-xs text-[#52665A] dark:text-[#BAC8B1] leading-relaxed font-sans">{st.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Best Practice Tips */}
              {activeGuide.tips && (
                <div className="p-4 rounded-xl bg-[#E8F6ED] dark:bg-[#1E3B2B] border border-[#B7E3C7] dark:border-[#355B43] text-xs">
                  <span className="font-bold text-[#16794B] dark:text-[#9FC48A] font-mono uppercase block mb-1.5 text-[11px]">
                    Pro Tips &amp; Security Best Practices:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-[#202B21] dark:text-[#E6E6E6] text-xs font-sans">
                    {activeGuide.tips.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sticky Fixed Footer - ALWAYS FULLY VISIBLE AT BOTTOM */}
            <div className="px-6 py-3.5 border-t border-[#404E3B]/10 dark:border-[#BAC8B1]/15 flex items-center justify-between gap-3 bg-[#F8FAF7] dark:bg-[#253629] shrink-0 font-mono">
              <span className="text-[11px] text-[#6C8480] dark:text-[#BAC8B1]">
                {pinnedGuideId ? 'Pinned open • Click outside to close' : 'Hover active • Remove cursor to hide'}
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setPinnedGuideId(null);
                    setHoveredGuideId(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#1E2B20] border border-[#404E3B]/20 dark:border-[#BAC8B1]/20 hover:bg-[#EEF3EC] dark:hover:bg-[#2A3B2C] text-[#404E3B] dark:text-[#BAC8B1] text-xs font-mono transition-colors cursor-pointer"
                >
                  Close Guide
                </button>
                {activeGuide.targetPage && (
                  <button
                    onClick={() => {
                      setPinnedGuideId(null);
                      setHoveredGuideId(null);
                      setActivePage(activeGuide.targetPage);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#7B9669] hover:bg-[#688258] text-white text-xs font-mono font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{activeGuide.targetLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
