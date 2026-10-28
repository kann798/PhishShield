import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  Check,
  X,
  BookOpen,
  Award,
} from 'lucide-react';

export default function AwarenessCenter() {
  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'attack_types' | 'red_flags' | 'checklist'
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState({});

  // Interactive Spot-the-Phish Simulation Scenarios
  const scenarios = [
    {
      id: 1,
      title: 'Scenario 1: Netflix Payment Failure Notice',
      sender: 'Netflix Billing <support@netfIix-billing-update.com>',
      subject: 'Urgent: Your subscription is on hold due to billing error',
      body: `Hi Customer,

We were unable to process your monthly subscription fee. Your account access will be disabled within 12 hours.
Please update your payment method immediately to continue watching:
http://netflix.account-billing.xyz/verify-card

The Netflix Customer Team`,
      isPhishing: true,
      explanation:
        'This is PHISHING. Notice three key red flags: 1) The sender domain uses a homoglyph (replacing lowercase "l" with capital "I": netfIix), 2) High-pressure 12-hour urgency, and 3) The link goes to an untrusted .xyz root domain.',
    },
    {
      id: 2,
      title: 'Scenario 2: GitHub Two-Factor Authentication Confirmation',
      sender: 'GitHub <noreply@github.com>',
      subject: '[GitHub] A new personal access token was generated',
      body: `Hey octocat,

A new personal access token ("deploy-script") was generated on your account from IP 192.0.2.1 (Chrome on macOS).
If you initiated this action, no further steps are required.
If you did not generate this token, revoke it immediately at:
https://github.com/settings/tokens

Thanks,
The GitHub Security Team`,
      isPhishing: false,
      explanation:
        'This is LEGITIMATE. The sender is verified (@github.com), addresses the user by their actual username ("octocat"), contains no coercive threats, and directs strictly to the authentic official domain over HTTPS.',
    },
    {
      id: 3,
      title: 'Scenario 3: Internal IT Password Expiration Warning',
      sender: 'IT Helpdesk <it-support@corp-internal-desk.top>',
      subject: 'ACTION REQUIRED: Your corporate password expires today',
      body: `Attention Employee,

Your company Windows network password expires in 3 hours. Failure to update will lock your workstation.
Click below to synchronize your active directory credentials:
http://104.244.72.11/corp/auth.php

IT Support Services`,
      isPhishing: true,
      explanation:
        'This is PHISHING. Notice: 1) Raw IP address destination (104.244.72.11), 2) The sender uses a generic .top domain instead of your verified internal company domain, and 3) Artificial urgency threatening workstation lockout.',
    },
  ];

  const handleAnswer = (id, answer) => {
    setSelectedAnswers((prev) => ({ ...prev, [id]: answer }));
    setShowExplanation((prev) => ({ ...prev, [id]: true }));
  };

  const score = Object.keys(selectedAnswers).reduce((acc, id) => {
    const sc = scenarios.find((s) => s.id === parseInt(id));
    if (sc && selectedAnswers[id] === sc.isPhishing) return acc + 1;
    return acc;
  }, 0);

  // Attack Types Information
  const attackTypes = [
    {
      title: 'Spear Phishing',
      icon: '🎯',
      desc: 'Highly customized phishing targeting specific individuals or organizations using researched personal details.',
      countermeasure: 'Verify requests for sensitive data through secondary communication channels (e.g., in-person or verified phone call).',
    },
    {
      title: 'Whaling (Executive Phishing)',
      icon: '🐋',
      desc: 'Phishing attacks specifically targeted at C-level executives, board members, or high-profile finance personnel.',
      countermeasure: 'Establish multi-signature authorization protocols for large wire transfers and payroll changes.',
    },
    {
      title: 'Business Email Compromise (BEC)',
      icon: '💼',
      desc: 'Impersonating executives or trusted suppliers to deceive employees into processing unauthorized payments or transferring funds.',
      countermeasure: 'Carefully inspect From vs Reply-To email headers and never deviate from established vendor verification procedures.',
    },
    {
      title: 'Clone Phishing',
      icon: '👥',
      desc: 'Creating an almost identical copy of a legitimate, previously delivered email, replacing original links or attachments with malware.',
      countermeasure: 'Inspect destination URLs in address bars and confirm unexpected links with the original sender.',
    },
    {
      title: 'Smishing & Vishing',
      icon: '📱',
      desc: 'Phishing executed via SMS text messages (Smishing) or voice telephone calls (Vishing) impersonating banks, IRS, or delivery couriers.',
      countermeasure: 'Never click tracking links in unsolicited SMS messages; log into courier or bank apps directly.',
    },
  ];

  return (
    <div className="space-y-6 w-full pb-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-[#1a2744] pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 rounded-xl text-emerald-700 dark:text-emerald-400 shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
              PHISHING AWARENESS & DEFENSE CENTER
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Interactive threat simulation, anatomy of deception, red flag checklists, and defensive response
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2.5 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'quiz'
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] backdrop-blur-xl'
              : 'liquid-glass-card text-slate-400 hover:text-white border-white/10 hover:border-emerald-500/30'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Interactive "Spot-the-Phish" Simulator</span>
          {Object.keys(selectedAnswers).length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-[10px] text-emerald-200 font-bold">
              {score}/{scenarios.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('attack_types')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'attack_types'
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] backdrop-blur-xl'
              : 'liquid-glass-card text-slate-400 hover:text-white border-white/10 hover:border-emerald-500/30'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Anatomy of Phishing Attacks</span>
        </button>

        <button
          onClick={() => setActiveTab('red_flags')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'red_flags'
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] backdrop-blur-xl'
              : 'liquid-glass-card text-slate-400 hover:text-white border-white/10 hover:border-emerald-500/30'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-emerald-400" />
          <span>Identifying Red Flags</span>
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'checklist'
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] backdrop-blur-xl'
              : 'liquid-glass-card text-slate-400 hover:text-white border-white/10 hover:border-emerald-500/30'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Prevention Checklist</span>
        </button>
      </div>

      {/* Tab 1: Interactive Simulator Quiz */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="liquid-glass-card relative overflow-hidden rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />
            <div>
              <h3 className="text-base font-extrabold text-white font-sans flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Real-World Email Inspection Challenge
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Review the synthetic sample emails below and decide whether they represent genuine communications or malicious phishing.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-mono font-semibold text-slate-400">Your Current Score:</span>
              <span className="text-xl font-black font-mono text-emerald-300 px-4 py-1.5 bg-[#061024]/80 border border-emerald-400/40 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                {score} / {scenarios.length}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {scenarios.map((sc) => {
              const answered = selectedAnswers[sc.id] !== undefined;
              const isCorrect = selectedAnswers[sc.id] === sc.isPhishing;

              return (
                <div
                  key={sc.id}
                  className="liquid-glass-card relative overflow-hidden rounded-2xl p-6 space-y-4 border border-white/10 hover:border-emerald-500/40 transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none" />
                  
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h4 className="text-sm font-bold text-white font-mono tracking-wide">{sc.title}</h4>
                    {answered && (
                      <span
                        className={`text-xs font-mono px-3 py-1 rounded-full font-bold flex items-center gap-1.5 backdrop-blur-xl ${
                          isCorrect
                            ? 'bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                            : 'bg-rose-500/20 border border-rose-400/60 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                        }`}
                      >
                        {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        <span>{isCorrect ? 'Correct Assessment' : 'Incorrect Assessment'}</span>
                      </span>
                    )}
                  </div>

                  {/* Mock Email Viewer */}
                  <div className="bg-[#061024]/90 dark:bg-[#050e20]/90 backdrop-blur-xl rounded-xl border border-white/10 p-4 font-mono text-xs space-y-2 shadow-inner">
                    <div className="text-slate-400">
                      <span className="text-slate-500 font-bold">From: </span>
                      <span className="text-emerald-300 font-semibold">{sc.sender}</span>
                    </div>
                    {sc.replyTo && (
                      <div className="text-slate-400">
                        <span className="text-slate-500 font-bold">Reply-To: </span>
                        <span className="text-amber-400 font-bold">{sc.replyTo}</span>
                      </div>
                    )}
                    <div className="text-slate-400">
                      <span className="text-slate-500 font-bold">Subject: </span>
                      <span className="text-white font-medium">{sc.subject}</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {sc.body}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-slate-400 font-mono font-medium">
                      What is your threat verdict?
                    </span>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleAnswer(sc.id, true)}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                          selectedAnswers[sc.id] === true
                            ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] border border-rose-300'
                            : 'liquid-glass-card border-rose-500/30 hover:border-rose-400 hover:text-rose-300 text-slate-300'
                        }`}
                      >
                        🚨 Phishing Attack
                      </button>
                      <button
                        onClick={() => handleAnswer(sc.id, false)}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                          selectedAnswers[sc.id] === false
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-300'
                            : 'liquid-glass-card border-emerald-500/30 hover:border-emerald-400 hover:text-emerald-300 text-slate-300'
                        }`}
                      >
                        ✅ Legitimate Email
                      </button>
                    </div>
                  </div>

                  {/* Feedback Explanation */}
                  {showExplanation[sc.id] && (
                    <div
                      className={`p-4 rounded-xl text-xs leading-relaxed border backdrop-blur-xl ${
                        isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-rose-950/40 border-rose-500/40 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                      }`}
                    >
                      <strong className="block mb-1 font-mono uppercase text-[11px] font-bold">
                        {isCorrect ? 'Analysis Confirmed:' : 'Threat Assessment Notice:'}
                      </strong>
                      <p>{sc.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Attack Types */}
      {activeTab === 'attack_types' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attackTypes.map((type, idx) => (
            <div key={idx} className="liquid-glass-card relative overflow-hidden rounded-2xl p-6 space-y-3 border border-white/10 hover:border-emerald-500/40 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none" />
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">{type.icon}</span>
                <h4 className="text-sm font-bold text-white font-mono tracking-wide">{type.title}</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{type.desc}</p>
              <div className="pt-3 border-t border-white/10">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">
                  Recommended Defense:
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">{type.countermeasure}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Identifying Red Flags */}
      {activeTab === 'red_flags' && (
        <div className="space-y-4">
          <div className="liquid-glass-card relative overflow-hidden rounded-2xl p-6 space-y-4 border border-white/10">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              How to Spot Deceptive URLs & Phishing Domains
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#061024]/80 backdrop-blur-xl border border-white/10 space-y-2">
                <h5 className="font-bold text-rose-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> 1. Raw IP Address Hosts
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  Legitimate web portals use registered domain names with public SSL certificates. Be wary of links like <code className="text-emerald-300 font-mono font-bold bg-emerald-950/60 px-1 py-0.5 rounded">http://192.168.1.1/login</code>.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#061024]/80 backdrop-blur-xl border border-white/10 space-y-2">
                <h5 className="font-bold text-rose-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> 2. Typosquatting & Homoglyphs
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  Attackers swap Latin characters for identical Cyrillic glyphs or replace letters with numbers (e.g., <code className="text-emerald-300 font-mono font-bold bg-emerald-950/60 px-1 py-0.5 rounded">paypa1.com</code> or <code className="text-emerald-300 font-mono font-bold bg-emerald-950/60 px-1 py-0.5 rounded">micros0ft.com</code>).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#061024]/80 backdrop-blur-xl border border-white/10 space-y-2">
                <h5 className="font-bold text-rose-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> 3. Brand Subdomain Deception
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  Always inspect the root domain immediately preceding the TLD. In <code className="text-emerald-300 font-mono font-bold bg-emerald-950/60 px-1 py-0.5 rounded">paypal.com.verify-login.xyz</code>, the actual domain is <strong className="text-emerald-200">verify-login.xyz</strong>, not PayPal.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#061024]/80 backdrop-blur-xl border border-white/10 space-y-2">
                <h5 className="font-bold text-rose-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> 4. HTTPS Does NOT Guarantee Safety
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  The padlock icon only indicates traffic encryption in transit. Over 80% of modern phishing domains use free automated TLS certificates (Let's Encrypt).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security Checklist */}
      {activeTab === 'checklist' && (
        <div className="liquid-glass-card relative overflow-hidden rounded-2xl p-6 space-y-4 border border-white/10">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Cybersecurity Incident Prevention Checklist
          </h3>
          <div className="space-y-3">
            {[
              { title: 'Enable Hardware Multi-Factor Authentication (MFA)', desc: 'FIDO2 / WebAuthn hardware keys or authenticator apps stop 99% of automated credential harvesting attempts.' },
              { title: 'Always Verify Out-of-Band', desc: 'If an email requests wire transfers or urgent payroll updates, contact the individual directly via a known phone number.' },
              { title: 'Inspect Sender vs Reply-To Headers', desc: 'Check for discrepancies between the visible display name, the From email address, and the destination Reply-To address.' },
              { title: 'Never Open Unexpected Script or Container Attachments', desc: 'Avoid executing .iso, .exe, .scr, or macro-enabled .docm/.xlsm files delivered in unsolicited messages.' },
              { title: 'Bookmark Critical Portals', desc: 'Never click email links to access financial, government, or cloud consoles. Type bookmarked URLs directly.' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#061024]/80 backdrop-blur-xl border border-white/10 flex items-start gap-3.5 hover:border-emerald-500/30 transition-colors">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 mt-0.5 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
