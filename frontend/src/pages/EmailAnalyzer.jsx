import React, { useState } from 'react';
import {
  Mail,
  Search,
  Shield,
  Zap,
} from 'lucide-react';
import AlertBanner from '../components/AlertBanner';
import AnalysisResultView from '../components/AnalysisResultView';
import { api, clientAnalyzeEmail } from '../services/api';

export default function EmailAnalyzer({ onSelectScan }) {
  const [emailText, setEmailText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Quick synthetic email presets
  const sampleEmails = [
    {
      label: 'Microsoft 365 Display Spoof (Critical)',
      text: `From: "Microsoft Security Team" <support-notice41@genericmail-alerts.xyz>
Reply-To: security-reply@attacker-box.net
Subject: Immediate Action Required: Account Deactivation Notice
Date: Mon, 27 Oct 2026 09:30:00 +0000

Dear Valued User,

Your Microsoft Office 365 enterprise account has encountered unusual sign-in activity from an unrecognized IP address.
Your account access will be terminated within 24 hours unless you verify your identity and confirm your credentials.

Click here to verify your account immediately:
http://192.168.1.80/office365-login/auth.php

Failure to respond to this final notice will result in irreversible suspension.

Best regards,
Microsoft Account Services`,
    },
    {
      label: 'Urgent Banking Suspension (Critical)',
      text: `From: "Chase Online Security" <alerts@chase-banking-security.tk>
Subject: Security Alert: Account Suspended
Date: Mon, 27 Oct 2026 10:14:00 +0000

Dear Customer,

We detected unauthorized wire transfer attempts on your banking profile. For your protection, your access has been locked.
To restore access, verify your credentials and confirm your debit card details by opening:
http://chase.com.security-verify-portal.top/login

Do not ignore this warning.`,
    },
    {
      label: 'CEO BEC Wire Transfer Scam (High)',
      text: `From: John Davis <ceo@enterprise-solutions.com>
Reply-To: wire-processing@overseas-fund.xyz
Subject: Urgent: Overdue Vendor Invoice Wire Transfer

Hey,

I need you to process an urgent wire transfer for an overdue invoice before 3:00 PM today.
The payment receipt details are in the wire transfer memo.
Please reply immediately so I can send the overseas swift account numbers.

Thanks,
John Davis
Chief Executive Officer`,
    },
    {
      label: 'Legitimate Team Newsletter (Low)',
      text: `From: Security Team <security@company.internal>
Subject: Monthly Engineering Security Best Practices Digest
Date: Mon, 27 Oct 2026 11:00:00 +0000

Hi Everyone,

Here is our monthly summary on engineering security hygiene.
Remember to regularly review your active API tokens and keep your local Docker installations updated.
Feel free to drop by office hours this Thursday if you have any questions.

Cheers,
The Internal Security Engineering Team`,
    },
  ];

  const handleAnalyze = async (textToTest = emailText) => {
    const content = textToTest || emailText;
    if (!content.trim()) {
      setError('Please paste email content or headers into the box.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const res = await api.analyzeEmail(content.trim());
      if (res && (res.success || res.data)) {
        setResult(res.data);
      } else {
        const fallback = clientAnalyzeEmail(content.trim());
        setResult(fallback.data);
      }
    } catch (err) {
      console.warn('Email analyze error, using client fallback:', err);
      const fallback = clientAnalyzeEmail(content.trim());
      setResult(fallback.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sampleText) => {
    setEmailText(sampleText);
    handleAnalyze(sampleText);
  };

  return (
    <div className="w-full pb-8">
      {/* 1. Results View (Clean 5-Section Layout matching reference design) */}
      {result && !loading ? (
        <AnalysisResultView
          type="email"
          result={result}
          onBack={() => setResult(null)}
        />
      ) : (
        <div className="space-y-6">
          {/* Page Header */}
          <div className="border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/35 rounded-2xl text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Mail className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
                  PHISHING EMAIL DETECTOR & NLP
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-sans">
                  Analyze headers, Reply-To mismatches, social engineering urgency, credential traps, and embedded hyperlinks
                </p>
              </div>
            </div>
          </div>

          {/* Input Form Card */}
          <div className="liquid-glass-card rounded-2xl p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)] border border-white/10 relative overflow-hidden">
            {/* Specular Top Line */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none" />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAnalyze();
              }}
              className="space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="email-textarea" className="text-xs font-mono uppercase text-slate-300 font-bold tracking-wider">
                    Email Headers and Body Content:
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono font-medium">
                    {emailText.length} characters (Max 200KB)
                  </span>
                </div>

                <textarea
                  id="email-textarea"
                  rows={8}
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  placeholder="Paste raw email text here, including From:, Reply-To:, Subject: headers and message body..."
                  className="w-full rounded-xl bg-[rgba(6,16,36,0.75)] border border-white/10 p-4 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/25 transition-all shadow-inner leading-relaxed"
                />
              </div>

              {/* Quick Preset Samples */}
              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-2 flex items-center gap-1.5 font-semibold">
                  <Zap className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Quick Synthetic Email Test Samples:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {sampleEmails.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSampleClick(sample.text)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium bg-[rgba(8,20,40,0.55)] backdrop-blur-md border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/15 text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-white/10">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Privacy protected: Raw email contents are evaluated in-memory and never logged to permanent plaintext tables.</span>
                </span>

                <div className="flex items-center gap-2.5">
                  {emailText && (
                    <button
                      type="button"
                      onClick={() => setEmailText('')}
                      className="px-3 py-2 text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                    >
                      Clear Text
                    </button>
                  )}

                  <button
                    id="analyze-email-btn"
                    type="submit"
                    disabled={loading || !emailText.trim()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-white font-extrabold text-xs uppercase tracking-wider font-mono transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing Indicators...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 text-emerald-400" />
                        <span>Analyze Email Content</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Error Alert */}
          {error && (
            <AlertBanner
              type="danger"
              title="Analysis Error"
              message={error}
              onDismiss={() => setError(null)}
            />
          )}

          {/* Loading State */}
          {loading && (
            <div className="rounded-2xl border border-white/10 bg-[rgba(8,20,40,0.65)] backdrop-blur-[24px] p-10 text-center shadow-md animate-pulse">
              <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping"></div>
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
                <Mail className="w-6 h-6 text-[#10B981] absolute" />
              </div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest">
                Inspecting Email Signatures & Headers...
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-mono">
                Evaluating From/Reply-To discrepancies, social engineering coercion, and embedded hyperlinks
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
