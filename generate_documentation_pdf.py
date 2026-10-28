"""
PhishShield Complete Project Documentation PDF Generator
Generates a professional, comprehensive, downloadable PDF document explaining the entire
PhishShield project using ReportLab.
"""
import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

# Output paths
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILENAME = "PhishShield_Complete_Project_Documentation.pdf"
OUTPUT_PATH = os.path.join(PROJECT_ROOT, OUTPUT_FILENAME)
PUBLIC_OUTPUT_PATH = os.path.join(PROJECT_ROOT, "frontend", "public", OUTPUT_FILENAME)


class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and print total page count
    along with running header and footer.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        # Do not draw header or footer on the cover page (Page 1)
        if self._pageNumber == 1:
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#0f2b48"))

        # Running Header
        self.drawString(54, 755, "PHISHSHIELD")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(125, 755, "|  Phishing Detection & Threat Analysis System  —  Complete Project Documentation")
        
        # Header Rule
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.6)
        self.line(54, 748, 558, 748)

        # Running Footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(54, 38, "PhishShield Architecture & Operational Guide  •  Educational Threat Analysis")

        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 38, page_str)

        # Footer Rule
        self.line(54, 48, 558, 48)

        self.restoreState()


def create_documentation_pdf(target_file):
    # Standard margins: 0.75 in (54 pt)
    doc = SimpleDocTemplate(
        target_file,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Curated Professional Palette
    c_primary = colors.HexColor("#0f2b48")    # Deep Navy
    c_secondary = colors.HexColor("#0284c7")  # Cyan / Cerulean Accent
    c_dark = colors.HexColor("#1e293b")       # Charcoal Body Text
    c_muted = colors.HexColor("#64748b")      # Slate Muted
    c_card_bg = colors.HexColor("#f8fafc")    # Light Neutral Background

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=c_primary,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_secondary,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=c_primary,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14.5,
        textColor=c_secondary,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12.5,
        textColor=c_dark,
        spaceBefore=5,
        spaceAfter=2,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=c_dark,
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=c_dark,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2.5
    )

    callout_style = ParagraphStyle(
        'Callout_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=c_primary
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7,
        leading=9.5,
        textColor=colors.HexColor("#0f172a")
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7,
        leading=10,
        textColor=c_dark
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=10,
        textColor=c_primary
    )

    story = []

    # =========================================================================
    # PAGE 1: COVER / TITLE PAGE
    # =========================================================================
    story.append(Spacer(1, 25))
    story.append(Paragraph("PHISHSHIELD", title_style))
    story.append(Paragraph("Phishing Detection & Threat Analysis System", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2.5, color=c_secondary, spaceBefore=0, spaceAfter=15))

    overview_p = (
        "<b>PhishShield</b> is a defensive cybersecurity and threat intelligence platform "
        "engineered to inspect suspicious website URLs and incoming email messages. It integrates a "
        "hybrid dual-engine architecture combining zero-SSRF offline heuristic inspection, lexical URL "
        "anatomy extraction, NLP email linguistic checks, and supervised machine learning models to "
        "deliver instant risk verdicts, a transparent 0–100 threat score, and actionable security "
        "remediation advice without exposing user networks to attacker beacons or external tracking."
    )
    story.append(Paragraph(overview_p, body_style))
    story.append(Spacer(1, 10))

    meta_data = [
        [Paragraph("<b>Project Title</b>", table_cell_bold), Paragraph("PhishShield — Phishing Detection and Threat Analysis System", table_cell_style)],
        [Paragraph("<b>Document Version</b>", table_cell_bold), Paragraph("1.1.0 (Complete System Specification & Interview Guide)", table_cell_style)],
        [Paragraph("<b>Application Type</b>", table_cell_bold), Paragraph("Full-Stack Defensive Threat Analysis Platform", table_cell_style)],
        [Paragraph("<b>Frontend Stack</b>", table_cell_bold), Paragraph("React 19, Vite 8, Tailwind CSS, Recharts, Lucide Icons, jsPDF", table_cell_style)],
        [Paragraph("<b>Backend Stack</b>", table_cell_bold), Paragraph("Python 3.13.1, Flask 3.1.3 REST API, SQLite 3 Persistence, Pytest", table_cell_style)],
        [Paragraph("<b>Machine Learning</b>", table_cell_bold), Paragraph("Scikit-Learn (Random Forest URL Classifier + TF-IDF Logistic Regression NLP)", table_cell_style)],
        [Paragraph("<b>Target Audience</b>", table_cell_bold), Paragraph("Cybersecurity Students, Junior SOC Analysts, Developers & Interview Evaluators", table_cell_style)],
        [Paragraph("<b>Release Date</b>", table_cell_bold), Paragraph("October 2026", table_cell_style)],
    ]
    t_meta = Table(meta_data, colWidths=[120, 384])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_card_bg),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 12))

    principles_text = (
        "<b>Core Architectural Commitments:</b><br/>"
        "• <b>Zero-SSRF Safety:</b> Inspects URLs entirely via offline string parsing and regular expressions without outbound socket connections.<br/>"
        "• <b>Privacy-First Sanitization:</b> Raw email bodies, passwords, and sessions are never stored in SQLite; only sanitized hashes and snippets are preserved.<br/>"
        "• <b>Hybrid Ensemble:</b> Deterministic rule weights (65%) are fused with statistical machine learning probabilities (35%) to prevent false negatives."
    )
    t_prin = Table([[Paragraph(principles_text, callout_style)]], colWidths=[504])
    t_prin.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#eff6ff")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#93c5fd")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(t_prin)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: TABLE OF CONTENTS
    # =========================================================================
    story.append(Paragraph("TABLE OF CONTENTS", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceBefore=2, spaceAfter=12))

    toc_items = [
        ("1. Project Overview & Problem Statement", "Purpose, problem statement, objectives, main features, and beginner-friendly value."),
        ("2. Complete Technology Stack", "Verified frontend, backend, database, ML/AI, and cybersecurity detection components."),
        ("3. Application Architecture", "Multi-tier system diagram, layer responsibilities, and data communication flow."),
        ("4. Complete Application Workflow", "Step-by-step operational lifecycle for URL, Email, scoring, ML, history, and reports."),
        ("5. Dashboard Metrics & Telemetry Analysis", "Data sources, calculation formulas, and distinguishing real from sample data."),
        ("6. Project Directory & File Structure", "Complete tree diagram with file roles and technical categorization."),
        ("7. Backend REST API Specification", "Endpoint catalog, parameters, responses, caller components, and credential safety."),
        ("8. Security Features & Honest Limitations", "Input validation, zero-SSRF reality, privacy guarantees, and known constraints."),
        ("9. Installation, Setup & Execution Guide", "Prerequisites, environment setup, execution commands, and troubleshooting."),
        ("10. Testing, Quality Assurance & Verification", "Unit test suite (Pytest), synthetic presets, and metric disclosures."),
        ("11. Comprehensive Interview Preparation Guide", "Elevator pitch, 15 technical interview Q&As, technology justification, and roadmap."),
    ]

    toc_data = [[Paragraph(f"<b>{t[0]}</b>", table_cell_bold), Paragraph(t[1], table_cell_style)] for t in toc_items]
    t_toc = Table(toc_data, colWidths=[175, 329])
    t_toc.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_card_bg),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_toc)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: SECTION 1 - PROJECT OVERVIEW
    # =========================================================================
    story.append(Paragraph("1. PROJECT OVERVIEW & PROBLEM STATEMENT", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("<b>1.1 Purpose of PhishShield</b>", h2_style))
    story.append(Paragraph(
        "PhishShield is an educational, defensive cybersecurity platform and threat analysis system "
        "designed for everyday computer users, junior SOC analysts, and security students. "
        "It provides a safe environment to evaluate potentially dangerous web links and email communications "
        "before interacting with them, translating cryptic threat indicators into actionable defense advice.",
        body_style
    ))

    story.append(Paragraph("<b>1.2 Problem Statement</b>", h2_style))
    story.append(Paragraph(
        "Social engineering and phishing constitute over 80% of initial network breaches worldwide. "
        "Attackers exploit psychological vulnerabilities and technological blindspots using tactics such as:",
        body_style
    ))
    story.append(Paragraph("• <b>Domain Masquerading:</b> Utilizing Punycode international characters (e.g. Cyrillic 'а' replacing Latin 'a') or character substitutions (e.g. <code>paypa1.com</code>) to impersonate trusted portals.", bullet_style))
    story.append(Paragraph("• <b>Subdomain Deception:</b> Prepending trusted brand names onto unrelated registered domains (e.g. <code>paypal.com.verify-billing.xyz</code>) to deceive mobile address bars.", bullet_style))
    story.append(Paragraph("• <b>Business Email Compromise (BEC):</b> Spoofing executive display names while routing responses through hidden <code>Reply-To</code> addresses.", bullet_style))
    story.append(Paragraph("• <b>Artificial Urgency:</b> Creating false alarms (e.g. 'account suspension in 24 hours') to bypass analytical skepticism.", bullet_style))

    story.append(Paragraph("<b>1.3 Key Objectives & Main Features</b>", h2_style))
    story.append(Paragraph("• <b>URL Analyzer:</b> Deconstructs URL anatomy (scheme, host, subdomains, path, query) and evaluates 14 heuristic checks offline.", bullet_style))
    story.append(Paragraph("• <b>Email Analyzer:</b> Inspects RFC headers, flags display spoofing and Reply-To mismatch, identifies coercion keywords, and scans embedded links.", bullet_style))
    story.append(Paragraph("• <b>Dual Machine Learning Pipeline:</b> Scikit-Learn Random Forest URL classification (15 features) + TF-IDF Logistic Regression NLP for email bodies.", bullet_style))
    story.append(Paragraph("• <b>Deterministic 0–100 Threat Scoring:</b> 4-tier calibrated classification (Low 0-25, Medium 26-50, High 51-75, Critical 76-100).", bullet_style))
    story.append(Paragraph("• <b>Security Operations Dashboard:</b> Aggregates audit logs, Doughnut breakdown, volume histograms, and dynamic relative timestamps.", bullet_style))
    story.append(Paragraph("• <b>Privacy & Export:</b> Zero-tracking client-side PDF forensic reporting, SIEM-compatible JSON/CSV export, and sanitized SQLite storage.", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: SECTION 2 - COMPLETE TECHNOLOGY STACK (FRONTEND & BACKEND)
    # =========================================================================
    story.append(Paragraph("2. COMPLETE TECHNOLOGY STACK", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("<b>2.1 Frontend Technologies</b>", h2_style))
    frontend_stack = [
        [Paragraph("<b>Component</b>", table_header_style), Paragraph("<b>Technology & Version</b>", table_header_style), Paragraph("<b>Role in Application</b>", table_header_style)],
        [Paragraph("Programming Language", table_cell_bold), Paragraph("JavaScript (ES2022+ / JSX)", table_cell_style), Paragraph("Powers client UI rendering, input handling, and async HTTP communication.", table_cell_style)],
        [Paragraph("UI Framework", table_cell_bold), Paragraph("React 19 (v19.3.1)", table_cell_style), Paragraph("Component-based reactive SPA architecture with state hooks and lifecycle management.", table_cell_style)],
        [Paragraph("Build Tool & Bundler", table_cell_bold), Paragraph("Vite 8 (v8.3.4)", table_cell_style), Paragraph("High-speed dev server with hot module replacement and optimized Rolldown production bundler.", table_cell_style)],
        [Paragraph("UI & Styling", table_cell_bold), Paragraph("Tailwind CSS 3 (v3.4.19)", table_cell_style), Paragraph("Powers the dark navy cybersecurity theme, liquid glassmorphism, and responsive layout.", table_cell_style)],
        [Paragraph("Chart Visualization", table_cell_bold), Paragraph("Recharts (v3.10.1)", table_cell_style), Paragraph("Renders interactive Doughnut risk classification breakdown and Volume bar charts.", table_cell_style)],
        [Paragraph("Icon Library", table_cell_bold), Paragraph("Lucide React (v1.62.0)", table_cell_style), Paragraph("Consistent security iconography for shields, alerts, compass, and navigation controls.", table_cell_style)],
        [Paragraph("Client PDF Engine", table_cell_bold), Paragraph("jsPDF (v4.2.1) + AutoTable", table_cell_style), Paragraph("Generates client-side forensic executive inspection reports in PDF format without tracking.", table_cell_style)],
        [Paragraph("State & Event Bus", table_cell_bold), Paragraph("React Hooks + CustomEvent", table_cell_style), Paragraph("Decoupled state management using <code>phishshield:new-scan</code> events for cross-component sync.", table_cell_style)],
    ]
    t_fe = Table(frontend_stack, colWidths=[110, 135, 259])
    t_fe.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_fe)
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>2.2 Backend Technologies</b>", h2_style))
    backend_stack = [
        [Paragraph("<b>Component</b>", table_header_style), Paragraph("<b>Technology & Version</b>", table_header_style), Paragraph("<b>Role in Application</b>", table_header_style)],
        [Paragraph("Programming Language", table_cell_bold), Paragraph("Python 3.13.1", table_cell_style), Paragraph("Executes URL heuristics, NLP vectorization, statistical ML inference, and REST APIs.", table_cell_style)],
        [Paragraph("Web Framework", table_cell_bold), Paragraph("Flask 3.1.3", table_cell_style), Paragraph("Lightweight WSGI framework providing HTTP routing, JSON serialization, and error handlers.", table_cell_style)],
        [Paragraph("CORS Middleware", table_cell_bold), Paragraph("Flask-CORS (v6.0.5)", table_cell_style), Paragraph("Enables Cross-Origin Resource Sharing between Vite frontend (port 5173) and Flask (port 5000).", table_cell_style)],
        [Paragraph("Request Safety Limit", table_cell_bold), Paragraph("Werkzeug Limits (512 KB)", table_cell_style), Paragraph("Strict payload size limit defending server against memory-exhaustion denial of service.", table_cell_style)],
        [Paragraph("Testing Framework", table_cell_bold), Paragraph("Pytest (v9.1.1)", table_cell_style), Paragraph("Automated unit and integration test suite executing 23 tests across analyzers and APIs.", table_cell_style)],
        [Paragraph("Server PDF Engine", table_cell_bold), Paragraph("ReportLab (v5.1.0)", table_cell_style), Paragraph("Compiles server-side PDF forensic reports and technical project documentation.", table_cell_style)],
    ]
    t_be = Table(backend_stack, colWidths=[110, 135, 259])
    t_be.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_be)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: SECTION 2 - DATABASE, ML, & DETECTION
    # =========================================================================
    story.append(Paragraph("<b>2.3 Database & Storage Technologies</b>", h2_style))
    db_summary = [
        [Paragraph("<b>Column Name</b>", table_header_style), Paragraph("<b>Data Type</b>", table_header_style), Paragraph("<b>Privacy Handling & Storage Purpose</b>", table_header_style)],
        [Paragraph("<code>id</code>", table_cell_bold), Paragraph("INTEGER PRIMARY KEY", table_cell_style), Paragraph("Autoincrementing scan record identifier.", table_cell_style)],
        [Paragraph("<code>scan_type</code>", table_cell_bold), Paragraph("TEXT NOT NULL", table_cell_style), Paragraph("Scan category: 'url' or 'email' (Indexed: <code>idx_scans_type</code>).", table_cell_style)],
        [Paragraph("<code>target_identifier</code>", table_cell_bold), Paragraph("TEXT NOT NULL", table_cell_style), Paragraph("Sanitized target link or [Subject Snippet] - Sender. Raw bodies are NEVER stored.", table_cell_style)],
        [Paragraph("<code>risk_score</code>", table_cell_bold), Paragraph("INTEGER NOT NULL", table_cell_style), Paragraph("Normalized hybrid risk score (0 to 100).", table_cell_style)],
        [Paragraph("<code>classification</code>", table_cell_bold), Paragraph("TEXT NOT NULL", table_cell_style), Paragraph("Threat classification: 'Low', 'Medium', 'High', 'Critical' (Indexed).", table_cell_style)],
        [Paragraph("<code>indicator_count</code>", table_cell_bold), Paragraph("INTEGER NOT NULL", table_cell_style), Paragraph("Total number of triggered heuristic indicators.", table_cell_style)],
        [Paragraph("<code>indicators_json</code>", table_cell_bold), Paragraph("TEXT (JSON)", table_cell_style), Paragraph("Serialized findings array (ID, name, severity, weight, evidence string, description).", table_cell_style)],
        [Paragraph("<code>recommendations_json</code>", table_cell_bold), Paragraph("TEXT (JSON)", table_cell_style), Paragraph("Serialized list of actionable defense steps.", table_cell_style)],
        [Paragraph("<code>details_json</code>", table_cell_bold), Paragraph("TEXT (JSON)", table_cell_style), Paragraph("Sanitized domain anatomy or header metadata, plus ML inference telemetry vectors.", table_cell_style)],
        [Paragraph("<code>is_sample</code>", table_cell_bold), Paragraph("BOOLEAN DEFAULT 0", table_cell_style), Paragraph("Flag distinguishing real user scans (0) from synthetic baseline seed records (1).", table_cell_style)],
        [Paragraph("<code>created_at</code>", table_cell_bold), Paragraph("TIMESTAMP", table_cell_style), Paragraph("UTC scan completion timestamp (Indexed: <code>idx_scans_created</code>).", table_cell_style)],
    ]
    t_db = Table(db_summary, colWidths=[95, 110, 299])
    t_db.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_db)
    story.append(Spacer(1, 5))

    story.append(Paragraph("<b>2.4 Machine Learning & AI Implementation</b>", h2_style))
    story.append(Paragraph("• <b>URL Random Forest Classifier:</b> Extracts 15 numerical features (lengths, dots, hyphens, '@', subdomains, is_ip, entropy, digit ratio, keyword count, TLD abuse, unusual ports, Punycode, double slashes), scaled via <code>StandardScaler</code>, classified with <code>RandomForestClassifier(n_estimators=30, max_depth=6)</code>.", bullet_style))
    story.append(Paragraph("• <b>Email NLP Text Classifier:</b> Transforms message text via <code>TfidfVectorizer(ngram_range=(1,2), max_features=300)</code> and evaluates phishing probability with <code>LogisticRegression(C=1.5)</code>.", bullet_style))
    story.append(Paragraph("• <b>Hybrid Risk Ensemble:</b> <code>RiskScorer.calculate()</code> fuses rules with ML: <code>Score = 0.65 * Rules + 0.35 * ML_Probability</code>. Enforces severity floors (Critical=75, High=50, Medium=25) so verified critical threats cannot be overridden by ML confidence.", bullet_style))
    story.append(Paragraph("• <b>Honest Training Disclosure:</b> Models are initialized in-memory from a curated baseline corpus of verified benign and phishing samples on startup (<code>MLEngine.initialize()</code>) for instant local zero-dependency deployment.", bullet_style))

    story.append(Paragraph("<b>2.5 Cybersecurity Detection Rules Summary</b>", h2_style))
    story.append(Paragraph("• <b>14 URL Checks:</b> Raw IP host (IPv4/IPv6), Punycode/IDN homoglyph (<code>xn--</code>), Brand typosquatting (Leetspeak + Levenshtein), Brand subdomain abuse, Excessive subdomains (>=3), Suspicious TLDs (<code>.xyz,.top,.buzz,.tk</code>), URL shorteners (<code>bit.ly,tinyurl</code>), Credential keywords (<code>login,verify</code>), '@' symbol exploit, Abnormal length, Concatenated hyphens, Non-standard ports, Hex encoding (%xx), HTTPS protocol check.", bullet_style))
    story.append(Paragraph("• <b>7 Email Checks:</b> Display Name brand spoofing, Sender vs. Reply-To mismatch, Urgency/coercion language, Credential solicitation, Financial fraud/wire requests, Dangerous attachment references (<code>.exe,.vbs,.iso</code>), Generic greetings + recursive link scanning.", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 6: SECTION 3 & 4 - ARCHITECTURE & WORKFLOW
    # =========================================================================
    story.append(Paragraph("3. APPLICATION ARCHITECTURE & DATA FLOW", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceBefore=2, spaceAfter=8))

    arch_diagram = [
        [Paragraph("<b>LAYER</b>", table_header_style), Paragraph("<b>COMPONENTS & RESPONSIBILITIES</b>", table_header_style)],
        [
            Paragraph("<b>1. Presentation Layer</b><br/>(Client Browser)", table_cell_bold),
            Paragraph("• React 19 SPA with Tailwind CSS Dark Glassmorphism.<br/>"
                      "• Dashboard, URL Analyzer, Email Analyzer, Scan History, Reports, Awareness, Help & FAQ.<br/>"
                      "• Client-side PDF generation (jsPDF) & CustomEvent reactive bus.", table_cell_style)
        ],
        [
            Paragraph("<b>2. Transport Layer</b><br/>(HTTP / REST)", table_cell_bold),
            Paragraph("• Centralized REST client (<code>frontend/src/services/api.js</code>).<br/>"
                      "• CORS enabled for localhost development; 512 KB payload size ceiling.", table_cell_style)
        ],
        [
            Paragraph("<b>3. Controller Layer</b><br/>(Flask 3.1 REST API)", table_cell_bold),
            Paragraph("• Endpoints: <code>/api/analyze/url</code>, <code>/api/analyze/email</code>, <code>/api/scans</code>, <code>/api/dashboard/stats</code>.<br/>"
                      "• Validates input size, normalizes schemes, and invokes detection engines.", table_cell_style)
        ],
        [
            Paragraph("<b>4. Threat Engine Layer</b><br/>(Analyzers & ML)", table_cell_bold),
            Paragraph("• <b>URLAnalyzer:</b> Anatomy decomposition, regex heuristics, typosquatting (SSRF-safe).<br/>"
                      "• <b>EmailAnalyzer:</b> Header parsing, RFC mismatch checks, BEC coercion patterns.<br/>"
                      "• <b>MLEngine:</b> Scikit-Learn Random Forest (15 features) + TF-IDF Logistic Regression.", table_cell_style)
        ],
        [
            Paragraph("<b>5. Scoring & Synthesis</b><br/>(RiskScorer)", table_cell_bold),
            Paragraph("• Calibrated rule weighting with severity floors (Critical=75, High=50, Medium=25).<br/>"
                      "• Hybrid ensemble: 65% Heuristic score + 35% ML statistical probability.<br/>"
                      "• Synthesizes actionable, indicator-driven defense recommendations.", table_cell_style)
        ],
        [
            Paragraph("<b>6. Persistence Layer</b><br/>(SQLite 3)", table_cell_bold),
            Paragraph("• Local database (<code>phishing_detector.db</code>) with indexed audit logs.<br/>"
                      "• Privacy sanitization: No raw email bodies or passwords written to disk.<br/>"
                      "• Real-time aggregation for dashboard volume metrics and relative timestamps.", table_cell_style)
        ],
    ]
    t_arch = Table(arch_diagram, colWidths=[130, 374])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 6))

    story.append(Paragraph("4. COMPLETE APPLICATION WORKFLOW", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("<b>4.1 URL Analysis Workflow:</b> User submits target URL -> Client calls <code>/api/analyze/url</code> -> Flask validates length (<=4096) and normalizes scheme -> URLAnalyzer runs 14 offline checks -> MLEngine extracts 15 numerical features & runs Random Forest -> RiskScorer computes hybrid 0-100 score & recommendations -> Result saved to SQLite -> Client renders gauge, verdict, and findings table.", body_style))
    story.append(Paragraph("<b>4.2 Email Analysis Workflow:</b> User pastes message/headers -> Client calls <code>/api/analyze/email</code> -> Flask parses headers and body -> EmailAnalyzer flags spoofed display name, Reply-To mismatch, coercion keywords, and extracts embedded links -> Links evaluated via URLAnalyzer -> MLEngine runs TF-IDF vectorizer + Logistic Regression -> Sanitized record saved to SQLite (raw body discarded) -> Client renders 5-section analysis results layout.", body_style))
    story.append(Paragraph("<b>4.3 Reactive Synchronization:</b> Upon scan completion, API client dispatches a <code>phishshield:new-scan</code> browser event. The Dashboard catches this event, immediately recalculating metrics and updating the Last Scan Summary without page reload.", body_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 7: SECTION 5 & 6 - DASHBOARD & DIRECTORY
    # =========================================================================
    story.append(Paragraph("5. DASHBOARD METRICS & TELEMETRY ANALYSIS", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "A critical engineering requirement of PhishShield is complete honesty regarding data origin. "
        "The dashboard explicitly distinguishes actual database audit logs from simulated SOC visualization elements:",
        body_style
    ))

    data_table = [
        [Paragraph("<b>Dashboard Metric / Widget</b>", table_header_style), Paragraph("<b>Data Classification</b>", table_header_style), Paragraph("<b>Data Source & Calculation Methodology</b>", table_header_style)],
        [
            Paragraph("<b>URLs Analyzed</b>", table_cell_bold),
            Paragraph("<font color='#059669'><b>ACTUAL DATA</b></font>", table_cell_style),
            Paragraph("Total count of real URL scans executed and persisted in SQLite: <code>SELECT COUNT(*) FROM scans WHERE scan_type = 'url'</code>.", table_cell_style)
        ],
        [
            Paragraph("<b>Emails Analyzed</b>", table_cell_bold),
            Paragraph("<font color='#059669'><b>ACTUAL DATA</b></font>", table_cell_style),
            Paragraph("Total count of real email scans executed and persisted in SQLite: <code>SELECT COUNT(*) FROM scans WHERE scan_type = 'email'</code>.", table_cell_style)
        ],
        [
            Paragraph("<b>Threats Detected</b>", table_cell_bold),
            Paragraph("<font color='#059669'><b>ACTUAL DATA</b></font>", table_cell_style),
            Paragraph("Count of completed scans classified as elevated risk: <code>SELECT COUNT(*) FROM scans WHERE classification IN ('Medium', 'High', 'Critical')</code>.", table_cell_style)
        ],
        [
            Paragraph("<b>Safe Items Verified</b>", table_cell_bold),
            Paragraph("<font color='#059669'><b>ACTUAL DATA</b></font>", table_cell_style),
            Paragraph("Count of completed scans exhibiting zero malicious signatures: <code>SELECT COUNT(*) FROM scans WHERE classification = 'Low'</code>.", table_cell_style)
        ],
        [
            Paragraph("<b>Threat Classification Breakdown</b>", table_cell_bold),
            Paragraph("<font color='#059669'><b>ACTUAL DATA</b></font>", table_cell_style),
            Paragraph("Recharts Doughnut chart showing real percentage breakdown of all SQLite scans grouped by Low, Medium, High, and Critical.", table_cell_style)
        ],
        [
            Paragraph("<b>Risk Distribution Volume</b>", table_cell_bold),
            Paragraph("<font color='#059669'><b>ACTUAL DATA</b></font>", table_cell_style),
            Paragraph("Recharts Bar chart plotting exact frequency counts for each threat tier from the database.", table_cell_style)
        ],
        [
            Paragraph("<b>Last Scan Summary</b>", table_cell_bold),
            Paragraph("<font color='#059669'><b>ACTUAL DATA</b></font>", table_cell_style),
            Paragraph("Pulls the newest completed scan (<code>ORDER BY created_at DESC, id DESC LIMIT 1</code>). Features a 5s ticker updating relative time ('Just now', '1 minute ago').", table_cell_style)
        ],
        [
            Paragraph("<b>Recent Threat Telemetry Table</b>", table_cell_bold),
            Paragraph("<font color='#059669'><b>ACTUAL DATA</b></font>", table_cell_style),
            Paragraph("Displays the 8 most recent scans from SQLite with direct 'Inspect' buttons opening forensic evidence modals.", table_cell_style)
        ],
        [
            Paragraph("<b>Right Telemetry Panel & Map</b>", table_cell_bold),
            Paragraph("<font color='#d97706'><b>SIMULATED DEMO</b></font>", table_cell_style),
            Paragraph("Displays animated SOC sensor feeds ('300K Payloads', '50ms Latency', curved world map threat arcs) for visual security operations realism and training drills.", table_cell_style)
        ],
    ]
    t_data = Table(data_table, colWidths=[120, 105, 279])
    t_data.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_data)
    story.append(Spacer(1, 6))

    story.append(Paragraph("6. PROJECT DIRECTORY & FILE STRUCTURE", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceBefore=2, spaceAfter=8))

    tree_text = (
        "phishing-detection-tool/<br/>"
        "├── <b>backend/</b><br/>"
        "│   ├── <b>app.py</b>                 [Backend] Main Flask REST API, CORS, routes & error handling<br/>"
        "│   ├── <b>database.py</b>            [Database] SQLite persistence, schema, seed data, stats aggregation<br/>"
        "│   ├── <b>requirements.txt</b>        [Config] Python dependencies (Flask, Scikit-Learn, ReportLab)<br/>"
        "│   ├── <b>phishing_detector.db</b>   [Storage] Active SQLite 3 database file<br/>"
        "│   ├── <b>analyzers/</b><br/>"
        "│   │   ├── <b>url_analyzer.py</b>      [Detection] 14 heuristic inspection rules & anatomy extraction<br/>"
        "│   │   ├── <b>email_analyzer.py</b>    [Detection] Header parsing, BEC, coercion & embedded link checks<br/>"
        "│   │   ├── <b>risk_scorer.py</b>       [Scoring] Calibrated scoring math, severity floors & recommendations<br/>"
        "│   │   └── <b>ml_engine.py</b>         [ML/AI] Scikit-Learn Random Forest & TF-IDF Logistic Regression<br/>"
        "│   └── <b>tests/</b>                [QA] Pytest automated test suite (23 passing tests)<br/>"
        "└── <b>frontend/</b><br/>"
        "    ├── <b>package.json</b>          [Config] Node.js dependencies (React 19, Recharts, Tailwind)<br/>"
        "    ├── <b>vite.config.js</b>         [Config] Vite build tool configuration<br/>"
        "    └── <b>src/</b><br/>"
        "        ├── <b>App.jsx</b>              [Frontend] Root application component, routing & global modals<br/>"
        "        ├── <b>index.css</b>            [Styling] Design system tokens, glassmorphism card utilities<br/>"
        "        ├── <b>services/api.js</b>      [Transport] Unified REST API client for backend communication<br/>"
        "        ├── <b>components/</b>          [UI] Navbar, Sidebar, Footer, Modals, Threat Map, Telemetry<br/>"
        "        └── <b>pages/</b>               [Views] Dashboard, UrlAnalyzer, EmailAnalyzer, FAQ, HelpResources"
    )
    t_tree = Table([[Paragraph(tree_text, code_style)]], colWidths=[504])
    t_tree.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#334155")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_tree)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 8: SECTION 7 & 8 - API SPEC & SECURITY LIMITS
    # =========================================================================
    story.append(Paragraph("7. BACKEND REST API SPECIFICATION", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceBefore=2, spaceAfter=8))

    api_table = [
        [Paragraph("<b>Endpoint & Method</b>", table_header_style), Paragraph("<b>Expected Input</b>", table_header_style), Paragraph("<b>Response Format</b>", table_header_style), Paragraph("<b>Calling Component</b>", table_header_style)],
        [
            Paragraph("<code>GET /api/health</code>", table_cell_bold),
            Paragraph("None", table_cell_style),
            Paragraph("<code>{ status: 'healthy', database: 'connected', ml_engine: 'operational' }</code>", table_cell_style),
            Paragraph("Navbar, Footer status", table_cell_style)
        ],
        [
            Paragraph("<code>POST /api/analyze/url</code>", table_cell_bold),
            Paragraph("<code>{ url: 'https://...' }</code>", table_cell_style),
            Paragraph("<code>{ success: true, data: { risk_score, classification, indicators, anatomy, ml_analysis } }</code>", table_cell_style),
            Paragraph("UrlAnalyzer.jsx", table_cell_style)
        ],
        [
            Paragraph("<code>POST /api/analyze/email</code>", table_cell_bold),
            Paragraph("<code>{ email_content: '...' }</code>", table_cell_style),
            Paragraph("<code>{ success: true, data: { risk_score, classification, indicators, sender_summary, ml_analysis } }</code>", table_cell_style),
            Paragraph("EmailAnalyzer.jsx", table_cell_style)
        ],
        [
            Paragraph("<code>GET /api/scans</code>", table_cell_bold),
            Paragraph("Query params: <code>type, risk, search, limit, offset</code>", table_cell_style),
            Paragraph("<code>{ success: true, count: N, data: [ ...scans ] }</code>", table_cell_style),
            Paragraph("ScanHistory.jsx, Reports.jsx", table_cell_style)
        ],
        [
            Paragraph("<code>GET /api/scans/&lt;id&gt;</code>", table_cell_bold),
            Paragraph("Path param: scan record ID", table_cell_style),
            Paragraph("<code>{ success: true, data: { complete scan record } }</code>", table_cell_style),
            Paragraph("ScanDetailModal.jsx", table_cell_style)
        ],
        [
            Paragraph("<code>DELETE /api/scans/&lt;id&gt;</code>", table_cell_bold),
            Paragraph("Path param: scan record ID", table_cell_style),
            Paragraph("<code>{ success: true, message: 'Scan deleted' }</code>", table_cell_style),
            Paragraph("ScanHistory.jsx, ScanDetailModal.jsx", table_cell_style)
        ],
        [
            Paragraph("<code>DELETE /api/scans</code>", table_cell_bold),
            Paragraph("None (Clears all history)", table_cell_style),
            Paragraph("<code>{ success: true, message: 'Cleared N scans' }</code>", table_cell_style),
            Paragraph("ScanHistory.jsx", table_cell_style)
        ],
        [
            Paragraph("<code>GET /api/dashboard/stats</code>", table_cell_bold),
            Paragraph("None", table_cell_style),
            Paragraph("<code>{ success: true, data: { urls_analyzed, emails_analyzed, threats_detected, risk_distribution, recent_scans } }</code>", table_cell_style),
            Paragraph("Dashboard.jsx", table_cell_style)
        ],
        [
            Paragraph("<code>GET /api/reports/&lt;id&gt;/export</code>", table_cell_bold),
            Paragraph("Query param: <code>format=json|csv|pdf</code>", table_cell_style),
            Paragraph("Binary attachment stream or JSON formatted forensic export.", table_cell_style),
            Paragraph("Reports.jsx, ScanDetailModal.jsx", table_cell_style)
        ],
    ]
    t_api = Table(api_table, colWidths=[105, 105, 184, 110])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_api)
    story.append(Spacer(1, 5))

    story.append(Paragraph("8. SECURITY PROTECTIONS & HONEST LIMITATIONS", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("<b>8.1 Implemented Security Protections:</b>", h3_style))
    story.append(Paragraph("• <b>Zero-SSRF Offline Isolation:</b> The engine evaluates links entirely through local string normalization, URL decomposition, and regular expressions. It never connects to target IPs, effectively eliminating Server-Side Request Forgery vulnerabilities and preventing attacker tracking.", bullet_style))
    story.append(Paragraph("• <b>Strict Input Sanitization & DoS Ceilings:</b> Web server enforces a 512 KB request size ceiling; URLAnalyzer rejects inputs over 4096 characters; EmailAnalyzer enforces a 200 KB maximum.", bullet_style))
    story.append(Paragraph("• <b>Data Privacy Guarantee:</b> Raw email bodies, passwords, session tokens, and file attachments are strictly sanitized and NEVER saved to the database. Only sanitized identifiers (e.g., subject snippets) and cryptographic hashes are stored.", bullet_style))
    story.append(Paragraph("• <b>Safe Error Handling:</b> Exceptions are caught cleanly, logged locally with privacy-scrubbed identifiers, and returned as sanitized user-friendly JSON errors without exposing internal stack traces.", bullet_style))

    story.append(Paragraph("<b>8.2 Honest Technical Limitations & Future Work:</b>", h3_style))
    story.append(Paragraph("• <b>Novel Zero-Day Phishing:</b> Heuristic and lexical scanners cannot detect newly registered zero-day domains that employ completely benign language on compromised trusted platforms (e.g., Google Forms or SharePoint phishing) without known signatures.", bullet_style))
    story.append(Paragraph("• <b>Lack of Dynamic Headless Sandboxing:</b> PhishShield does not execute JavaScript or render live pages in a Chromium sandbox. While this guarantees SSRF immunity, it prevents evaluation of multi-stage dynamic redirects.", bullet_style))
    story.append(Paragraph("• <b>Authentication Model:</b> The current build is designed as a standalone local/SOC inspection tool and does not enforce multi-user RBAC or JWT login (planned for future enterprise releases).", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 9: SECTION 9 & 10 - INSTALLATION & TESTING
    # =========================================================================
    story.append(Paragraph("9. INSTALLATION, SETUP & EXECUTION GUIDE", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("<b>9.1 Prerequisites:</b> Python 3.10+ (tested on Python 3.13) and Node.js 18+ (Node.js 20+ recommended).", body_style))

    setup_steps = (
        "<b>Step 1: Backend Environment Setup & Dependencies</b><br/>"
        "<code>cd backend</code><br/>"
        "<code>python -m venv venv</code><br/>"
        "<code>.\\venv\\Scripts\\pip install -r requirements.txt</code><br/>"
        "<i>Installs: Flask, flask-cors, scikit-learn, numpy, reportlab, pytest</i><br/><br/>"
        "<b>Step 2: Start the Backend REST API Server</b><br/>"
        "<code>.\\venv\\Scripts\\python.exe app.py</code><br/>"
        "<i>Server starts on http://127.0.0.1:5000 with SQLite database auto-initialized.</i><br/><br/>"
        "<b>Step 3: Frontend Setup & Development Server</b><br/>"
        "<code>cd ..\\frontend</code><br/>"
        "<code>npm install</code><br/>"
        "<code>npm run dev</code><br/>"
        "<i>Vite dev server starts on http://localhost:5173 with hot reload enabled.</i><br/><br/>"
        "<b>Step 4: Verify Application Status</b><br/>"
        "Open your web browser and navigate to <b>http://localhost:5173</b>. Ensure the top status pill indicates <code>ENGINE ACTIVE</code> and <code>ML: ON</code>."
    )
    t_setup = Table([[Paragraph(setup_steps, body_style)]], colWidths=[504])
    t_setup.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_card_bg),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_setup)
    story.append(Spacer(1, 6))

    story.append(Paragraph("10. TESTING, QUALITY ASSURANCE & VERIFICATION", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("<b>10.1 Automated Pytest Suite:</b>", h3_style))
    story.append(Paragraph(
        "PhishShield includes a complete automated test suite located in <code>backend/tests/</code>. "
        "Running <code>.\\venv\\Scripts\\pytest.exe</code> validates all subsystems with <b>100% test pass rate</b> "
        "(23 passed tests in 8.44 seconds):",
        body_style
    ))
    story.append(Paragraph("• <b>test_url_analyzer.py (8 tests):</b> Validates IP host detection, Punycode homoglyphs, brand typosquatting, shorteners, phishing keywords, and benign URLs.", bullet_style))
    story.append(Paragraph("• <b>test_email_analyzer.py (5 tests):</b> Validates display name spoofing, Reply-To mismatches, psychological urgency, wire transfer fraud, and benign engineering digests.", bullet_style))
    story.append(Paragraph("• <b>test_ml_engine.py (4 tests):</b> Validates feature vector extraction (15 dimensions), Random Forest inference, TF-IDF vectorization, and Logistic Regression output.", bullet_style))
    story.append(Paragraph("• <b>test_api.py (6 tests):</b> Validates REST endpoint responses, HTTP 400 error handling, SQLite persistence, and dashboard aggregation logic.", bullet_style))

    story.append(Paragraph("<b>10.2 Synthetic Preset Verification:</b>", h3_style))
    story.append(Paragraph("The UI includes one-click synthetic presets (e.g. 'Raw IP Credential Trap', 'Microsoft 365 Suspension', 'Internal Digest') enabling testers to instantly verify that classification tiers and evidence tables render accurately.", body_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 10: SECTION 11 - INTERVIEW PREPARATION (PITCH & Q1-Q5)
    # =========================================================================
    story.append(Paragraph("11. COMPREHENSIVE INTERVIEW PREPARATION GUIDE", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("<b>11.1 The 30-Second Elevator Pitch</b>", h2_style))
    story.append(Paragraph(
        "<i>\"PhishShield is a full-stack cybersecurity defense platform engineered to detect malicious web URLs and "
        "phishing emails using a hybrid ensemble of offline heuristics and Scikit-Learn machine learning. It protects "
        "organizations and end-users against credential harvesting, typosquatting, and Business Email Compromise with "
        "zero SSRF risk, transparent 0–100 risk scoring, and privacy-preserving audit logging.\"</i>",
        callout_style
    ))

    story.append(Paragraph("<b>11.2 The Two-Minute In-Depth Walkthrough</b>", h2_style))
    story.append(Paragraph(
        "<i>\"When building PhishShield, my goal was to solve two core problems: first, the danger of running automated "
        "scanners that trigger attacker tracking beacons or Server-Side Request Forgery; second, the reality that purely "
        "machine learning models hallucinate and lack explainability, while pure rule engines miss novel lexical patterns. "
        "I designed a dual-engine architecture: the frontend is built with React 19 and Tailwind CSS with real-time Recharts "
        "analytics. The backend runs a Flask REST API connected to an SQLite database. When a user submits an email or link, "
        "the tool parses structural anatomy, evaluates 14 URL checks and 7 email indicators, extracts 15 numerical feature vectors, "
        "and runs an ensemble model fusing heuristic weights with Random Forest and TF-IDF Logistic Regression classifiers. "
        "Everything executes in isolated memory without outbound requests, protecting user privacy and ensuring instant analysis.\"</i>",
        body_style
    ))

    story.append(Paragraph("<b>11.3 Top 15 Technical Interview Questions & Answers</b>", h2_style))

    qa_p1 = [
        ("Q1: How does PhishShield prevent Server-Side Request Forgery (SSRF)?",
         "PhishShield implements strict offline heuristic analysis. It parses URL strings, domains, and paths using localized regular expressions and urllib.parse without initiating outbound socket connections or HTTP requests. Attackers cannot probe internal networks or log client IP addresses."),

        ("Q2: Why did you combine rule-based heuristics with machine learning instead of relying on ML alone?",
         "Pure ML classifiers are 'black boxes' that can produce unpredictable edge-case classifications and lack transparency. Conversely, pure rule engines are rigid. By combining deterministic weights (65%) with ML statistical confidence (35%) and enforcing severity floors, PhishShield guarantees that verified threats (like raw IP logins) are never missed while benefiting from ML statistical generalization."),

        ("Q3: What specific machine learning models are used and what features are extracted?",
         "We implement two Scikit-Learn models in ml_engine.py: A RandomForestClassifier for URLs using 15 numerical features (URL length, domain length, entropy, digit ratio, keyword count, TLD abuse, Punycode, ports, subdomains, etc.), and a TfidfVectorizer + LogisticRegression classifier for email NLP analysis."),

        ("Q4: How do you detect domain typosquatting and homoglyphs without an external API?",
         "We implement a two-stage algorithm: first, a Leetspeak normalization dictionary converting common substitutions ('0'->'o', '1'->'l', 'vv'->'w', 'rn'->'m') to detect visual clones; second, a dynamic Levenshtein edit distance calculation comparing domain names against a dictionary of major enterprise target brands."),

        ("Q5: How does the system detect Business Email Compromise (BEC)?",
         "The email analyzer checks for display name spoofing by comparing the human-readable 'From' display header against the actual transmitting domain. It also flags when the 'Reply-To' header directs responses to an external domain differing from the sender, which is the textbook signature of executive wire fraud."),
    ]

    for q, a in qa_p1:
        story.append(Paragraph(f"<b>{q}</b>", h3_style))
        story.append(Paragraph(a, body_style))
        story.append(Spacer(1, 2.5))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 11: SECTION 11 - INTERVIEW QA (Q6-Q10)
    # =========================================================================
    story.append(Paragraph("11.3 Technical Interview Questions & Answers (Continued)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceBefore=2, spaceAfter=8))

    qa_p2 = [
        ("Q6: How does the risk scoring algorithm work, and why are there severity floors?",
         "Indicators are assigned calibrated point weights. To prevent runaway scores from multiple minor anomalies while ensuring serious threats are flagged, we enforce severity floors: any Critical indicator establishes a baseline score of 75; High establishes 50; Medium establishes 25. Scores are then blended with ML probability and capped at 100."),

        ("Q7: What data privacy safeguards are implemented for stored scans?",
         "To prevent accidental disclosure of sensitive communications, raw email message bodies and passwords are never permanently written to SQLite. The database only stores a sanitized identifier snippet, an extracted indicator list, and a SHA-256 cryptographic hash for forensic audit trails."),

        ("Q8: How does the frontend communicate with the backend and handle real-time UI updates?",
         "The React frontend uses a centralized API client in services/api.js over HTTP REST. Upon successful scan execution or deletion, it dispatches custom window events ('phishshield:new-scan') that notify the Dashboard, telemetry panels, and history logs to refresh without requiring a page reload."),

        ("Q9: Why did you choose SQLite over PostgreSQL or MongoDB for this system?",
         "SQLite requires zero external server setup, runs in-process with the Python backend, provides ACID compliance with zero memory overhead, and allows PhishShield to be deployed immediately on any workstation or air-gapped forensic lab as a standalone single-binary package."),

        ("Q10: What happens if a user submits an excessively long or malformed input?",
         "We enforce defensive request limits: Flask caps total payload size at 512 KB (HTTP 413); URLAnalyzer validates URL structure and rejects strings over 4096 characters; EmailAnalyzer requires a minimum of 10 characters and caps text at 200 KB, returning clean HTTP 400 JSON errors."),
    ]

    for q, a in qa_p2:
        story.append(Paragraph(f"<b>{q}</b>", h3_style))
        story.append(Paragraph(a, body_style))
        story.append(Spacer(1, 3))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 12: SECTION 11 - INTERVIEW QA (Q11-Q15), MATRIX & CONCLUSION
    # =========================================================================
    story.append(Paragraph("11.3 Technical Interview Questions & Answers (Continued)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceBefore=2, spaceAfter=8))

    qa_p3 = [
        ("Q11: How is dashboard data generated, and how does it differentiate real from sample data?",
         "Dashboard statistics execute SQL aggregation queries (COUNT, GROUP BY) against the SQLite 'scans' table. The initial seed records are flagged with 'is_sample = 1' so analysts can clearly audit user-generated scans versus baseline synthetic demonstration records."),

        ("Q12: What are the primary limitations of offline heuristic analysis?",
         "Offline heuristic analysis cannot inspect dynamic JavaScript execution, cloaked server-side redirects, or newly registered zero-day domains that host clean login forms without obvious keyword triggers. Dynamic sandboxing is planned as an optional future enhancement."),

        ("Q13: How would you scale PhishShield for an enterprise environment with millions of daily scans?",
         "To scale for enterprise volume, we would: 1) Deploy the Flask backend via Gunicorn across Docker containers behind an NGINX load balancer; 2) Migrate persistence from SQLite to a distributed PostgreSQL cluster; 3) Decouple analysis using a Celery/Redis asynchronous message queue; 4) Cache domain reputation queries in Redis."),

        ("Q14: How are reports generated and exported in the application?",
         "PhishShield supports multi-format reporting: client-side PDF rendering using jsPDF and AutoTable for instant zero-server overhead reports; server-side PDF generation via ReportLab; and structured JSON/CSV endpoints for SIEM ingestion."),

        ("Q15: What are the most important future improvements planned for PhishShield?",
         "The future roadmap includes: 1) Optional headless Chromium browser sandboxing for screenshotting live pages; 2) Multi-tenant RBAC with JWT authentication; 3) Integration with live MISP and threat intelligence feeds; 4) A native Chrome extension companion."),
    ]

    for q, a in qa_p3:
        story.append(Paragraph(f"<b>{q}</b>", h3_style))
        story.append(Paragraph(a, body_style))
        story.append(Spacer(1, 2.5))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>11.4 Technology Justification Matrix</b>", h2_style))
    just_table = [
        [Paragraph("<b>Technology</b>", table_header_style), Paragraph("<b>Alternative Considered</b>", table_header_style), Paragraph("<b>Reason for Final Selection</b>", table_header_style)],
        [
            Paragraph("<b>React 19 + Vite 8</b>", table_cell_bold),
            Paragraph("Next.js / Vanilla JS", table_cell_style),
            Paragraph("Vite provides instantaneous build speeds without SSR complexity, while React 19 gives state-of-the-art component reactivity.", table_cell_style)
        ],
        [
            Paragraph("<b>Flask 3.1</b>", table_cell_bold),
            Paragraph("Django / FastAPI", table_cell_style),
            Paragraph("Lightweight, minimal memory footprint, and direct integration with Python's scientific ML ecosystem without monolithic overhead.", table_cell_style)
        ],
        [
            Paragraph("<b>Scikit-Learn</b>", table_cell_bold),
            Paragraph("TensorFlow / PyTorch", table_cell_style),
            Paragraph("Tabular lexical and TF-IDF feature classification executes in under 5 ms on CPU, avoiding heavy GPU dependencies and multi-GB weights.", table_cell_style)
        ],
        [
            Paragraph("<b>SQLite 3</b>", table_cell_bold),
            Paragraph("PostgreSQL / MongoDB", table_cell_style),
            Paragraph("Zero configuration required for local installation; robust indexed ACID transactions and complete operational portability.", table_cell_style)
        ],
        [
            Paragraph("<b>Tailwind CSS 3</b>", table_cell_bold),
            Paragraph("Bootstrap / CSS Modules", table_cell_style),
            Paragraph("Enables highly customized, pixel-perfect dark glassmorphism styling and responsive cybersecurity aesthetics with zero runtime CSS overhead.", table_cell_style)
        ],
    ]
    t_just = Table(just_table, colWidths=[110, 125, 269])
    t_just.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_just)

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Document Concluding Summary:</b>", h3_style))
    story.append(Paragraph(
        "This technical document represents the complete, verified engineering specification of the PhishShield "
        "application. All documented algorithms, machine learning models, database schemas, and endpoints have "
        "been inspected directly from active source code and validated against the automated Pytest suite.",
        callout_style
    ))

    # Build the PDF using NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] Generated PDF successfully at: {target_file}")


if __name__ == "__main__":
    create_documentation_pdf(OUTPUT_PATH)
    # Also save in public folder for browser access
    try:
        os.makedirs(os.path.dirname(PUBLIC_OUTPUT_PATH), exist_ok=True)
        import shutil
        shutil.copyfile(OUTPUT_PATH, PUBLIC_OUTPUT_PATH)
        print(f"[SUCCESS] Copied PDF to public web folder: {PUBLIC_OUTPUT_PATH}")
    except Exception as e:
        print(f"[WARNING] Could not copy to public folder: {e}")
