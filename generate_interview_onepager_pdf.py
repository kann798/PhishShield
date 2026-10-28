"""
Script to generate a crisp, high-density, 1-PAGE Interview Cheat Sheet PDF
for PhishShield: Phishing Detection & Threat Analysis System.
Fits strictly on exactly 1 page (Letter size, 612 x 792 pt).
Simple, clean English with NO confusing offline/cloud jargon.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)
import pypdf

PDF_FILENAME = "PhishShield_Interview_OnePager.pdf"

# Clean Professional Palette
PRIMARY_DARK = colors.HexColor("#0f172a")    # Slate 900
BRAND_CYAN   = colors.HexColor("#0891b2")    # Cyan 600
TEXT_DARK    = colors.HexColor("#1e293b")    # Slate 800
TEXT_MUTED   = colors.HexColor("#475569")    # Subtitle / Notes
BG_LIGHT     = colors.HexColor("#f8fafc")    # Card background
BORDER_COLOR = colors.HexColor("#cbd5e1")    # Subtle line
HIGHLIGHT_BG = colors.HexColor("#ecfeff")    # Cyan tint

def build_pdf(filename=PDF_FILENAME):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=24,
        rightMargin=24,
        topMargin=20,
        bottomMargin=20
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=15,
        textColor=PRIMARY_DARK,
    )
    
    badge_style = ParagraphStyle(
        'Badge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9,
        textColor=colors.white,
        alignment=2
    )
    
    sec_header_style = ParagraphStyle(
        'SecHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=10.5,
        textColor=BRAND_CYAN
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.2,
        textColor=TEXT_DARK
    )

    qa_q_style = ParagraphStyle(
        'QA_Q',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.2,
        leading=9.0,
        textColor=PRIMARY_DARK
    )

    qa_a_style = ParagraphStyle(
        'QA_A',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.0,
        leading=8.8,
        textColor=TEXT_MUTED
    )

    story = []

    # ---------------- HEADER BANNER ----------------
    header_table_data = [
        [
            Paragraph("<b>PHISHSHIELD</b> | Cybersecurity Interview Master Cheat Sheet", title_style),
            Paragraph("<font color='#0891b2'><b>WEB APPLICATION</b></font><br/><font color='#64748b' size=6.5>Rules (65%) + ML (35%) | Flask & React 19</font>", badge_style)
        ]
    ]
    header_table = Table(header_table_data, colWidths=[360, 204])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('LINEBELOW', (0,0), (-1,-1), 1.2, BRAND_CYAN),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 4))

    # ---------------- SECTION 1 & 2: PITCH & PURPOSE (2 Columns) ----------------
    col1_pitch = [
        Paragraph("<b>1. THE 30-SECOND PITCH (What is your project?)</b>", sec_header_style),
        Spacer(1, 1),
        Paragraph(
            "<b>'PhishShield'</b> is a web-based <b>phishing detection and threat analysis system</b>. "
            "It allows users to paste a suspicious website link (URL) or email to check if it is safe or a phishing attack. "
            "It uses a <b>hybrid detection engine</b> that combines cybersecurity rules with Scikit-Learn Machine Learning to produce an accurate, easy-to-understand risk score from 0 to 100.",
            body_style
        ),
        Spacer(1, 2),
        Paragraph("<b>2. PURPOSE (Why did you build it?)</b>", sec_header_style),
        Spacer(1, 1),
        Paragraph(
            "• <b>Problem:</b> Phishing attacks cause over 90% of corporate data breaches. Regular users and security analysts need a fast, simple tool to verify suspicious messages.<br/>"
            "• <b>Solution:</b> PhishShield gives immediate verdicts (Safe, Suspicious, or Phishing), explains the exact technical reasons why, and lets users export PDF reports.",
            body_style
        )
    ]

    col2_stack = [
        Paragraph("<b>3. TECHNOLOGIES USED (Verified Stack)</b>", sec_header_style),
        Spacer(1, 1),
        Paragraph(
            "• <b>Frontend:</b> React 19, Vite 8, Tailwind CSS, Lucide React Icons.<br/>"
            "• <b>Charts:</b> Recharts (Donut chart & risk volume charts).<br/>"
            "• <b>Backend:</b> Python 3.13, Flask 3.1 REST API, Flask-CORS.<br/>"
            "• <b>Machine Learning:</b> Scikit-Learn (Random Forest for URLs, TF-IDF + Logistic Regression for Email NLP).<br/>"
            "• <b>Database:</b> SQLite 3 (stores scan history and stats).<br/>"
            "• <b>Reporting:</b> jsPDF & AutoTable (generates instant PDF reports).<br/>"
            "• <b>Testing:</b> Pytest (23 automated test cases covering all analyzers).",
            body_style
        ),
        Spacer(1, 2),
        Paragraph("<b>4. WHY IS IT CALLED 'HYBRID'?</b>", sec_header_style),
        Spacer(1, 1),
        Paragraph(
            "Because it combines two things: <b>Rules (65%)</b> catch obvious technical tricks (like fake domains and IP hosts), while <b>Machine Learning (35%)</b> catches subtle text patterns. Together, they are much more reliable than using either one alone.",
            body_style
        )
    ]

    pitch_stack_table = Table([[col1_pitch, col2_stack]], colWidths=[278, 286])
    pitch_stack_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(pitch_stack_table)
    story.append(Spacer(1, 4))

    # ---------------- SECTION 5: APPLICATION WORKFLOW ----------------
    workflow_box = [
        Paragraph("<b>5. APPLICATION WORKFLOW (Step-by-Step)</b>", sec_header_style),
        Spacer(1, 1),
        Paragraph(
            "<b>Step 1 (Input):</b> User pastes a suspicious URL or raw email text into the React frontend.<br/>"
            "<b>Step 2 (Rule Check):</b> Backend checks 14 URL rules (IP address hosts, typosquatting, suspicious TLDs) or 7 email rules (Reply-To mismatch, urgent language).<br/>"
            "<b>Step 3 (ML Check):</b> Scikit-Learn models analyze URL structure (15 features) and email words (TF-IDF) to calculate an ML risk probability.<br/>"
            "<b>Step 4 (Final Score):</b> The system calculates the score: <code>Final Risk = 0.65 * Rules + 0.35 * ML</code>.<br/>"
            "<b>Step 5 (Result):</b> The user sees the Verdict (Safe &lt; 35, Suspicious 35-69, Phishing &ge; 70), risk score out of 100, and explanation table.",
            body_style
        )
    ]
    wf_table = Table([[workflow_box]], colWidths=[564])
    wf_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.7, BORDER_COLOR),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(wf_table)
    story.append(Spacer(1, 4))

    # ---------------- SECTION 6: IMPORTANT PRACTICAL NOTES ----------------
    notes_box = [
        Paragraph(
            "<b>6. IMPORTANT PRACTICAL NOTES FOR INTERVIEWS:</b><br/>"
            "• <b>User Privacy:</b> Raw email bodies and passwords are never permanently saved in the SQLite database—only scan results and rule IDs are logged.<br/>"
            "• <b>Safe URL Parsing:</b> The app inspects the URL's text structure without opening dangerous malicious websites in the backend.<br/>"
            "• <b>Severity Floors:</b> If an obvious danger is detected (like an IP address host), the risk score automatically jumps to &ge; 75 (Phishing).<br/>"
            "• <b>Real-Time Dashboard:</b> The dashboard updates scan statistics automatically and displays accurate time ('Just now', '1m ago').",
            body_style
        )
    ]
    notes_table = Table([[notes_box]], colWidths=[564])
    notes_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HIGHLIGHT_BG),
        ('BOX', (0,0), (-1,-1), 0.7, colors.HexColor("#a5f3fc")),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(notes_table)
    story.append(Spacer(1, 4))

    # ---------------- SECTION 7: INTERVIEW QUESTIONS & DIRECT ANSWERS ----------------
    story.append(Paragraph("<b>7. TOP 5 INTERVIEW QUESTIONS & HOW TO ANSWER CONFIDENTLY</b>", sec_header_style))
    story.append(Spacer(1, 2))

    qa_list = [
        [
            Paragraph("<b>Q1: What does your application do?</b>", qa_q_style),
            Paragraph("<b>Answer:</b> PhishShield is a web application that scans suspicious URLs and emails. It uses a combination of cybersecurity rules and Scikit-Learn machine learning to detect phishing attacks and assign a risk score from 0 to 100.", qa_a_style)
        ],
        [
            Paragraph("<b>Q2: Is this a rule-based or machine learning project?</b>", qa_q_style),
            Paragraph("<b>Answer:</b> It is a <b>hybrid system</b>. It uses rules (65% weight) to catch clear violations like fake domain names and raw IP addresses, and machine learning (35% weight) to catch subtle word patterns and complex URL structures.", qa_a_style)
        ],
        [
            Paragraph("<b>Q3: What machine learning algorithms did you use?</b>", qa_q_style),
            Paragraph("<b>Answer:</b> I used Scikit-Learn's <code>RandomForestClassifier</code> for URLs using a 15-feature lexical vector, and <code>TfidfVectorizer</code> with <code>LogisticRegression</code> to analyze email text and detect phishing keywords.", qa_a_style)
        ],
        [
            Paragraph("<b>Q4: How do you detect fake websites (Typosquatting)?</b>", qa_q_style),
            Paragraph("<b>Answer:</b> I use the Levenshtein distance algorithm. It compares the entered domain with popular brands (like PayPal, Google, Microsoft). If the name is only 1 character different (like <code>paypa1.com</code>), it flags it as typosquatting.", qa_a_style)
        ],
        [
            Paragraph("<b>Q5: How is user data protected?</b>", qa_q_style),
            Paragraph("<b>Answer:</b> Privacy is built-in. When a user scans an email, the backend analyzes it in memory and immediately discards the raw body text. We only store the subject line, risk score, and timestamp in SQLite.", qa_a_style)
        ]
    ]

    qa_table = Table(qa_list, colWidths=[240, 324])
    qa_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('LINEBELOW', (0,0), (-1,-2), 0.4, colors.HexColor("#e2e8f0")),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#ffffff")),
    ]))
    story.append(qa_table)

    # Build document
    doc.build(story)
    print(f"Generated {filename}")

if __name__ == "__main__":
    build_pdf()
    reader = pypdf.PdfReader(PDF_FILENAME)
    print(f"Total Pages: {len(reader.pages)}")
