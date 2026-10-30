"""
Email Analyzer Module for PhishShield.
Parses email headers and body text to identify phishing indicators,
credential harvesting, BEC / Reply-To spoofing, social engineering triggers,
suspicious attachment mentions, and malicious embedded links.
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
    ]

    # Credential Harvesting Patterns
    CREDENTIAL_PATTERNS = [
        (r'\b(?:verify your account|confirm your identity|update your billing|validate your details|identity sync|complete the identity sync)\b', "Identity/Account Verification"),
        (r'\b(?:reset your password|change your password|enter your credentials|login to restore|authenticate with your|corporate domain email credentials|email credentials|domain credentials|corporate credentials|authenticate to decrypt|decrypt and view)\b', "Corporate Credential Harvester"),
        (r'\b(?:social security|ssn|credit card number|cvv|pin code|banking credentials|debit card details)\b', "Sensitive Data Harvest"),
        (r'\b(?:click here to login|sign in to your account|access your portal|sign in to view|login to view)\b', "Call-to-Action Login Link"),
        (r'\b(?:two-factor|2fa|mfa|authenticator token|authenticator platform|authenticator migration|token migration|authentication migration|authenticator app)\b', "MFA / 2FA Security Token Harvester"),
        (r'\b(?:scan the qr code|qr code embedded|embedded in this message with your mobile device camera|scan with your mobile device|scan the qr)\b', "QR Code Phishing (Quishing)"),
    ]

    # Financial / Scams / Wire Fraud Patterns
    FINANCIAL_PATTERNS = [
        (r'\b(?:wire transfer|direct deposit|bank transfer|swift code|ach transfer)\b', "Direct Wire / Transfer Request"),
        (r'\b(?:bitcoin|btc|cryptocurrency|crypto wallet|ethereum|usdt)\b', "Cryptocurrency Payment"),
        (r'\b(?:gift card|itunes card|amazon gift card|steam card|google play card)\b', "Gift Card Payment Scam"),
        (r'\b(?:overdue invoice|unpaid invoice|invoice attached|payment receipt|remittance|overdue vendor invoice)\b', "Phony Invoice / Remittance Fraud"),
        (r'\b(?:lottery winner|inheritance fund|compensation fund|millions of dollars|claim prize)\b', "Advance Fee / Nigerian Prince Scam"),
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

    # High-Risk / Suspicious TLDs commonly abused in phishing
    SUSPICIOUS_SENDER_TLDS = {
        "top", "xyz", "club", "work", "click", "site", "cfd", "gq", "ml", "tk",
        "buzz", "rest", "shop", "online", "surf", "monster", "fit", "icu", "cam", "kim", "zip"
    }

    # Deceptive administrative / security keywords in sender domains
    DECEPTIVE_DOMAIN_KEYWORDS = [
        "cloud-file", "file-share", "security-validation", "mfa-authenticator",
        "auth-node", "secure-login", "verify-portal", "account-alert", "sharepoint-cloud"
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
        "geek squad", "mcafee", "norton", "symantec"
    ]

    @classmethod
    def analyze(cls, raw_content: str) -> Dict[str, Any]:
        """
        Analyze pasted email text, extracting headers, body content,
        embedded links, and detecting social engineering indicators.
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
        if any(h["id"] in ("reply_to_mismatch", "display_name_spoofing", "deceptive_sender_domain") for h in header_findings):
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
                "prediction": "Unavailable"
            }

        # Calculate final hybrid risk score (Heuristics + ML NLP Ensemble)
        risk_result = RiskScorer.calculate(indicators, context_type="email", ml_analysis=ml_analysis)

        # Create privacy-conscious identifier & preview (do not store raw body)
        content_hash = hashlib.sha256(cleaned.encode("utf-8")).hexdigest()[:12]
        subject_title = headers.get("Subject", "Untitled Email")
        sender_id = headers.get("From", "Unknown Sender")
        target_identifier = f"[{subject_title[:45]}] - {sender_id[:35]}" if headers else f"Email Content Snippet ({cleaned[:50]}...)"

        return {
            "valid": True,
            "target_identifier": target_identifier,
            "content_hash": content_hash,
            "headers": headers,
            "sender_summary": sender_summary,
            "social_engineering_triggers": list(set(social_engineering_triggers)),
            "extracted_urls": extracted_urls,
            "ml_analysis": ml_analysis,
            "risk_score": risk_result["risk_score"],
            "classification": risk_result["classification"],
            "severity_counts": risk_result["severity_counts"],
            "indicators": indicators,
            "recommendations": risk_result["recommendations"],
            "summary": risk_result["summary"],
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
                # Check for standard email header keys
                match = re.match(r'^(From|To|Subject|Reply-To|Return-Path|Date|CC|BCC):\s*(.*)$', line_str, re.IGNORECASE)
                if match:
                    key = match.group(1).title()
                    headers[key] = match.group(2).strip()
                    continue
                elif line_str == "":
                    # Empty line marks end of headers
                    in_headers = False
                    continue
                else:
                    # Non-empty line that doesn't match a header format -> start of body
                    in_headers = False
                    body_lines.append(line)
            else:
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

        # Extract email addresses from headers: "Display Name" <user@domain.com>
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

        # 2. Display Name Impersonation (e.g. "PayPal Service" <attacker@gmail.com>)
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

        # 3. Free Webmail Masquerading as Official Organization
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

        # 4. High-Risk / Suspicious Sender TLD (.top, .xyz, .club, etc.)
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

        # Regex for standard and defanged URLs in text
        url_pattern = r'((?:https?|hxxps?|hXXps?|ftps?)://[^\s<>"\'\)]+|www\.[^\s<>"\'\)]+)'
        raw_urls = re.findall(url_pattern, text)

        # Deduplicate while preserving order
        seen = set()
        unique_urls = []
        for u in raw_urls:
            # Clean trailing punctuation
            u_clean = re.sub(r'[.,;!?)>]+$', '', u)
            if u_clean not in seen:
                seen.add(u_clean)
                unique_urls.append(u_clean)

        # Inspect up to 10 URLs
        high_risk_links = 0
        medium_risk_links = 0
        for u in unique_urls[:10]:
            # Refang URL if defanged (e.g. hxxps -> https, [.] -> .)
            refanged = re.sub(r'^(?:hxxps|hXXps)://', 'https://', u, flags=re.IGNORECASE)
            refanged = re.sub(r'^(?:hxxp|hXXp)://', 'http://', refanged, flags=re.IGNORECASE)
            refanged = re.sub(r'\[\.\]', '.', refanged)
            refanged = re.sub(r'\(\.\)', '.', refanged)

            analysis = URLAnalyzer.analyze(refanged)
            if analysis.get("valid"):
                extracted.append({
                    "url": u,
                    "inspected_url": refanged,
                    "risk_score": analysis["risk_score"],
                    "classification": analysis["classification"],
                    "indicators_count": len(analysis.get("indicators", [])),
                    "summary": analysis.get("summary")
                })
                if analysis["classification"] in ("High", "Critical"):
                    high_risk_links += 1
                elif analysis["classification"] == "Medium":
                    medium_risk_links += 1

        if high_risk_links > 0:
            findings.append({
                "id": "malicious_embedded_url",
                "name": f"High-Risk Embedded Link{'s' if high_risk_links > 1 else ''} ({high_risk_links} detected)",
                "severity": "critical",
                "weight": 70,
                "evidence": f"{high_risk_links} of {len(unique_urls)} embedded URLs flagged as High/Critical",
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

        return extracted, findings
