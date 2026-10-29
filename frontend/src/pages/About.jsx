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
      <div className="border-b border-[#404E3B]/15 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#7B9669]/20 border border-[#7B9669]/40 rounded-2xl text-[#404E3B] shadow-sm">
            <Info className="w-5 h-5 text-[#404E3B]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#404E3B] font-heading">
              PROJECT ARCHITECTURE & THREAT MODEL
            </h1>
            <p className="text-xs sm:text-sm text-[#6C8480] mt-1 font-sans">
              Technical specifications, detection methodologies, privacy architecture, and operational limitations
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Purpose & Overview */}
        <div className="rounded-2xl border border-[#404E3B]/15 bg-white p-5 sm:p-6 space-y-3 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 text-[#404E3B]">
            <Shield className="w-5 h-5 text-[#7B9669]" />
            <h3 className="text-sm font-bold text-[#404E3B] font-mono uppercase">1. Project Purpose</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#2C3527] leading-relaxed font-sans">
            <strong>PhishShield</strong> is an educational and defensive cybersecurity platform engineered to detect social engineering, credential harvesting, domain spoofing, and malicious link delivery. Designed for security analysts, incident responders, and end-users, it bridges raw threat indicators with actionable guidance.
          </p>
        </div>

        {/* Security & SSRF Prevention */}
        <div className="rounded-2xl border border-[#404E3B]/15 bg-white p-5 sm:p-6 space-y-3 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 text-[#404E3B]">
            <Lock className="w-5 h-5 text-[#7B9669]" />
            <h3 className="text-sm font-bold text-[#404E3B] font-mono uppercase">2. Zero-SSRF Safety Principle</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#2C3527] leading-relaxed font-sans">
            The tool implements strict <strong>offline heuristic analysis</strong>. It parses URL strings and message structures using localized regular expressions and parsing algorithms without making outbound HTTP requests. This eliminates Server-Side Request Forgery (SSRF) vulnerabilities and prevents attacker tracking beacons from being triggered.
          </p>
        </div>

        {/* Technology Stack */}
        <div className="rounded-2xl border border-[#404E3B]/15 bg-white p-5 sm:p-6 space-y-3 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 text-[#404E3B]">
            <Cpu className="w-5 h-5 text-[#7B9669]" />
            <h3 className="text-sm font-bold text-[#404E3B] font-mono uppercase">3. Full-Stack Architecture</h3>
          </div>
          <div className="space-y-2 text-xs font-mono text-[#2C3527]">
            <div><strong className="text-[#404E3B]">Frontend:</strong> React 19, Vite, Tailwind CSS, Recharts, Lucide Icons</div>
            <div><strong className="text-[#404E3B]">Backend:</strong> Python 3.13, Flask REST API, Flask-CORS</div>
            <div><strong className="text-[#404E3B]">Persistence:</strong> SQLite with privacy-conscious sanitized hashing</div>
            <div><strong className="text-[#404E3B]">Analysis:</strong> Heuristic rule engine, Levenshtein edit distance, IDN/Punycode decode</div>
          </div>
        </div>

        {/* Privacy Safeguards */}
        <div className="rounded-2xl border border-[#404E3B]/15 bg-white p-5 sm:p-6 space-y-3 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 text-[#404E3B]">
            <Layers className="w-5 h-5 text-[#7B9669]" />
            <h3 className="text-sm font-bold text-[#404E3B] font-mono uppercase">4. Data Privacy Guarantees</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#2C3527] leading-relaxed font-sans">
            To prevent accidental exposure of confidential correspondence, raw email message bodies are never permanently retained in the database. Instead, only a sanitized target snippet, subject line, and SHA-256 cryptographic hash are preserved for auditability.
          </p>
        </div>
      </div>

      {/* Limitations, False Positives & False Negatives */}
      <div className="rounded-2xl border border-amber-300 bg-white p-5 sm:p-6 space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h3 className="text-sm font-bold font-mono uppercase text-[#404E3B]">
            5. Detection Limitations, False Positives & False Negatives
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#2C3527] leading-relaxed">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
            <h4 className="font-bold text-amber-800 font-mono uppercase text-[11px]">Potential False Positives</h4>
            <p>
              Legitimate marketing emails and newsletters frequently use URL shorteners, tracking redirects, or generic greetings ("Dear Customer"). These may register elevated medium risk scores even when benign.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
            <h4 className="font-bold text-rose-800 font-mono uppercase text-[11px]">Potential False Negatives</h4>
            <p>
              Newly registered zero-day phishing sites utilizing standard dictionaries on benign domains (e.g., Google Forms or SharePoint phishing) without obvious keywords may produce low heuristic scores until flagged by dynamic sandboxing or threat intelligence feeds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
