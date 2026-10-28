import React, { useState } from 'react';
import {
  Globe,
  Search,
  Shield,
  Zap,
} from 'lucide-react';
import AlertBanner from '../components/AlertBanner';
import AnalysisResultView from '../components/AnalysisResultView';
import { api, clientAnalyzeUrl } from '../services/api';

export default function UrlAnalyzer({ onSelectScan }) {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Synthetic safe test examples for rapid user testing
  const sampleUrls = [
    { label: 'Raw IP Host (Critical)', url: 'http://192.168.1.45/paypal-login/verify.php' },
    { label: 'Brand Typosquatting (Critical)', url: 'http://paypa1-security-verification.com/signin' },
    { label: 'Subdomain Deception (High)', url: 'http://paypal.com.account-update.xyz/login' },
    { label: 'URL Shortener (Medium)', url: 'https://bit.ly/3xY8a9Q' },
    { label: 'Legitimate Site (Low)', url: 'https://www.google.com/search?q=cybersecurity' },
  ];

  const handleAnalyze = async (targetUrl = urlInput) => {
    const urlToTest = targetUrl || urlInput;
    if (!urlToTest.trim()) {
      setError('Please enter a website URL to analyze.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const res = await api.analyzeUrl(urlToTest.trim());
      if (res && (res.success || res.data)) {
        setResult(res.data);
      } else {
        const fallback = clientAnalyzeUrl(urlToTest.trim());
        setResult(fallback.data);
      }
    } catch (err) {
      console.warn('URL analyze error, using client fallback:', err);
      const fallback = clientAnalyzeUrl(urlToTest.trim());
      setResult(fallback.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sampleUrl) => {
    setUrlInput(sampleUrl);
    handleAnalyze(sampleUrl);
  };

  return (
    <div className="w-full pb-8">
      {/* 1. Results View (Clean 5-Section Layout matching reference design) */}
      {result && !loading ? (
        <AnalysisResultView
          type="url"
          result={result}
          onBack={() => setResult(null)}
        />
      ) : (
        <div className="space-y-6">
          {/* Page Header */}
      <div className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/35 rounded-2xl text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Globe className="w-5 h-5 text-[#10B981]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              PHISHING URL DETECTOR & HEURISTICS
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-sans">
              Zero-SSRF offline heuristic evaluation of domain structures, typosquatting, raw IP hosts, and evasion tricks
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
            <label htmlFor="url-input" className="block text-xs font-mono uppercase text-slate-300 font-bold mb-2 tracking-wider">
              Website URL to Inspect:
            </label>
            <div className="relative">
              <input
                id="url-input"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="e.g. http://192.168.1.1/login or https://paypa1-security-verification.com"
                className="w-full rounded-xl bg-[rgba(6,16,36,0.75)] border border-white/10 px-4 py-3.5 text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/25 transition-all shadow-inner"
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={() => setUrlInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-[rgba(8,20,40,0.8)] border border-white/10 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick-test Presets */}
          <div>
            <span className="text-[11px] font-mono text-slate-400 block mb-2 flex items-center gap-1.5 font-semibold">
              <Zap className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Quick Synthetic Test Samples:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleUrls.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSampleClick(sample.url)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium bg-[rgba(8,20,40,0.55)] backdrop-blur-md border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/15 text-slate-300 hover:text-white transition-all shadow-sm"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-white/10">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Zero-SSRF safe: URL strings are analyzed entirely offline using deterministic regex heuristics.</span>
            </span>

            <button
              id="analyze-url-btn"
              type="submit"
              disabled={loading || !urlInput.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-white font-extrabold text-xs uppercase tracking-wider font-mono transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing Heuristics...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-emerald-400" />
                  <span>Analyze URL Target</span>
                </>
              )}
            </button>
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
        <div className="rounded-2xl border border-white/10 bg-[rgba(8,20,40,0.65)] backdrop-blur-[24px] p-10 text-center shadow-md animate-pulse">
          <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping"></div>
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
            <Globe className="w-6 h-6 text-[#10B981] absolute" />
          </div>
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest">
            Scanning URL Architecture & Threat Signatures...
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-mono">
            Evaluating IP address, homoglyphs, brand spoofing, subdomain depth, and suspicious keywords
          </p>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
