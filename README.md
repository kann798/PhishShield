# 🛡️ PhishShield — Phishing Detection & Threat Intelligence Platform

PhishShield is an open-source, full-stack cybersecurity application engineered to detect phishing attempts by inspecting URLs, email headers, message bodies, and social engineering patterns. 

Built with **Python Flask** (backend heuristics engine & SQLite database) and **React + Vite + Tailwind CSS** (cybersecurity dark-mode interface with Recharts), PhishShield provides real-time threat scores, explainable indicators, an interactive awareness simulator, and downloadable compliance reports.

---

## 🌟 Key Features

### 1. 🔍 Phishing URL Detection
- **Host & IP Inspection:** Flags numeric IPv4/IPv6 addresses used in place of registered domains (e.g., `http://192.168.1.1/login`).
- **Brand Homoglyph & Typosquatting:** Detects lookalike characters and common brand impersonations (e.g., `paypa1`, `micros0ft`, `arnazon`, `googIe`).
- **Subdomain Deception:** Identifies brand names pushed into deep subdomains to mask malicious root domains (e.g., `paypal.com.account-update.xyz`).
- **URL Shortener Detection:** Detects link-shortening services (`bit.ly`, `tinyurl.com`, `t.co`, etc.) that obfuscate destinations.
- **Protocol Evaluation:** Evaluates HTTP vs HTTPS while educating users that HTTPS alone does **not** guarantee safety.
- **Explainable Indicators:** Every finding explains **why** it is suspicious, backed by extracted evidence snippets.

### 2. 📧 Phishing Email & Header Analysis
- **Header Discrepancy Checks:** Detects Business Email Compromise (BEC) through `From` vs `Reply-To` mismatches.
- **Display Name Spoofing:** Flags emails where the display name claims to be a brand (e.g., `"Microsoft Support"`) while sent from an untrusted or free webmail domain.
- **Social Engineering Traps:** Identifies urgent time constraints ("within 24 hours"), account suspension threats, and credential solicitations.
- **Payment & Invoice Scams:** Detects wire transfers, crypto payments, gift cards, and fraudulent invoice memos.
- **Embedded Link Scanning:** Automatically extracts all hyperlinks from the email body and assesses their threat scores.
- **Dangerous Attachment Warning:** Flags references to high-risk files (`.exe`, `.scr`, `.iso`, `.docm`).

### 3. 📊 Real-Time Threat Dashboard
- **Aggregate Metrics:** Total URLs analyzed, total emails analyzed, suspicious threats flagged, and safe/clean records.
- **Interactive Visualizations:** Recharts Risk Distribution Doughnut chart and Risk Distribution Volume bar charts.
- **Audit Logs:** Recent scans table with one-click inspection triggers.
- **Sample Data Flagging:** Initial demonstration records are clearly marked as synthetic samples.

### 4. 🗄️ SQLite Scan History & Auditing
- Local SQLite database persistence (`phishing_detector.db`).
- Search by target, subject, or indicator keywords.
- Filter by scan type (URL / Email) and risk level (Low, Medium, High, Critical).
- Detailed inspection modal showing full URL anatomy and header metadata.
- Privacy-conscious design: raw email content is never stored permanently.

### 5. 🎓 Interactive Awareness Center
- **Spot-the-Phish Simulator:** Interactive quiz with 4 real-world email scenarios, instant verdict feedback, and score tracking.
- **Attack Taxonomy:** Educational guides on Spear Phishing, Whaling, BEC, Clone Phishing, Smishing, and Vishing.
- **Red Flag Guide:** How to identify homoglyphs, deceptive subdomains, and deceptive links.
- **Prevention Checklist:** Actionable best practices (MFA, out-of-band verification, reporting).

### 6. 📄 Downloadable Reports
- Export complete security audit reports in **JSON** or **CSV** formats.
- Formatted executive memo view with print and PDF support.

---

## 🏗️ Project Architecture

