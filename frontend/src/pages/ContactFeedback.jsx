import React, { useState } from 'react';
import {
  Mail,
  Send,
  AlertTriangle,
  Lightbulb,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function ContactFeedback({ initialSubject = '' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(initialSubject || 'General Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill out all required fields before sending.');
      return;
    }

    // Basic email format check
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }

    setError(null);
    setSubmitting(true);

    // Simulate reliable dispatch
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 600);
  };

  const handleCardClick = (subj) => {
    setSubject(subj);
    setSubmitted(false);
    setError(null);
  };

  return (
    <div className="space-y-6 w-full pb-8 animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/15 border border-cyan-500/35 rounded-2xl text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Mail className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              Contact &amp; Feedback
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-sans">
              Have a question, found an issue, or want to share feedback? We&apos;re here to help.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Send a Message Form (7 cols on Desktop) */}
        <div className="lg:col-span-7 liquid-glass-card rounded-2xl border border-white/10 bg-[rgba(6,16,36,0.75)] backdrop-blur-xl p-6 sm:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.35)] relative overflow-hidden">
          {/* Specular Highlight Line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none" />

          <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide mb-5 flex items-center gap-2">
            <span>Send a Message</span>
          </h3>

          {submitted && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 flex items-start gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wide">
                  Message Transmitted Successfully
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 font-sans leading-relaxed">
                  Thank you! Your feedback and inquiries help improve PhishShield&apos;s detection models. We have logged your submission.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-[11px] font-mono text-emerald-400 hover:text-white underline font-semibold"
                >
                  Send another message
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            {/* Name Input */}
            <div>
              <label htmlFor="contact-name" className="block text-slate-300 font-mono font-semibold mb-1.5 uppercase text-[11px] tracking-wider">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2.5 rounded-xl bg-[rgba(6,16,36,0.85)] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all font-sans"
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="contact-email" className="block text-slate-300 font-mono font-semibold mb-1.5 uppercase text-[11px] tracking-wider">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 rounded-xl bg-[rgba(6,16,36,0.85)] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all font-sans"
              />
            </div>

            {/* Subject Selector */}
            <div>
              <label htmlFor="contact-subject" className="block text-slate-300 font-mono font-semibold mb-1.5 uppercase text-[11px] tracking-wider">
                Subject
              </label>
              <select
                id="contact-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[rgba(6,16,36,0.9)] border border-white/10 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all font-sans cursor-pointer"
              >
                <option value="General Inquiry" className="bg-[#061024] text-white">General Inquiry</option>
                <option value="Report a Problem" className="bg-[#061024] text-white">Report a Problem</option>
                <option value="Suggest a Feature" className="bg-[#061024] text-white">Suggest a Feature</option>
                <option value="Security Feedback" className="bg-[#061024] text-white">Security Feedback</option>
              </select>
            </div>

            {/* Message Textarea */}
            <div>
              <label htmlFor="contact-message" className="block text-slate-300 font-mono font-semibold mb-1.5 uppercase text-[11px] tracking-wider">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-4 rounded-xl bg-[rgba(6,16,36,0.85)] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all font-sans leading-relaxed resize-y"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.45)] cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Other Ways to Reach Us (5 cols on Desktop) */}
        <div className="lg:col-span-5 liquid-glass-card rounded-2xl border border-white/10 bg-[rgba(6,16,36,0.75)] backdrop-blur-xl p-6 sm:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.35)] relative overflow-hidden space-y-4">
          {/* Specular Highlight Line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none" />

          <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide mb-4">
            Other Ways to Reach Us
          </h3>

          {/* Subcard 1: General Questions */}
          <div
            onClick={() => handleCardClick('General Inquiry')}
            className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer flex items-start gap-3.5 group"
          >
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white font-mono group-hover:text-cyan-400 transition-colors">
                General Questions
              </h4>
              <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
                Use the contact form for general queries about PhishShield.
              </p>
            </div>
          </div>

          {/* Subcard 2: Report a Problem */}
          <div
            onClick={() => handleCardClick('Report a Problem')}
            className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer flex items-start gap-3.5 group"
          >
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white font-mono group-hover:text-rose-400 transition-colors">
                Report a Problem
              </h4>
              <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
                Found a bug or unexpected behavior? Let us know.
              </p>
            </div>
          </div>

          {/* Subcard 3: Suggest a Feature */}
          <div
            onClick={() => handleCardClick('Suggest a Feature')}
            className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer flex items-start gap-3.5 group"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white font-mono group-hover:text-amber-400 transition-colors">
                Suggest a Feature
              </h4>
              <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
                Have an idea to improve PhishShield? Share your suggestions.
              </p>
            </div>
          </div>

          {/* Subcard 4: Project Information */}
          <div
            onClick={() => handleCardClick('Security Feedback')}
            className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer flex items-start gap-3.5 group"
          >
            <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white font-mono group-hover:text-blue-400 transition-colors">
                Project Information
              </h4>
              <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
                This is an educational project built for cybersecurity awareness and learning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
