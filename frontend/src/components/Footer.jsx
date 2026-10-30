import React from 'react';
import {
  Shield,
  HelpCircle,
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
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 0 0-1.66 1.64 1.65 1.65 0 0 0 1.66 1.64 1.64 1.64 0 0 0 1.64-1.64c0-.91-.73-1.64-1.64-1.64Z" />
    </svg>
  );
}

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function Footer({
  setActivePage,
  onOpenSecurity = () => {},
  onSelectContactSubject = () => {},
  telemetryCollapsed = true,
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
    <footer
      className="w-full border-t border-[#404E3B]/20 bg-[#EEF3EC] text-[#2C3527] select-none relative z-20 shrink-0"
      aria-label="Website Footer"
    >
      {/* Top Specular Line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#7B9669]/40 to-transparent pointer-events-none" />

      {/* Main Container: Compact, thin horizontal rectangle reduced by ~40% in height */}
      <div
        className={`w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2 transition-all duration-300 ${
          telemetryCollapsed ? '' : 'xl:pr-[330px]'
        }`}
      >
        {/* Horizontal Columns Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-y-1.5 gap-x-6 lg:gap-x-8 items-start">
          {/* Column 1: Brand Header with Social Icons Beside Branding + Compact Overview (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-4.5 h-4.5 rounded bg-[#7B9669]/20 border border-[#7B9669]/40 flex items-center justify-center text-[#404E3B] shadow-xs">
                <Shield className="w-2.5 h-2.5 stroke-[2]" />
              </div>
              <span className="text-xs sm:text-[13px] font-black tracking-wider text-[#404E3B] font-heading">
                PHISHSHIELD
              </span>

              {/* Social Media Icons Immediately Beside Branding */}
              <div className="flex items-center gap-1 ml-1.5">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn"
                  aria-label="LinkedIn"
                  className="w-4.5 h-4.5 rounded bg-white border border-[#404E3B]/15 hover:border-[#7B9669] text-[#6C8480] hover:text-[#404E3B] hover:bg-[#EEF3EC] transition-all flex items-center justify-center cursor-pointer shadow-xs"
                >
                  <LinkedinIcon />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  title="GitHub"
                  aria-label="GitHub Repository"
                  className="w-4.5 h-4.5 rounded bg-white border border-[#404E3B]/15 hover:border-[#7B9669] text-[#6C8480] hover:text-[#404E3B] hover:bg-[#EEF3EC] transition-all flex items-center justify-center cursor-pointer shadow-xs"
                >
                  <GithubIcon />
                </a>
                <button
                  onClick={() => handleSupportClick('General Inquiry')}
                  title="Contact Mail"
                  aria-label="Contact Email"
                  className="w-4.5 h-4.5 rounded bg-white border border-[#404E3B]/15 hover:border-[#7B9669] text-[#6C8480] hover:text-[#404E3B] hover:bg-[#EEF3EC] transition-all flex items-center justify-center cursor-pointer shadow-xs"
                >
                  <Mail className="w-2.5 h-2.5 stroke-[1.8]" />
                </button>
              </div>
            </div>

            <p className="text-[9.5px] text-[#6C8480] font-sans leading-tight max-w-md">
              Rule-based and AI/ML phishing detection &amp; threat intelligence platform.
            </p>

            {/* Horizontal inline links for About, Overview, and Capabilities */}
            <div className="flex items-center gap-2 text-[10px] font-sans text-[#2C3527] flex-wrap leading-tight">
              <button
                onClick={() => handleNav('about')}
                className="hover:text-[#7B9669] transition-colors cursor-pointer font-medium hover:underline"
              >
                About PhishShield
              </button>
              <span className="text-[#6C8480]/40">•</span>
              <button
                onClick={() => handleNav('about')}
                className="hover:text-[#7B9669] transition-colors cursor-pointer font-medium hover:underline"
              >
                Project Overview
              </button>
              <span className="text-[#6C8480]/40">•</span>
              <button
                onClick={() => handleNav('about')}
                className="hover:text-[#7B9669] transition-colors cursor-pointer font-medium hover:underline"
              >
                Detection Capabilities
              </button>
            </div>
          </div>

          {/* Column 2: Help & Resources (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-0.5">
            <h4 className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#404E3B] mb-0.5 flex items-center gap-1">
              <span>Help &amp; Resources</span>
            </h4>
            <ul className="space-y-0.5 text-[10px] font-sans leading-tight">
              <li>
                <button
                  onClick={() => handleNav('faq')}
                  className="flex items-center gap-1.5 text-[#2C3527] hover:text-[#7B9669] transition-colors cursor-pointer group text-left font-medium"
                >
                  <HelpCircle className="w-2.5 h-2.5 text-[#6C8480] group-hover:text-[#7B9669] stroke-[1.8] transition-colors shrink-0" />
                  <span>FAQ</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('help')}
                  className="flex items-center gap-1.5 text-[#2C3527] hover:text-[#7B9669] transition-colors cursor-pointer group text-left font-medium"
                >
                  <BookOpen className="w-2.5 h-2.5 text-[#6C8480] group-hover:text-[#7B9669] stroke-[1.8] transition-colors shrink-0" />
                  <span>Getting Started</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('help')}
                  className="flex items-center gap-1.5 text-[#2C3527] hover:text-[#7B9669] transition-colors cursor-pointer group text-left font-medium"
                >
                  <BookOpen className="w-2.5 h-2.5 text-[#6C8480] group-hover:text-[#7B9669] stroke-[1.8] transition-colors shrink-0" />
                  <span>User Guide</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Security (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-0.5">
            <h4 className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#404E3B] mb-0.5 flex items-center gap-1">
              <span>Security</span>
            </h4>
            <ul className="space-y-0.5 text-[10px] font-sans leading-tight">
              <li>
                <button
                  onClick={() => onOpenSecurity('disclaimer')}
                  className="flex items-center gap-1.5 text-[#2C3527] hover:text-[#7B9669] transition-colors cursor-pointer group text-left font-medium"
                >
                  <ShieldAlert className="w-2.5 h-2.5 text-[#6C8480] group-hover:text-[#7B9669] stroke-[1.8] transition-colors shrink-0" />
                  <span>Security Disclaimer</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenSecurity('privacy')}
                  className="flex items-center gap-1.5 text-[#2C3527] hover:text-[#7B9669] transition-colors cursor-pointer group text-left font-medium"
                >
                  <Lock className="w-2.5 h-2.5 text-[#6C8480] group-hover:text-[#7B9669] stroke-[1.8] transition-colors shrink-0" />
                  <span>Privacy Information</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenSecurity('responsible_use')}
                  className="flex items-center gap-1.5 text-[#2C3527] hover:text-[#7B9669] transition-colors cursor-pointer group text-left font-medium"
                >
                  <FileCheck className="w-2.5 h-2.5 text-[#6C8480] group-hover:text-[#7B9669] stroke-[1.8] transition-colors shrink-0" />
                  <span>Responsible Use</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Support (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-0.5">
            <h4 className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#404E3B] mb-0.5 flex items-center gap-1">
              <span>Support</span>
            </h4>
            <ul className="space-y-0.5 text-[10px] font-sans leading-tight">
              <li>
                <button
                  onClick={() => handleSupportClick('General Inquiry')}
                  className="flex items-center gap-1.5 text-[#2C3527] hover:text-[#7B9669] transition-colors cursor-pointer group text-left font-medium"
                >
                  <Mail className="w-2.5 h-2.5 text-[#6C8480] group-hover:text-[#7B9669] stroke-[1.8] transition-colors shrink-0" />
                  <span>Contact</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSupportClick('Report a Problem')}
                  className="flex items-center gap-1.5 text-[#2C3527] hover:text-[#7B9669] transition-colors cursor-pointer group text-left font-medium"
                >
                  <AlertTriangle className="w-2.5 h-2.5 text-[#6C8480] group-hover:text-[#7B9669] stroke-[1.8] transition-colors shrink-0" />
                  <span>Report a Problem</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSupportClick('Feedback')}
                  className="flex items-center gap-1.5 text-[#2C3527] hover:text-[#7B9669] transition-colors cursor-pointer group text-left font-medium"
                >
                  <MessageSquare className="w-2.5 h-2.5 text-[#6C8480] group-hover:text-[#7B9669] stroke-[1.8] transition-colors shrink-0" />
                  <span>Feedback</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-bar: Copyright on Bottom-Left, Terms/Privacy on Bottom-Right */}
        <div className="mt-1 pt-1 border-t border-[#404E3B]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[9.5px] text-[#6C8480] font-sans">
          <span>
            &copy; 2026 PhishShield | Built for Cybersecurity Awareness &amp; Threat Analysis
          </span>

          <div className="flex items-center gap-3 text-[9.5px] font-medium pr-10 sm:pr-14">
            <button
              onClick={() => onOpenSecurity('terms')}
              className="text-[#404E3B] hover:text-[#7B9669] transition-colors cursor-pointer"
            >
              Terms of Use
            </button>
            <span className="text-[#6C8480]/50">|</span>
            <button
              onClick={() => onOpenSecurity('privacy')}
              className="text-[#404E3B] hover:text-[#7B9669] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