```
phishing-detection-tool/
├── backend/
│   ├── analyzers/
│   │   ├── __init__.py
│   │   ├── risk_scorer.py        # Heuristic scoring engine (0-100 scale & thresholds)
│   │   ├── url_analyzer.py       # Offline URL parser, typosquatting & homoglyph detector
│   │   └── email_analyzer.py     # Email header parser, BEC & social engineering analyzer
│   ├── tests/
│   │   ├── test_api.py           # Integration tests for Flask endpoints
│   │   ├── test_url_analyzer.py  # Unit tests for URL heuristics
│   │   └── test_email_analyzer.py# Unit tests for email & BEC heuristics
│   ├── app.py                    # Flask REST API with CORS, size limits & route handlers
│   ├── database.py               # SQLite schema, CRUD operations & sample data seeding
│   ├── pytest.ini                # Pytest configuration
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Top header with engine status & quick triggers
│   │   │   ├── Sidebar.jsx       # Cyber navigation sidebar with active indicator
│   │   │   ├── RiskBadge.jsx     # Glowing threat level badge (Low/Med/High/Critical)
│   │   │   ├── RiskGauge.jsx     # Radial threat score meter
│   │   │   ├── IndicatorCard.jsx # Technical finding card with copyable evidence
│   │   │   ├── ScanDetailModal.jsx # Comprehensive scan anatomy & breakdown modal
│   │   │   └── AlertBanner.jsx   # Toast notifications and status alerts
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Overview metrics and Recharts threat distribution
│   │   │   ├── UrlAnalyzer.jsx   # URL threat scanner with preset test samples
│   │   │   ├── EmailAnalyzer.jsx # Email & header analyzer with URL extraction
│   │   │   ├── ScanHistory.jsx   # Searchable and filterable SQLite scan table
│   │   │   ├── AwarenessCenter.jsx # Spot-the-Phish simulator & training modules
│   │   │   ├── Reports.jsx       # Executive report memo & JSON/CSV downloads
│   │   │   └── About.jsx         # Architecture, threat model & limitation specs
│   │   ├── services/
│   │   │   └── api.js            # Unified API client communicating with Flask
│   │   ├── App.jsx               # Root application component
│   │   ├── index.css             # Tailwind directives & custom cyber aesthetics
│   │   └── main.jsx              # React DOM mounting
│   ├── index.html                # Entry HTML with cybersecurity fonts and favicon
│   ├── tailwind.config.js        # Cyber theme tokens & glow shadows
│   └── package.json              # Node dependencies
└── README.md                     # Documentation & setup guide
```

---

## 🔒 Threat Model & Safety Guarantees

1. **Zero-SSRF (Server-Side Request Forgery) Principle:**
   - All submitted URL strings are analyzed **strictly offline** using static parsing, regular expressions, and algorithmic heuristics.
   - The server **never** initiates an outbound HTTP connection to target addresses, preventing attackers from using this tool as an open proxy or tracking beacon.
2. **Data Privacy Protection:**
   - Raw email message bodies are **never** stored permanently in the database.
   - The database only records a sanitized subject snippet, the sender identifier, and a SHA-256 hash for audit integrity.
3. **Calibrated Heuristic Scoring:**
   - Threat scores (0–100) are computed using non-linear diminishing returns to prevent runaway values while ensuring critical indicators immediately elevate the score.
   - Results are presented as heuristic confidence classifications without claiming to be verified statistical certainties.

---

## ⚙️ Windows Installation & Execution Guide

### Prerequisites
- **Python 3.10+** (Python 3.13 tested)
- **Node.js 18+** (Node v22 tested) with `npm`

---

### Step 1: Open Terminal in Project Directory
Open PowerShell or Command Prompt and navigate to the project directory:
```powershell
cd C:\Users\kanna\.gemini\antigravity-ide\scratch\phishing-detection-tool
```

---

### Step 2: Set Up & Run the Python Flask Backend

1. Navigate to the `backend` folder:
   ```powershell
   cd backend
   ```

2. Create a virtual environment (if not already created):
   ```powershell
   python -m venv venv
   ```

3. Activate the virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
   *(If script execution is disabled on PowerShell, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first).*

4. Install backend dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

5. Run the automated test suite to verify all 19 test cases pass:
   ```powershell
   pytest -v
   ```

