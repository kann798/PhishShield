"""
Unit tests for Machine Learning Threat Intelligence Engine (MLEngine).
Validates RandomForest lexical URL classification and NLP LogisticRegression email models.
"""
import pytest
from analyzers.ml_engine import MLEngine


def test_ml_url_legitimate():
    """Verify legitimate URL features yield low phishing probability."""
    res = MLEngine.predict_url("https://www.google.com/search?q=cybersecurity")
    assert res["ml_enabled"] is True
    assert "RandomForestClassifier" in res["model_architecture"]
    assert res["phishing_probability"] <= 50.0
    assert res["prediction"] == "Legitimate"
    assert "feature_vector" in res
    assert res["feature_vector"]["is_ip_address"] is False
    assert isinstance(res["confidence_score"], float)


def test_ml_url_phishing_ip():
    """Verify numeric IP credential harvesting URL is recognized with high phishing probability."""
    res = MLEngine.predict_url("http://192.168.1.50/account/verify/login.php")
    assert res["ml_enabled"] is True
    assert res["phishing_probability"] >= 35.0
    assert res["feature_vector"]["is_ip_address"] is True
    assert res["feature_vector"]["phishing_keyword_matches"] >= 2
    assert any("IP address" in ind for ind in res["top_ml_indicators"])


def test_ml_email_legitimate():
    """Verify natural business email yields low phishing probability."""
    legit_email = "Hi team, please find attached the meeting agenda for our sync tomorrow morning at 10 AM."
    res = MLEngine.predict_email(legit_email)
    assert res["ml_enabled"] is True
    assert "TF-IDF" in res["model_architecture"]
    assert res["phishing_probability"] <= 50.0
    assert res["prediction"] == "Legitimate"
    assert isinstance(res["confidence_score"], float)


def test_ml_email_phishing():
    """Verify urgent account suspension email triggers phishing NLP classification."""
    phish_email = "URGENT: Your bank account has been suspended! Verify your credentials immediately within 24 hours."
    res = MLEngine.predict_email(phish_email)
    assert res["ml_enabled"] is True
    assert res["phishing_probability"] >= 50.0
    assert res["prediction"] == "Phishing / Coercive"
    assert res["nlp_features"]["coercive_urgency_detected"] is True
    assert res["nlp_features"]["financial_credential_lures"] is True
