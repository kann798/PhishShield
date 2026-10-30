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



  // Quick synthetic email presets with distinct severity colors
  const sampleEmails = [
    {
      label: 'Microsoft 365 Display Spoof (Critical)',
      severity: 'critical',
      tagColor: 'bg-[#FEECEC] border-[#F5B7BD] text-[#B42318] hover:bg-[#D92D20] hover:text-white hover:border-[#D92D20] dark:bg-[#FEECEC] dark:border-[#F5B7BD] dark:text-[#B42318]',
      badgeBg: 'bg-[#D92D20]',
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
      severity: 'critical',
      tagColor: 'bg-[#FEECEC] border-[#F5B7BD] text-[#B42318] hover:bg-[#D92D20] hover:text-white hover:border-[#D92D20] dark:bg-[#FEECEC] dark:border-[#F5B7BD] dark:text-[#B42318]',
      badgeBg: 'bg-[#D92D20]',
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
      severity: 'high',
      tagColor: 'bg-[#FFF1DB] border-[#F5D08A] text-[#9A3412] hover:bg-[#B54708] hover:text-white hover:border-[#B54708] dark:bg-[#FFF1DB] dark:border-[#F5D08A] dark:text-[#9A3412]',
      badgeBg: 'bg-[#B54708]',
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
      severity: 'safe',
      tagColor: 'bg-[#E8F6ED] border-[#B7E3C7] text-[#0E623B] hover:bg-[#16794B] hover:text-white hover:border-[#16794B] dark:bg-[#E8F6ED] dark:border-[#B7E3C7] dark:text-[#0E623B]',
      badgeBg: 'bg-[#16794B]',
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
    <div className="w-full pb-8 space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#404E3B]/15 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#7B9669]/20 border border-[#7B9669]/40 rounded-2xl text-[#404E3B] shadow-sm">
            <Mail className="w-5 h-5 text-[#404E3B]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1C2518] dark:text-white font-heading">
              PHISHING EMAIL DETECTOR &amp; <span className="text-[#7B9669] dark:text-[#9FC48A]">NLP</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#404E3B]/80 dark:text-[#BAC8B1] mt-0.5 font-sans font-medium page-subtitle">
              Analyze headers, Reply-To mismatches, social engineering urgency, credential traps, and embedded hyperlinks
            </p>
          </div>
        </div>
      </div>

      {/* Input Form Card - Always visible above results */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#404E3B]/15 relative overflow-hidden">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }}
          className="space-y-4"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="email-textarea" className="text-xs font-mono uppercase text-[#1C2518] dark:text-[#1C2518] font-black tracking-wider">
                Email Headers and Body Content:
              </label>
              <span className="text-[11px] text-[#2C3527] dark:text-[#2C3527] font-mono font-bold">
                {emailText.length} characters (Max 200KB)
              </span>
            </div>

            <textarea
              id="email-textarea"
              rows={8}
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="Paste raw email text here, including From:, Reply-To:, Subject: headers and message body..."
              className="w-full rounded-xl bg-[#F4F7F4] border border-[#404E3B]/25 p-4 text-xs text-[#111827] dark:text-[#111827] font-mono font-medium placeholder:text-[#2D3D28] placeholder:not-italic dark:placeholder:text-[#2D3D28] focus:outline-none focus:border-[#7B9669] focus:ring-2 focus:ring-[#7B9669]/25 transition-all leading-relaxed"
            />
          </div>

          {/* Quick Preset Samples with distinct severity colors */}
          <div>
            <span className="text-xs font-mono text-[#1C2518] dark:text-[#1C2518] block mb-2 flex items-center gap-1.5 font-extrabold tracking-wide">
              <Zap className="w-3.5 h-3.5 text-[#7B9669]" />
              <span>Quick Synthetic Email Test Samples:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleEmails.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSampleClick(sample.text)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all shadow-xs cursor-pointer ${sample.tagColor}`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${sample.badgeBg}`}></span>
                  <span>{sample.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-[#404E3B]/10">
            <span className="text-[11px] text-[#2C3527] dark:text-[#2C3527] flex items-center gap-1.5 font-semibold">
              <Shield className="w-3.5 h-3.5 text-[#404E3B] shrink-0" />
              <span>Privacy protected: Raw email contents are evaluated in-memory and never logged to permanent plaintext tables.</span>
            </span>

            <div className="flex items-center gap-2.5">
              {emailText && (
                <button
                  type="button"
                  onClick={() => {
                    setEmailText('');
                    setResult(null);
                  }}
                  className="px-3 py-2 text-xs font-mono text-[#6C8480] hover:text-[#404E3B] cursor-pointer"
                >
                  Clear Text
                </button>
              )}

              <button
                id="analyze-email-btn"
                type="submit"
                disabled={loading || !emailText.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#7B9669] hover:bg-[#688258] text-white font-extrabold text-xs uppercase tracking-wider font-mono transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing Indicators...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-white" />
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

      {/* Loading Scanning State */}
      {loading && (
        <div className="rounded-2xl border border-[#404E3B]/15 bg-white p-10 text-center shadow-sm animate-pulse">
          <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#7B9669]/20 animate-ping"></div>
            <div className="w-12 h-12 rounded-full border-2 border-[#7B9669] border-t-transparent animate-spin"></div>
            <Mail className="w-6 h-6 text-[#7B9669] absolute" />
          </div>
          <h3 className="text-sm font-mono font-bold text-[#404E3B] uppercase tracking-widest">
            Scanning Email Architecture &amp; NLP Vectors...
          </h3>
          <p className="text-xs text-[#6C8480] mt-1 max-w-sm mx-auto font-mono">
            Extracting header spoofing indicators, urgency tokens, deceptive hyperlinks, and wire transfer lures
          </p>
        </div>
      )}

      {/* Results View - Appears directly below the email input card */}
      {result && !loading && (
        <div id="email-scan-results" className="pt-2 animate-fadeIn">
          <AnalysisResultView
            type="email"
            result={result}
            onBack={() => setResult(null)}
          />
        </div>
      )}
    </div>
  );
}
