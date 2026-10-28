"""
Machine Learning Threat Intelligence Engine for PhishShield.
Integrates scikit-learn models for lexical URL vector classification
and NLP text feature analysis for email phishing detection.
"""
import math
import re
import ipaddress
from urllib.parse import urlparse
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


class MLEngine:
    """
    Dual ML classification pipeline:
    1. Lexical & Structural Feature Random Forest for URLs.
    2. TF-IDF + Linguistic Feature Classifier for Email bodies.
    """

    _url_model = None
    _url_scaler = None
    _email_vectorizer = None
    _email_model = None
    _is_initialized = False

    PHISHING_KEYWORDS = [
        "login", "signin", "verify", "verification", "account", "security",
        "update", "banking", "secure", "password", "credential", "recover",
        "wallet", "support", "auth", "validation", "confirm", "authenticate",
        "identity", "billing", "suspend", "unlock", "passcode", "wire"
    ]

    SUSPICIOUS_TLDS = {
        "xyz", "top", "buzz", "club", "work", "click", "link", "icu",
        "cam", "monster", "fit", "rest", "country", "live", "guru", "tk", "ml", "cf"
    }

    @classmethod
    def initialize(cls):
        """Train and warm up ML models with synthetic baseline datasets."""
        if cls._is_initialized:
            return

        # -------------------------------------------------------------
        # 1. Train URL Random Forest Classifier
        # -------------------------------------------------------------
        # Features: [length, domain_len, path_len, dots, hyphens, at_symbol,
        #            subdomains, is_ip, entropy, digit_ratio, keyword_count,
        #            suspicious_tld, unusual_port, punycode, double_slash]
        url_train_features = []
        url_train_labels = []

        # Synthetic Legitimate URLs
        legit_samples = [
            "https://www.google.com/search?q=cybersecurity",
            "https://github.com/torvalds/linux",
            "https://en.wikipedia.org/wiki/Phishing",
            "https://aws.amazon.com/console/",
            "https://stackoverflow.com/questions/tagged/python",
            "https://developer.mozilla.org/en-US/docs/Web/API",
            "https://news.ycombinator.com/",
            "https://www.microsoft.com/en-us/software-download",
            "https://pypi.org/project/scikit-learn/",
            "https://docs.python.org/3/library/urllib.parse.html",
            "https://reddit.com/r/netsec",
            "https://medium.com/topic/technology",
            "https://cloud.google.com/docs",
            "https://apple.com/iphone",
            "https://netflix.com/browse",
        ]

        # Synthetic Phishing URLs
        phish_samples = [
            "http://192.168.1.50/account/verify/login.php",
            "http://paypal-security-update-center.xyz/auth/login",
            "https://chase-online-banking-verification.top/signin",
            "http://secure-microsoft-account-recovery.tk/login.html",
            "http://netflix-billing-update-urgent.cam/verify-payment",
            "http://appleid.apple.com.verify-device-security.xyz/login",
            "http://bankofamerica-verify-identity-passcode.icu/confirm",
            "http://dhl-package-delivery-tracking-fee.buzz/pay",
            "http://metamask-seed-phrase-recovery-wallet.link/auth",
            "http://instagram-copyright-infringement-appeal.cfd/verify",
            "http://login.microsoftonline.com.phish-auth.xyz/oauth",
            "http://amazon-prime-membership-suspended.work/billing",
            "http://steam-community-free-nitro-gift.top/login",
            "http://coinbase-pro-security-alert-kyc.fit/wallet",
            "http://wellsfargo-wire-transfer-authorization.monster/verify",
        ]

        for url in legit_samples:
            url_train_features.append(cls._extract_url_feature_vector(url))
            url_train_labels.append(0)  # 0 = Safe

        for url in phish_samples:
            url_train_features.append(cls._extract_url_feature_vector(url))
            url_train_labels.append(1)  # 1 = Phishing

        X_url = np.array(url_train_features)
        y_url = np.array(url_train_labels)

        cls._url_scaler = StandardScaler()
        X_url_scaled = cls._url_scaler.fit_transform(X_url)

        cls._url_model = RandomForestClassifier(n_estimators=30, random_state=42, max_depth=6)
        cls._url_model.fit(X_url_scaled, y_url)

        # -------------------------------------------------------------
        # 2. Train Email NLP Classifier
        # -------------------------------------------------------------
        email_legit = [
            "Hi team, attached is the monthly engineering newsletter. Keep up the great work!",
            "Here is the calendar invitation for our weekly architecture sync tomorrow at 10 AM.",
            "Please review the pull request for updating the API pagination when you have a moment.",
            "Monthly company all-hands slides have been uploaded to the internal wiki page.",
            "Your subscription invoice for October has been processed automatically. Thank you.",
            "Reminder: Scheduled maintenance on the staging cluster this Saturday from 2 to 4 UTC.",
            "Welcome to our platform! Check out our documentation to get started with the SDK.",
        ]

        email_phish = [
            "URGENT: Your bank account has been suspended! Verify your credentials immediately or access will be revoked within 24 hours.",
            "Dear Customer, we detected unauthorized access to your account. Click here to confirm your password and identity.",
            "Immediate wire transfer needed. Please pay this attached overdue invoice to avoid legal penalties and service termination.",
            "Your mailbox quota is full! Log in here to update your email storage or all pending messages will be permanently deleted.",
            "SECURITY ALERT: Someone accessed your Chase profile from an unrecognized device. Click here to secure your funds now.",
            "Wire transfer instructions: Boss sent instructions to wire $45,000 to vendor immediately before market close.",
            "Crypto wallet reward: You have received 1.5 ETH. Connect your seed phrase to claim your prize immediately.",
        ]

        email_corpus = email_legit + email_phish
        email_labels = [0] * len(email_legit) + [1] * len(email_phish)

        cls._email_vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=300)
        X_email = cls._email_vectorizer.fit_transform(email_corpus)

        cls._email_model = LogisticRegression(random_state=42, C=1.5)
        cls._email_model.fit(X_email, email_labels)

        cls._is_initialized = True

    @classmethod
    def _calculate_entropy(cls, text: str) -> float:
        """Calculate Shannon entropy of a string."""
        if not text:
            return 0.0
        prob = [float(text.count(c)) / len(text) for c in set(text)]
        return -sum(p * math.log(p, 2) for p in prob)

    @classmethod
    def _extract_url_feature_vector(cls, url: str) -> list:
        """Extract 15 numerical features from URL."""
        parsed = urlparse(url if "://" in url else f"http://{url}")
        domain = parsed.netloc.split(":")[0].lower()
        path = parsed.path.lower()

        # Is IP address
        is_ip = 0
        try:
            ipaddress.ip_address(domain)
            is_ip = 1
        except ValueError:
            is_ip = 0

        # Subdomain count
        parts = domain.split(".")
        subdomains = max(0, len(parts) - 2) if not is_ip else 0

        # TLD
        tld = parts[-1] if len(parts) > 1 and not is_ip else ""
        has_suspicious_tld = 1 if tld in cls.SUSPICIOUS_TLDS else 0

        # Keyword count
        full_lower = url.lower()
        kw_count = sum(1 for kw in cls.PHISHING_KEYWORDS if kw in full_lower)

        # Digit ratio
        digits = sum(1 for c in domain if c.isdigit())
        digit_ratio = digits / max(1, len(domain))

        # Port
        port = parsed.port
        has_unusual_port = 1 if port and port not in (80, 443) else 0

        # Punycode
        has_punycode = 1 if "xn--" in domain else 0

        # Double slash in path
        has_double_slash = 1 if "//" in path else 0

        return [
            len(url),
            len(domain),
            len(path),
            url.count("."),
            url.count("-"),
            url.count("@"),
            subdomains,
            is_ip,
            cls._calculate_entropy(domain),
            digit_ratio,
            kw_count,
            has_suspicious_tld,
            has_unusual_port,
            has_punycode,
            has_double_slash,
        ]

    @classmethod
    def predict_url(cls, url: str) -> dict:
        """Run ML inference on a URL string."""
        cls.initialize()
        features = cls._extract_url_feature_vector(url)
        scaled = cls._url_scaler.transform([features])

        # Probability distribution [P(safe), P(phishing)]
        probs = cls._url_model.predict_proba(scaled)[0]
        phish_prob = float(probs[1])

        # Top contributing indicators
        top_factors = []
        if features[7] == 1:
            top_factors.append("Host is direct numeric IP address")
        if features[10] > 0:
            top_factors.append(f"Contains {features[10]} credential harvesting keywords")
        if features[11] == 1:
            top_factors.append("Uses low-reputation / abused TLD")
        if features[8] > 3.6:
            top_factors.append(f"Elevated domain entropy ({features[8]:.2f})")
        if features[5] > 0:
            top_factors.append("Embedded '@' symbol in authority")
        if features[6] >= 2:
            top_factors.append(f"Excessive subdomains ({features[6]})")

        return {
            "ml_enabled": True,
            "model_architecture": "RandomForestClassifier (Lexical & Structural Feature Vectors)",
            "phishing_probability": float(round(phish_prob * 100, 1)),
            "prediction": "Phishing" if phish_prob >= 0.50 else "Legitimate",
            "confidence_score": float(round(float(max(probs)) * 100, 1)),
            "feature_vector": {
                "url_length": int(features[0]),
                "domain_length": int(features[1]),
                "path_length": int(features[2]),
                "dot_count": int(features[3]),
                "hyphen_count": int(features[4]),
                "subdomain_count": int(features[6]),
                "is_ip_address": bool(features[7]),
                "domain_entropy": float(round(float(features[8]), 2)),
                "phishing_keyword_matches": int(features[10]),
            },
            "top_ml_indicators": top_factors or ["Lexical patterns within legitimate statistical thresholds"],
        }

    @classmethod
    def predict_email(cls, email_content: str) -> dict:
        """Run ML NLP inference on email body content."""
        cls.initialize()

        # Vectorize text
        vec = cls._email_vectorizer.transform([email_content])
        probs = cls._email_model.predict_proba(vec)[0]
        phish_prob = float(probs[1])

        # Linguistic heuristics
        text_lower = email_content.lower()
        urgency_terms = ["urgent", "immediately", "24 hours", "suspended", "action required", "terminate"]
        matched_urgency = [t for t in urgency_terms if t in text_lower]

        financial_terms = ["wire", "invoice", "payroll", "bitcoin", "bank", "password", "wallet", "funds"]
        matched_financial = [t for t in financial_terms if t in text_lower]

        top_factors = []
        if matched_urgency:
            top_factors.append(f"High urgency coercion keywords ({', '.join(matched_urgency[:2])})")
        if matched_financial:
            top_factors.append(f"Financial / credential bait triggers ({', '.join(matched_financial[:2])})")
        if "http://" in text_lower or "https://" in text_lower:
            top_factors.append("Embedded clickable hyperlink vectors")

        return {
            "ml_enabled": True,
            "model_architecture": "TF-IDF + LogisticRegression NLP Classifier",
            "phishing_probability": float(round(phish_prob * 100, 1)),
            "prediction": "Phishing / Coercive" if phish_prob >= 0.50 else "Legitimate",
            "confidence_score": float(round(float(max(probs)) * 100, 1)),
            "nlp_features": {
                "char_length": len(email_content),
                "word_count": len(email_content.split()),
                "coercive_urgency_detected": bool(matched_urgency),
                "financial_credential_lures": bool(matched_financial),
            },
            "top_ml_indicators": top_factors or ["Natural business text patterns within legitimate baseline"],
        }
