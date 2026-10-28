# PhishGuard Browser Extension — Glassmorphism Edition

Real-time browser security extension for phishing detection, matching the exact glassmorphism theme and AI models of the PhishGuard / PhishShield platform.

---

## Features
- **340px Ultra-Compact Glassmorphism Popup**: Deep navy background (`#040c18`), world map backdrop, laser scan beam, and emerald glowing accents (`#10b981`).
- **Live Threat Engine Integration**: Connects with the Flask threat engine (`http://127.0.0.1:5000/api/analyze/url`).
- **Real-Time Classification**: Random Forest 15-feature lexical heuristics & entropy analysis.
- **Visual Verdict Card**: Color-coded safe (`#6ee7b7`) and danger (`#f87171`) cards with risk probability bars.

---

## How to Install in Google Chrome or Microsoft Edge

1. Open your browser and navigate to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
2. Enable **Developer Mode** (toggle switch in the top-right corner).
3. Click **"Load unpacked"** (top-left).
4. Select this directory:
   ```
   C:\Users\kanna\.gemini\antigravity-ide\scratch\phishing-detection-tool\extension
   ```
5. Pin the **PhishGuard** shield icon to your browser toolbar!
6. Open any website and click the PhishGuard icon to inspect the active tab in real time.
