import React from 'react';
import {
  ShieldAlert,
  Lock,
  FileCheck,
  FileText,
  X,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export default function SecurityDisclaimerModal({ isOpen, onClose, activeSection = 'disclaimer' }) {
  if (!isOpen) return null;

  const contentMap = {
    disclaimer: {
      title: 'Security Disclaimer & Automated Threat Limits',
      icon: ShieldAlert,
      badgeColor: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
      badgeText: 'CRITICAL NOTICE',
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wide mb-1">
                Automated Detection Disclaimer
              </h4>
              <p className="text-xs leading-relaxed">
                Automated heuristic algorithms and machine learning models are analytical aids, not infallible guarantees. They can produce both <strong>false positives</strong> (flagging legitimate content as suspicious) and <strong>false negatives</strong> (failing to detect novel evasion techniques).
              </p>
            </div>
          </div>

          <h5 className="font-bold text-white font-mono uppercase tracking-wider text-xs">
            Mandatory Independent Verification
          </h5>
          <p>
            Never rely solely on automated scores from PhishShield to make critical security, financial, or authentication decisions. If an email or message requests:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
            <li>Wire transfers, cryptocurrency payments, or banking credential changes</li>
            <li>Submission of passwords, MFA tokens, or corporate credentials</li>
            <li>Emergency changes to vendor invoices or routing numbers</li>
          </ul>
          <p>
            Always verify the request independently through an established, out-of-band channel (such as a known telephone number or official corporate directory) before taking action.
          </p>

          <h5 className="font-bold text-white font-mono uppercase tracking-wider text-xs pt-2">
            Limitation of Liability
          </h5>
          <p className="text-xs text-slate-400">
            PhishShield is provided for cybersecurity awareness, educational research, and defensive threat analysis. The authors and maintainers accept no liability for any direct or consequential security incidents resulting from reliance on automated scan outputs.
          </p>
        </div>
      ),
    },
    privacy: {
      title: 'Privacy Information & Data Handling Policy',
      icon: Lock,
      badgeColor: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
      badgeText: 'DATA SANITIZATION',
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wide mb-1">
                Zero-SSRF Offline Architecture
              </h4>
              <p className="text-xs leading-relaxed">
                URL and email analyses are executed entirely in isolated, offline memory. PhishShield does <strong>not</strong> fetch remote web pages, download suspicious binary payloads, or trigger server-side request forgery (SSRF).
              </p>
            </div>
          </div>

          <h5 className="font-bold text-white font-mono uppercase tracking-wider text-xs">
            What We Store in Local SQLite
          </h5>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
            <li><strong>Target Identifier:</strong> The inspected URL string or sanitized email subject/sender snippet.</li>
            <li><strong>Risk Metrics:</strong> Calculated risk score (0-100), classification level, and triggered indicators list.</li>
            <li><strong>Timestamp:</strong> UTC completion timestamp and sequential scan ID for historical reference.</li>
          </ul>

          <h5 className="font-bold text-white font-mono uppercase tracking-wider text-xs pt-2">
            What We Never Store
          </h5>
          <p className="text-xs text-slate-400">
            PhishShield never saves raw email message bodies, sensitive attachment binaries, session tokens, or entered credentials. Scan history can be permanently cleared at any time from the Scan History tab.
          </p>
        </div>
      ),
    },
    responsible_use: {
      title: 'Responsible Use & Ethical Guidelines',
      icon: FileCheck,
      badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
      badgeText: 'ETHICAL DEFENSE',
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
          <p>
            PhishShield is engineered strictly to empower users, students, and security analysts to defend themselves against adversarial deception.
          </p>

          <h5 className="font-bold text-white font-mono uppercase tracking-wider text-xs">
            Acceptable Use Cases
          </h5>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
            <li>Analyzing suspicious incoming messages and links received in personal or enterprise inboxes.</li>
            <li>Cybersecurity training, awareness drills, and academic research into phishing vectors.</li>
            <li>Generating forensic evidence summaries for incident reporting to organizational SOCs.</li>
          </ul>

          <h5 className="font-bold text-white font-mono uppercase tracking-wider text-xs pt-2">
            Prohibited Activities
          </h5>
          <p className="text-xs text-slate-400">
            You may not use PhishShield to reverse-engineer defensive heuristics for the purpose of crafting undetected phishing attacks, testing weaponized exploit delivery vectors, or conducting unauthorized surveillance.
          </p>
        </div>
      ),
    },
    terms: {
      title: 'Terms of Use & License Terms',
      icon: FileText,
      badgeColor: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
      badgeText: 'TERMS OF SERVICE',
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
          <p>
            By using PhishShield, you acknowledge and agree that the software is provided &quot;as is&quot;, without warranty of any kind, express or implied, including fitness for a particular security standard.
          </p>
          <p className="text-xs text-slate-400">
            The platform is free to use for personal, educational, and defense-in-depth security training. Continued usage implies acceptance of our data sanitization policy and responsibility for independent out-of-band verification.
          </p>
        </div>
      ),
    },
  };

  const current = contentMap[activeSection] || contentMap.disclaimer;
  const Icon = current.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="liquid-glass-card rounded-2xl border border-white/10 bg-[rgba(6,16,36,0.92)] backdrop-blur-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto no-scrollbar shadow-[0_25px_60px_rgba(0,0,0,0.7)] relative animate-scaleUp">
        {/* Top Edge Specular Line */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${current.badgeColor}`}>
                  {current.badgeText}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
                {current.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-5">
          {current.body}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] cursor-pointer"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
