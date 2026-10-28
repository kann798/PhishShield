import React from 'react';
import {
  Info,
  Shield,
  Cpu,
  Layers,
  Lock,
  AlertTriangle,
} from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6 w-full pb-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <Info className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              PROJECT ARCHITECTURE & THREAT MODEL
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Technical specifications, detection methodologies, privacy architecture, and operational limitations
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Purpose & Overview */}
        <div className="liquid-glass-card rounded-2xl border border-white/10 bg-[rgba(10,24,52,0.65)] backdrop-blur-[28px] p-5 sm:p-6 space-y-3 shadow-[0_16px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Specular Top Line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none" />

          <div className="flex items-center gap-2 text-emerald-400">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">1. Project Purpose</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            <strong>PhishShield</strong> is an educational and defensive cybersecurity platform engineered to detect social engineering, credential harvesting, domain spoofing, and malicious link delivery. Designed for security analysts, incident responders, and end-users, it bridges raw threat indicators with actionable guidance.
          </p>
        </div>

        {/* Security & SSRF Prevention */}
        <div className="liquid-glass-card rounded-2xl border border-emerald-500/25 bg-[rgba(10,24,52,0.65)] backdrop-blur-[28px] p-5 sm:p-6 space-y-3 shadow-[0_16px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Specular Top Line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />

          <div className="flex items-center gap-2 text-emerald-400">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">2. Zero-SSRF Safety Principle</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            The tool implements strict <strong>offline heuristic analysis</strong>. It parses URL strings and message structures using localized regular expressions and parsing algorithms without making outbound HTTP requests. This eliminates Server-Side Request Forgery (SSRF) vulnerabilities and prevents attacker tracking beacons from being triggered.
          </p>
        </div>

        {/* Technology Stack */}
        <div className="liquid-glass-card rounded-2xl border border-white/10 bg-[rgba(10,24,52,0.65)] backdrop-blur-[28px] p-5 sm:p-6 space-y-3 shadow-[0_16px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Specular Top Line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          <div className="flex items-center gap-2 text-emerald-400">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">3. Full-Stack Architecture</h3>
          </div>
          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div><strong className="text-emerald-400">Frontend:</strong> React 19, Vite, Tailwind CSS, Recharts, Lucide Icons</div>
            <div><strong className="text-emerald-400">Backend:</strong> Python 3.13, Flask REST API, Flask-CORS</div>
            <div><strong className="text-emerald-400">Persistence:</strong> SQLite with privacy-conscious sanitized hashing</div>
            <div><strong className="text-emerald-400">Analysis:</strong> Heuristic rule engine, Levenshtein edit distance, IDN/Punycode decode</div>
          </div>
        </div>

        {/* Privacy Safeguards */}
        <div className="liquid-glass-card rounded-2xl border border-amber-500/25 bg-[rgba(10,24,52,0.65)] backdrop-blur-[28px] p-5 sm:p-6 space-y-3 shadow-[0_16px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Specular Top Line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />

          <div className="flex items-center gap-2 text-amber-400">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">4. Data Privacy Guarantees</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            To prevent accidental exposure of confidential correspondence, raw email message bodies are never permanently retained in the database. Instead, only a sanitized target snippet, subject line, and SHA-256 cryptographic hash are preserved for auditability.
          </p>
        </div>
      </div>

      {/* Limitations, False Positives & False Negatives */}
      <div className="liquid-glass-card rounded-2xl border border-amber-500/30 bg-[rgba(26,20,14,0.65)] backdrop-blur-[28px] p-5 sm:p-6 space-y-4 shadow-[0_16px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Specular Top Line */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent pointer-events-none" />

        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold font-mono uppercase text-white">
            5. Detection Limitations, False Positives & False Negatives
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-[rgba(6,16,36,0.7)] border border-amber-500/20 space-y-2 shadow-inner">
            <h4 className="font-bold text-amber-400 font-mono uppercase text-[11px]">Potential False Positives</h4>
            <p>
              Legitimate marketing emails and newsletters frequently use URL shorteners, tracking redirects, or generic greetings ("Dear Customer"). These may register elevated medium risk scores even when benign.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[rgba(6,16,36,0.7)] border border-rose-500/20 space-y-2 shadow-inner">
            <h4 className="font-bold text-rose-400 font-mono uppercase text-[11px]">Potential False Negatives</h4>
            <p>
              Newly registered zero-day phishing sites utilizing standard dictionaries on benign domains (e.g., Google Forms or SharePoint phishing) without obvious keywords may produce low heuristic scores until flagged by dynamic sandboxing or threat intelligence feeds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
