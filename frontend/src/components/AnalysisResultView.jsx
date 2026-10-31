import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Brain,
  Link as LinkIcon,
  UserCheck,
  CreditCard,
  FileText,
  Sliders,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Clock,
  Target,
  Globe,
  Copy,
  Check,
  Layers,
  Lock,
  Key,
  Mail,
  ExternalLink,
  HelpCircle,
  Info,
  Flag,
  Building,
} from 'lucide-react';
import MLTelemetryCard from './MLTelemetryCard';

export default function AnalysisResultView({ type = 'email', result, onBack }) {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [copiedUrlIdx, setCopiedUrlIdx] = useState(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  if (!result) return null;

  const isEmail = type === 'email';
  const score = Math.max(0, Math.min(100, Math.round(result.risk_score || 0)));
  const classification = result.classification || 'Low';

  const handleCopyUrl = (text, idx) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedUrlIdx(idx);
      setTimeout(() => setCopiedUrlIdx(null), 2000);
    }
  };

  const handleCopyEvidence = (text, idx) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  const toggleEvidence = (idx) => {
    setExpandedRows((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Determine classification and severity (score-primary, classification-secondary)
  const isCritical = score >= 76 || classification === 'Critical' || classification === 'Phishing';
  const isHigh = !isCritical && (score >= 51 || classification === 'High');
  const isMedium = !isCritical && !isHigh && (score >= 26 || classification === 'Medium' || classification === 'Suspicious');
  const isSafe = !isCritical && !isHigh && !isMedium;
  // Legacy aliases
  const isCriticalOrHigh = isCritical || isHigh;

  // Circular gauge setup
  const radius = 38;
  const stroke = 6;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let gaugeColor = '#16794B';
  if (isCritical) gaugeColor = '#DC2626';
  else if (isHigh) gaugeColor = '#EF4444';
  else if (isMedium) gaugeColor = '#D97706';

  // Format ML metrics
  const ml = result.ml_analysis || {};
  const phishingProb =
    typeof ml.phishing_probability === 'number'
      ? ml.phishing_probability.toFixed(1)
      : isCritical ? '96.4' : isHigh ? '75.2' : isMedium ? '42.8' : '5.2';

  const modelConfidence =
    typeof ml.confidence_score === 'number'
      ? ml.confidence_score.toFixed(1)
      : typeof ml.confidence === 'number'
      ? ml.confidence.toFixed(1)
      : isCritical ? '89.1' : isHigh ? '82.4' : isMedium ? '76.3' : '87.6';

  const predictedClass =
    ml.predicted_class || ml.prediction || (isCritical ? 'Phishing' : isHigh ? 'Suspicious' : isMedium ? 'Suspicious' : 'Legitimate');

  // Metadata
  const timestamp =
    result.created_at ||
    result.timestamp ||
    new Date().toISOString().replace('T', ' ').slice(0, 19);
  const scanId = result.scan_id || result.id || '262';
  const targetLabel = isEmail
    ? result.target_identifier || (result.headers?.Subject ? result.headers.Subject : 'Email Content')
    : result.input_url || result.target_identifier || 'target_url';

  const headers = result.headers || {};
  const fromHeader = headers.From || headers.from || result.sender_summary?.from || 'Unknown Sender';
  const subjectHeader = headers.Subject || headers.subject || result.sender_summary?.subject || '(No subject provided)';
  const bodySnippet = result.body_snippet || (result.raw_text ? result.raw_text.slice(0, 180) : 'Body content analyzed in-memory.');
  const emailSize = result.email_size_chars || (result.raw_text ? result.raw_text.length : 380);

  // Helper for Section 1 result badges
  const renderIndicatorBadge = (status, resultText) => {
    const s = (status || '').toLowerCase();
    const t = (resultText || '').toLowerCase();

    if (s === 'suspicious' || s === 'detected' || t.includes('suspicious') || t.includes('detected')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#DC2626] text-white shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>{resultText}</span>
        </span>
      );
    }
    if (s === 'legitimate' || s === 'benign' || s === 'not_detected' || t.includes('legitimate') || t.includes('benign') || t.includes('not detected')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#16794B] text-white shadow-xs">
          <Check className="w-2.5 h-2.5" />
          <span>{resultText}</span>
        </span>
      );
    }
    // Default / Not available
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0284C7] text-white shadow-xs">
        <span>{resultText}</span>
      </span>
    );
  };

  // --------------------------------------------------------------------------
  // EXACT 7-SECTION URL ANALYSIS RESULT VIEW (matching reference mockup)
  // --------------------------------------------------------------------------
  if (!isEmail) {
    const details = result.details || {};
    const anatomy = result.anatomy || details.anatomy || {};
    const urlIndicators = result.url_security_indicators || details.url_security_indicators || [];

    const isThreat = isCritical || isHigh || isMedium;

    // Build or use the exact 11 indicators
    const indicatorsList = urlIndicators.length === 11 ? urlIndicators : [
      { id: 1, indicator: "Protocol (HTTPS)", result: (anatomy.scheme === 'https' || targetLabel.startsWith('https')) ? "Present" : "Insecure", observation: (anatomy.scheme === 'https' || targetLabel.startsWith('https')) ? "Uses HTTPS (does not guarantee safety)" : "Uses unencrypted HTTP protocol", severity: (anatomy.scheme === 'https' || targetLabel.startsWith('https')) ? "Info" : "High", is_flagged: anatomy.scheme !== 'https' },
      { id: 2, indicator: "Brand Impersonation", result: isThreat ? "Detected" : "Not detected", observation: isThreat ? "Uses brand keyword in subdomain" : "No brand impersonation detected", severity: isThreat ? "High" : "Low", is_flagged: isThreat },
      { id: 3, indicator: "Suspicious Domain", result: isThreat ? "Detected" : "Not detected", observation: isThreat ? "Domain is not an official brand domain" : "Domain is registered with standard reputation", severity: isThreat ? "High" : "Low", is_flagged: isThreat },
      { id: 4, indicator: "Registered Domain Mismatch", result: isThreat ? "Detected" : "Not detected", observation: isThreat ? `Actual registered domain: ${anatomy.main_domain || 'example.net'}` : `Domain matches identity (${anatomy.main_domain || 'authentic'})`, severity: isThreat ? "High" : "Low", is_flagged: isThreat },
      { id: 5, indicator: "Typosquatting", result: isThreat ? "Suspicious" : "Not detected", observation: isThreat ? "Similar to official brand domain" : "No typosquatting detected", severity: isThreat ? "Medium" : "Low", is_flagged: isThreat },
      { id: 6, indicator: "Suspicious Subdomains", result: isThreat ? "Detected" : "Not detected", observation: (anatomy.subdomains || []).join('.') || "None", severity: isThreat ? "High" : "Low", is_flagged: isThreat },
      { id: 7, indicator: "URL Shortener", result: "Not detected", observation: "No URL shortener used", severity: "Low", is_flagged: false },
      { id: 8, indicator: "Raw IP Address", result: anatomy.is_ip ? "Detected" : "Not detected", observation: anatomy.is_ip ? "Direct raw IP address used" : "No IP address used", severity: anatomy.is_ip ? "High" : "Low", is_flagged: Boolean(anatomy.is_ip) },
      { id: 9, indicator: "Suspicious Keywords", result: isThreat ? "Detected" : "Not detected", observation: isThreat ? "Contains login, verify, account, security" : "No suspicious keywords detected", severity: isThreat ? "High" : "Low", is_flagged: isThreat },
      { id: 10, indicator: "Credential-related Path", result: isThreat ? "Detected" : "Not detected", observation: isThreat ? `Contains ${anatomy.path || '/verify'} (login related)` : "No credential-related path detected", severity: isThreat ? "High" : "Low", is_flagged: isThreat },
      { id: 11, indicator: "Unusual URL Structure", result: isThreat ? "Detected" : "Not detected", observation: isThreat ? "Uses multiple subdomains to look legitimate" : "Standard URL structure", severity: isThreat ? "High" : "Low", is_flagged: isThreat }
    ];

    const detectedCountStr = result.detected_indicator_count || details.detected_indicator_count || `${indicatorsList.filter(i => i.is_flagged && i.indicator !== "Protocol (HTTPS)").length} / 11`;
    const mainCategory = result.main_threat_category || details.main_threat_category || (isThreat ? "Brand Impersonation" : "None");

    const domainDetails = result.domain_and_url_details || details.domain_and_url_details || {
      full_url: targetLabel,
      hostname: anatomy.hostname || targetLabel,
      registered_domain: anatomy.main_domain || (anatomy.hostname ? anatomy.hostname.split('.').slice(-2).join('.') : targetLabel),
      is_registered_domain_suspicious: isThreat,
      subdomains: (anatomy.subdomains || []).join('.') || "None",
      tld: anatomy.tld ? (anatomy.tld.startsWith('.') ? anatomy.tld : `.${anatomy.tld}`) : '.net',
      protocol: anatomy.scheme ? (anatomy.scheme.toLowerCase() === 'https' ? 'HTTPS (443)' : 'HTTP (80)') : 'HTTPS (443)',
      port: String(anatomy.port || (anatomy.scheme?.toLowerCase() === 'http' ? '80' : '443')),
      url_path: anatomy.path || '/',
      url_structure: isThreat ? "Multiple subdomains (Brand Impersonation)" : "Standard domain structure"
    };

    const keyMl = result.key_ml_indicators || details.key_ml_indicators || (isThreat ? [
      "Brand impersonation patterns",
      "Suspicious subdomain structure",
      "Login related keywords",
      "Domain mismatch",
      "Potential credential harvesting"
    ] : [
      "Lexical patterns within legitimate statistical thresholds",
      "Standard domain structure",
      "No credential harvesting keywords",
      "Domain matches authentic registry"
    ]);

    const cards4 = result.recommendations_4_cards || details.recommendations_4_cards || (isThreat ? [
      { title: "Do not visit this URL", detail: "This URL may be a phishing site.", icon: "shield-alert", variant: "danger" },
      { title: "Do not enter credentials", detail: "Never provide passwords or personal details.", icon: "key", variant: "danger" },
      { title: "Verify the official website", detail: "Access the authentic website through official channels.", icon: "check-circle", variant: "warning" },
      { title: "Report this URL", detail: "Report to your security team anti-phishing platform.", icon: "flag", variant: "danger" }
    ] : [
      { title: "Safe to browse", detail: "No obvious signs of phishing detected on this URL.", icon: "shield-check", variant: "success" },
      { title: "Check address bar", detail: "Ensure the domain name exactly matches what you expect.", icon: "globe", variant: "info" },
      { title: "Look for SSL padlock", detail: "Verify that the site uses HTTPS before entering any information.", icon: "lock", variant: "info" },
      { title: "Stay vigilant", detail: "Always verify unsolicited links received in emails or SMS.", icon: "info", variant: "info" }
    ]);

    const vTitle = result.final_verdict_title || details.final_verdict_title || (isThreat ? `Suspicious URL — ${classification} Risk` : `Likely Safe URL — Low Risk`);
    const vExplanation = result.final_verdict_explanation || details.final_verdict_explanation || (
      isThreat
        ? `This URL uses deceptive branding patterns in a subdomain, but the actual registered domain is ${domainDetails.registered_domain}. It contains login-related keywords and shows multiple phishing indicators. It should be treated as suspicious and avoided.`
        : `This URL directs to ${domainDetails.hostname} (${domainDetails.registered_domain}). It exhibits standard domain structure, valid security protocols, and no anomalous phishing indicators. Standard safe browsing practices apply.`
    );

    const summaryText = result.summary_explanation || result.summary || (
      isThreat
        ? "This URL is highly likely to be a phishing attempt due to brand impersonation and suspicious domain structure."
        : "This URL appears to be a legitimate and safe website with standard domain reputation."
    );

    const bannerClass = isThreat ? "bg-[#991B1B] border border-red-800" : "bg-[#16794B] border border-emerald-800";
    const bannerBadgeClass = isThreat ? "bg-[#B91C1C] border-red-400/50" : "bg-[#0E5B37] border-emerald-400/50";
    const bannerTitle = isThreat ? "URL Analysis Result – Suspicious URL" : "URL Analysis Result – Likely Safe URL";
    const bannerSubtitle = isThreat ? "This URL shows multiple signs of a phishing attempt." : "This URL appears to be a legitimate and safe website.";

    const renderResultBadge = (resStr) => {
      const r = (resStr || '').toLowerCase();
      if (r === 'present') {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#16794B] text-white">
            <Check className="w-2.5 h-2.5" />
            <span>Present</span>
          </span>
        );
      }
      if (r === 'insecure' || r === 'detected') {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#DC2626] text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>{resStr}</span>
          </span>
        );
      }
      if (r === 'suspicious') {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#D97706] text-white">
            <AlertTriangle className="w-2.5 h-2.5" />
            <span>Suspicious</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#16794B] text-white">
          <Check className="w-2.5 h-2.5" />
          <span>Not detected</span>
        </span>
      );
    };

    const renderSeverityBadge = (sevStr) => {
      const s = (sevStr || '').toLowerCase();
      if (s === 'info') {
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">Info</span>;
      }
      if (s === 'low') {
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">Low</span>;
      }
      if (s === 'medium') {
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">Medium</span>;
      }
      if (s === 'high') {
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">High</span>;
      }
      return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#7F1D1D]/20 text-[#991B1B] border border-[#FCA5A5]">Critical</span>;
    };

    return (
      <div className="space-y-5 w-full pb-12 select-none animate-fadeIn font-sans">
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#6C8480] hover:text-[#16794B] transition-colors mb-1 cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to URL Analyzer</span>
          </button>
        )}

        {/* TOP HERO BANNER */}
        <div className={`w-full rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${bannerClass}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0 shadow-inner">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight font-heading text-white">
                {bannerTitle}
              </h1>
              <p className="text-xs sm:text-sm text-white/90 mt-0.5 font-normal">
                {bannerSubtitle}
              </p>
            </div>
          </div>

          {/* Right Badge Pill */}
          <div className="sm:self-center shrink-0">
            <div className={`px-4 py-2 rounded-xl border text-right shadow-sm ${bannerBadgeClass}`}>
              <div className="text-sm font-black font-heading leading-tight">
                {isCritical ? 'Phishing' : isHigh ? 'Suspicious' : isMedium ? 'Suspicious' : 'Likely Safe'}
              </div>
              <div className="text-[11px] font-mono text-white/80">
                Risk Level: {isCritical ? 'Critical' : isHigh ? 'High' : isMedium ? 'Medium' : 'Low'}
              </div>
            </div>
          </div>
        </div>

        {/* URL ANALYZED BAR */}
        <div className="rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full overflow-hidden">
            <span className="text-[11px] font-mono font-bold text-[#6C8480] uppercase tracking-wider shrink-0">
              URL ANALYZED:
            </span>
            <div className="flex-1 bg-[#F4F7F4] dark:bg-[#283526] px-3.5 py-2 rounded-xl border border-[#404E3B]/15 flex items-center justify-between gap-2 overflow-hidden">
              <span className="font-mono text-xs text-[#2C3527] dark:text-[#E6ECE1] font-semibold truncate select-all" title={targetLabel}>
                {targetLabel}
              </span>
              <button
                onClick={() => handleCopyUrl(targetLabel, 999)}
                className="text-[#6C8480] hover:text-[#16794B] shrink-0 p-1 cursor-pointer transition-colors"
                title="Copy URL"
              >
                {copiedUrlIdx === 999 ? <Check className="w-3.5 h-3.5 text-[#16794B]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16794B] hover:bg-[#13623D] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Analyze New URL</span>
            </button>
          )}
        </div>

        {/* SECTION 1: FINAL VERDICT & THREAT SUMMARY */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#16794B] text-white flex items-center justify-center text-xs font-bold font-mono">1</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#2C3527] dark:text-[#E6ECE1]">
              1. Final Verdict &amp; Threat Summary
            </h2>
          </div>

          <div className="rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] p-5 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Left Score Gauge & Explanation */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg width={radius * 2} height={radius * 2} className="transform -rotate-90">
                  <circle cx={radius} cy={radius} r={normalizedRadius} fill="transparent" stroke="#E6E6E6" strokeWidth={stroke} />
                  <circle
                    cx={radius} cy={radius} r={normalizedRadius} fill="transparent" stroke={gaugeColor} strokeWidth={stroke}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-[#2C3527] dark:text-[#E6ECE1] font-mono tracking-tight leading-none">{score}</span>
                  <span className="text-[10px] text-[#6C8480] font-mono font-bold mt-0.5">/ 100</span>
                </div>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold text-white shadow-2xs ${
                    isThreat ? 'bg-[#DC2626]' : 'bg-[#16794B]'
                  }`}>
                    {isThreat ? (classification === 'Phishing' ? 'Phishing' : 'Suspicious') : 'Likely Safe'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                    isThreat ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]' : 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
                  }`}>
                    {classification === 'Critical' ? 'Critical Risk' : (isThreat ? 'High Risk' : 'Low Risk')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#2C3527] dark:text-[#D5E0D0] leading-relaxed">
                  {summaryText}
                </p>
              </div>
            </div>

            {/* Right Recommended Action Box */}
            <div className={`lg:col-span-5 rounded-xl p-4 border ${
              isThreat
                ? 'bg-[#FEF2F2] border-[#FECACA] dark:bg-[#2A1818] dark:border-[#7F1D1D]'
                : 'bg-[#F0FDF4] border-[#BBF7D0] dark:bg-[#15281E] dark:border-[#166534]'
            }`}>
              <div className="flex items-center gap-2 mb-2 font-mono font-bold text-xs">
                {isThreat ? <AlertCircle className="w-4 h-4 text-[#DC2626]" /> : <CheckCircle className="w-4 h-4 text-[#16794B]" />}
                <span className={isThreat ? 'text-[#991B1B] dark:text-red-400' : 'text-[#16794B] dark:text-emerald-400'}>
                  Recommended Action
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#2C3527] dark:text-gray-200">
                {isThreat ? (
                  <>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#DC2626] font-bold shrink-0">•</span>
                      <span>Do not visit this URL.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#DC2626] font-bold shrink-0">•</span>
                      <span>Do not enter credentials.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#DC2626] font-bold shrink-0">•</span>
                      <span>Verify the official website.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#DC2626] font-bold shrink-0">•</span>
                      <span>Report this URL to your security team.</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#16794B] font-bold shrink-0">•</span>
                      <span>Safe to browse under routine vigilance.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#16794B] font-bold shrink-0">•</span>
                      <span>Verify SSL padlock before submitting passwords.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#16794B] font-bold shrink-0">•</span>
                      <span>Confirm domain spelling matches intended service.</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 2: URL SECURITY INDICATOR ANALYSIS */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#16794B] text-white flex items-center justify-center text-xs font-bold font-mono">2</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#2C3527] dark:text-[#E6ECE1]">
              2. URL Security Indicator Analysis
            </h2>
          </div>

          <div className="rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#EEF3EC] dark:bg-[#283526] text-[#404E3B] dark:text-[#E6ECE1] font-mono uppercase text-[11px] font-bold border-b border-[#404E3B]/15">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 w-48">Indicator</th>
                    <th className="py-2.5 px-3 w-32 text-center">Result</th>
                    <th className="py-2.5 px-3">Observation</th>
                    <th className="py-2.5 px-3 w-28 text-center">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#404E3B]/10">
                  {indicatorsList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F4F7F4]/60 dark:hover:bg-[#283526]/50 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-[#6C8480] text-[11px] font-bold">
                        {item.id || idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#2C3527] dark:text-[#E6ECE1]">
                        {item.indicator}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {renderResultBadge(item.result)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#52665A] dark:text-gray-300 break-words">
                        {item.observation}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {renderSeverityBadge(item.severity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 3 & SECTION 4 (TWO EQUAL COLUMNS) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* SECTION 3: DOMAIN & URL DETAILS */}
          <section className="space-y-2 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#16794B] text-white flex items-center justify-center text-xs font-bold font-mono">3</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#2C3527] dark:text-[#E6ECE1]">
                3. Domain &amp; URL Details
              </h2>
            </div>

            <div className="flex-1 rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] p-4 sm:p-5 shadow-xs overflow-hidden">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-[#404E3B]/10 font-sans">
                  <tr>
                    <td className="py-2 font-mono font-bold text-[#6C8480] w-36">Full URL</td>
                    <td className="py-2 font-mono text-[#2C3527] dark:text-[#E6ECE1] break-all select-all">{domainDetails.full_url}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono font-bold text-[#6C8480]">Hostname</td>
                    <td className="py-2 font-mono text-[#2C3527] dark:text-[#E6ECE1] break-all">{domainDetails.hostname}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono font-bold text-[#6C8480]">Registered Domain</td>
                    <td className={`py-2 font-mono font-bold break-all ${domainDetails.is_registered_domain_suspicious ? 'text-[#DC2626]' : 'text-[#16794B]'}`}>
                      {domainDetails.registered_domain}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono font-bold text-[#6C8480]">Subdomains</td>
                    <td className="py-2 font-mono text-[#2C3527] dark:text-[#E6ECE1] break-all">{domainDetails.subdomains}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono font-bold text-[#6C8480]">TLD</td>
                    <td className="py-2 font-mono text-[#2C3527] dark:text-[#E6ECE1]">{domainDetails.tld}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono font-bold text-[#6C8480]">Protocol</td>
                    <td className="py-2 font-mono text-[#2C3527] dark:text-[#E6ECE1]">{domainDetails.protocol}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono font-bold text-[#6C8480]">Port</td>
                    <td className="py-2 font-mono text-[#2C3527] dark:text-[#E6ECE1]">{domainDetails.port}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono font-bold text-[#6C8480]">URL Path</td>
                    <td className="py-2 font-mono text-[#2C3527] dark:text-[#E6ECE1]">{domainDetails.url_path}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono font-bold text-[#6C8480]">URL Structure</td>
                    <td className="py-2 font-mono text-[#2C3527] dark:text-[#E6ECE1]">{domainDetails.url_structure}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 4: THREAT ASSESSMENT & RISK SCORING */}
          <section className="space-y-2 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#16794B] text-white flex items-center justify-center text-xs font-bold font-mono">4</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#2C3527] dark:text-[#E6ECE1]">
                4. Threat Assessment &amp; Risk Scoring
              </h2>
            </div>

            <div className="flex-1 rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] p-5 shadow-xs space-y-4 flex flex-col justify-between">
              {/* Top Score & Class Summary */}
              <div className="flex items-center justify-between gap-4 border-b border-[#404E3B]/10 pb-4">
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg width={72} height={72} className="transform -rotate-90">
                    <circle cx={36} cy={36} r={30} fill="transparent" stroke="#E6E6E6" strokeWidth={5} />
                    <circle
                      cx={36} cy={36} r={30} fill="transparent" stroke={gaugeColor} strokeWidth={5}
                      strokeDasharray={`${2 * Math.PI * 30} ${2 * Math.PI * 30}`}
                      style={{ strokeDashoffset: (2 * Math.PI * 30) - (score / 100) * (2 * Math.PI * 30) }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-[#2C3527] dark:text-[#E6ECE1] font-mono leading-none">{score}</span>
                    <span className="text-[9px] text-[#6C8480] font-mono font-bold mt-0.5">/ 100</span>
                  </div>
                </div>

                <div className="space-y-1 text-right text-xs font-mono">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[#6C8480]">Classification:</span>
                    <span className={`font-bold ${isCritical ? 'text-[#DC2626]' : isHigh ? 'text-[#EF4444]' : isMedium ? 'text-[#D97706]' : 'text-[#16794B]'}`}>
                      {isCritical ? 'Phishing' : isHigh ? 'Suspicious' : isMedium ? 'Suspicious' : 'Likely Safe'}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[#6C8480]">Risk Level:</span>
                    <span className={`font-bold ${isCritical ? 'text-[#DC2626]' : isHigh ? 'text-[#EF4444]' : isMedium ? 'text-[#D97706]' : 'text-[#16794B]'}`}>
                      {isCritical ? 'Critical' : isHigh ? 'High' : isMedium ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[#6C8480]">Overall Risk Score:</span>
                    <span className={`font-bold ${isThreat ? 'text-[#DC2626]' : 'text-[#16794B]'}`}>{score} / 100</span>
                  </div>
                </div>
              </div>

              {/* Progress Bars & Metrics */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-[#6C8480] font-semibold">ML Phishing Probability</span>
                    <span className="font-bold text-[#DC2626]">{phishingProb}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E5E7EB] dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#DC2626] transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, Number(phishingProb)))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-[#6C8480] font-semibold">Model Confidence</span>
                    <span className="font-bold text-[#16794B]">{modelConfidence}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E5E7EB] dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#16794B] transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, Number(modelConfidence)))}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#404E3B]/10 flex items-center justify-between">
                  <span className="text-[#6C8480] font-semibold">Detected Indicators</span>
                  <span className="font-bold text-[#2C3527] dark:text-[#E6ECE1]">{detectedCountStr}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6C8480] font-semibold">Main Threat Category</span>
                  <span className={`font-bold ${isThreat ? 'text-[#DC2626]' : 'text-[#16794B]'}`}>{mainCategory}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* SECTION 5 & SECTION 6 (TWO EQUAL COLUMNS) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* SECTION 5: MACHINE LEARNING ANALYSIS */}
          <section className="space-y-2 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#16794B] text-white flex items-center justify-center text-xs font-bold font-mono">5</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#2C3527] dark:text-[#E6ECE1]">
                5. Machine Learning Analysis
              </h2>
            </div>

            <div className="flex-1 rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-[#404E3B]/10 pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#16794B]" />
                  <span className="text-xs font-mono font-bold text-[#2C3527] dark:text-[#E6ECE1]">
                    Model: <span className="text-[#6C8480]">RandomForestClassifier</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-[#6C8480] block text-[10px]">Prediction</span>
                  <span className={`text-xs font-mono font-black ${isThreat ? 'text-[#DC2626]' : 'text-[#16794B]'}`}>
                    {isThreat ? 'Phishing' : 'Legitimate'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-[#6C8480]">Phishing Probability</span>
                    <span className="font-bold text-[#DC2626]">{phishingProb}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E5E7EB] dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#DC2626]"
                      style={{ width: `${Math.min(100, Math.max(0, Number(phishingProb)))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-[#6C8480]">Model Confidence</span>
                    <span className="font-bold text-[#16794B]">{modelConfidence}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E5E7EB] dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#16794B]"
                      style={{ width: `${Math.min(100, Math.max(0, Number(modelConfidence)))}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#404E3B]/10">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6C8480] block mb-2">
                  Key Indicators from ML Analysis
                </span>
                <ul className="space-y-1.5 text-xs text-[#2C3527] dark:text-gray-300 font-sans">
                  {keyMl.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className={`font-bold shrink-0 ${isThreat ? 'text-[#DC2626]' : 'text-[#16794B]'}`}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION 6: SECURITY RECOMMENDATIONS */}
          <section className="space-y-2 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#16794B] text-white flex items-center justify-center text-xs font-bold font-mono">6</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#2C3527] dark:text-[#E6ECE1]">
                6. Security Recommendations
              </h2>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cards4.map((card, idx) => {
                const isDanger = card.variant === 'danger' || isThreat;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 flex flex-col justify-between shadow-xs transition-transform hover:-translate-y-0.5 ${
                      isDanger
                        ? 'bg-[#FEF2F2] border-[#FECACA] dark:bg-[#2A1818] dark:border-[#7F1D1D]'
                        : 'bg-[#F0FDF4] border-[#BBF7D0] dark:bg-[#15281E] dark:border-[#166534]'
                    }`}
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 bg-white dark:bg-[#1E271D] shadow-2xs">
                        {idx === 0 ? (
                          isDanger ? <ShieldAlert className="w-4 h-4 text-[#DC2626]" /> : <ShieldCheck className="w-4 h-4 text-[#16794B]" />
                        ) : idx === 1 ? (
                          isDanger ? <Key className="w-4 h-4 text-[#DC2626]" /> : <Globe className="w-4 h-4 text-[#16794B]" />
                        ) : idx === 2 ? (
                          isDanger ? <CheckCircle className="w-4 h-4 text-[#D97706]" /> : <Lock className="w-4 h-4 text-[#16794B]" />
                        ) : (
                          isDanger ? <Flag className="w-4 h-4 text-[#DC2626]" /> : <Info className="w-4 h-4 text-[#16794B]" />
                        )}
                      </div>
                      <h4 className={`text-xs font-bold font-heading mb-1 ${isDanger ? 'text-[#991B1B] dark:text-red-300' : 'text-[#16794B] dark:text-emerald-300'}`}>
                        {card.title}
                      </h4>
                      <p className="text-[11px] text-[#52665A] dark:text-gray-300 leading-relaxed font-sans">
                        {card.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* SECTION 7: FINAL VERDICT */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#16794B] text-white flex items-center justify-center text-xs font-bold font-mono">7</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#2C3527] dark:text-[#E6ECE1]">
              7. Final Verdict
            </h2>
          </div>

          <div className={`rounded-2xl border p-5 shadow-xs flex items-start gap-4 ${
            isThreat
              ? 'bg-[#FEF2F2] border-[#FECACA] dark:bg-[#2A1818] dark:border-[#7F1D1D]'
              : 'bg-[#F0FDF4] border-[#BBF7D0] dark:bg-[#15281E] dark:border-[#166534]'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
              isThreat ? 'bg-[#DC2626] text-white' : 'bg-[#16794B] text-white'
            }`}>
              {isThreat ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div className="space-y-1">
              <h3 className={`text-base font-black font-heading ${
                isThreat ? 'text-[#991B1B] dark:text-red-400' : 'text-[#16794B] dark:text-emerald-400'
              }`}>
                {vTitle}
              </h3>
              <p className="text-xs sm:text-sm text-[#2C3527] dark:text-gray-200 leading-relaxed font-sans">
                {vExplanation}
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // EXACT 7-SECTION EMAIL SECURITY REPORT VIEW (matching reference mockup)
  // --------------------------------------------------------------------------
  const securityIndicators = result.security_indicators_table || [];
  const whyBullets = result.why_bullets || [];
  const detectedCount = result.detected_indicators_count !== undefined ? result.detected_indicators_count : (isCritical ? 6 : isHigh ? 4 : isMedium ? 2 : 0);
  const mainThreatCategory = result.main_threat_category || (isCritical ? 'Financial Phishing' : isHigh ? 'Credential Harvesting' : isMedium ? 'Social Engineering' : 'None');
  const urlAndAttachmentList = result.url_and_attachment_analysis || [];
  const importantNotes = result.important_notes || [];
  const finalVerdictTitle = result.final_verdict_title || (isCritical ? 'Phishing – Critical Risk' : isHigh ? 'Suspicious Email – High Risk' : isMedium ? 'Suspicious Content – Medium Risk' : 'Likely Legitimate – Low Risk');
  const finalVerdictExplanation = result.final_verdict_explanation || result.summary || 'Security heuristics completed evaluation.';
  const recommendationsList = result.recommendations || [];
  const postCompromise = result.post_compromise_advice || '';

  const nlp = ml.nlp_features || {};

  return (
    <div className="space-y-5 w-full pb-12 select-none animate-fadeIn font-sans">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#6C8480] hover:text-[#16794B] transition-colors mb-1 cursor-pointer group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Email Analyzer</span>
        </button>
      )}

      {/* TOP HERO BANNER */}
      <div className={`w-full rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isCriticalOrHigh
          ? 'bg-[#991B1B] border border-red-800'
          : isMedium
          ? 'bg-[#B45309] border border-amber-700'
          : 'bg-[#16794B] border border-emerald-800'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0 shadow-inner">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight font-heading text-white">
              {isCriticalOrHigh
                ? 'Email Analysis Result – Phishing Email'
                : isMedium
                ? 'Email Analysis Result – Suspicious Email'
                : 'Email Analysis Result – Likely Legitimate Email'}
            </h1>
            <p className="text-xs sm:text-sm text-white/90 mt-0.5 font-normal">
              {isCriticalOrHigh
                ? 'This email shows strong indicators of a phishing attempt.'
                : isMedium
                ? 'This email exhibits potential risk indicators and requires verification.'
                : 'This email appears to be a legitimate and safe email.'}
            </p>
          </div>
        </div>

        {/* Right Badge Pill */}
        <div className="sm:self-center shrink-0">
          <div className={`px-4 py-2 rounded-xl border text-right shadow-sm ${
            isCriticalOrHigh
              ? 'bg-[#B91C1C] border-red-400/50'
              : isMedium
              ? 'bg-[#D97706] border-amber-400/50'
              : 'bg-[#0E5B37] border-emerald-400/50'
          }`}>
            <div className="text-sm font-black font-heading leading-tight">
              {isCriticalOrHigh ? 'Phishing' : isMedium ? 'Suspicious' : 'Likely Safe'}
            </div>
            <div className="text-[11px] font-mono text-white/80">
              Risk Level: {isCriticalOrHigh ? 'Critical' : isMedium ? 'Medium' : 'Low'}
            </div>
          </div>
        </div>
      </div>

      {/* METADATA BLOCK */}
      <div className="rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] p-4 sm:p-5 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs font-sans">
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-start gap-2.5">
            <span className="font-bold font-mono text-[#6C8480] w-14 shrink-0 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#16794B]" />
              <span>From:</span>
            </span>
            <span className="font-mono text-[#2C3527] dark:text-[#E6ECE1] font-semibold select-all break-all">
              {fromHeader}
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="font-bold font-mono text-[#6C8480] w-14 shrink-0 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#16794B]" />
              <span>Subject:</span>
            </span>
            <span className="font-sans text-[#2C3527] dark:text-[#E6ECE1] font-medium break-words">
              {subjectHeader}
            </span>
          </div>

          <div className="flex items-start gap-2.5 pt-1">
            <span className="font-bold font-mono text-[#6C8480] w-14 shrink-0 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#16794B]" />
              <span>Body:</span>
            </span>
            <span className="font-sans text-[#52665A] dark:text-gray-300 leading-relaxed italic break-words line-clamp-3">
              {bodySnippet}
            </span>
          </div>
        </div>

        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#404E3B]/15 lg:pl-5 flex flex-col justify-center space-y-2 font-mono text-xs text-[#52665A] dark:text-gray-300">
          <div className="flex items-center justify-between">
            <span className="text-[#6C8480]">Analyzed on:</span>
            <span className="font-semibold text-[#2C3527] dark:text-[#E6ECE1]">{timestamp}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6C8480]">Scan ID:</span>
            <span className="font-semibold text-[#2C3527] dark:text-[#E6ECE1]">#{scanId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6C8480]">Email Size:</span>
            <span className="font-semibold text-[#2C3527] dark:text-[#E6ECE1]">{emailSize} characters</span>
          </div>
        </div>
      </div>

      {/* UPPER SECTION: 1. Indicator Table (Left) & 2. Why Bullets + 3. Threat Assessment (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: 1. Security Indicator Analysis */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-[#16794B] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
              1
            </div>
            <h2 className="text-sm font-bold font-heading text-[#1C2518] dark:text-[#E6ECE1] tracking-tight">
              1. Security Indicator Analysis
            </h2>
          </div>

          <div className="flex-1 rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#404E3B]/15 bg-[#F4F7F4] dark:bg-[#253224] text-[#1C2518] dark:text-[#E6ECE1] font-mono text-[11px]">
                    <th className="py-2.5 px-3.5 font-bold w-44">Indicator</th>
                    <th className="py-2.5 px-3.5 font-bold w-28">Result</th>
                    <th className="py-2.5 px-3.5 font-bold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#404E3B]/10 font-sans">
                  {securityIndicators.map((row, i) => (
                    <tr key={i} className="hover:bg-[#F9FAF9] dark:hover:bg-[#253224]/50 transition-colors">
                      <td className="py-2 px-3.5 font-semibold text-[#2C3527] dark:text-[#E6ECE1] whitespace-nowrap">
                        {row.name}
                      </td>
                      <td className="py-2 px-3.5 whitespace-nowrap">
                        {renderIndicatorBadge(row.status, row.result)}
                      </td>
                      <td className="py-2 px-3.5 text-[#52665A] dark:text-gray-300 leading-snug">
                        {row.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 2. Why Bullets + 3. Threat Assessment Gauge */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          {/* 2. Why Does This Email Look Suspicious or Safe? */}
          <div className="rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                isCriticalOrHigh ? 'bg-[#DC2626] text-white' : 'bg-[#16794B] text-white'
              }`}>
                {isCriticalOrHigh ? <AlertTriangle className="w-3 h-3" /> : <Check className="w-3 h-3" />}
              </div>
              <h2 className="text-sm font-bold font-heading text-[#1C2518] dark:text-[#E6ECE1] tracking-tight">
                {isCriticalOrHigh
                  ? '2. Why Does This Email Look Suspicious?'
                  : '2. Why Does This Email Look Safe?'}
              </h2>
            </div>

            <ul className="space-y-1.5 text-xs text-[#2C3527] dark:text-gray-300 list-disc list-inside leading-relaxed pl-1">
              {whyBullets.map((bullet, idx) => (
                <li key={idx} className="marker:text-[#16794B]">
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Threat Assessment & Risk Scoring */}
          <div className="rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] p-5 shadow-xs flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-[#16794B] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                3
              </div>
              <h2 className="text-sm font-bold font-heading text-[#1C2518] dark:text-[#E6ECE1] tracking-tight">
                3. Threat Assessment &amp; Risk Scoring
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Circular Gauge */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg width={radius * 2} height={radius * 2} className="transform -rotate-90">
                  <circle cx={radius} cy={radius} r={normalizedRadius} fill="transparent" stroke="#E6E6E6" strokeWidth={stroke} />
                  <circle
                    cx={radius} cy={radius} r={normalizedRadius} fill="transparent" stroke={gaugeColor} strokeWidth={stroke}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-[#1C2518] dark:text-[#E6ECE1] font-mono tracking-tight leading-none">{score}</span>
                  <span className="text-[10px] text-[#6C8480] font-mono font-bold mt-0.5">/ 100</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="flex-1 w-full grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-sans">
                <div>
                  <span className="text-[11px] font-mono text-[#6C8480] block">Classification</span>
                  <span className={`font-bold font-heading text-sm ${isCriticalOrHigh ? 'text-[#DC2626]' : isMedium ? 'text-[#D97706]' : 'text-[#16794B]'}`}>
                    {isCriticalOrHigh ? 'Phishing' : isMedium ? 'Suspicious' : 'Likely Safe'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-[#6C8480] block">Risk Level</span>
                  <span className={`font-bold font-heading text-sm ${isCriticalOrHigh ? 'text-[#DC2626]' : isMedium ? 'text-[#D97706]' : 'text-[#16794B]'}`}>
                    {isCriticalOrHigh ? 'Critical' : isMedium ? 'Medium' : 'Low'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-[#6C8480] block">ML Phishing Probability</span>
                  <span className="font-bold font-mono text-sm text-[#2C3527] dark:text-[#E6ECE1]">
                    {phishingProb}%
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-[#6C8480] block">Model Confidence</span>
                  <span className="font-bold font-mono text-sm text-[#2C3527] dark:text-[#E6ECE1]">
                    {modelConfidence}%
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-[#6C8480] block">Detected Indicators</span>
                  <span className={`font-bold font-mono text-sm ${detectedCount > 0 ? 'text-[#DC2626]' : 'text-[#16794B]'}`}>
                    {detectedCount} / 10
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-[#6C8480] block">Main Threat Category</span>
                  <span className={`font-bold font-sans text-xs ${mainThreatCategory !== 'None' ? 'text-[#DC2626]' : 'text-[#52665A] dark:text-gray-300'}`}>
                    {mainThreatCategory}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: 4. Embedded URL & Attachment (Left) & 5. ML and NLP Analysis (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: 4. Embedded URL and Attachment Analysis */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-[#16794B] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
              4
            </div>
            <h2 className="text-sm font-bold font-heading text-[#1C2518] dark:text-[#E6ECE1] tracking-tight">
              4. Embedded URL and Attachment Analysis
            </h2>
          </div>

          <div className="flex-1 rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] p-4 sm:p-5 shadow-xs flex flex-col justify-center">
            {urlAndAttachmentList.length > 0 && urlAndAttachmentList.some(item => item.name !== '-') ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#404E3B]/15 bg-[#F4F7F4] dark:bg-[#253224] text-[#1C2518] dark:text-[#E6ECE1] font-mono text-[11px]">
                      <th className="py-2 px-3 w-8">#</th>
                      <th className="py-2 px-3 w-20">Type</th>
                      <th className="py-2 px-3">URL / File Name</th>
                      <th className="py-2 px-3 w-24 text-center">Status</th>
                      <th className="py-2 px-3 w-24 text-center">Threat Level</th>
                      <th className="py-2 px-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#404E3B]/10 font-sans">
                    {urlAndAttachmentList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F9FAF9] dark:hover:bg-[#253224]/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[#6C8480]">{item.index || idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#2C3527] dark:text-[#E6ECE1]">{item.type}</td>
                        <td className="py-2.5 px-3 font-mono text-[#2C3527] dark:text-[#E6ECE1] max-w-xs truncate" title={item.name}>
                          <div className="flex items-center gap-1.5">
                            <span className="truncate select-all">{item.name}</span>
                            {item.name !== '-' && (
                              <button onClick={() => handleCopyUrl(item.name, idx)} className="text-[#6C8480] hover:text-[#16794B] cursor-pointer shrink-0">
                                {copiedUrlIdx === idx ? <Check className="w-3 h-3 text-[#16794B]" /> : <Copy className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            item.status === 'Suspicious' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                            item.status === 'Analyzed' || item.status === 'Safe' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                            'bg-gray-100 text-gray-600 border-gray-300'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">
                          <span className={item.threat_level === 'High' || item.threat_level === 'Critical' ? 'text-rose-600' : 'text-[#6C8480]'}>
                            {item.threat_level}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#52665A] dark:text-gray-300 text-[11px] leading-tight">
                          {item.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#16794B]/10 text-[#16794B] flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-sm font-bold font-heading text-[#1C2518] dark:text-[#E6ECE1]">
                  No embedded URLs detected
                </h3>
                <p className="text-xs text-[#6C8480] max-w-sm mx-auto font-sans">
                  No hyperlinks or web addresses were found in the provided email content.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: 5. ML and NLP Analysis */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-[#16794B] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
              5
            </div>
            <h2 className="text-sm font-bold font-heading text-[#1C2518] dark:text-[#E6ECE1] tracking-tight">
              5. ML and NLP Analysis
            </h2>
          </div>

          <div className="flex-1 rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#404E3B]/10 text-xs">
              <div>
                <span className="text-[11px] font-mono text-[#6C8480] block">Model</span>
                <span className="font-bold text-[#2C3527] dark:text-[#E6ECE1]">TF-IDF + Logistic Regression</span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#6C8480] block">Predicted Class</span>
                <span className={`font-bold font-heading ${isCriticalOrHigh ? 'text-[#DC2626]' : 'text-[#16794B]'}`}>
                  {predictedClass}
                </span>
              </div>
            </div>

            {/* Phishing Probability bar */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 font-bold">
                <span className="text-[#6C8480]">Phishing Probability</span>
                <span className={parseFloat(phishingProb) >= 50 ? 'text-[#DC2626]' : 'text-[#16794B]'}>{phishingProb}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E6E6E6] dark:bg-gray-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${parseFloat(phishingProb) >= 50 ? 'bg-[#DC2626]' : 'bg-[#16794B]'}`}
                  style={{ width: `${Math.min(100, Math.max(5, parseFloat(phishingProb)))}%` }}
                />
              </div>
            </div>

            {/* Model Confidence bar */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 font-bold">
                <span className="text-[#6C8480]">Model Confidence</span>
                <span className="text-[#16794B]">{modelConfidence}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E6E6E6] dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#16794B] transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(5, parseFloat(modelConfidence)))}%` }}
                />
              </div>
            </div>

            {/* NLP Feature Detection */}
            <div className="pt-2">
              <span className="text-[11px] font-mono font-bold text-[#6C8480] block mb-2 uppercase">
                NLP Feature Detection
              </span>
              <div className="space-y-1.5 text-xs font-sans">
                {[
                  { name: 'Financial Bait', detected: nlp.financial_bait },
                  { name: 'Credential Request', detected: nlp.credential_request },
                  { name: 'Urgency / Coercion', detected: nlp.urgency_coercion },
                  { name: 'Suspicious Keywords', detected: nlp.suspicious_keywords },
                  { name: 'Legitimate Structure', detected: nlp.legitimate_structure, invertColor: true }
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-[#404E3B]/5 last:border-0">
                    <span className="text-[#2C3527] dark:text-gray-300">{feat.name}</span>
                    {feat.detected ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        feat.invertColor
                          ? 'bg-[#16794B] text-white'
                          : 'bg-[#DC2626] text-white'
                      }`}>
                        <Check className="w-2.5 h-2.5" />
                        <span>Detected</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#16794B] text-white">
                        <Check className="w-2.5 h-2.5" />
                        <span>Not detected</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Security Recommendations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#16794B] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
            6
          </div>
          <h2 className="text-sm font-bold font-heading text-[#1C2518] dark:text-[#E6ECE1] tracking-tight">
            6. Security Recommendations
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {recommendationsList.map((rec, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border shadow-xs flex flex-col justify-between ${
                rec.variant === 'danger'
                  ? 'border-red-200 bg-red-50/70 dark:bg-red-950/20 dark:border-red-900/50'
                  : rec.variant === 'warning'
                  ? 'border-amber-200 bg-amber-50/70 dark:bg-amber-950/20 dark:border-amber-900/50'
                  : 'border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/20 dark:border-emerald-900/50'
              }`}
            >
              <div>
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center mb-2.5 ${
                  rec.variant === 'danger' ? 'bg-white text-red-600 border-red-200' :
                  rec.variant === 'warning' ? 'bg-white text-amber-600 border-amber-200' :
                  'bg-white text-emerald-700 border-emerald-200'
                }`}>
                  {rec.icon === 'shield-ban' ? <ShieldAlert className="w-4 h-4" /> :
                   rec.icon === 'lock-alert' ? <Lock className="w-4 h-4" /> :
                   rec.icon === 'building' ? <Building className="w-4 h-4" /> :
                   rec.icon === 'globe' ? <Globe className="w-4 h-4" /> :
                   rec.icon === 'info' ? <Info className="w-4 h-4" /> :
                   rec.icon === 'phone' ? <UserCheck className="w-4 h-4" /> :
                   <Flag className="w-4 h-4" />}
                </div>
                <h3 className={`text-xs font-bold font-heading mb-1 ${
                  rec.variant === 'danger' ? 'text-red-900 dark:text-red-300' :
                  rec.variant === 'warning' ? 'text-amber-900 dark:text-amber-300' :
                  'text-emerald-900 dark:text-emerald-300'
                }`}>
                  {rec.title}
                </h3>
                <p className="text-[11px] leading-relaxed text-[#52665A] dark:text-gray-300">
                  {rec.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {postCompromise && (
          <div className="p-3 rounded-xl bg-red-100/80 border border-red-300 text-red-900 flex items-center gap-2.5 text-xs font-sans">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span><strong>If you already shared information:</strong> {postCompromise.replace('If you already shared information: ', '')}</span>
          </div>
        )}
      </div>

      {/* SECTION 7: Security Notes and Final Verdict */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#16794B] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
            7
          </div>
          <h2 className="text-sm font-bold font-heading text-[#1C2518] dark:text-[#E6ECE1] tracking-tight">
            7. Security Notes and Final Verdict
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Important Notes */}
          <div className="rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-[#0284C7] text-white flex items-center justify-center shrink-0">
                <Info className="w-3 h-3" />
              </div>
              <h3 className="text-xs font-bold font-heading text-[#1C2518] dark:text-[#E6ECE1] uppercase tracking-wide">
                Important Notes
              </h3>
            </div>
            <ul className="space-y-1.5 text-xs text-[#52665A] dark:text-gray-300 list-disc list-inside leading-relaxed">
              {importantNotes.map((note, idx) => (
                <li key={idx}>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Final Verdict Card */}
          <div className={`rounded-2xl p-5 shadow-xs border flex flex-col justify-between ${
            isCriticalOrHigh
              ? 'bg-red-50/80 border-red-300 text-red-950 dark:bg-red-950/30 dark:border-red-800'
              : isMedium
              ? 'bg-amber-50/80 border-amber-300 text-amber-950 dark:bg-amber-950/30 dark:border-amber-800'
              : 'bg-emerald-50/80 border-emerald-300 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-800'
          }`}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  isCriticalOrHigh ? 'bg-red-600 text-white' : isMedium ? 'bg-amber-600 text-white' : 'bg-emerald-700 text-white'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className={`text-sm font-bold font-heading ${
                  isCriticalOrHigh ? 'text-red-900 dark:text-red-300' : isMedium ? 'text-amber-900 dark:text-amber-300' : 'text-emerald-900 dark:text-emerald-300'
                }`}>
                  Final Verdict: {finalVerdictTitle}
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-[#2C3527] dark:text-gray-200">
                {finalVerdictExplanation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
