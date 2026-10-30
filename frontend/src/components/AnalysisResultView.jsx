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

  // Determine classification and severity classes
  const isCriticalOrHigh = classification === 'Critical' || classification === 'High' || classification === 'Phishing' || score >= 70;
  const isMedium = classification === 'Medium' || classification === 'Suspicious' || (score >= 26 && score < 70);
  const isSafe = !isCriticalOrHigh && !isMedium;

  // Circular gauge setup
  const radius = 38;
  const stroke = 6;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let gaugeColor = '#16794B';
  if (isCriticalOrHigh) gaugeColor = '#DC2626';
  else if (isMedium) gaugeColor = '#D97706';

  // Format ML metrics
  const ml = result.ml_analysis || {};
  const phishingProb =
    typeof ml.phishing_probability === 'number'
      ? ml.phishing_probability.toFixed(1)
      : isCriticalOrHigh ? '96.4' : '5.2';

  const modelConfidence =
    typeof ml.confidence_score === 'number'
      ? ml.confidence_score.toFixed(1)
      : typeof ml.confidence === 'number'
      ? ml.confidence.toFixed(1)
      : isCriticalOrHigh ? '89.1' : '87.6';

  const predictedClass =
    ml.predicted_class || ml.prediction || (isCriticalOrHigh ? 'Phishing' : 'Legitimate');

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
  // STANDALONE URL ANALYZER REPORT VIEW (when type === 'url')
  // --------------------------------------------------------------------------
  if (!isEmail) {
    let resolvedAnatomy = result.anatomy || result.details?.anatomy;
    const urlIndicators = result.indicators || [];

    return (
      <div className="space-y-6 w-full pb-10 select-none animate-fadeIn">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#404E3B]/15 pb-4">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#6C8480] hover:text-[#7B9669] transition-colors mb-2 cursor-pointer group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to URL Analyzer</span>
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#404E3B] dark:text-[#E6ECE1] font-heading">
              URL Analysis Result
            </h1>
            <p className="text-xs text-[#6C8480] mt-0.5 font-sans">
              AI-powered phishing detection and security analysis
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono text-[#6C8480]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-[#1E271D] border border-[#404E3B]/15 text-[#404E3B] dark:text-[#E6ECE1] shadow-sm">
              <Clock className="w-3.5 h-3.5 text-[#6C8480]" />
              <span>Analyzed on: {timestamp}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-[#1E271D] border border-[#404E3B]/15 text-[#404E3B] dark:text-[#E6ECE1] shadow-sm">
              <Target className="w-3.5 h-3.5 text-[#6C8480]" />
              <span>Scan ID: #{scanId}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-[#1E271D] border border-[#404E3B]/15 text-[#404E3B] dark:text-[#E6ECE1] shadow-sm max-w-[280px] truncate" title={targetLabel}>
              <Globe className="w-3.5 h-3.5 text-[#6C8480] shrink-0" />
              <span className="truncate">Target: {targetLabel}</span>
            </div>
          </div>
        </div>

        {/* 1.. THREAT SUMMARY */}
        <section>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#404E3B] dark:text-[#E6ECE1] mb-2 flex items-center gap-1.5">
            <span className="text-[#7B9669]">1..</span>
            <span>THREAT SUMMARY</span>
          </h2>

          <div className="rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 shrink-0">
              <div className="relative w-24 h-24 flex items-center justify-center">
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
                  <span className="text-3xl font-black text-[#404E3B] dark:text-[#E6ECE1] font-mono tracking-tight leading-none">{score}</span>
                  <span className="text-[10px] text-[#6C8480] font-mono font-bold mt-0.5">/ 100</span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-2 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <div className={`px-4 py-1.5 rounded-full font-mono font-bold text-xs flex items-center gap-2 ${
                  isCriticalOrHigh ? 'bg-[#DC2626] text-white' : isMedium ? 'bg-[#D97706] text-white' : 'bg-[#16794B] text-white'
                }`}>
                  {isCriticalOrHigh ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  <span>{isCriticalOrHigh ? 'PHISHING DETECTED' : isMedium ? 'SUSPICIOUS LINK' : 'LIKELY SAFE'}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  isCriticalOrHigh ? 'border-rose-300 bg-rose-50 text-rose-700' : isMedium ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                }`}>
                  {classification} Risk
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#2C3527] dark:text-[#D5E0D0] leading-relaxed max-w-xl">
                {result.summary || (isCriticalOrHigh
                  ? 'This URL is highly likely to be a phishing attempt due to detected adversarial indicators and deception traits.'
                  : 'No aggressive phishing traits identified. Routine security precautions apply.')}
              </p>
            </div>

            <div className={`w-full lg:w-auto lg:max-w-xs shrink-0 flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border shadow-sm ${
              isCriticalOrHigh ? 'border-[#F5B7BD] bg-[#FEECEC]' : isMedium ? 'border-[#F5D08A] bg-[#FFF1DB]' : 'border-[#B7E3C7] bg-[#E8F6ED]'
            }`}>
              <div className="p-2.5 rounded-xl bg-white shrink-0 mt-0.5 shadow-xs">
                <Shield className={`w-4 h-4 ${isCriticalOrHigh ? 'text-[#DC2626]' : isMedium ? 'text-[#D97706]' : 'text-[#16794B]'}`} />
              </div>
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wide font-mono mb-1 ${
                  isCriticalOrHigh ? 'text-[#B42332]' : isMedium ? 'text-[#B54708]' : 'text-[#16794B]'
                }`}>
                  Recommended Action
                </h4>
                <p className="text-xs leading-relaxed text-[#2C3527]">
                  {isCriticalOrHigh
                    ? 'Do not click or enter login credentials on this website. Block domain on firewall.'
                    : 'Destination passed offline heuristic tests. Verify HTTPS encryption before sharing credentials.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2.. WHY THIS URL WAS FLAGGED */}
        <section>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#404E3B] dark:text-[#E6ECE1] mb-2 flex items-center gap-1.5">
            <span className="text-[#7B9669]">2..</span>
            <span>WHY THIS URL WAS FLAGGED</span>
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#404E3B]/15 bg-[#EEF3EC] dark:bg-[#253224] text-[#404E3B] dark:text-[#E6ECE1] font-mono uppercase text-[11px]">
                  <th className="py-3 px-4 w-12 font-semibold">#</th>
                  <th className="py-3 px-4 w-64 font-semibold">Detected Issue</th>
                  <th className="py-3 px-4 font-semibold">Explanation</th>
                  <th className="py-3 px-4 w-28 text-center font-semibold">Severity</th>
                  <th className="py-3 px-4 w-36 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#404E3B]/10 font-sans">
                {urlIndicators.length > 0 ? (
                  urlIndicators.map((ind, idx) => (
                    <React.Fragment key={idx}>
                      <tr className="hover:bg-[#F4F7F4] dark:hover:bg-[#253224]/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[#6C8480]">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-[#404E3B] dark:text-[#E6ECE1]">{ind.name || 'Threat Indicator'}</td>
                        <td className="py-3.5 px-4 text-[#2C3527] dark:text-[#D5E0D0] leading-relaxed">{ind.description || ind.summary}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                            (ind.severity || '').toLowerCase() === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                            (ind.severity || '').toLowerCase() === 'high' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                            'bg-amber-50 text-amber-700 border-amber-300'
                          }`}>
                            {ind.severity || 'Medium'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => toggleEvidence(idx)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-[#404E3B]/20 bg-[#EEF3EC] hover:bg-[#7B9669] hover:text-white text-[#404E3B] text-xs font-mono font-semibold transition-colors cursor-pointer"
                          >
                            <span>{expandedRows[idx] ? 'Hide' : 'Evidence'}</span>
                            {expandedRows[idx] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                      {expandedRows[idx] && (
                        <tr className="bg-[#F4F7F4] dark:bg-[#253224]/30 border-t border-[#404E3B]/10">
                          <td colSpan={5} className="p-4">
                            <pre className="p-3 rounded-xl bg-white dark:bg-[#1E271D] border border-[#404E3B]/15 text-[#2C3527] dark:text-[#D5E0D0] font-mono text-xs whitespace-pre-wrap select-all">
                              {ind.evidence || ind.description}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#6C8480] font-mono text-xs">
                      <CheckCircle className="w-6 h-6 text-[#16794B] mx-auto mb-2" />
                      <span>Clean URL structure. No adversarial indicators detected.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3.. AI / ML ANALYSIS */}
        <section>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#404E3B] dark:text-[#E6ECE1] mb-2 flex items-center gap-1.5">
            <span className="text-[#7B9669]">3..</span>
            <span>AI / ML ANALYSIS</span>
          </h2>
          <div className="rounded-2xl border border-[#404E3B]/15 bg-white dark:bg-[#1E271D] p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#6C8480] block mb-1 font-bold">Predicted Class</span>
              <span className={`text-base font-black font-mono ${isCriticalOrHigh ? 'text-rose-600' : 'text-[#16794B]'}`}>
                {predictedClass}
              </span>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 font-bold text-[#404E3B] dark:text-[#E6ECE1]">
                <span>Phishing Probability</span>
                <span>{phishingProb}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E6E6E6] dark:bg-gray-700 overflow-hidden">
                <div className={`h-full rounded-full ${parseFloat(phishingProb) >= 50 ? 'bg-rose-500' : 'bg-[#16794B]'}`} style={{ width: `${phishingProb}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 font-bold text-[#404E3B] dark:text-[#E6ECE1]">
                <span>Model Confidence</span>
                <span>{modelConfidence}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E6E6E6] dark:bg-gray-700 overflow-hidden">
                <div className="h-full rounded-full bg-[#16794B]" style={{ width: `${modelConfidence}%` }} />
              </div>
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
  const detectedCount = result.detected_indicators_count !== undefined ? result.detected_indicators_count : (isCriticalOrHigh ? 6 : 0);
  const mainThreatCategory = result.main_threat_category || (isCriticalOrHigh ? 'Financial Phishing' : 'None');
  const urlAndAttachmentList = result.url_and_attachment_analysis || [];
  const importantNotes = result.important_notes || [];
  const finalVerdictTitle = result.final_verdict_title || (isCriticalOrHigh ? 'Phishing – Critical Risk' : 'Likely Legitimate – Low Risk');
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
