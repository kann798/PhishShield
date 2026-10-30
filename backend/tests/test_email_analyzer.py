"""
Unit tests for Email Analyzer.
Validates detection of urgent coercion, credential harvesting,
reply-to spoofing, display name spoofing, and benign messages.
"""
import pytest
from analyzers.email_analyzer import EmailAnalyzer


def test_legitimate_email():
    """Verify benign everyday emails score Low risk."""
    content = """From: Alice Smith <alice@example.com>
Subject: Team Sync Agenda for Thursday
Hi team,
Looking forward to our weekly planning session tomorrow at 2 PM.
Please bring your updates.
Best,
Alice"""
    result = EmailAnalyzer.analyze(content)
    assert result["valid"] is True
    assert result["risk_score"] <= 25
    assert result["classification"] == "Low"


def test_reply_to_mismatch_bec():
    """Verify business email compromise (BEC) reply-to mismatch is flagged Critical."""
    content = """From: CEO John <john@enterprise-corp.com>
Reply-To: attacker@foreign-domain.xyz
Subject: Urgent: Wire Transfer
Please wire the vendor payment immediately to the attached account number.
Best,
John"""
    result = EmailAnalyzer.analyze(content)
    assert result["valid"] is True
    assert any(ind["id"] == "reply_to_mismatch" for ind in result["indicators"])
    assert result["classification"] in ("High", "Critical")


def test_credential_phishing_email():
    """Verify credential harvesting with urgent threat triggers Critical classification."""
    content = """From: "PayPal Security" <security-alerts@suspicious-host.com>
Subject: Account Suspended Immediately
Dear Customer,
Your account has been suspended due to unauthorized activity.
You must verify your account within 24 hours to avoid permanent deactivation.
Please click here to login: http://192.168.1.1/paypal/login.php"""
    result = EmailAnalyzer.analyze(content)
    assert result["valid"] is True
    assert result["risk_score"] >= 75
    assert result["classification"] == "Critical"
    assert "Urgency & Fear" in result["social_engineering_triggers"]
    assert len(result["extracted_urls"]) >= 1


def test_display_name_spoofing():
    """Verify spoofed display name pretending to be a major brand is flagged."""
    content = """From: "Microsoft Support Team" <admin789@genericmail.com>
Subject: Security Alert: Reset Password
Your password has expired. Click here to reset your password immediately."""
    result = EmailAnalyzer.analyze(content)
    assert result["valid"] is True
    assert any(ind["id"] == "display_name_spoofing" for ind in result["indicators"])


def test_empty_email_content():
    """Verify empty input fails gracefully."""
    result = EmailAnalyzer.analyze("")
    assert result["valid"] is False
    assert "error" in result


def test_chase_legitimate_statement():
    """Verify official banking statements without credential harvesting are classified Safe."""
    content = """From: ebanking-alerts@chase.com
Subject: Your monthly e-Statement is ready to view

Body:
Your monthly account Statement for account ending in ...4012 is now available. Log in to your Chase online banking app or visit our official site to securely view or download your document."""
    result = EmailAnalyzer.analyze(content)
    assert result["valid"] is True
    assert result["classification"] == "Low"
    assert result["risk_score"] <= 15
    assert result["detected_indicators_count"] == 0
    assert result["main_threat_category"] == "None"
    assert len(result["security_indicators_table"]) == 10
    assert result["security_indicators_table"][0]["status"] == "legitimate"


def test_tax_refund_phishing_lure():
    """Verify tax refund phishing scam with defanged link and credential trap is Critical."""
    content = """From: refund-agent@tax-refund-portal.example.org
Subject: Tax Refund Notification: Pending amount $1,420.50

Body:
After the final annual calculation of your fiscal earnings, we determined that you are eligible for an immediate tax refund of $1,420.50. To receive your refund directly to your debit card, click here to fill in your personal identity and card details: hxxp://tax-department-refund.example.com/claim"""
    result = EmailAnalyzer.analyze(content)
    assert result["valid"] is True
    assert result["classification"] == "Critical"
    assert result["risk_score"] >= 85
    assert result["detected_indicators_count"] >= 5
    assert result["main_threat_category"] == "Financial Phishing"
    assert len(result["extracted_urls"]) == 1


def test_university_meeting_notification():
    """Verify university meeting update is classified as Low risk."""
    content = """From: department-chair@university.edu
Subject: Faculty & Staff Meeting Schedule: Friday 3:00 PM

Body:
Dear Colleagues,
The agenda for Friday's faculty symposium has been updated. Please review the attached discussion points and join us in Hall B.
Best regards,
Academic Committee"""
    result = EmailAnalyzer.analyze(content)
    assert result["valid"] is True
    assert result["classification"] == "Low"
    assert result["risk_score"] <= 15


def test_routine_invoice_receipt():
    """Verify routine subscription invoice confirmation is classified as Low risk."""
    content = """From: billing@google.com
Subject: Your Google Workspace subscription invoice receipt

Body:
Your subscription invoice for October has been processed automatically. Thank you for your payment. You can view or download your receipt anytime from the admin console."""
    result = EmailAnalyzer.analyze(content)
    assert result["valid"] is True
    assert result["classification"] == "Low"
    assert result["risk_score"] <= 15
