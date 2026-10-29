import React, { useState } from 'react';
import {
  Compass,
  Globe,
  Mail,
  BarChart3,
  History,
  Eye,
  Download,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
} from 'lucide-react';

export default function HelpResources({ setActivePage }) {
  const [selectedGuide, setSelectedGuide] = useState(null);

  const guides = [
    {
      id: 'url',
      title: 'How to Analyze a URL',
      icon: Globe,
      color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
      description: 'Learn how to scan and analyze suspicious URLs.',
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
      color: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
      description: 'Learn how to upload and analyze emails for phishing.',
      targetPage: 'email',
      targetLabel: 'Launch Email Analyzer',
      steps: [
        {
          step: 1,
          title: 'Copy Raw Email Text & Headers',
          detail: 'In your email provider (Outlook, Gmail, Apple Mail), choose "Show Original" or "View Headers", and copy the headers (From, Reply-To, Subject) and body.',
        },
        {
          step: 2,
          title: 'Open Email Analyzer',
          detail: 'Select "Email Analyzer" in the navigation sidebar.',
        },
        {
          step: 3,
          title: 'Paste Email Content',
          detail: 'Paste the content into the text area. You can also click synthetic email test presets (e.g. CEO BEC Wire Transfer, Microsoft 365 Display Spoof) to test.',
        },
        {
          step: 4,
          title: 'Inspect Email',
          detail: 'Click "Analyze Email Content". The NLP and heuristic engines evaluate sender mismatches, urgency triggers, wire transfer solicitations, and embedded links.',
        },
        {
          step: 5,
          title: 'Examine Results',
          detail: 'Review the 5-section analysis results layout: Threat Summary, Flagged Issues table, AI/ML summary, and Recommended Next Actions.',
        },
      ],
      tips: [
        'Check if the Reply-To domain differs from the sender domain; attackers frequently spoof display names while routing replies to a personal mailbox.',
        'Beware of artificial urgency (e.g. "immediate suspension in 24 hours") designed to make you act without thinking.',
      ],
    },
    {
      id: 'scores',
      title: 'Understanding Risk Scores',
      icon: BarChart3,
      color: 'text-teal-400 bg-teal-500/15 border-teal-500/30',
      description: 'What risk scores mean and how classifications work.',
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
          detail: 'Color: Amber Yellow. Structural anomalies or mild coercion detected (such as shortened URLs or generic urgent phrasing). Exercise caution.',
        },
        {
          step: 4,
          title: 'High Risk Tier (65–84)',
          detail: 'Color: Vibrant Orange. Multiple dangerous indicators found (e.g. typosquatting domain, sender mismatch, credential traps). Avoid interacting.',
        },
        {
          step: 5,
          title: 'Critical Risk Tier (85–100)',
          detail: 'Color: Crimson Red. Severe phishing attempt detected (e.g. raw IP login portals, wire transfer requests, verified brand spoofing). Block and report immediately.',
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
      color: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
      description: 'Find and manage your past scan history.',
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
      color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
      description: 'Understand scan results and view evidence.',
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
      color: 'text-teal-400 bg-teal-500/15 border-teal-500/30',
      description: 'Download and share scan reports in PDF format.',
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

  return (
    <div className="space-y-6 w-full pb-8 animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-[#404E3B]/15 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#7B9669]/20 border border-[#7B9669]/40 rounded-2xl text-[#404E3B] shadow-sm">
            <Compass className="w-5 h-5 text-[#404E3B]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#404E3B] font-heading">
              Help &amp; Resources
            </h1>
            <p className="text-xs sm:text-sm text-[#6C8480] mt-0.5 font-sans">
              Step-by-step guides and useful information to help you use PhishShield effectively.
            </p>
          </div>
        </div>
      </div>

      {/* 6 Step-by-Step Guide Cards (2 rows of 3 on Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {guides.map((guide) => {
          const Icon = guide.icon;

          return (
            <div
              key={guide.id}
              className="bg-white rounded-2xl border border-[#404E3B]/15 p-5 sm:p-6 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-[#7B9669] transition-all duration-300"
            >
              <div>
                {/* Icon Badge */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-[#7B9669]/15 border border-[#7B9669]/30 text-[#404E3B] shadow-xs group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5 text-[#7B9669]" />
                </div>

                <h3 className="text-base font-bold text-[#404E3B] font-sans tracking-wide mb-1.5 group-hover:text-[#7B9669] transition-colors">
                  {guide.title}
                </h3>

                <p className="text-xs text-[#6C8480] font-sans leading-relaxed mb-4">
                  {guide.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-[#404E3B]/10 flex items-center justify-between">
                <button
                  onClick={() => setSelectedGuide(guide)}
                  className="text-xs font-mono font-bold text-[#7B9669] hover:text-[#404E3B] flex items-center gap-1.5 transition-colors cursor-pointer group/btn"
                >
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step-by-Step Guide Viewer Modal */}
      {selectedGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedGuide(null);
          }}
        >
          <div className="bg-white rounded-2xl border border-[#404E3B]/20 p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl relative animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#404E3B]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#7B9669]/15 border border-[#7B9669]/30 text-[#404E3B]">
                  <selectedGuide.icon className="w-5 h-5 text-[#7B9669]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#404E3B] font-mono">
                    {selectedGuide.title}
                  </h3>
                  <p className="text-xs text-[#6C8480] font-sans">
                    {selectedGuide.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                aria-label="Close Guide"
                className="p-1.5 rounded-lg bg-[#EEF3EC] text-[#404E3B] hover:bg-[#7B9669] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Numbered Steps */}
            <div className="py-5 space-y-3.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#404E3B] mb-2">
                Step-by-Step Instructions:
              </h4>

              <div className="space-y-3 font-sans">
                {selectedGuide.steps.map((st) => (
                  <div
                    key={st.step}
                    className="p-3.5 rounded-xl bg-[#F4F7F4] border border-[#404E3B]/10 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#7B9669] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                      {st.step}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-[#404E3B] font-mono">{st.title}</h5>
                      <p className="text-xs text-[#2C3527] leading-relaxed mt-0.5">{st.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Best Practice Tips */}
              {selectedGuide.tips && (
                <div className="mt-4 p-4 rounded-xl bg-[#EEF3EC] border border-[#7B9669]/30 text-xs">
                  <span className="font-bold text-[#404E3B] font-mono uppercase block mb-1.5">
                    Pro Tips &amp; Security Best Practices:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-[#2C3527]">
                    {selectedGuide.tips.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#404E3B]/10 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedGuide(null)}
                className="px-4 py-2 rounded-xl bg-[#EEF3EC] hover:bg-[#BAC8B1]/40 text-[#404E3B] text-xs font-mono transition-colors cursor-pointer"
              >
                Close Guide
              </button>
              {selectedGuide.targetPage && (
                <button
                  onClick={() => {
                    setSelectedGuide(null);
                    setActivePage(selectedGuide.targetPage);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#7B9669] hover:bg-[#688258] text-white text-xs font-mono font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{selectedGuide.targetLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
