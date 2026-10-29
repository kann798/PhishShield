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
      <div className="border-b border-[#404E3B]/15 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#7B9669]/20 border border-[#7B9669]/40 rounded-2xl text-[#404E3B] shadow-sm">
            <GraduationCap className="w-5 h-5 text-[#404E3B]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#404E3B] font-heading">
              PHISHING AWARENESS & DEFENSE CENTER
            </h1>
            <p className="text-xs sm:text-sm text-[#6C8480] mt-0.5">
              Interactive threat simulation, anatomy of deception, red flag checklists, and defensive response
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2.5 border-b border-[#404E3B]/10 pb-4">
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'quiz'
              ? 'bg-[#7B9669] text-white shadow-sm'
              : 'bg-white text-[#404E3B] border border-[#404E3B]/15 hover:bg-[#EEF3EC]'
          }`}
        >
          <Award className={`w-4 h-4 ${activeTab === 'quiz' ? 'text-white' : 'text-[#7B9669]'}`} />
          <span>Interactive "Spot-the-Phish" Simulator</span>
          {Object.keys(selectedAnswers).length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'quiz' ? 'bg-white/20 text-white' : 'bg-[#7B9669]/15 text-[#404E3B]'}`}>
              {score}/{scenarios.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('attack_types')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'attack_types'
              ? 'bg-[#7B9669] text-white shadow-sm'
              : 'bg-white text-[#404E3B] border border-[#404E3B]/15 hover:bg-[#EEF3EC]'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${activeTab === 'attack_types' ? 'text-white' : 'text-[#7B9669]'}`} />
          <span>Anatomy of Phishing Attacks</span>
        </button>

        <button
          onClick={() => setActiveTab('red_flags')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'red_flags'
              ? 'bg-[#7B9669] text-white shadow-sm'
              : 'bg-white text-[#404E3B] border border-[#404E3B]/15 hover:bg-[#EEF3EC]'
          }`}
        >
          <AlertTriangle className={`w-4 h-4 ${activeTab === 'red_flags' ? 'text-white' : 'text-[#7B9669]'}`} />
          <span>Identifying Red Flags</span>
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'checklist'
              ? 'bg-[#7B9669] text-white shadow-sm'
              : 'bg-white text-[#404E3B] border border-[#404E3B]/15 hover:bg-[#EEF3EC]'
          }`}
        >
          <ShieldCheck className={`w-4 h-4 ${activeTab === 'checklist' ? 'text-white' : 'text-[#7B9669]'}`} />
          <span>Prevention Checklist</span>
        </button>
      </div>

      {/* Tab 1: Interactive Simulator Quiz */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#404E3B]/15 shadow-sm">
            <div>
              <h3 className="text-base font-extrabold text-[#404E3B] font-sans flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#7B9669]" />
                Real-World Email Inspection Challenge
              </h3>
              <p className="text-xs text-[#6C8480] mt-1">
                Review the synthetic sample emails below and decide whether they represent genuine communications or malicious phishing.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-mono font-semibold text-[#6C8480]">Your Current Score:</span>
              <span className="text-xl font-black font-mono text-[#404E3B] px-4 py-1.5 bg-[#EEF3EC] border border-[#404E3B]/15 rounded-xl">
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
                  className="bg-white rounded-2xl p-6 space-y-4 border border-[#404E3B]/15 shadow-sm transition-all duration-300"
                >
                  <div className="flex items-center justify-between border-b border-[#404E3B]/10 pb-3">
                    <h4 className="text-sm font-bold text-[#404E3B] font-mono tracking-wide">{sc.title}</h4>
                    {answered && (
                      <span
                        className={`text-xs font-mono px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                          isCorrect
                            ? 'bg-[#7B9669]/15 border border-[#7B9669]/30 text-[#404E3B]'
                            : 'bg-rose-50 border border-rose-200 text-rose-700'
                        }`}
                      >
                        {isCorrect ? <Check className="w-3.5 h-3.5 text-[#7B9669]" /> : <X className="w-3.5 h-3.5 text-rose-600" />}
                        <span>{isCorrect ? 'Correct Assessment' : 'Incorrect Assessment'}</span>
                      </span>
                    )}
                  </div>

                  {/* Mock Email Viewer */}
                  <div className="bg-[#F4F7F4] rounded-xl border border-[#404E3B]/10 p-4 font-mono text-xs space-y-2">
                    <div className="text-[#6C8480]">
                      <span className="font-bold text-[#404E3B]">From: </span>
                      <span className="text-[#2C3527] font-semibold">{sc.sender}</span>
                    </div>
                    {sc.replyTo && (
                      <div className="text-[#6C8480]">
                        <span className="font-bold text-[#404E3B]">Reply-To: </span>
                        <span className="text-amber-700 font-bold">{sc.replyTo}</span>
                      </div>
                    )}
                    <div className="text-[#6C8480]">
                      <span className="font-bold text-[#404E3B]">Subject: </span>
                      <span className="text-[#2C3527] font-medium">{sc.subject}</span>
                    </div>
                    <div className="pt-2 border-t border-[#404E3B]/10 text-[#2C3527] whitespace-pre-wrap leading-relaxed">
                      {sc.body}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-[#6C8480] font-mono font-medium">
                      What is your threat verdict?
                    </span>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleAnswer(sc.id, true)}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          selectedAnswers[sc.id] === true
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-white border border-rose-300 text-rose-700 hover:bg-rose-50'
                        }`}
                      >
                        🚨 Phishing Attack
                      </button>
                      <button
                        onClick={() => handleAnswer(sc.id, false)}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          selectedAnswers[sc.id] === false
                            ? 'bg-[#7B9669] text-white shadow-sm'
                            : 'bg-white border border-[#7B9669]/40 text-[#404E3B] hover:bg-[#EEF3EC]'
                        }`}
                      >
                        ✅ Legitimate Email
                      </button>
                    </div>
                  </div>

                  {/* Feedback Explanation */}
                  {showExplanation[sc.id] && (
                    <div
                      className={`p-4 rounded-xl text-xs leading-relaxed border ${
                        isCorrect
                          ? 'bg-[#EEF3EC] border-[#7B9669]/30 text-[#404E3B]'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
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
            <div key={idx} className="bg-white rounded-2xl p-6 space-y-3 border border-[#404E3B]/15 shadow-sm transition-all duration-300">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-xl bg-[#EEF3EC] border border-[#404E3B]/15">{type.icon}</span>
                <h4 className="text-sm font-bold text-[#404E3B] font-mono tracking-wide">{type.title}</h4>
              </div>
              <p className="text-xs text-[#2C3527] leading-relaxed">{type.desc}</p>
              <div className="pt-3 border-t border-[#404E3B]/10">
                <span className="text-[10px] font-mono uppercase text-[#7B9669] font-bold block mb-1">
                  Recommended Defense:
                </span>
                <p className="text-xs text-[#6C8480] leading-relaxed">{type.countermeasure}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Identifying Red Flags */}
      {activeTab === 'red_flags' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 space-y-4 border border-[#404E3B]/15 shadow-sm">
            <h3 className="text-sm font-bold text-[#404E3B] font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7B9669]" />
              How to Spot Deceptive URLs & Phishing Domains
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#F4F7F4] border border-[#404E3B]/10 space-y-2">
                <h5 className="font-bold text-rose-700 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> 1. Raw IP Address Hosts
                </h5>
                <p className="text-[#2C3527] leading-relaxed">
                  Legitimate web portals use registered domain names with public SSL certificates. Be wary of links like <code className="text-[#404E3B] font-mono font-bold bg-[#BAC8B1]/40 px-1 py-0.5 rounded">http://192.168.1.1/login</code>.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F4] border border-[#404E3B]/10 space-y-2">
                <h5 className="font-bold text-rose-700 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> 2. Typosquatting & Homoglyphs
                </h5>
                <p className="text-[#2C3527] leading-relaxed">
                  Attackers swap Latin characters for identical Cyrillic glyphs or replace letters with numbers (e.g., <code className="text-[#404E3B] font-mono font-bold bg-[#BAC8B1]/40 px-1 py-0.5 rounded">paypa1.com</code> or <code className="text-[#404E3B] font-mono font-bold bg-[#BAC8B1]/40 px-1 py-0.5 rounded">micros0ft.com</code>).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F4] border border-[#404E3B]/10 space-y-2">
                <h5 className="font-bold text-rose-700 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> 3. Brand Subdomain Deception
                </h5>
                <p className="text-[#2C3527] leading-relaxed">
                  Always inspect the root domain immediately preceding the TLD. In <code className="text-[#404E3B] font-mono font-bold bg-[#BAC8B1]/40 px-1 py-0.5 rounded">paypal.com.verify-login.xyz</code>, the actual domain is <strong className="text-[#404E3B]">verify-login.xyz</strong>, not PayPal.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F4] border border-[#404E3B]/10 space-y-2">
                <h5 className="font-bold text-rose-700 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> 4. HTTPS Does NOT Guarantee Safety
                </h5>
                <p className="text-[#2C3527] leading-relaxed">
                  The padlock icon only indicates traffic encryption in transit. Over 80% of modern phishing domains use free automated TLS certificates (Let's Encrypt).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security Checklist */}
      {activeTab === 'checklist' && (
        <div className="bg-white rounded-2xl p-6 space-y-4 border border-[#404E3B]/15 shadow-sm">
          <h3 className="text-sm font-bold text-[#404E3B] font-mono uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7B9669]" />
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
              <div key={idx} className="p-4 rounded-xl bg-[#F4F7F4] border border-[#404E3B]/10 flex items-start gap-3.5">
                <div className="p-1.5 rounded-lg bg-[#7B9669]/20 text-[#404E3B] border border-[#7B9669]/40 mt-0.5 shrink-0 shadow-xs">
                  <Check className="w-4 h-4 text-[#7B9669]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#404E3B]">{item.title}</h4>
                  <p className="text-xs text-[#6C8480] mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
