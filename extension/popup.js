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
      let payload = null;
      try {
        const response = await fetch(`${API_BASE}/analyze/url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlToScan }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.success && data.data) {
            payload = data.data;
          } else if (data && data.risk_score !== undefined) {
            payload = data;
          }
        }
      } catch (netErr) {
        console.warn('Flask threat engine offline, evaluating via local heuristic engine:', netErr);
      }

      // If backend did not yield a valid scan object, use client heuristic analysis
      if (!payload || payload.risk_score === undefined) {
        payload = heuristicAnalyzeUrl(urlToScan);
      }

      setTimeout(() => {
        loadingBox.classList.add('hidden');
        scanBtn.disabled = false;
        scanBtnText.textContent = 'SCAN ACTIVE TAB';
        if (!payload) {
          renderError('Threat intelligence engine could not analyze this URL.');
        } else {
          renderResults(payload);
        }
      }, 1400);
    } catch (err) {
      setTimeout(() => {
        loadingBox.classList.add('hidden');
        scanBtn.disabled = false;
        scanBtnText.textContent = 'SCAN ACTIVE TAB';
        renderError('Threat intelligence engine could not analyze this URL.');
      }, 800);
    }
  });

  function heuristicAnalyzeUrl(rawUrl) {
    const url = (rawUrl || '').trim();
    let hostname = '';
    let protocol = 'https:';
    try {
      const u = new URL(url.startsWith('http') ? url : `https://${url}`);
      hostname = u.hostname.toLowerCase();
      protocol = u.protocol.toLowerCase();
    } catch {
      hostname = url.split('/')[0].split(':')[0].toLowerCase();
    }

    const isIp = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/.test(hostname);
    const typos = ['paypa1', 'micros0ft', 'arnazon', 'app1e', 'netf1ix', 'g00gle', 'ch4se', 'b1nance'];
    const hasTypo = typos.some(t => hostname.includes(t));

    const brands = ['paypal', 'microsoft', 'google', 'apple', 'amazon', 'netflix', 'chase', 'facebook', 'instagram', 'linkedin'];
    const authenticRegexes = {
      paypal: /^([a-z0-9-]+\.)*paypal\.(com|[a-z]{2}|me)$/,
      microsoft: /^([a-z0-9-]+\.)*microsoft\.(com|net|org)$/,
      google: /^([a-z0-9-]+\.)*google\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/,
      apple: /^([a-z0-9-]+\.)*apple\.(com|[a-z]{2}|co\.[a-z]{2})$/,
      amazon: /^([a-z0-9-]+\.)*amazon\.(com|in|co\.uk|de|fr|ca)$/,
      netflix: /^([a-z0-9-]+\.)*netflix\.(com|[a-z]{2}|net)$/,
      chase: /^([a-z0-9-]+\.)*chase\.com$/,
      facebook: /^([a-z0-9-]+\.)*facebook\.com$/,
      instagram: /^([a-z0-9-]+\.)*instagram\.com$/,
      linkedin: /^([a-z0-9-]+\.)*linkedin\.com$/
    };

    let brandAbuse = false;
    for (const b of brands) {
      if (hostname.includes(b)) {
        const regex = authenticRegexes[b];
        if (!regex || !regex.test(hostname)) {
          brandAbuse = true;
          break;
        }
      }
    }

    const keywords = ['login', 'signin', 'security', 'verify', 'update', 'account', 'banking', 'recovery', 'wallet', 'confirm'];
    const kwMatches = keywords.filter(k => url.toLowerCase().includes(k));
    const hyphens = (hostname.match(/-/g) || []).length;

    let score = 0;
    if (isIp || hasTypo) {
      score = 85;
    } else if (brandAbuse) {
      score = 70 + Math.min(25, kwMatches.length * 5 + (hyphens >= 2 ? 10 : 0));
    } else if (kwMatches.length >= 2) {
      score = 55 + (hyphens >= 2 ? 15 : 0);
    } else if (hyphens >= 3) {
      score = 45;
    } else {
      score = protocol === 'http:' ? 25 : 0;
    }

    let classification = 'Low';
    if (score >= 76) classification = 'Critical';
    else if (score >= 51) classification = 'High';
    else if (score >= 26) classification = 'Medium';

    return {
      input_url: url,
      risk_score: score,
      classification: classification,
      ml_analysis: {
        prediction: score >= 50 ? 'Phishing' : 'Legitimate',
        phishing_probability: score
      }
    };
  }

  function renderResults(payload) {
    resultCard.className = 'result-card'; // reset classes
    const isPhishing = payload.classification === 'Critical' ||
                       payload.classification === 'High' ||
                       payload.classification === 'Medium' ||
                       (payload.risk_score !== undefined && payload.risk_score >= 40) ||
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
