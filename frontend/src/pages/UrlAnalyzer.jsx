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
      <div className="border-b border-[#404E3B]/15 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#7B9669]/20 border border-[#7B9669]/40 rounded-2xl text-[#404E3B] shadow-sm">
            <Globe className="w-5 h-5 text-[#404E3B]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#404E3B] font-heading">
              PHISHING URL DETECTOR & HEURISTICS
            </h1>
            <p className="text-xs sm:text-sm text-[#6C8480] mt-0.5 font-sans">
              Zero-SSRF offline heuristic evaluation of domain structures, typosquatting, raw IP hosts, and evasion tricks
            </p>
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#404E3B]/15 relative overflow-hidden">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="url-input" className="block text-xs font-mono uppercase text-[#404E3B] font-bold mb-2 tracking-wider">
              Website URL to Inspect:
            </label>
            <div className="relative">
              <input
                id="url-input"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="e.g. http://192.168.1.1/login or https://paypa1-security-verification.com"
                className="w-full rounded-xl bg-[#F4F7F4] border border-[#404E3B]/20 px-4 py-3.5 text-sm text-[#2C3527] font-mono placeholder:text-[#6C8480] focus:outline-none focus:border-[#7B9669] focus:ring-2 focus:ring-[#7B9669]/25 transition-all"
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={() => setUrlInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#404E3B] hover:text-[#2C3527] px-2.5 py-1 rounded-lg bg-[#EEF3EC] border border-[#404E3B]/15 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick-test Presets */}
          <div>
            <span className="text-[11px] font-mono text-[#6C8480] block mb-2 flex items-center gap-1.5 font-semibold">
              <Zap className="w-3.5 h-3.5 text-[#7B9669]" />
              <span>Quick Synthetic Test Samples:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleUrls.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSampleClick(sample.url)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium bg-[#EEF3EC] border border-[#404E3B]/15 hover:border-[#7B9669] hover:bg-[#7B9669] hover:text-white text-[#404E3B] transition-all shadow-sm"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-[#404E3B]/10">
            <span className="text-[11px] text-[#6C8480] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#7B9669] shrink-0" />
              <span>Zero-SSRF safe: URL strings are analyzed entirely offline using deterministic regex heuristics.</span>
            </span>

            <button
              id="analyze-url-btn"
              type="submit"
              disabled={loading || !urlInput.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#7B9669] hover:bg-[#688258] text-white font-extrabold text-xs uppercase tracking-wider font-mono transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing Heuristics...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-white" />
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
        <div className="rounded-2xl border border-[#404E3B]/15 bg-white p-10 text-center shadow-sm animate-pulse">
          <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#7B9669]/20 animate-ping"></div>
            <div className="w-12 h-12 rounded-full border-2 border-[#7B9669] border-t-transparent animate-spin"></div>
            <Globe className="w-6 h-6 text-[#7B9669] absolute" />
          </div>
          <h3 className="text-sm font-mono font-bold text-[#404E3B] uppercase tracking-widest">
            Scanning URL Architecture & Threat Signatures...
          </h3>
          <p className="text-xs text-[#6C8480] mt-1 max-w-sm mx-auto font-mono">
            Evaluating IP address, homoglyphs, brand spoofing, subdomain depth, and suspicious keywords
          </p>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
