// PhishGuard Extension Popup Controller
const API_BASE = 'http://127.0.0.1:5000/api';

document.addEventListener('DOMContentLoaded', async () => {
  const scanBtn = document.getElementById('scanBtn');
  const scanBtnText = document.getElementById('scanBtnText');
  const loadingBox = document.getElementById('loadingBox');
  const resultCard = document.getElementById('resultCard');
  const statusDot = document.getElementById('statusDot');
  const currentUrlDisplay = document.getElementById('currentUrlDisplay');
  const log2 = document.getElementById('log2');
  const log3 = document.getElementById('log3');
  const log4 = document.getElementById('log4');

  const verdictIcon = document.getElementById('verdictIcon');
  const verdictLabel = document.getElementById('verdictLabel');
  const resDomain = document.getElementById('resDomain');
  const resSsl = document.getElementById('resSsl');
  const resRisk = document.getElementById('resRisk');
  const resScore = document.getElementById('resScore');
  const scoreBarFill = document.getElementById('scoreBarFill');

  let activeUrl = 'https://paypal-security-update-center.com/login';

  // 1. Check API Health
  try {
    const healthRes = await fetch(`${API_BASE}/health`);
    if (healthRes.ok) {
      statusDot.style.background = '#10b981';
      statusDot.title = 'Protection Engine Active (Online)';
    } else {
      statusDot.style.background = '#f59e0b';
      statusDot.title = 'Engine Connecting...';
    }
  } catch (err) {
    statusDot.style.background = '#ef4444';
    statusDot.title = 'Engine Offline (Check Flask on port 5000)';
  }

  // 2. Query Active Chrome Tab if available
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].url) {
        const tabUrl = tabs[0].url;
        if (tabUrl.startsWith('http://') || tabUrl.startsWith('https://')) {
          activeUrl = tabUrl;
        }
        try {
          const u = new URL(activeUrl);
          currentUrlDisplay.textContent = `Active: ${u.hostname}`;
        } catch {
          currentUrlDisplay.textContent = `Active: ${activeUrl.substring(0, 30)}...`;
        }
      }
    });
  } else {
    currentUrlDisplay.textContent = 'Active: paypal-security-update-center.com';
  }

  // 3. Scan Button Action
  scanBtn.addEventListener('click', async () => {
    let urlToScan = activeUrl.trim();
    if (!urlToScan.startsWith('http://') && !urlToScan.startsWith('https://')) {
      urlToScan = `https://${urlToScan}`;
    }

    scanBtn.disabled = true;
    scanBtnText.textContent = 'SCANNING...';
    loadingBox.classList.remove('hidden');
    resultCard.classList.add('hidden');

    // Reset log lines
    log2.classList.remove('visible');
    log3.classList.remove('visible');
    log4.classList.remove('visible');

    setTimeout(() => log2.classList.add('visible'), 400);
    setTimeout(() => log3.classList.add('visible'), 850);
    setTimeout(() => log4.classList.add('visible'), 1300);

    try {
      const response = await fetch(`${API_BASE}/analyze/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToScan }),
      });

      const data = await response.json();

      setTimeout(() => {
        loadingBox.classList.add('hidden');
        scanBtn.disabled = false;
        scanBtnText.textContent = 'SCAN ACTIVE TAB';
        if (!response.ok || !data.success) {
          renderError(data.error || 'Threat intelligence engine could not analyze this URL.');
        } else {
          renderResults(data.data || data);
        }
      }, 1600);
    } catch (err) {
      setTimeout(() => {
        loadingBox.classList.add('hidden');
        scanBtn.disabled = false;
        scanBtnText.textContent = 'SCAN ACTIVE TAB';
        renderError('Unable to connect to threat defense engine on 127.0.0.1:5000.');
      }, 1000);
    }
  });

  function renderResults(payload) {
    resultCard.className = 'result-card'; // reset classes
    const isPhishing = payload.classification === 'Critical' ||
                       payload.classification === 'High' ||
                       payload.classification === 'Medium' ||
                       (payload.risk_score && payload.risk_score >= 40) ||
                       payload.ml_analysis?.prediction === 'Phishing';
    const scorePct = payload.risk_score > 1 ? payload.risk_score : Math.round((payload.risk_score || 0) * 100);

    let parsedDomain = 'Unknown';
    try {
      parsedDomain = new URL(payload.input_url || activeUrl).hostname;
    } catch {
      parsedDomain = (payload.input_url || activeUrl).split('/')[2] || activeUrl;
    }

    resDomain.textContent = parsedDomain;
    resSsl.textContent = (payload.input_url || activeUrl).startsWith('https://') ? 'Valid HTTPS' : 'Insecure HTTP';
    resScore.textContent = `${scorePct}%`;
    scoreBarFill.style.width = `${Math.max(4, Math.min(100, scorePct))}%`;

    if (isPhishing) {
      resultCard.classList.add('danger');
      verdictLabel.textContent = 'PHISHING';
      resRisk.textContent = payload.classification ? payload.classification.toUpperCase() : 'HIGH THREAT';
      verdictIcon.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    } else {
      resultCard.classList.add('safe');
      verdictLabel.textContent = 'SAFE';
      resRisk.textContent = payload.classification ? payload.classification.toUpperCase() : 'CLEAN';
      verdictIcon.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    }

    resultCard.classList.remove('hidden');
  }

  function renderError(msg) {
    resultCard.className = 'result-card error';
    resultCard.innerHTML = `
      <div class="result-verdict">
        <div class="verdict-icon" style="background: rgba(248,113,113,0.2); border: 1px solid rgba(248,113,113,0.4);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="verdict-label" style="color: #f87171; font-size: 15px;">ENGINE OFFLINE</div>
      </div>
      <p class="error-msg">${msg}</p>
    `;
    resultCard.classList.remove('hidden');
  }
});