6. Start the Flask backend server:
   ```powershell
   python app.py
   ```
   *The backend will initialize the SQLite database (`phishing_detector.db`) and listen on `http://127.0.0.1:5000`.*

---

### Step 3: Set Up & Run the React Frontend

1. Open a **second terminal window** and navigate to the `frontend` folder:
   ```powershell
   cd C:\Users\kanna\.gemini\antigravity-ide\scratch\phishing-detection-tool\frontend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
   *The frontend will launch at `http://127.0.0.1:5173`.*

---

### Step 4: Open and Test in Browser

Open your browser and navigate to:
```
http://127.0.0.1:5173
```

---

## 🧪 Testing Guide with Synthetic Test Cases

### 1. URL Analysis Test Cases

| Scenario | Test URL String | Expected Risk Level | Key Indicators Triggered |
|---|---|---|---|
| **Raw IP Address** | `http://192.168.1.45/paypal-login/verify.php` | **Critical** (85–95) | Numeric IP host, phishing keywords (`login`, `verify`), insecure HTTP |
| **Brand Typosquatting** | `http://paypa1-security-verification.com/signin` | **Critical** (75–85) | Character substitution (`paypa1`), credential keywords, multiple hyphens |
| **Subdomain Deception** | `http://paypal.com.account-update.xyz/login` | **High** (60–75) | Brand abuse in subdomain, high-risk TLD (`.xyz`), login keyword |
| **URL Shortener** | `https://bit.ly/3xY8a9Q` | **Medium** (25–35) | Known shortener service masking destination |
| **Legitimate Portal** | `https://www.google.com/search?q=cybersecurity` | **Low** (0–10) | Clean domain, valid HTTPS notice, no suspicious patterns |

---

### 2. Email Analysis Test Cases

| Scenario | Sample Content | Expected Risk Level | Key Findings |
|---|---|---|---|
| **Office 365 Display Spoof** | `From: "Microsoft Security" <user@genericmail.xyz>` <br> `Subject: Account Suspended in 24 Hours` | **Critical** (80–90) | Display name impersonation, urgent coercion, credential request |
| **BEC Wire Transfer** | `From: CEO <ceo@company.com>` <br> `Reply-To: phish@evil.net` <br> `Please wire $50,000 today` | **Critical** (75–85) | Reply-To / From mismatch, wire fraud patterns |
| **Legitimate Newsletter** | `From: Security Team <security@company.internal>` <br> `Subject: Monthly Tech Digest` | **Low** (0–15) | Consistent internal headers, no coercive phrasing |

---

## 📡 REST API Reference

| Method | Endpoint | Description | Sample Query / Payload |
|---|---|---|---|
| `GET` | `/api/health` | Health status of service and database | None |
| `POST` | `/api/analyze/url` | Inspect URL string and persist scan | `{"url": "http://192.168.1.1/login"}` |
| `POST` | `/api/analyze/email` | Inspect email text and headers | `{"email_content": "From: ... Subject: ..."}` |
| `GET` | `/api/scans` | Retrieve scan logs with filtering | `?type=url&risk=critical&search=paypal` |
| `GET` | `/api/scans/<id>` | Fetch complete scan record with anatomy | None |
| `DELETE` | `/api/scans/<id>` | Delete single scan record | None |
| `DELETE` | `/api/scans` | Clear all scan history | None |
| `GET` | `/api/dashboard/stats` | Aggregated threat stats and chart distributions | None |
| `GET` | `/api/reports/<id>/export` | Download report file | `?format=json` or `?format=csv` |

---

## ⚖️ Detection Limitations

1. **Heuristics vs Dynamic Sandboxing:**
   - PhishShield evaluates static text properties. It does not render JavaScript or execute dynamic DOM inspection.
2. **False Positives:**
   - Marketing emails often use URL shorteners or generic greetings ("Dear User") which may yield Medium risk.
3. **False Negatives:**
   - Zero-day phishing campaigns hosted on reputable cloud storage (e.g. OneDrive forms) without obvious keywords may avoid detection until threat intelligence signatures are updated.

---

## 📜 License
This project is released under the **MIT License** for educational and cybersecurity awareness purposes.
