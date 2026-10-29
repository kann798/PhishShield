import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { api, getApiBaseUrl } from '../services/api';
import { downloadExtensionZipPackage } from '../utils/extensionBundle';

// Browser SVG Icons
function ChromeIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="#4285F4" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 2a10 10 0 0 1 8.66 5H12" stroke="#EA4335" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20.66 7A10 10 0 0 1 12 22l4.33-7.5" stroke="#34A853" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M3.34 7l4.33 7.5L12 22A10 10 0 0 1 3.34 7z" stroke="#FBBC05" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function EdgeIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M21.5 14.5c-.8 4.2-4.5 7.5-9.5 7.5a10 10 0 1 1 9.8-12c-.5 0-1 .2-1.3.5-1.5 1.5-1.5 4 0 5.5l1 1z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.5" fill="#0078D4" />
    </svg>
  );
}

function BrowserIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  );
}

export default function ExtensionPreviewModal({ isOpen, onClose }) {
  const [targetUrl, setTargetUrl] = useState('https://paypal-security-update-center.com/login');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Installation state & tabs
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'install'
  const [browserType, setBrowserType] = useState('chrome'); // 'chrome' | 'edge' | 'brave' | 'firefox' | 'browser'
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedScheme, setCopiedScheme] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Auto-detect user browser
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent;
      if (/Edg\//i.test(ua)) {
        setBrowserType('edge');
      } else if (/Brave/i.test(ua) || navigator.brave) {
        setBrowserType('brave');
      } else if (/Firefox\//i.test(ua)) {
        setBrowserType('firefox');
      } else if (/Chrome\//i.test(ua)) {
        setBrowserType('chrome');
      } else {
        setBrowserType('browser');
      }
    }
  }, []);

  if (!isOpen) return null;

  const browserConfig = {
    chrome: {
      name: 'Chrome',
      label: 'ADD TO CHROME',
      icon: ChromeIcon,
      schemeUrl: 'chrome://extensions',
      color: '#4285F4',
    },
    edge: {
      name: 'Microsoft Edge',
      label: 'ADD TO EDGE',
      icon: EdgeIcon,
      schemeUrl: 'edge://extensions',
      color: '#0078D4',
    },
    brave: {
      name: 'Brave',
      label: 'ADD TO BRAVE',
      icon: BrowserIcon,
      schemeUrl: 'brave://extensions',
      color: '#FB542B',
    },
    firefox: {
      name: 'Firefox',
      label: 'ADD TO FIREFOX',
      icon: BrowserIcon,
      schemeUrl: 'about:debugging#/runtime/this-firefox',
      color: '#FF7139',
    },
    browser: {
      name: 'Browser',
      label: 'ADD TO BROWSER',
      icon: BrowserIcon,
      schemeUrl: 'chrome://extensions',
      color: '#16794B',
    },
  }[browserType] || {
    name: 'Chrome',
    label: 'ADD TO CHROME',
    icon: ChromeIcon,
    schemeUrl: 'chrome://extensions',
    color: '#4285F4',
  };

  const CurrentBrowserIcon = browserConfig.icon;

  const handleScan = async () => {
    if (!targetUrl || !targetUrl.trim()) {
      setError('Please enter a valid URL to inspect.');
      return;
    }

    let normalized = targetUrl.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
      setTargetUrl(normalized);
    }

    setIsScanning(true);
    setResult(null);
    setError(null);
    setScanStep(1);

    setTimeout(() => setScanStep(2), 300);
    setTimeout(() => setScanStep(3), 600);
    setTimeout(() => setScanStep(4), 900);

    try {
      const res = await api.analyzeUrl(normalized);
      const data = res.data || res;
      setTimeout(() => {
        setResult(data);
        setIsScanning(false);
        setScanStep(5);
      }, 1200);
    } catch (err) {
      setTimeout(() => {
        setError(err.message || 'Threat intelligence engine could not analyze this URL.');
        setIsScanning(false);
        setScanStep(0);
      }, 800);
    }
  };

  const handleDownloadExtension = async () => {
    try {
      await downloadExtensionZipPackage(getApiBaseUrl());
      setDownloadSuccess(true);
      setActiveTab('install');
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to download extension package:', err);
    }
  };

  const handleCopyPath = () => {
    const fullPath = 'phishing-detection-tool/extension';
    navigator.clipboard?.writeText(fullPath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2500);
  };

  const handleCopyScheme = (scheme) => {
    navigator.clipboard?.writeText(scheme);
    setCopiedScheme(true);
    setTimeout(() => setCopiedScheme(false), 2500);
  };

  const isPhishing = Boolean(
    result && (
      result.classification === 'Critical' ||
      result.classification === 'High' ||
      result.classification === 'Medium' ||
      (result.risk_score && result.risk_score >= 40) ||
      result.ml_analysis?.prediction === 'Phishing'
    )
  );

  const scorePct = result ? (result.risk_score > 1 ? result.risk_score : Math.round((result.risk_score || 0) * 100)) : 0;

  let parsedHost = 'paypal-security-update-center.com';
  try {
    const raw = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    parsedHost = new URL(raw).hostname || targetUrl;
  } catch {
    parsedHost = targetUrl;
  }

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] overflow-y-auto p-4 sm:p-6 bg-black/80 backdrop-blur-md flex items-center justify-center animate-fadeIn"
    >
      <div className="relative flex flex-col items-center max-w-xl w-full my-auto py-4">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between w-full max-w-[420px] mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
              <span>PhishShield Browser Extension</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#7B9669]/30 text-[#BAC8B1] border border-[#7B9669]/40">v1.2</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#BAC8B1] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close extension modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-[#243D2E]/80 p-1 rounded-xl border border-[#BAC8B1]/20 mb-3 w-full max-w-[420px] font-mono text-xs">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-[#7B9669] text-white shadow-sm'
                : 'text-[#BAC8B1] hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </button>
          <button
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'install'
                ? 'bg-[#7B9669] text-white shadow-sm'
                : 'text-[#BAC8B1] hover:text-white hover:bg-white/5'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install in Browser</span>
          </button>
        </div>

        {/* TAB 1: INTERACTIVE SIMULATOR (Frame with Guaranteed High-Contrast Colors) */}
        {activeTab === 'simulator' && (
          <div
            className="phishguard-extension-frame shadow-[0_25px_60px_rgba(0,0,0,0.65)] border-2 border-[#7B9669]/60 rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#243D2E', width: '360px' }}
          >
            {/* Background Layer with Map & Glowing Dots */}
            <div className="bg-layer">
              <div className="world-map"></div>
              <div className="ambient-glow"></div>
              <div className="pdot" style={{ top: '22%', left: '18%' }}></div>
              <div className="pdot" style={{ top: '65%', left: '78%' }}></div>
              <div className="pdot" style={{ top: '45%', left: '50%' }}></div>
            </div>

            {/* Laser Bar */}
            <div className="laser-bar"></div>

            {/* Main Panel with Crisp Dark-Forest Card Theme */}
            <div className="panel" style={{ backgroundColor: '#1C2E22', borderColor: 'rgba(186, 200, 177, 0.3)' }}>
              {/* Header */}
              <div className="pg-header" style={{ borderBottomColor: 'rgba(186, 200, 177, 0.2)' }}>
                <div className="logo-box" style={{ backgroundColor: '#7B9669', borderColor: 'rgba(255,255,255,0.25)' }}>
                  <Shield className="w-4.5 h-4.5 shield-icon text-white" />
                </div>
                <div className="logo-text">
                  <div className="logo-main" style={{ color: '#FFFFFF' }}>
                    PHISH<span style={{ color: '#86EFAC' }}>SHIELD</span>
                  </div>
                  <div className="logo-sub" style={{ color: '#BAC8B1' }}>THREAT DEFENSE V1.2</div>
                </div>
                <div className="status-dot" style={{ backgroundColor: '#86EFAC' }} title="Security Engine Active"></div>
              </div>

              {/* Active Tab URL Tip Bar */}
              <div
                className="tip-bar flex flex-col gap-1.5"
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(186, 200, 177, 0.25)' }}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-white text-[11px]">Active Tab URL:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setTargetUrl(
                        targetUrl.includes('paypal')
                          ? 'https://google.com'
                          : 'https://paypal-security-update-center.com/login'
                      )
                    }
                    className="text-[10px] font-mono text-[#86EFAC] hover:text-white hover:underline cursor-pointer font-bold"
                  >
                    [Toggle Test URL]
                  </button>
                </div>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full bg-[#132217] border border-[#BAC8B1]/40 rounded px-2.5 py-1.5 text-[11px] font-mono text-white focus:outline-none focus:border-[#86EFAC]"
                />
              </div>

              {/* Scan Button */}
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="scan-btn"
                style={{ backgroundColor: '#7B9669', borderColor: '#7B9669', color: '#FFFFFF' }}
              >
                <span className="scan-btn-shine"></span>
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span style={{ color: '#FFFFFF', fontWeight: 800 }}>{isScanning ? 'SCANNING...' : 'SCAN ACTIVE TAB'}</span>
              </button>

              {/* Loading Box */}
              {isScanning && (
                <div className="loading-box" style={{ backgroundColor: 'rgba(0,0,0,0.35)', borderColor: 'rgba(186,200,177,0.25)' }}>
                  <div className="spinner-ring" style={{ borderTopColor: '#86EFAC' }}></div>
                  <div className="log-lines">
                    <div className={`log-line ${scanStep >= 1 ? 'visible' : ''}`} style={{ color: '#BAC8B1' }}>Extracting tab URL...</div>
                    <div className={`log-line ${scanStep >= 2 ? 'visible' : ''}`} style={{ color: '#BAC8B1' }}>Resolving domain heuristics...</div>
                    <div className={`log-line ${scanStep >= 3 ? 'visible' : ''}`} style={{ color: '#BAC8B1' }}>Evaluating lexical entropy...</div>
                    <div className={`log-line ${scanStep >= 4 ? 'visible' : ''}`} style={{ color: '#BAC8B1' }}>Running ML classifier...</div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="result-card error" style={{ backgroundColor: 'rgba(180,35,50,0.3)', borderColor: '#F5B7BD' }}>
                  <div className="result-verdict">
                    <div className="verdict-icon">
                      <AlertTriangle className="w-4 h-4 text-rose-300" />
                    </div>
                    <div className="verdict-label text-rose-300">SCAN NOTICE</div>
                  </div>
                  <p className="error-msg text-rose-200">{error}</p>
                </div>
              )}

              {/* Result Card with High Contrast Colors */}
              {result && !isScanning && (
                <div
                  className={`result-card ${isPhishing ? 'danger' : 'safe'}`}
                  style={{
                    backgroundColor: isPhishing ? 'rgba(180, 35, 50, 0.35)' : 'rgba(22, 121, 75, 0.35)',
                    borderColor: isPhishing ? '#F5B7BD' : '#7B9669',
                  }}
                >
                  <div className="result-verdict" style={{ borderBottomColor: 'rgba(255,255,255,0.15)' }}>
                    <div className="verdict-icon">
                      {isPhishing ? (
                        <X className="w-4.5 h-4.5 text-rose-300" />
                      ) : (
                        <CheckCircle2 className="w-4.5 h-4.5 text-[#86EFAC]" />
                      )}
                    </div>
                    <div className="verdict-label" style={{ color: isPhishing ? '#fca5a5' : '#86EFAC', fontWeight: 900 }}>
                      {isPhishing ? 'PHISHING / MALICIOUS' : 'SAFE'}
                    </div>
                  </div>

                  <div className="result-rows">
                    <div className="result-row">
                      <span className="rk" style={{ color: '#BAC8B1', fontWeight: 600 }}>Domain</span>
                      <span className="rv truncate max-w-[170px]" style={{ color: '#FFFFFF', fontWeight: 700 }} title={parsedHost}>
                        {parsedHost}
                      </span>
                    </div>
                    <div className="result-row">
                      <span className="rk" style={{ color: '#BAC8B1', fontWeight: 600 }}>SSL Status</span>
                      <span className="rv" style={{ color: targetUrl.startsWith('https://') ? '#86EFAC' : '#FCA5A5', fontWeight: 700 }}>
                        {targetUrl.startsWith('https://') ? 'Valid HTTPS' : 'Insecure HTTP'}
                      </span>
                    </div>
                    <div className="result-row">
                      <span className="rk" style={{ color: '#BAC8B1', fontWeight: 600 }}>Threat Level</span>
                      <span className="rv font-bold" style={{ color: isPhishing ? '#fca5a5' : '#86EFAC', fontWeight: 800 }}>
                        {result.classification ? result.classification.toUpperCase() : (isPhishing ? 'HIGH RISK' : 'LOW / CLEAN')}
                      </span>
                    </div>
                  </div>

                  <div className="score-bar-wrap" style={{ borderTopColor: 'rgba(255,255,255,0.12)' }}>
                    <div className="score-bar-label">
                      <span style={{ color: '#BAC8B1', fontWeight: 600 }}>Risk Probability</span>
                      <span style={{ color: '#FFFFFF', fontWeight: 800 }}>{scorePct}%</span>
                    </div>
                    <div className="score-bar-track" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                      <div
                        className="score-bar-fill"
                        style={{
                          width: `${Math.max(4, Math.min(100, scorePct))}%`,
                          backgroundColor: isPhishing ? '#D92D20' : '#10B981',
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Strip */}
            <div className="pg-footer" style={{ color: '#BAC8B1' }}>
              <Shield className="w-3 h-3 text-[#86EFAC]" />
              <span style={{ color: '#BAC8B1' }}>POWERED BY PHISHSHIELD THREAT ENGINE</span>
            </div>
          </div>
        )}

        {/* PRIMARY "ADD TO BROWSER" ACTION BAR */}
        <div className="w-full max-w-[420px] mt-3 space-y-2.5">
          {/* Main Add Button */}
          <button
            onClick={handleDownloadExtension}
            className="w-full py-3 px-5 rounded-xl font-bold font-mono text-xs tracking-wider uppercase text-white shadow-lg flex items-center justify-between gap-3 cursor-pointer transform hover:scale-[1.01] active:scale-[0.99] transition-all bg-gradient-to-r from-[#16794B] via-[#355B43] to-[#1D6FA5] border border-[#86EFAC]/40"
          >
            <div className="flex items-center gap-2.5">
              <CurrentBrowserIcon className="w-5 h-5 text-white shrink-0" />
              <span className="text-sm font-extrabold">{browserConfig.label}</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/20 text-white flex items-center gap-1">
              <span>Install v1.2</span>
              <Download className="w-3 h-3" />
            </span>
          </button>

          {/* Quick Info & Action Buttons */}
          <div className="p-3.5 rounded-xl bg-[#243D2E] border border-[#BAC8B1]/20 text-xs text-[#E6E6E6] shadow-md">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#BAC8B1]/15">
              <span className="font-mono text-[11px] text-[#86EFAC] font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready for {browserConfig.name}</span>
              </span>
              <button
                onClick={() => setActiveTab('install')}
                className="text-[11px] font-mono text-[#BAC8B1] hover:text-white hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View 3-Step Guide</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="truncate text-[11px] text-[#BAC8B1]">
                Unpacked path: <code className="text-white font-mono bg-black/30 px-1.5 py-0.5 rounded text-[10px]">extension/</code>
              </div>
              <button
                onClick={handleCopyPath}
                className="px-2.5 py-1 rounded bg-[#355B43] hover:bg-[#7B9669] text-white text-[11px] font-mono font-bold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedPath ? <Check className="w-3 h-3 text-[#86EFAC]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPath ? 'Copied!' : 'Copy Path'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* TAB 2: STEP-BY-STEP INSTALLATION GUIDE MODAL / DRAWER */}
        {activeTab === 'install' && (
          <div className="w-full max-w-[420px] bg-[#1C2E22] rounded-2xl border-2 border-[#7B9669]/60 p-5 text-[#E6E6E6] space-y-4 shadow-2xl animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#BAC8B1]/15 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <CurrentBrowserIcon className="w-4 h-4 text-[#86EFAC]" />
                  <span>How to Add to {browserConfig.name}</span>
                </h4>
                <p className="text-[11px] text-[#BAC8B1] font-sans mt-0.5">
                  Follow these 3 quick steps to load PhishShield into your browser:
                </p>
              </div>
            </div>

            {/* Browser Selector Pill Row */}
            <div className="flex items-center gap-1.5 pb-1 overflow-x-auto no-scrollbar font-mono text-[10px]">
              {['chrome', 'edge', 'brave', 'firefox'].map((b) => (
                <button
                  key={b}
                  onClick={() => setBrowserType(b)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                    browserType === b
                      ? 'bg-[#7B9669] text-white font-bold'
                      : 'bg-black/30 text-[#BAC8B1] hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Step 1 */}
            <div className="p-3 rounded-xl bg-black/25 border border-[#BAC8B1]/15 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#16794B] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Get Extension Files</span>
                </span>
                <button
                  onClick={handleDownloadExtension}
                  className="px-2.5 py-1 rounded-lg bg-[#7B9669] hover:bg-[#688258] text-white text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download ZIP</span>
                </button>
              </div>
              <p className="text-[11px] text-[#BAC8B1] font-sans leading-relaxed">
                Click <strong>Download ZIP</strong> to save <code>phishshield-extension.zip</code> and extract it, or use the project's local <code>extension/</code> folder.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-xl bg-black/25 border border-[#BAC8B1]/15 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1D6FA5] text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Open Browser Extensions Page</span>
                </span>
                <button
                  onClick={() => handleCopyScheme(browserConfig.schemeUrl)}
                  className="px-2.5 py-1 rounded-lg bg-[#1D6FA5] hover:bg-[#15537D] text-white text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedScheme ? <Check className="w-3 h-3 text-[#86EFAC]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedScheme ? 'Copied!' : 'Copy URL'}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#BAC8B1] font-sans leading-relaxed">
                Open a new tab and navigate to:
              </p>
              <div className="p-2 rounded bg-black/40 border border-white/10 font-mono text-[11px] text-[#86EFAC] select-all break-all">
                {browserConfig.schemeUrl}
              </div>
              <p className="text-[10px] text-[#BAC8B1]/70 font-sans italic">
                *Browsers block web apps from launching internal scheme URLs directly for security. Simply copy and paste the URL into your address bar.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-xl bg-black/25 border border-[#BAC8B1]/15 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#B54708] text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Enable Developer Mode &amp; Load</span>
                </span>
              </div>
              <ol className="list-decimal list-inside text-[11px] text-[#BAC8B1] font-sans space-y-1.5 leading-relaxed">
                <li>Toggle on <strong>Developer mode</strong> in the top-right corner.</li>
                <li>Click the <strong>Load unpacked</strong> button in the top-left toolbar.</li>
                <li>
                  Select the extension folder:
                  <div className="mt-1 flex items-center gap-2">
                    <code className="text-white bg-black/40 px-2 py-1 rounded text-[10px] flex-1 truncate">
                      phishing-detection-tool/extension
                    </code>
                    <button
                      onClick={handleCopyPath}
                      className="px-2 py-1 rounded bg-[#355B43] hover:bg-[#7B9669] text-white text-[10px] font-mono font-bold cursor-pointer"
                    >
                      {copiedPath ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </li>
              </ol>
            </div>

            {/* Success Finish Banner */}
            <div className="p-3 rounded-xl bg-[#16794B]/20 border border-[#16794B]/50 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#86EFAC] shrink-0" />
              <div className="text-[11px] font-sans text-white">
                <span className="font-bold text-[#86EFAC] block font-mono">Ready to Protect!</span>
                Pin the PhishShield shield icon to your toolbar to inspect tabs anytime in 1 click.
              </div>
            </div>

            {/* Back button */}
            <button
              onClick={() => setActiveTab('simulator')}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
            >
              Back to Live Simulator
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
