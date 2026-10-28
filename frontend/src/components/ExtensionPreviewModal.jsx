import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function ExtensionPreviewModal({ isOpen, onClose }) {
  const [targetUrl, setTargetUrl] = useState('https://paypal-security-update-center.com/login');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0 = idle, 1 = log1, 2 = log2, 3 = log3, 4 = log4, 5 = done
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

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
      className="fixed inset-0 z-[9999] overflow-y-auto p-4 sm:p-6 bg-black/85 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200"
    >
      <div className="relative flex flex-col items-center max-w-xl w-full my-auto py-6">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between w-full max-w-[360px] mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
              PhishShield Extension Preview
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close extension modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Exact 340px Extension Popup Container Frame */}
        <div
          className="phishguard-extension-frame shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(16,185,129,0.2)] border border-emerald-500/35"
          style={{ backgroundColor: '#040c18' }}
        >
          {/* 1. Background Layer (contained inside frame) */}
          <div className="bg-layer">
            <div className="world-map"></div>
            <div className="ambient-glow"></div>
            <div className="pdot" style={{ top: '22%', left: '18%' }}></div>
            <div className="pdot" style={{ top: '65%', left: '78%' }}></div>
            <div className="pdot" style={{ top: '45%', left: '50%' }}></div>
          </div>

          {/* 2. Laser Bar */}
          <div className="laser-bar"></div>

          {/* 3. Main Glassmorphic Panel */}
          <div className="panel">
            {/* Header */}
            <div className="pg-header">
              <div className="logo-box">
                <Shield className="w-4.5 h-4.5 shield-icon text-emerald-400" />
              </div>
              <div className="logo-text">
                <div className="logo-main">
                  PHISH<span className="logo-accent">SHIELD</span>
                </div>
                <div className="logo-sub">THREAT DEFENSE V1.2</div>
              </div>
              <div className="status-dot" title="Security Engine Active"></div>
            </div>

            {/* Tip Bar / URL Selector */}
            <div className="tip-bar flex flex-col gap-1.5">
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-slate-300">Active Tab URL:</span>
                <button
                  type="button"
                  onClick={() =>
                    setTargetUrl(
                      targetUrl.includes('paypal')
                        ? 'https://google.com'
                        : 'https://paypal-security-update-center.com/login'
                    )
                  }
                  className="text-[9.5px] font-mono text-[#6ee7b7] hover:underline"
                >
                  [Toggle Test URL]
                </button>
              </div>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            {/* Scan Button */}
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="scan-btn"
            >
              <span className="scan-btn-shine"></span>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isScanning ? 'SCANNING...' : 'SCAN ACTIVE TAB'}</span>
            </button>

            {/* Loading Box */}
            {isScanning && (
              <div className="loading-box">
                <div className="spinner-ring"></div>
                <div className="log-lines">
                  <div className={`log-line ${scanStep >= 1 ? 'visible' : ''}`}>Extracting tab URL...</div>
                  <div className={`log-line ${scanStep >= 2 ? 'visible' : ''}`}>Resolving domain heuristics...</div>
                  <div className={`log-line ${scanStep >= 3 ? 'visible' : ''}`}>Evaluating lexical entropy...</div>
                  <div className={`log-line ${scanStep >= 4 ? 'visible' : ''}`}>Running ML classifier...</div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="result-card error">
                <div className="result-verdict">
                  <div className="verdict-icon">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="verdict-label text-rose-400">SCAN NOTICE</div>
                </div>
                <p className="error-msg">{error}</p>
              </div>
            )}

            {/* Result Card */}
            {result && !isScanning && (
              <div className={`result-card ${isPhishing ? 'danger' : 'safe'}`}>
                <div className="result-verdict">
                  <div className="verdict-icon">
                    {isPhishing ? (
                      <X className="w-4.5 h-4.5 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                    )}
                  </div>
                  <div className="verdict-label">
                    {isPhishing ? 'PHISHING' : 'SAFE'}
                  </div>
                </div>

                <div className="result-rows">
                  <div className="result-row">
                    <span className="rk">Domain</span>
                    <span className="rv truncate max-w-[170px]" title={parsedHost}>{parsedHost}</span>
                  </div>
                  <div className="result-row">
                    <span className="rk">SSL Status</span>
                    <span className="rv">{targetUrl.startsWith('https://') ? 'Valid HTTPS' : 'Insecure HTTP'}</span>
                  </div>
                  <div className="result-row">
                    <span className="rk">Threat Level</span>
                    <span className="rv">{result.classification ? result.classification.toUpperCase() : (isPhishing ? 'HIGH RISK' : 'CLEAN')}</span>
                  </div>
                </div>

                <div className="score-bar-wrap">
                  <div className="score-bar-label">
                    <span>Risk Probability</span>
                    <span>{scorePct}%</span>
                  </div>
                  <div className="score-bar-track">
                    <div className="score-bar-fill" style={{ width: `${Math.max(4, Math.min(100, scorePct))}%` }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Strip */}
          <div className="pg-footer">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>POWERED BY PHISHSHIELD THREAT ENGINE</span>
          </div>
        </div>

        {/* Extension Info Box */}
        <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-white/10 text-center max-w-[360px] w-full text-xs text-slate-300 shadow-lg">
          <p className="font-mono text-[11px] text-emerald-400 mb-1 font-bold">
            ✓ PhishShield Extension Ready
          </p>
          <p className="text-[11px] text-slate-400">
            Unpacked extension folder ready at:
            <code className="text-emerald-400 font-mono block mt-0.5 text-[10px] break-all">
              phishing-detection-tool/extension
            </code>
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
