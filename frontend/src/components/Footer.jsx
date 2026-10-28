import React from 'react';
import {
  Shield,
  HelpCircle,
  Compass,
  BookOpen,
  ShieldAlert,
  Lock,
  FileCheck,
  Mail,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';

function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 0 0-1.66 1.64 1.65 1.65 0 0 0 1.66 1.64 1.64 1.64 0 0 0 1.64-1.64c0-.91-.73-1.64-1.64-1.64Z" />
    </svg>
  );
}

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function Footer({
  setActivePage,
  onOpenSecurity = () => {},
  onSelectContactSubject = () => {},
}) {
  const handleNav = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSupportClick = (subject) => {
    onSelectContactSubject(subject);
    setActivePage('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-12 w-full select-none" aria-label="Website Footer">
      <div className="liquid-glass-card rounded-2xl border border-white/10 bg-[rgba(6,16,36,0.75)] backdrop-blur-xl p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.35)] relative overflow-hidden">
        {/* Top Specular Edge Line */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent pointer-events-none" />

        {/* 4-Column Grid on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Brand & Overview */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-base font-black tracking-wider text-white font-heading">
                PHISHSHIELD
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              PhishShield is a cybersecurity application designed to detect suspicious URLs and phishing emails using rule-based and AI/ML-assisted analysis.
            </p>

            <ul className="space-y-2 text-xs font-sans">
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 group-hover:bg-cyan-300 transition-colors" />
                  <span>About PhishShield</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 group-hover:bg-cyan-300 transition-colors" />
                  <span>Project Overview</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 group-hover:bg-cyan-300 transition-colors" />
                  <span>Detection Capabilities</span>
                </button>
              </li>
            </ul>

            {/* Social / Direct Connect Icons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                title="LinkedIn"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 transition-all flex items-center justify-center cursor-pointer shadow-sm"
              >
                <LinkedinIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                title="GitHub"
                aria-label="GitHub Repository"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 transition-all flex items-center justify-center cursor-pointer shadow-sm"
              >
                <GithubIcon className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => handleSupportClick('General Inquiry')}
                title="Contact Mail"
                aria-label="Contact Email"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 transition-all flex items-center justify-center cursor-pointer shadow-sm"
              >
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Column 2: Help & Resources */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-3.5 flex items-center gap-1.5">
              <span>Help &amp; Resources</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-sans">
              <li>
                <button
                  onClick={() => handleNav('faq')}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer group text-left"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                  <span>Frequently Asked Questions</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('help')}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer group text-left"
                >
                  <Compass className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                  <span>Getting Started</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('help')}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer group text-left"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                  <span>User Guide</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Security */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-3.5 flex items-center gap-1.5">
              <span>Security</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-sans">
              <li>
                <button
                  onClick={() => onOpenSecurity('disclaimer')}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer group text-left"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                  <span>Security Disclaimer</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenSecurity('privacy')}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer group text-left"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                  <span>Privacy Information</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenSecurity('responsible_use')}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer group text-left"
                >
                  <FileCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                  <span>Responsible Use</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-3.5 flex items-center gap-1.5">
              <span>Support</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-sans">
              <li>
                <button
                  onClick={() => handleSupportClick('General Inquiry')}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer group text-left"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                  <span>Contact</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSupportClick('Report a Problem')}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer group text-left"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                  <span>Report a Problem</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSupportClick('Feedback')}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer group text-left"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                  <span>Feedback</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-sans">
          <span>
            &copy; 2026 PhishShield | Built for Cybersecurity Awareness &amp; Threat Analysis
          </span>

          <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
            <button
              onClick={() => onOpenSecurity('terms')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Terms of Use
            </button>
            <span>|</span>
            <button
              onClick={() => onOpenSecurity('privacy')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
