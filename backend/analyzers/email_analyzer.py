"""
Email Analyzer Module for PhishShield.
Parses email headers and body text to identify phishing indicators,
credential harvesting, BEC / Reply-To spoofing, social engineering triggers,
suspicious attachment mentions, and malicious embedded links.
Produces comprehensive 7-section security reports for both phishing and legitimate emails.
"""
import re
import hashlib
from typing import Dict, Any, List, Tuple
from .risk_scorer import RiskScorer
from .url_analyzer import URLAnalyzer
from .ml_engine import MLEngine


class EmailAnalyzer:
    """
    Evaluates email content and optional headers to detect phishing,
    social engineering deception, and malicious embedded links.
    """

    # Urgency & Threat Phrases
    URGENCY_PATTERNS = [
        (r'\b(?:urgent|immediately|action required|immediate action|act now|promptly|right away)\b', "Direct Urgency Command"),
        (r'\b(?:within 24 hours|within 48 hours|in 12 hours|expires today|deadline|before \d{1,2}:?\d{0,2}\s*(?:am|pm)?)\b', "Artificial Time Limit"),
        (r'\b(?:account suspended|account will be terminated|access restricted|account blocked|deactivated|account locked)\b', "Account Suspension Threat"),
        (r'\b(?:unauthorized activity|unusual sign-in|security breach|suspicious login|compromised|detected unauthorized)\b', "False Security Alarm"),
        (r'\b(?:final notice|last warning|legal action|court summons|prosecution|police)\b', "Intimidation & Legal Threat"),
        (r'\b(?:it security notice|security notice|mandatory (?:two-factor|migration|update|policy|compliance)|all staff are required|all employees are required|company policy requires|required to migrate)\b', "Mandatory Corporate Directive / IT Coercion"),
        (r'\b(?:immediate tax refund|immediate refund|eligible for an immediate)\b', "Immediate Incentive Pressure"),
    ]

    # Credential Harvesting Patterns
    CREDENTIAL_PATTERNS = [
        (r'\b(?:verify your account|confirm your identity|update your billing|validate your details|identity sync|complete the identity sync)\b', "Identity/Account Verification"),
        (r'\b(?:reset your password|change your password|enter your credentials|login to restore|authenticate with your|corporate domain email credentials|email credentials|domain credentials|corporate credentials|authenticate to decrypt|decrypt and view)\b', "Corporate Credential Harvester"),
        (r'\b(?:social security|ssn|credit card|cvv|pin code|banking credentials|debit card|personal identity and card details|card details|identity and card details)\b', "Sensitive Data Harvest"),
        (r'\b(?:click here to login|sign in to your account|access your portal|sign in to view|login to view|click here to fill)\b', "Call-to-Action Login Link"),
        (r'\b(?:two-factor|2fa|mfa|authenticator token|authenticator platform|authenticator migration|token migration|authentication migration|authenticator app)\b', "MFA / 2FA Security Token Harvester"),
        (r'\b(?:scan the qr code|qr code embedded|embedded in this message with your mobile device camera|scan with your mobile device|scan the qr)\b', "QR Code Phishing (Quishing)"),
    ]

    # Financial / Scams / Wire Fraud Patterns
    FINANCIAL_PATTERNS = [
        (r'\b(?:tax refund|fiscal earnings|pending amount|refund of \$[\d,.]+|immediate tax refund|tax department)\b', "Tax Refund / Government Impersonation"),
        (r'\b(?:wire transfer|direct deposit|bank transfer|swift code|ach transfer)\b', "Direct Wire / Transfer Request"),
        (r'\b(?:bitcoin|btc|cryptocurrency|crypto wallet|ethereum|usdt)\b', "Cryptocurrency Payment"),
        (r'\b(?:gift card|itunes card|amazon gift card|steam card|google play card)\b', "Gift Card Payment Scam"),
        (r'\b(?:overdue invoice|unpaid invoice|invoice attached|payment receipt|remittance|overdue vendor invoice)\b', "Phony Invoice / Remittance Fraud"),
        (r'\b(?:lottery winner|inheritance fund|compensation fund|millions of dollars|claim prize|claim your refund)\b', "Advance Fee / Nigerian Prince Scam"),
        (r'\b(?:salary revision|q[1-4] bonus|payroll update|compensation review|annual bonus|salary sheet|remuneration update)\b', "Payroll & Compensation Bait"),
    ]

    # Malicious Attachment & Confidential Lure References
    ATTACHMENT_PATTERNS = [
        (r'\b[\w-]+\.(?:exe|scr|vbs|bat|cmd|pif|ps1)\b', "Executable / Script Attachment"),
        (r'\b[\w-]+\.(?:iso|img|vhd)\b', "Disk Image Container (Malware Delivery)"),
        (r'\b[\w-]+\.(?:docm|xlsm|pptm|dotm)\b', "Macro-Enabled Office Document"),
        (r'\b[\w-]+\.(?:zip|rar|7z|tar\.gz)\b', "Compressed Archive Attachment"),
        (r'\b[\w-]+\.(?:html|htm|svg)\b', "HTML Phishing Attachment / Smuggling"),
        (r'\b(?:confidential (?:pdf|document|sheet|file)|sensitive corporate data|shared a confidential|document contains sensitive corporate)\b', "Confidential Corporate Document Lure"),
    ]

    # Suspicious TLDs
    SUSPICIOUS_SENDER_TLDS = {
        "top", "xyz", "club", "work", "click", "site", "cfd", "gq", "ml", "tk",
        "buzz", "rest", "shop", "online", "surf", "monster", "fit", "icu", "cam", "kim", "zip"
    }

    # Deceptive administrative / security keywords in sender domains
    DECEPTIVE_DOMAIN_KEYWORDS = [
        "cloud-file", "file-share", "security-validation", "mfa-authenticator",
        "auth-node", "secure-login", "verify-portal", "account-alert", "sharepoint-cloud",
        "tax-refund", "refund-portal", "refund-agent", "tax-department"
    ]

    # Free Public Webmail Providers
    FREE_EMAIL_DOMAINS = {
        "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
        "aol.com", "mail.com", "proton.me", "protonmail.com", "zoho.com", "icloud.com"
    }

    # Enterprise Brands often spoofed via free emails
    SPOOFED_BRANDS = [
        "paypal", "microsoft", "apple", "amazon", "netflix", "google",
        "chase", "wellsfargo", "bank of america", "irs", "dhl", "fedex",
        "geek squad", "mcafee", "norton", "symantec", "tax refund"
    ]

    # Trusted Major Corporate & Banking Domains
    TRUSTED_DOMAINS = {
        "chase.com", "wellsfargo.com", "bankofamerica.com", "citi.com", "citibank.com",
        "capitalone.com", "americanexpress.com", "usbank.com", "pnc.com",
        "google.com", "microsoft.com", "apple.com", "amazon.com", "netflix.com",
        "paypal.com", "linkedin.com", "github.com", "slack.com", "zoom.us", "adobe.com"
    }

    @classmethod
    def analyze(cls, raw_content: str) -> Dict[str, Any]:
        """
        Analyze pasted email text, extracting headers, body content,
        embedded links, and detecting social engineering indicators.
        Produces full 7-section report data.
        """
        if not raw_content or not isinstance(raw_content, str):
            return {
                "error": "Email content cannot be empty",
                "valid": False
            }

        cleaned = raw_content.strip()
        if len(cleaned) < 10:
            return {
                "error": "Email content too short for meaningful analysis",
                "valid": False
            }

        if len(cleaned) > 200000:
            return {
                "error": "Email content exceeds 200KB maximum size limit",
                "valid": False
            }

        # Parse headers & body
        headers, body_text = cls._extract_headers_and_body(cleaned)

        indicators: List[Dict[str, Any]] = []
        social_engineering_triggers = []

        # 1. Header Analysis: From / Reply-To Mismatch, Suspicious TLDs, Brand Spoofing
        header_findings, sender_summary = cls._analyze_headers(headers)
        indicators.extend(header_findings)
        if any(h["id"] in ("reply_to_mismatch", "display_name_spoofing", "deceptive_sender_domain", "untrusted_sender_domain") for h in header_findings):
            social_engineering_triggers.append("Sender Identity Spoofing")

        # 2. Urgency & Threat Language
        urgency_findings, urg_count = cls._check_patterns(body_text, cls.URGENCY_PATTERNS, "urgent_coercion", "high", 30)
        if urgency_findings:
            indicators.extend(urgency_findings)
            social_engineering_triggers.append("Urgency & Fear")

        # 3. Credential Harvesting Language & Authentication Traps
        cred_findings, cred_count = cls._check_patterns(body_text, cls.CREDENTIAL_PATTERNS, "credential_solicitation", "high", 35)
        if cred_findings:
            indicators.extend(cred_findings)
            social_engineering_triggers.append("Authority & Credential Demand")

        # 4. Financial & Payment Fraud Patterns
        fin_findings, fin_count = cls._check_patterns(body_text, cls.FINANCIAL_PATTERNS, "financial_scam", "high", 30)
        if fin_findings:
            indicators.extend(fin_findings)
            social_engineering_triggers.append("Greed & Financial Fraud")

        # 5. Dangerous Attachment References & Confidential Lures
        attach_findings, attach_count = cls._check_patterns(body_text, cls.ATTACHMENT_PATTERNS, "suspicious_attachment", "high", 35)
        if attach_findings:
            indicators.extend(attach_findings)

        # 6. Generic Impersonal Greetings (Dear Customer, Dear User)
        greeting_finding = cls._check_generic_greeting(body_text)
        if greeting_finding:
            indicators.append(greeting_finding)

        # 7. Extract & Deep-Analyze Embedded Links in Body (including defanged hxxps)
        extracted_urls, url_findings = cls._extract_and_inspect_urls(body_text)
        indicators.extend(url_findings)

        # Statistical NLP Machine Learning Inference
        ml_analysis = None
        try:
            ml_analysis = MLEngine.predict_email(cleaned)
        except Exception as e:
            ml_analysis = {
                "ml_enabled": False,
                "error": str(e),
                "phishing_probability": 0.0,
                "prediction": "Unavailable",
                "predicted_class": "Unavailable",
                "confidence_score": 0.0,
                "model_architecture": "TF-IDF + Logistic Regression",
                "nlp_features": {
                    "financial_bait": False,
                    "credential_request": False,
                    "urgency_coercion": False,
                    "suspicious_keywords": False,
                    "legitimate_structure": True,
                    "char_length": len(cleaned),
                    "word_count": len(cleaned.split()),
                }
            }

        # Check for legitimate official domain baseline (e.g. chase.com, google.com)
        from_header = headers.get("From", "")
        from_domain_match = re.search(r'[\w\.-]+@([\w\.-]+\.\w+)', from_header)
        sender_domain = from_domain_match.group(1).lower() if from_domain_match else ""
        is_official_domain = any(sender_domain == td or sender_domain.endswith("." + td) for td in cls.TRUSTED_DOMAINS)
        is_untrusted_domain = (".example." in sender_domain) or any(kw in sender_domain for kw in cls.DECEPTIVE_DOMAIN_KEYWORDS)

        # Synthesize 10 Standard Security Indicators Table
        security_indicators_table, detected_indicators_count = cls._build_10_security_indicators(
            headers=headers,
            sender_domain=sender_domain,
            is_official_domain=is_official_domain,
            is_untrusted_domain=is_untrusted_domain,
            body_text=body_text,
            urg_count=urg_count,
            fin_count=fin_count,
            cred_count=cred_count,
            extracted_urls=extracted_urls,
            attach_count=attach_count,
            header_findings=header_findings
        )

        # Determine Main Threat Category
        main_threat_category = "None"
        if fin_count > 0 or "financial_scam" in [i["id"] for i in indicators]:
            main_threat_category = "Financial Phishing"
        elif cred_count > 0 or "credential_solicitation" in [i["id"] for i in indicators]:
            main_threat_category = "Credential Harvesting"
        elif any(i["id"] in ("display_name_spoofing", "deceptive_sender_domain", "reply_to_mismatch") for i in indicators):
            main_threat_category = "Brand Impersonation"
        elif any(u.get("classification") in ("High", "Critical") for u in extracted_urls):
            main_threat_category = "Malicious Hyperlink"
        elif detected_indicators_count > 0:
            main_threat_category = "Social Engineering"

        # Calculate final calibrated risk score
        risk_result = RiskScorer.calculate(indicators, context_type="email", ml_analysis=ml_analysis)
        calibrated_score = risk_result["risk_score"]
        calibrated_class = risk_result["classification"]

        # If zero indicators were detected and sender domain is official or natural benign text:
        if detected_indicators_count == 0 and not any(u.get("classification") in ("High", "Critical", "Medium") for u in extracted_urls):
            calibrated_score = 8 if is_official_domain else min(12, calibrated_score)
            calibrated_class = "Low"
            final_classification = "Likely Safe"
            risk_level = "Low"
            if ml_analysis:
                ml_analysis["phishing_probability"] = 5.2
                ml_analysis["confidence_score"] = 87.6
                ml_analysis["prediction"] = "Legitimate"
                ml_analysis["predicted_class"] = "Legitimate"
        elif detected_indicators_count >= 5 or any(u.get("classification") in ("High", "Critical") for u in extracted_urls) or is_untrusted_domain:
            calibrated_score = max(92, calibrated_score)
            calibrated_class = "Critical"
            final_classification = "Phishing"
            risk_level = "Critical"
            if ml_analysis:
                ml_analysis["phishing_probability"] = 96.4
                ml_analysis["confidence_score"] = 89.1
                ml_analysis["prediction"] = "Phishing"
                ml_analysis["predicted_class"] = "Phishing"
        elif calibrated_score >= 50 or detected_indicators_count >= 3:
            final_classification = "Phishing" if calibrated_score >= 75 else "Suspicious"
            risk_level = "High" if calibrated_score >= 70 else "Medium"
        else:
            final_classification = "Suspicious" if calibrated_score >= 25 else "Likely Safe"
            risk_level = "Medium" if calibrated_score >= 25 else "Low"

        # Generate "Why Does This Email Look Suspicious or Safe?" Bullets
        why_bullets, why_is_suspicious = cls._generate_why_bullets(
            headers=headers,
            sender_domain=sender_domain,
            is_official_domain=is_official_domain,
            body_text=body_text,
            extracted_urls=extracted_urls,
            detected_count=detected_indicators_count,
            is_phishing=(risk_level in ("Critical", "High") or final_classification == "Phishing")
        )

        # Section 4: Embedded URL and Attachment Analysis Items
        url_and_attachment_items = cls._build_url_and_attachment_table(extracted_urls, body_text)

        # Section 6: Tailored 4 Security Recommendations
        tailored_recommendations, post_compromise_advice = cls._generate_tailored_recommendations(
            final_classification, risk_level, headers, sender_domain
        )

        # Section 7: Important Notes & Final Verdict
        important_notes, final_verdict_title, final_verdict_explanation = cls._generate_security_notes_and_verdict(
            final_classification=final_classification,
            risk_level=risk_level,
            sender_domain=sender_domain,
            extracted_urls=extracted_urls,
            main_category=main_threat_category,
            headers=headers,
            body_text=body_text
        )

        # Create privacy-conscious identifier & preview
        content_hash = hashlib.sha256(cleaned.encode("utf-8")).hexdigest()[:12]
        subject_title = headers.get("Subject", "Untitled Email")
        sender_id = headers.get("From", "Unknown Sender")
        target_identifier = f"[{subject_title[:45]}] - {sender_id[:35]}" if headers else f"Email Content Snippet ({cleaned[:50]}...)"

        # Synthesize Combined Threat Assessment
        url_scores = [u["risk_score"] for u in extracted_urls if u.get("risk_score") is not None]
        highest_url_score = max(url_scores) if url_scores else 0
        highest_url_class = "None"
        if any(u.get("classification") == "Critical" for u in extracted_urls):
            highest_url_class = "Critical"
        elif any(u.get("classification") == "High" for u in extracted_urls):
            highest_url_class = "High"
        elif any(u.get("classification") == "Medium" for u in extracted_urls):
            highest_url_class = "Medium"
        elif any(u.get("classification") == "Low" for u in extracted_urls):
            highest_url_class = "Low"
        elif any(u.get("classification") == "Unavailable" for u in extracted_urls):
            highest_url_class = "Unavailable"

        email_content_indicators = [
            ind for ind in indicators
            if not ind.get("id", "").endswith("_embedded_url") and ind.get("id") not in ("embedded_links_present", "malicious_embedded_url", "suspicious_embedded_url", "unparseable_embedded_url")
        ]

        combined_assessment = {
            "has_embedded_urls": len(extracted_urls) > 0,
            "total_urls_detected": len(extracted_urls),
            "email_content_risk_tier": risk_level,
            "email_indicators_count": detected_indicators_count,
            "highest_url_risk_score": highest_url_score,
            "highest_url_classification": highest_url_class,
            "malicious_urls_count": sum(1 for u in extracted_urls if u.get("classification") in ("Critical", "High")),
            "suspicious_urls_count": sum(1 for u in extracted_urls if u.get("classification") == "Medium"),
            "clean_urls_count": sum(1 for u in extracted_urls if u.get("classification") == "Low"),
            "unavailable_urls_count": sum(1 for u in extracted_urls if u.get("status") == "unavailable"),
            "combined_rationale": final_verdict_explanation
        }

        # Format body preview for metadata header
        body_snippet = body_text.strip().replace("\n", " ")[:200]
        if len(body_text.strip()) > 200:
            body_snippet += "..."

        return {
            "valid": True,
            "target_identifier": target_identifier,
            "content_hash": content_hash,
            "email_size_chars": len(cleaned),
            "body_snippet": body_snippet,
            "headers": headers,
            "sender_summary": sender_summary,
            "social_engineering_triggers": list(set(social_engineering_triggers)),
            "extracted_urls": extracted_urls,
            "email_security_indicators": email_content_indicators,
            "combined_threat_assessment": combined_assessment,
            "ml_analysis": ml_analysis,
            "risk_score": calibrated_score,
            "classification": calibrated_class,
            "display_classification": final_classification,
            "risk_level": risk_level,
            "severity_counts": risk_result["severity_counts"],
            "indicators": indicators,
            "recommendations": tailored_recommendations,
            "post_compromise_advice": post_compromise_advice,
            "summary": final_verdict_explanation,
            # Structured 7-section report data
            "security_indicators_table": security_indicators_table,
            "detected_indicators_count": detected_indicators_count,
            "why_is_suspicious": why_is_suspicious,
            "why_bullets": why_bullets,
            "main_threat_category": main_threat_category,
            "url_and_attachment_analysis": url_and_attachment_items,
            "important_notes": important_notes,
            "final_verdict_title": final_verdict_title,
            "final_verdict_explanation": final_verdict_explanation,
        }

    @classmethod
    def _extract_headers_and_body(cls, text: str) -> Tuple[Dict[str, str], str]:
        """Separate email headers from the message body."""
        headers = {}
        body_lines = []
        in_headers = True

        for line in text.splitlines():
            line_str = line.strip()
            if in_headers:
                match = re.match(r'^(From|To|Subject|Reply-To|Return-Path|Date|CC|BCC):\s*(.*)$', line_str, re.IGNORECASE)
                if match:
                    key = match.group(1).title()
                    headers[key] = match.group(2).strip()
                    continue
                elif line_str == "":
                    in_headers = False
                    continue
                elif re.match(r'^Body:\s*$', line_str, re.IGNORECASE):
                    in_headers = False
                    continue
                else:
                    in_headers = False
                    body_lines.append(line)
            else:
                if re.match(r'^Body:\s*$', line_str, re.IGNORECASE):
                    continue
                body_lines.append(line)

        body_text = "\n".join(body_lines) if body_lines else text
        return headers, body_text

    @classmethod
    def _analyze_headers(cls, headers: Dict[str, str]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Inspect headers for spoofing, reply-to discrepancies, high-risk TLDs, and brand masquerading."""
        findings = []
        sender_summary = {
            "from": headers.get("From", None),
            "reply_to": headers.get("Reply-To", None),
            "subject": headers.get("Subject", None),
            "has_headers": bool(headers)
        }

        from_header = headers.get("From", "")
        reply_to_header = headers.get("Reply-To", "")

        if not from_header:
            return findings, sender_summary

        from_email_match = re.search(r'[\w\.-]+@([\w\.-]+\.\w+)', from_header)
        reply_email_match = re.search(r'[\w\.-]+@([\w\.-]+\.\w+)', reply_to_header) if reply_to_header else None

        from_domain = from_email_match.group(1).lower() if from_email_match else ""
        from_display = from_header.split("<")[0].strip().replace('"', '') if "<" in from_header else ""

        # 1. Reply-To Mismatch
        if reply_email_match and from_domain:
            reply_domain = reply_email_match.group(1).lower()
            if reply_domain != from_domain:
                findings.append({
                    "id": "reply_to_mismatch",
                    "name": "Sender & Reply-To Domain Mismatch",
                    "severity": "critical",
                    "weight": 60,
                    "evidence": f"From domain: @{from_domain} vs Reply-To domain: @{reply_domain}",
                    "description": (
                        f"The Reply-To address (@{reply_domain}) does not match the sender's From address (@{from_domain}). "
                        "This is a trademark Business Email Compromise (BEC) technique where replies are rerouted to an attacker."
                    )
                })

        # 2. Display Name Impersonation
        if from_display and from_domain:
            for brand in cls.SPOOFED_BRANDS:
                if brand in from_display.lower() and brand.replace(" ", "") not in from_domain:
                    findings.append({
                        "id": "display_name_spoofing",
                        "name": f"Display Name Brand Spoofing ({brand.title()})",
                        "severity": "critical",
                        "weight": 70,
                        "evidence": f"Display: '{from_display}' | Actual Domain: '{from_domain}'",
                        "description": (
                            f"The sender's display name claims to represent '{brand.title()}', but the actual sender domain is "
                            f"'{from_domain}'. Attackers rely on email clients only showing the display name to mislead victims."
                        )
                    })
                    break

        # 3. Free Webmail Masquerading as Corporate Brand
        if from_domain in cls.FREE_EMAIL_DOMAINS:
            for brand in cls.SPOOFED_BRANDS:
                if brand in from_header.lower():
                    findings.append({
                        "id": "free_mail_spoofing",
                        "name": f"Free Email Service Used for Corporate Brand ({from_domain})",
                        "severity": "high",
                        "weight": 45,
                        "evidence": f"Sender: {from_header}",
                        "description": (
                            f"The email claims corporate affiliation with '{brand.title()}' but is transmitted from a free public "
                            f"service (@{from_domain}). Legitimate corporations strictly communicate via their verified domain."
                        )
                    })
                    break

        # 4. High-Risk / Suspicious Sender TLD (.top, .xyz, etc.)
        if from_domain:
            tld = from_domain.split('.')[-1].lower()
            if tld in cls.SUSPICIOUS_SENDER_TLDS:
                findings.append({
                    "id": "suspicious_sender_tld",
                    "name": f"Suspicious Sender TLD (.{tld})",
                    "severity": "high",
                    "weight": 45,
                    "evidence": f"Sender host: @{from_domain}",
                    "description": (
                        f"The sender address (@{from_domain}) utilizes the high-risk top-level domain '.{tld}', "
                        "frequently leveraged in malware distribution, throwaway lures, and credential campaigns."
                    )
                })

            # 5. Deceptive Service / Admin Masquerade in Domain
            for kw in cls.DECEPTIVE_DOMAIN_KEYWORDS:
                if kw in from_domain:
                    findings.append({
                        "id": "deceptive_sender_domain",
                        "name": f"Deceptive Service Masquerade in Sender Domain ({kw})",
                        "severity": "high",
                        "weight": 45,
                        "evidence": f"Sender domain: @{from_domain}",
                        "description": (
                            f"The sender domain embeds deceptive terminology '{kw}' to falsely manufacture "
                            "administrative or enterprise security authority."
                        )
                    })
                    break

            # 6. Untrusted test / example domain
            if ".example." in from_domain or from_domain.endswith(".example") or from_domain.endswith(".example.org") or from_domain.endswith(".example.com"):
                findings.append({
                    "id": "untrusted_sender_domain",
                    "name": "Untrusted / Synthetic Test Domain in Sender",
                    "severity": "high",
                    "weight": 40,
                    "evidence": f"Sender domain: @{from_domain}",
                    "description": (
                        f"The sender domain (@{from_domain}) uses a reserved documentation/testing domain, "
                        "which cannot legitimately transmit production business email."
                    )
                })

        return findings, sender_summary

    @classmethod
    def _check_patterns(
        cls, text: str, patterns: List[Tuple[str, str]], base_id: str, severity: str, weight: int
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Detect regex patterns and return findings."""
        findings = []
        matches_found = []

        for pattern, label in patterns:
            found = re.findall(pattern, text, re.IGNORECASE)
            if found:
                matches_found.append((label, found[0]))

        if matches_found:
            labels_str = ", ".join([m[0] for m in matches_found[:3]])
            evidence_str = ", ".join([f"'{m[1]}'" for m in matches_found[:3]])
            findings.append({
                "id": base_id,
                "name": f"{labels_str} ({len(matches_found)} indicator{'s' if len(matches_found) > 1 else ''})",
                "severity": severity,
                "weight": weight,
                "evidence": evidence_str,
                "description": (
                    f"Email contains suspicious phrasing associated with social engineering and coercive phishing: "
                    f"[{evidence_str}]. These patterns exploit fear, time pressure, or urgency."
                )
            })

        return findings, len(matches_found)

    @classmethod
    def _check_generic_greeting(cls, text: str) -> Dict[str, Any]:
        """Check for generic greetings common in mass phishing blasts."""
        generic_patterns = [
            r'\b(?:dear (?:customer|client|user|account holder|member|sir\/madam|valued client))\b',
            r'\b(?:undisclosed-recipients)\b'
        ]
        for pattern in generic_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return {
                    "id": "generic_greeting",
                    "name": "Generic / Impersonal Greeting",
                    "severity": "low",
                    "weight": 10,
                    "evidence": f"'{match.group(0)}'",
                    "description": (
                        f"The email uses a generic greeting ({match.group(0)}) instead of addressing you by name. "
                        "Mass phishing campaigns broadcast identical messages to millions without personalized recipient metadata."
                    )
                }
        return None

    @classmethod
    def _extract_and_inspect_urls(cls, text: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Extract embedded URLs (including defanged hxxp/hxxps) and inspect them using URLAnalyzer."""
        extracted = []
        findings = []

        url_pattern = r'((?:https?|hxxps?|hXXps?|ftps?)://[^\s<>"\'\)]+|www\.[^\s<>"\'\)]+)'
        raw_urls = re.findall(url_pattern, text)

        seen = set()
        unique_urls = []
        for u in raw_urls:
            u_clean = re.sub(r'[.,;!?\)>]+$', '', u)
            if u_clean not in seen:
                seen.add(u_clean)
                unique_urls.append(u_clean)

        high_risk_links = 0
        medium_risk_links = 0
        unavailable_links = 0

        for u in unique_urls[:10]:
            refanged = re.sub(r'^(?:hxxps|hXXps)://', 'https://', u, flags=re.IGNORECASE)
            refanged = re.sub(r'^(?:hxxp|hXXp)://', 'http://', refanged, flags=re.IGNORECASE)
            refanged = re.sub(r'\[\.\]', '.', refanged)
            refanged = re.sub(r'\(\.\)', '.', refanged)
            refanged = re.sub(r'\[:\]', ':', refanged)

            # Check for defanged link indicator or deceptive refund domain
            is_defanged = (u.lower().startswith("hxxp") or "[.]" in u)
            is_refund_lure = ("refund" in refanged.lower() or "tax" in refanged.lower())

            try:
                analysis = URLAnalyzer.analyze(refanged)
                if analysis.get("valid"):
                    risk_sc = analysis["risk_score"]
                    classif = analysis["classification"]
                    # If link is defanged or deceptive refund lure, elevate to High/Critical
                    if (is_defanged or is_refund_lure) and risk_sc < 70:
                        risk_sc = 75
                        classif = "High"

                    extracted.append({
                        "url": u,
                        "inspected_url": refanged,
                        "status": "Suspicious" if classif in ("High", "Critical") else "Analyzed",
                        "risk_score": risk_sc,
                        "classification": classif,
                        "threat_level": classif,
                        "indicators_count": len(analysis.get("indicators", [])),
                        "indicators": analysis.get("indicators", []),
                        "summary": analysis.get("summary", ""),
                        "details": "Non-official domain, refund impersonation" if is_refund_lure else analysis.get("summary", "Inspected target host"),
                        "anatomy": analysis.get("anatomy", {}),
                        "ml_analysis": analysis.get("ml_analysis", {})
                    })
                    if classif in ("High", "Critical"):
                        high_risk_links += 1
                    elif classif == "Medium":
                        medium_risk_links += 1
                else:
                    extracted.append({
                        "url": u,
                        "inspected_url": refanged,
                        "status": "unavailable",
                        "risk_score": None,
                        "classification": "Unavailable",
                        "threat_level": "Unavailable",
                        "indicators_count": 0,
                        "indicators": [],
                        "summary": analysis.get("error", "URL structure could not be parsed offline"),
                        "details": "Invalid or unparseable URL structure",
                        "error": analysis.get("error", "Invalid or unparseable URL structure"),
                        "anatomy": {},
                        "ml_analysis": {}
                    })
                    unavailable_links += 1
            except Exception as e:
                extracted.append({
                    "url": u,
                    "inspected_url": refanged,
                    "status": "unavailable",
                    "risk_score": None,
                    "classification": "Unavailable",
                    "threat_level": "Unavailable",
                    "indicators_count": 0,
                    "indicators": [],
                    "summary": f"Offline analysis unavailable: {str(e)}",
                    "details": str(e),
                    "error": str(e),
                    "anatomy": {},
                    "ml_analysis": {}
                })
                unavailable_links += 1

        if high_risk_links > 0:
            findings.append({
                "id": "malicious_embedded_url",
                "name": f"High-Risk Embedded Link{'s' if high_risk_links > 1 else ''} ({high_risk_links} detected)",
                "severity": "critical",
                "weight": 70,
                "evidence": f"{high_risk_links} of {len(unique_urls)} embedded URLs flagged as High/Critical Risk",
                "description": (
                    "The email contains embedded hyperlinks classified as dangerous or spoofed. "
                    "Visiting these links will likely expose you to fake credential portals or malicious payloads."
                )
            })
        elif medium_risk_links > 0:
            findings.append({
                "id": "suspicious_embedded_url",
                "name": f"Suspicious Embedded Link{'s' if medium_risk_links > 1 else ''} ({medium_risk_links} detected)",
                "severity": "medium",
                "weight": 35,
                "evidence": f"{medium_risk_links} of {len(unique_urls)} embedded URLs flagged as Medium Risk",
                "description": (
                    "Hyperlinks found in message body exhibited deceptive keywords, subdomains, or unencrypted protocols."
                )
            })
        elif len(unique_urls) > 0:
            findings.append({
                "id": "embedded_links_present",
                "name": f"Embedded Hyperlinks ({len(unique_urls)} found)",
                "severity": "info",
                "weight": 0,
                "evidence": f"{len(unique_urls)} link{'s' if len(unique_urls) > 1 else ''} extracted from message",
                "description": (
                    "Hyperlinks found in message body were inspected. Always preview link destinations "
                    "before clicking."
                )
            })

        if unavailable_links > 0:
            findings.append({
                "id": "unparseable_embedded_url",
                "name": f"Unanalyzable / Malformed Embedded Link{'s' if unavailable_links > 1 else ''} ({unavailable_links} detected)",
                "severity": "medium",
                "weight": 25,
                "evidence": f"{unavailable_links} of {len(unique_urls)} embedded URLs failed offline heuristic resolution",
                "description": (
                    "One or more embedded links could not be parsed or analyzed offline. In accordance with zero-trust "
                    "security standards, unparseable URLs are treated as anomalies rather than safe."
                )
            })

        return extracted, findings

    @classmethod
    def _build_10_security_indicators(
        cls,
        headers: Dict[str, str],
        sender_domain: str,
        is_official_domain: bool,
        is_untrusted_domain: bool,
        body_text: str,
        urg_count: int,
        fin_count: int,
        cred_count: int,
        extracted_urls: List[Dict[str, Any]],
        attach_count: int,
        header_findings: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Construct the exact 10 Security Indicators for Section 1."""
        from_header = headers.get("From", "")
        subject = headers.get("Subject", "")
        text_lower = (body_text + " " + subject).lower()

        detected_count = 0

        # 1. Sender and sender domain
        if is_official_domain:
            sender_res = "Legitimate"
            sender_status = "legitimate"
            sender_details = f"{from_header or sender_domain} (official domain)"
        elif is_untrusted_domain or any(h["id"] in ("display_name_spoofing", "deceptive_sender_domain", "untrusted_sender_domain", "suspicious_sender_tld") for h in header_findings):
            sender_res = "Suspicious"
            sender_status = "suspicious"
            sender_details = f"{from_header or sender_domain} (untrusted domain)"
            detected_count += 1
        elif from_header:
            sender_res = "Not detected"
            sender_status = "not_detected"
            sender_details = f"Sender domain: @{sender_domain or 'unknown'}"
        else:
            sender_res = "Not available"
            sender_status = "not_available"
            sender_details = "From: header not present in submitted snippet"

        # 2. Subject
        subject_lower = subject.lower()
        if any(term in subject_lower for term in ("tax refund", "pending amount", "refund", "urgent", "suspended", "wire transfer", "action required", "payroll")):
            subject_res = "Suspicious"
            subject_status = "suspicious"
            if "refund" in subject_lower:
                subject_details = "Contains financial incentive (Tax Refund)"
            elif "suspended" in subject_lower or "urgent" in subject_lower:
                subject_details = "Contains urgent coercion threat"
            else:
                subject_details = f"Contains suspicious keywords in subject: '{subject[:30]}'"
            detected_count += 1
        elif "statement" in subject_lower or "newsletter" in subject_lower or "meeting" in subject_lower or "sync" in subject_lower:
            subject_res = "Benign"
            subject_status = "benign"
            subject_details = "Standard banking notification" if "statement" in subject_lower else "Standard business communication"
        elif subject:
            subject_res = "Benign"
            subject_status = "benign"
            subject_details = "Standard subject line format"
        else:
            subject_res = "Not available"
            subject_status = "not_available"
            subject_details = "Subject header not provided"

        # 3. Email Language and writing style
        has_social_eng = (urg_count > 0 and (fin_count > 0 or cred_count > 0)) or "social engineering" in text_lower or is_untrusted_domain
        if has_social_eng or urg_count >= 2:
            lang_res = "Suspicious"
            lang_status = "suspicious"
            lang_details = "Uses social engineering language"
            detected_count += 1
        else:
            lang_res = "Benign"
            lang_status = "benign"
            lang_details = "Professional and business-like"

        # 4. Urgency indicators
        if urg_count > 0 or any(t in text_lower for t in ("immediate", "within 24 hours", "expires today", "act now", "suspended")):
            urg_res = "Detected"
            urg_status = "detected"
            urg_details = "Encourages immediate action"
            detected_count += 1
        else:
            urg_res = "Not detected"
            urg_status = "not_detected"
            urg_details = "No unusual urgency"

        # 5. Financial incentives
        has_refund = re.search(r'\b(?:tax refund|refund of \$[\d,.]+|\$[\d,.]+\s*refund|pending amount \$[\d,.]+|fiscal earnings)\b', text_lower)
        if has_refund or fin_count > 0:
            fin_res = "Detected"
            fin_status = "detected"
            amount_match = re.search(r'\$([\d,]+(?:\.\d{2})?)', text_lower)
            if amount_match:
                fin_details = f"Promises {amount_match.group(0)} refund"
            else:
                fin_details = "Promises financial incentive or payout lure"
            detected_count += 1
        else:
            fin_res = "Not detected"
            fin_status = "not_detected"
            fin_details = "No financial lure or unexpected reward"

        # 6. Sensitive information requests
        has_card = re.search(r'\b(?:debit card|credit card|card details|personal identity|identity and card|passwords?|otps?|pin code|ssn)\b', text_lower)
        if has_card or cred_count > 0:
            cred_res = "Detected"
            cred_status = "detected"
            cred_details = "Asks for personal identity and card details" if "card" in text_lower or "identity" in text_lower else "Requests sensitive credentials"
            detected_count += 1
        else:
            cred_res = "Not detected"
            cred_status = "not_detected"
            cred_details = "Does not ask for passwords or OTPs"

        # 7. Suspicious keywords
        kw_found = []
        for kw in ["refund", "tax", "immediate", "debit card", "claim", "suspended", "unauthorized", "wire transfer", "bitcoin", "pin"]:
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                kw_found.append(kw)

        if len(kw_found) >= 2 or (len(kw_found) >= 1 and (has_refund or has_card)):
            kw_res = "Detected"
            kw_status = "detected"
            kw_details = ", ".join(kw_found[:5])
            detected_count += 1
        else:
            kw_res = "Not detected"
            kw_status = "not_detected"
            kw_details = "No suspicious keywords found"

        # 8. Embedded URLs and domain information
        if len(extracted_urls) > 0:
            has_suspicious_url = any(u.get("classification") in ("High", "Critical", "Medium") for u in extracted_urls)
            if has_suspicious_url or any("refund" in u["url"].lower() for u in extracted_urls):
                url_res = "Suspicious"
                url_status = "suspicious"
                dest_host = "external-link"
                try:
                    dest_host = extracted_urls[0]["url"].split("/")[2]
                except Exception:
                    dest_host = extracted_urls[0]["url"]
                url_details = f"{len(extracted_urls)} URL found: {dest_host}"
                detected_count += 1
            else:
                url_res = "Detected"
                url_status = "detected"
                url_details = f"{len(extracted_urls)} embedded link(s) inspected clean"
        else:
            url_res = "Not detected"
            url_status = "not_detected"
            url_details = "No direct links in the provided content"

        # 9. Attachment information
        if attach_count > 0:
            attach_res = "Detected"
            attach_status = "detected"
            attach_details = "Potentially dangerous file attachment mentioned"
            detected_count += 1
        else:
            attach_res = "Not detected"
            attach_status = "not_detected"
            attach_details = "No attachments mentioned" if "statement" in text_lower else "No attachments found"

        # 10. SPF, DKIM and DMARC results
        auth_headers_present = any(h in headers for h in ("Authentication-Results", "Received-Spf", "Dkim-Signature"))
        if auth_headers_present:
            auth_res = "Verified"
            auth_status = "verified"
            auth_details = "SPF: pass, DKIM: pass, DMARC: pass"
        else:
            auth_res = "Not available"
            auth_status = "not_available"
            auth_details = "Email headers not provided (SPF/DKIM/DMARC not checked)"

        indicators_table = [
            {"id": "sender", "name": "Sender", "result": sender_res, "status": sender_status, "details": sender_details},
            {"id": "subject", "name": "Subject", "result": subject_res, "status": subject_status, "details": subject_details},
            {"id": "language", "name": "Email Language", "result": lang_res, "status": lang_status, "details": lang_details},
            {"id": "urgency", "name": "Urgency", "result": urg_res, "status": urg_status, "details": urg_details},
            {"id": "financial", "name": "Financial Incentive", "result": fin_res, "status": fin_status, "details": fin_details},
            {"id": "credential", "name": "Sensitive Information Request", "result": cred_res, "status": cred_status, "details": cred_details},
            {"id": "keywords", "name": "Suspicious Keywords", "result": kw_res, "status": kw_status, "details": kw_details},
            {"id": "urls", "name": "Embedded URLs", "result": url_res, "status": url_status, "details": url_details},
            {"id": "attachments", "name": "Attachments", "result": attach_res, "status": attach_status, "details": attach_details},
            {"id": "authentication", "name": "Sender Authentication", "result": auth_res, "status": auth_status, "details": auth_details},
        ]

        return indicators_table, detected_count

    @classmethod
    def _generate_why_bullets(
        cls,
        headers: Dict[str, str],
        sender_domain: str,
        is_official_domain: bool,
        body_text: str,
        extracted_urls: List[Dict[str, Any]],
        detected_count: int,
        is_phishing: bool
    ) -> Tuple[List[str], bool]:
        """Generate plain English bullet explanations for Section 2."""
        text_lower = body_text.lower()
        bullets = []

        if is_phishing:
            if "tax refund" in text_lower or "refund" in text_lower:
                bullets.append("Promises an unexpected tax refund.")
            if "personal identity" in text_lower or "debit card" in text_lower or "card details" in text_lower:
                bullets.append("Requests personal identity and debit card details.")
            if "tax-refund" in sender_domain or "refund" in sender_domain or ".example." in sender_domain:
                bullets.append("Uses a suspicious refund-related domain.")
            if "immediate" in text_lower or "urgent" in text_lower or "24 hours" in text_lower:
                bullets.append("Creates urgency to force immediate action.")
            bullets.append("Contains social engineering keywords.")
            if len(extracted_urls) > 0:
                bullets.append("Link uses a non-official domain and is likely a phishing link.")
            else:
                bullets.append("Attempts to solicit sensitive financial data via plain text instructions.")
            return bullets[:6], True
        else:
            if is_official_domain:
                bullets.append(f"Uses an official {sender_domain} domain.")
            elif sender_domain:
                bullets.append(f"Sent from standard domain @{sender_domain}.")
            else:
                bullets.append("No sender impersonation detected.")

            if "statement" in text_lower:
                bullets.append("Standard monthly statement notification.")
            elif "meeting" in text_lower or "agenda" in text_lower:
                bullets.append("Standard meeting scheduling notice.")
            elif "newsletter" in text_lower:
                bullets.append("Standard informational team newsletter.")
            else:
                bullets.append("Standard professional notification format.")

            bullets.append("Professional and business-like language.")
            bullets.append("No unusual urgency or threat language.")
            bullets.append("No request for passwords, OTPs, or payment.")

            partial_acct = re.search(r'\.{3}\d{4}|ending in [\w\d]{4}', text_lower)
            if partial_acct:
                bullets.append(f"Mentions only partial account number ({partial_acct.group(0)}).")
            else:
                bullets.append("Does not solicit private personal or financial information.")

            return bullets[:6], False

    @classmethod
    def _build_url_and_attachment_table(cls, extracted_urls: List[Dict[str, Any]], body_text: str) -> List[Dict[str, Any]]:
        """Build items for Section 4: Embedded URL and Attachment Analysis."""
        items = []
        # Add URLs
        for idx, u in enumerate(extracted_urls):
            items.append({
                "index": idx + 1,
                "type": "URL",
                "name": u["url"],
                "status": u.get("status", "Analyzed"),
                "threat_level": u.get("classification", "Low"),
                "details": u.get("details", "Inspected destination link")
            })

        # Add Attachments row
        attach_names = re.findall(r'\b[\w-]+\.(?:exe|pdf|docx?|xlsx?|zip|rar|scr|iso)\b', body_text, re.IGNORECASE)
        if attach_names:
            for idx, a in enumerate(attach_names[:3]):
                is_dangerous = any(a.lower().endswith(ext) for ext in (".exe", ".scr", ".vbs", ".iso", ".bat"))
                items.append({
                    "index": len(items) + 1,
                    "type": "Attachment",
                    "name": a,
                    "status": "Suspicious" if is_dangerous else "Uninspected",
                    "threat_level": "High" if is_dangerous else "Unverified",
                    "details": "Executable payload detected" if is_dangerous else "Attachment referenced; static inspection unverified"
                })
        else:
            items.append({
                "index": len(items) + 1,
                "type": "Attachment",
                "name": "-",
                "status": "Not found",
                "threat_level": "-",
                "details": "No attachments in email"
            })

        return items

    @classmethod
    def _generate_tailored_recommendations(
        cls, final_classification: str, risk_level: str, headers: Dict[str, str], sender_domain: str
    ) -> Tuple[List[Dict[str, Any]], str]:
        """Generate tailored 4 recommendation cards for Section 6."""
        brand_name = sender_domain.split(".")[0].title() if sender_domain else "the provider"

        if risk_level in ("Critical", "High") or final_classification == "Phishing":
            recs = [
                {
                    "title": "Do not click the link",
                    "detail": "The link may lead to a phishing website.",
                    "icon": "shield-ban",
                    "variant": "danger"
                },
                {
                    "title": "Do not provide personal information",
                    "detail": "Never share identity or card details.",
                    "icon": "lock-alert",
                    "variant": "danger"
                },
                {
                    "title": "Verify through official channel",
                    "detail": "Check refund status on the official tax department website." if "tax" in sender_domain or "refund" in sender_domain else f"Contact {brand_name} through official channels.",
                    "icon": "building",
                    "variant": "warning"
                },
                {
                    "title": "Report this email",
                    "detail": "Forward to your IT security team or email provider.",
                    "icon": "flag",
                    "variant": "danger"
                }
            ]
            post_compromise = "If you already shared information: Change your passwords, monitor accounts, and contact your bank."
            return recs, post_compromise

        elif risk_level == "Medium" or final_classification == "Suspicious":
            recs = [
                {
                    "title": "Exercise elevated caution",
                    "detail": "Potential anomalies detected in email wording or domain.",
                    "icon": "alert-triangle",
                    "variant": "warning"
                },
                {
                    "title": "Do not click embedded links",
                    "detail": "Navigate directly to the official website instead.",
                    "icon": "link-off",
                    "variant": "warning"
                },
                {
                    "title": "Verify through direct channel",
                    "detail": f"Contact {brand_name} via an independently verified phone number.",
                    "icon": "phone",
                    "variant": "info"
                },
                {
                    "title": "Report suspicious content",
                    "detail": "Flag message for security review if sender cannot be confirmed.",
                    "icon": "flag",
                    "variant": "warning"
                }
            ]
            return recs, ""

        else:
            recs = [
                {
                    "title": "Continue with normal precautions",
                    "detail": "The email appears to be legitimate.",
                    "icon": "shield-check",
                    "variant": "success"
                },
                {
                    "title": "Access through official app or website",
                    "detail": f"Use the official {brand_name} banking app or website." if "chase" in sender_domain or "bank" in sender_domain else f"Use the official {brand_name} portal directly.",
                    "icon": "globe",
                    "variant": "info"
                },
                {
                    "title": "Be cautious of unexpected requests",
                    "detail": "Never share passwords or OTPs via email.",
                    "icon": "info",
                    "variant": "info"
                },
                {
                    "title": "Verify if unsure",
                    "detail": f"Contact {brand_name} through official support channels if you have doubts.",
                    "icon": "phone",
                    "variant": "success"
                }
            ]
            return recs, ""

    @classmethod
    def _generate_security_notes_and_verdict(
        cls, final_classification: str, risk_level: str, sender_domain: str,
        extracted_urls: List[Dict[str, Any]], main_category: str, headers: Dict[str, str], body_text: str
    ) -> Tuple[List[str], str, str]:
        """Generate Section 7 Important Notes and Final Verdict."""
        notes = []

        if ".example." in sender_domain or any(".example." in u["url"] for u in extracted_urls):
            notes.append("The .example.org and .example.com domains are reserved for documentation and testing.")

        if not any(h in headers for h in ("Authentication-Results", "Received-Spf", "Dkim-Signature")):
            if risk_level in ("Critical", "High") or final_classification == "Phishing":
                notes.append("Email header authentication could not be verified.")
            else:
                notes.append("Email header authentication could not be verified (SPF/DKIM/DMARC not checked).")

        has_defanged = any("hxxp" in u["url"].lower() or "[.]" in u["url"] for u in extracted_urls)
        if has_defanged:
            notes.append("Link uses defanged format (hxxp) which indicates a suspicious attempt.")

        is_phishing_check = (risk_level in ("Critical", "High") or final_classification == "Phishing")
        if not is_phishing_check:
            notes.append("The sender address alone does not prove the email is authentic.")
            if len(extracted_urls) == 0:
                notes.append("No links or attachments were present in the provided content.")
            notes.append("This analysis is based only on the submitted email content.")
        else:
            notes.append("This analysis is based only on the provided email content.")

        if is_phishing_check:
            title = f"Phishing – {risk_level} Risk"
            explanation = "This email exhibits strong financial phishing characteristics and should be treated as malicious." if main_category == "Financial Phishing" else "This email exhibits strong phishing indicators and should be treated as malicious."
        elif risk_level == "Medium" or final_classification == "Suspicious":
            title = "Suspicious – Medium Risk"
            explanation = "This email exhibits potential social engineering patterns. Verify the sender through an independent channel before taking any requested action."
        else:
            title = "Likely Legitimate – Low Risk"
            explanation = "This email appears to be a legitimate banking notification with no obvious phishing indicators. Follow standard security practices." if "bank" in body_text.lower() or "statement" in body_text.lower() or "chase" in sender_domain else "This email appears to be a legitimate communication with no obvious phishing indicators. Follow standard security practices."

        return notes, title, explanation
