"""
Unit tests for URL Analyzer.
Validates detection of IP addresses, typosquatting, subdomains,
special characters, shorteners, length, and legitimate links.
"""
import pytest
from analyzers.url_analyzer import URLAnalyzer


def test_legitimate_url():
    """Verify normal legitimate URLs produce Low risk without false alarms."""
    result = URLAnalyzer.analyze("https://www.google.com/search?q=cybersecurity")
    assert result["valid"] is True
    assert result["risk_score"] <= 25
    assert result["classification"] == "Low"
    assert result["anatomy"]["hostname"] == "www.google.com"


def test_ip_address_url():
    """Verify IP-based URLs are identified with High severity."""
    result = URLAnalyzer.analyze("http://192.168.1.100/login/bank")
    assert result["valid"] is True
    assert result["anatomy"]["is_ip"] is True
    assert any(ind["id"] == "ip_based_url" for ind in result["indicators"])
    assert result["risk_score"] >= 50


def test_brand_typosquatting():
    """Verify homoglyph and typosquatting brand masquerading is detected as Critical."""
    result = URLAnalyzer.analyze("http://paypa1-security-center.com/signin")
    assert result["valid"] is True
    assert any(ind["id"] == "brand_typosquatting" for ind in result["indicators"])
    assert result["classification"] in ("High", "Critical")


def test_brand_subdomain_abuse():
    """Verify brand keywords in subdomains of deceptive root domains are detected."""
    result = URLAnalyzer.analyze("http://paypal.com.account-update.xyz/login")
    assert result["valid"] is True
    assert any(ind["id"] == "brand_subdomain_abuse" for ind in result["indicators"])


def test_at_symbol_obfuscation():
    """Verify '@' character in URL triggers critical warning."""
    result = URLAnalyzer.analyze("http://google.com@evil-site.com/auth")
    assert result["valid"] is True
    assert any(ind["id"] == "at_symbol_obfuscation" for ind in result["indicators"])
    assert result["risk_score"] >= 75


def test_url_shortener():
    """Verify known shorteners are flagged for user inspection."""
    result = URLAnalyzer.analyze("https://bit.ly/secure-doc-view")
    assert result["valid"] is True
    assert any(ind["id"] == "url_shortener" for ind in result["indicators"])


def test_empty_and_invalid_url():
    """Verify empty or non-string inputs return proper validation errors."""
    res1 = URLAnalyzer.analyze("")
    assert res1["valid"] is False
    assert "error" in res1

    res2 = URLAnalyzer.analyze(None)
    assert res2["valid"] is False


def test_excessively_long_url():
    """Verify URL length detection."""
    long_url = "https://legitimate.org/" + "a" * 150
    result = URLAnalyzer.analyze(long_url)
    assert result["valid"] is True
    assert any(ind["id"] == "unusually_long_url" for ind in result["indicators"])
