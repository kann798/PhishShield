import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function FAQ({ setActivePage }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqData = [
    {
      id: 1,
      question: '1. What is PhishShield?',
      answer: (
        <div className="space-y-2">
          <p>
            <strong>PhishShield</strong> is an advanced, offline-first cybersecurity threat intelligence and awareness platform. It is engineered to detect adversarial phishing attempts across website URLs and incoming email messages.
          </p>
          <p>
            By combining deterministic structural heuristics, social engineering keyword analysis, sender address verification, and trained machine learning classification, PhishShield helps users and security analysts evaluate suspicious communications safely in an isolated runtime sandbox.
          </p>
        </div>
      ),
    },
    {
      id: 2,
      question: '2. How does URL analysis work?',
      answer: (
        <div className="space-y-2">
          <p>
            PhishShield inspects website links using <strong>zero-SSRF offline heuristic evaluation</strong>. This means the scanner never makes outbound network connections to the target site, preventing attackers from logging your IP address or serving drive-by malware.
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300">
            <li><strong>Host Parsing:</strong> Flags direct numeric IP hostnames (e.g. <code>192.168.1.45</code>) that bypass domain registration.</li>
            <li><strong>Typosquatting &amp; Homoglyphs:</strong> Identifies misspelled brand names and deceptive lookalike characters (e.g. <code>paypa1</code> vs <code>paypal</code>).</li>
            <li><strong>Subdomain Deception:</strong> Detects excessive subdomain nesting used to disguise malicious destinations.</li>
            <li><strong>Credential Traps:</strong> Scans paths and parameters for keywords like <code>login</code>, <code>verify</code>, <code>banking</code>, and <code>auth</code>.</li>
            <li><strong>Protocol Security:</strong> Flags unencrypted plain HTTP links transmitting sensitive credentials.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 3,
      question: '3. How does email phishing detection work?',
      answer: (
        <div className="space-y-2">
          <p>
            The email detection engine analyzes standard RFC headers and message body content through multiple inspection layers:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300">
            <li><strong>Sender &amp; Reply-To Mismatch:</strong> Detects display name spoofing and flags when responses are routed to a different domain than the sender&apos;s address.</li>
            <li><strong>Psychological Urgency &amp; Coercion:</strong> Identifies artificial time pressure (e.g. &quot;account deactivation within 24 hours&quot;).</li>
            <li><strong>Financial Solicitations:</strong> Flags unverified wire transfers, gift cards, invoices, and cryptocurrency requests.</li>
            <li><strong>Credential Solicitation:</strong> Scans for requests to provide passwords, PINs, or MFA tokens.</li>
            <li><strong>Embedded Hyperlink Inspection:</strong> Extracts and runs all URLs embedded in the message through the URL heuristic engine.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 4,
      question: '4. What do the different risk levels mean?',
      answer: (
        <div className="space-y-2">
          <p>PhishShield categorizes inspection results into four distinct threat levels based on overall risk score:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="font-bold text-emerald-400 block font-mono text-xs uppercase mb-0.5">Low Risk (0–34)</span>
              <p className="text-xs text-slate-300">Baseline safety signatures pass. No aggressive coercion or structural anomalies identified.</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <span className="font-bold text-amber-400 block font-mono text-xs uppercase mb-0.5">Medium Risk (35–64)</span>
              <p className="text-xs text-slate-300">Suspicious elements present (e.g. URL shorteners, generic urgency). Caution and verification advised.</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
              <span className="font-bold text-orange-400 block font-mono text-xs uppercase mb-0.5">High Risk (65–84)</span>
              <p className="text-xs text-slate-300">Multiple active indicators detected (e.g. sender mismatch, typosquatting). Do not click links.</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <span className="font-bold text-rose-400 block font-mono text-xs uppercase mb-0.5">Critical Risk (85–100)</span>
              <p className="text-xs text-slate-300">Active phishing or BEC scam detected. Block the sender and report immediately.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      question: '5. What does the risk score represent?',
      answer: (
        <div className="space-y-2">
          <p>
            The risk score is a deterministic scale from <strong>0 to 100</strong>. It represents the accumulated threat probability calculated from all detected security indicators and machine learning confidence.
          </p>
          <p>
            Each triggered rule contributes a calibrated severity weight (ranging from +5 points for minor protocol anomalies up to +50 points for raw IP credential harvests or display name spoofing). The final score is normalized and capped at 100.
          </p>
        </div>
      ),
    },
    {
      id: 6,
      question: '6. Does PhishShield use AI/ML?',
      answer: (
        <div className="space-y-2">
          <p>
            <strong>Yes.</strong> PhishShield incorporates a dedicated Machine Learning pipeline operating in tandem with deterministic heuristic rules:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300">
            <li><strong>NLP Feature Extraction:</strong> Computes TF-IDF vector embeddings over message text and header linguistics.</li>
            <li><strong>Supervised Classifiers:</strong> Leverages trained scikit-learn models (Random Forest / Logistic Regression) to compute statistical phishing probability and model confidence.</li>
            <li><strong>Advanced Telemetry:</strong> Analysts can view raw model predictions, classification probabilities, and extracted feature vectors in the collapsible &quot;Advanced Analysis&quot; drawer.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 7,
      question: '7. How are scan results stored?',
      answer: (
        <div className="space-y-2">
          <p>
            Scan records are persisted in a local SQLite database (<code>phishing_detector.db</code>) managed on your local system or secure deployment server.
          </p>
          <p>
            <strong>Privacy Guarantee:</strong> PhishShield strictly sanitizes all stored data. Raw email message bodies, passwords, session cookies, and binary attachments are <em>never</em> written to disk. Only sanitized target identifiers (such as the analyzed URL or sanitized subject snippet), timestamps, risk scores, and indicator IDs are stored for audit logging.
          </p>
        </div>
      ),
    },
    {
      id: 8,
      question: '8. How can I download a report?',
      answer: (
        <div className="space-y-2">
          <p>You can generate and download forensic reports through two straightforward methods:</p>
          <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-300">
            <li><strong>From Scan History / Inspection:</strong> Click the <strong>Download PDF</strong> button inside any scan detail view to instantly generate an Executive Forensic Report using client-side PDF rendering.</li>
            <li><strong>From Reports &amp; Export:</strong> Navigate to <strong>Reports &amp; Export</strong> in the sidebar to download forensic audit logs in <strong>JSON</strong> or <strong>CSV</strong> format for SIEM ingestion.</li>
          </ol>
        </div>
      ),
    },
    {
      id: 9,
      question: '9. What should I do when phishing is detected?',
      answer: (
        <div className="space-y-2">
          <p>When PhishShield flags an email or URL as High or Critical Risk, follow standard incident response hygiene:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300">
            <li><strong>Do not interact:</strong> Never click embedded links or download attachments.</li>
            <li><strong>Protect credentials:</strong> Never submit passwords, MFA codes, or financial account details.</li>
            <li><strong>Independent verification:</strong> If the message purports to be from your bank, employer, or vendor, contact them via a known telephone number or official web portal.</li>
            <li><strong>Report internally:</strong> Forward the message to your organization&apos;s security operations team (SOC) or IT helpdesk.</li>
            <li><strong>Purge:</strong> Delete the message from your inbox and trash folders.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 10,
      question: '10. Can PhishShield guarantee that a website is safe?',
      answer: (
        <div className="space-y-2">
          <p>
            <strong>No automated scanner can provide a 100% guarantee of absolute safety.</strong>
          </p>
          <p>
            Attackers continually develop novel evasion techniques, such as exploiting newly registered domains, compromising legitimate web applications, and using multi-stage conditional redirects. A &quot;Likely Safe&quot; score indicates that no known adversarial patterns were detected, but you must always exercise standard security awareness before submitting credentials or downloading files.
          </p>
        </div>
      ),
    },
  ];

  const filteredFaqs = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof item.answer === 'string' && item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleExpand = (id) => {
    setExpandedIndex(expandedIndex === id ? null : id);
  };

  return (
    <div className="space-y-6 w-full pb-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#404E3B]/15 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#7B9669]/20 border border-[#7B9669]/40 rounded-2xl text-[#404E3B] dark:text-[#BAC8B1] shadow-sm">
              <HelpCircle className="w-5 h-5 text-[#404E3B] dark:text-[#BAC8B1]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1C2518] dark:text-white font-heading">
                FREQUENTLY ASKED <span className="text-[#7B9669] dark:text-[#9FC48A]">QUESTIONS</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#404E3B]/80 dark:text-[#BAC8B1] mt-0.5 font-sans font-medium page-subtitle">
                Find answers to common questions about PhishShield, its features, and how it works.
              </p>
            </div>
          </div>
        </div>

        {/* Search Filter Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#F4F7F4] border border-[#404E3B]/20 text-xs text-[#2C3527] font-sans placeholder:text-[#2D3D28] placeholder:not-italic dark:placeholder:text-[#2D3D28] focus:outline-none focus:border-[#7B9669] focus:ring-1 focus:ring-[#7B9669]/40 transition-all"
          />
          <Search className="w-4 h-4 text-[#404E3B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#6C8480] hover:text-[#404E3B] px-1.5 py-0.5 rounded bg-[#EEF3EC]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedIndex === faq.id;

            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-[#404E3B]/15 bg-white shadow-sm transition-all overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  aria-expanded={isExpanded}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer group hover:bg-[#F4F7F4] transition-colors"
                >
                  <h3 className="text-xs sm:text-sm font-bold font-mono text-[#404E3B] group-hover:text-[#7B9669] transition-colors flex items-center gap-2.5">
                    <span>{faq.question}</span>
                  </h3>
                  <div className="p-1 rounded-lg bg-[#EEF3EC] text-[#404E3B] group-hover:bg-[#7B9669] group-hover:text-white transition-colors shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-[#404E3B]/10 text-xs sm:text-sm text-[#2C3527] font-sans leading-relaxed animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-[#404E3B]/15 bg-white p-8 text-center text-[#6C8480] font-mono text-xs">
            No questions matching &quot;{searchQuery}&quot;. Try a different search keyword.
          </div>
        )}
      </div>

      {/* Helpful Next Steps Banner */}
      <div className="p-5 rounded-2xl border border-[#7B9669]/30 bg-[#EEF3EC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#7B9669]/20 text-[#404E3B]">
            <Sparkles className="w-5 h-5 text-[#7B9669]" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-mono text-[#404E3B] uppercase tracking-wider">
              Need personalized assistance or found an issue?
            </h4>
            <p className="text-xs text-[#6C8480] font-sans mt-0.5">
              Explore step-by-step guides or send our security team a direct inquiry.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActivePage('help')}
            className="px-4 py-2 rounded-xl bg-[#7B9669] hover:bg-[#688258] text-white font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span>User Guides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActivePage('contact')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#BAC8B1]/30 text-[#404E3B] font-mono text-xs font-bold border border-[#404E3B]/20 transition-all cursor-pointer"
          >
            Contact Team
          </button>
        </div>
      </div>
    </div>
  );
}
