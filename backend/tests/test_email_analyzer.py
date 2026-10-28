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
