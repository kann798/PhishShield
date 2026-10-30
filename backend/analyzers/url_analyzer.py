"""
URL Analyzer Module for PhishShield.
Performs offline, heuristic inspection of URLs to detect phishing indicators,
domain spoofing, typosquatting, obfuscation, and structural anomalies.
No external network requests are made (SSRF-safe).
"""
import re
import ipaddress
from urllib.parse import urlparse, unquote
from typing import Dict, Any, List, Optional
from .risk_scorer import RiskScorer
from .ml_engine import MLEngine


class URLAnalyzer:
    """
    Analyzes URLs strictly through static parsing, regular expressions,
    and heuristic indicator rules without making network requests.
    """

    # Common URL Shorteners
    SHORTENERS = {
        "bit.ly", "tinyurl.com", "t.co", "is.gd", "ow.ly", "buff.ly",
        "cutt.ly", "rb.gy", "shorturl.at", "tiny.cc", "rebrand.ly",
        "goo.gl", "lnkd.in", "s.id", "soo.gd", "adf.ly", "v.gd"
    }

    # High-Risk / Low-Cost TLDs frequently abused in phishing campaigns
    SUSPICIOUS_TLDS = {
        "tk", "ml", "ga", "cf", "gq", "xyz", "top", "buzz", "club",
        "work", "click", "link", "icu", "cam", "monster", "fit",
        "rest", "country", "live", "guru", "surf", "cfd", "shop"
    }

    # Keywords commonly exploited in credential harvesting, social engineering, and prize scams
    PHISHING_KEYWORDS = [
        "login", "signin", "sign-in", "log-in", "verify", "verification",
        "account", "security", "update", "banking", "secure", "password",
        "credential", "recover", "wallet", "support", "auth", "validation",
        "confirm", "authenticate", "identity", "billing", "webscr", "ebayisapi",
        "suspend", "unlock", "passcode", "helpdesk",
        "prize", "winner", "reward", "lottery", "claim", "claim-now",
        "giveaway", "free-gift", "cash-bonus", "jackpot"
    ]

    # Major target brands for typosquatting / impersonation
    TARGET_BRANDS = [
        "paypal", "microsoft", "google", "apple", "amazon", "netflix",
        "chase", "wellsfargo", "bankofamerica", "facebook", "instagram",
        "binance", "coinbase", "dropbox", "dhl", "fedex", "outlook",
        "office365", "yahoo", "citibank", "steam", "linkedin", "meta"
    ]

# Non-standard or suspicious web ports
    UNUSUAL_PORTS = {2082, 2083, 2086, 2087, 8000, 8080, 8088, 8443, 8888, 9000, 9090, 10000}

    # Authentic Domain Registries for major brands to eliminate false positives
    AUTHENTIC_BRAND_DOMAINS = {
        "amazon": [
            r"^([a-z0-9-]+\.)*amazon\.(com|in|co\.uk|de|fr|ca|co\.jp|es|it|com\.au|com\.br|cn|com\.mx|nl|se|pl|eg|sa|ae|sg)$",
            r"^([a-z0-9-]+\.)*media-amazon\.com$",
            r"^([a-z0-9-]+\.)*images-amazon\.com$",
            r"^([a-z0-9-]+\.)*ssl-images-amazon\.com$",
            r"^([a-z0-9-]+\.)*a2z\.com$"
        ],
        "microsoft": [
            r"^([a-z0-9-]+\.)*microsoft\.(com|net|org)$",
            r"^([a-z0-9-]+\.)*microsoftonline\.com$",
            r"^([a-z0-9-]+\.)*live\.(com|net)$",
            r"^([a-z0-9-]+\.)*office\.(com|net)$",
            r"^([a-z0-9-]+\.)*office365\.com$",
            r"^([a-z0-9-]+\.)*windows\.(com|net)$",
            r"^([a-z0-9-]+\.)*azure\.(com|net)$",
            r"^([a-z0-9-]+\.)*msn\.(com|net)$",
            r"^([a-z0-9-]+\.)*bing\.com$",
            r"^([a-z0-9-]+\.)*sharepoint\.com$",
            r"^([a-z0-9-]+\.)*visualstudio\.com$",
            r"^([a-z0-9-]+\.)*skype\.com$"
        ],
        "google": [
            r"^([a-z0-9-]+\.)*google\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$",
            r"^([a-z0-9-]+\.)*youtube\.com$",
            r"^([a-z0-9-]+\.)*gmail\.com$",
            r"^([a-z0-9-]+\.)*gstatic\.com$",
            r"^([a-z0-9-]+\.)*googleusercontent\.com$",
            r"^([a-z0-9-]+\.)*android\.com$"
        ],
        "apple": [
            r"^([a-z0-9-]+\.)*apple\.(com|[a-z]{2}|co\.[a-z]{2})$",
            r"^([a-z0-9-]+\.)*icloud\.com$",
            r"^([a-z0-9-]+\.)*itunes\.com$"
        ],
        "paypal": [
            r"^([a-z0-9-]+\.)*paypal\.(com|[a-z]{2}|me)$",
            r"^([a-z0-9-]+\.)*paypal-communication\.com$"
        ],
        "netflix": [
            r"^([a-z0-9-]+\.)*netflix\.(com|[a-z]{2}|net)$",
            r"^([a-z0-9-]+\.)*nflxvideo\.net$"
        ],
        "chase": [
            r"^([a-z0-9-]+\.)*chase\.com$",
            r"^([a-z0-9-]+\.)*jpmorgan\.com$",
            r"^([a-z0-9-]+\.)*jpmorganchase\.com$"
        ],
        "facebook": [
            r"^([a-z0-9-]+\.)*facebook\.com$",
            r"^([a-z0-9-]+\.)*fb\.com$",
            r"^([a-z0-9-]+\.)*meta\.com$"
        ],
        "instagram": [
            r"^([a-z0-9-]+\.)*instagram\.com$",
            r"^([a-z0-9-]+\.)*cdninstagram\.com$"
        ],
        "linkedin": [
            r"^([a-z0-9-]+\.)*linkedin\.com$",
            r"^([a-z0-9-]+\.)*licdn\.com$"
        ]
    }

    @classmethod
    def _is_authentic_brand_domain(cls, brand: str, hostname: str) -> bool:
        """Check if hostname is officially owned or registered by the legitimate brand."""
        patterns = cls.AUTHENTIC_BRAND_DOMAINS.get(brand.lower(), [])
        return any(bool(re.match(pat, hostname.lower())) for pat in patterns)

    @classmethod
    def analyze(cls, raw_url: str) -> Dict[str, Any]:
        """
        Main analysis method for URL strings.
        Validates structure, extracts anatomy, evaluates heuristics,
        and generates risk score and findings.
        """
        if not raw_url or not isinstance(raw_url, str):
            return {
                "error": "URL cannot be empty",
                "valid": False
            }

        cleaned_url = raw_url.strip()

        # Defanged URL refanging (e.g., hxxps:// -> https://, hxxp:// -> http://, [.] -> .)
        cleaned_url = re.sub(r'^(?:hxxps|hXXps)://', 'https://', cleaned_url, flags=re.IGNORECASE)
        cleaned_url = re.sub(r'^(?:hxxp|hXXp)://', 'http://', cleaned_url, flags=re.IGNORECASE)
        cleaned_url = cleaned_url.replace('[.]', '.').replace('(.)', '.').replace('[:]', ':')
        
        # Enforce reasonable input size
        if len(cleaned_url) > 4096:
            return {
                "error": "URL exceeds maximum allowed length of 4096 characters",
                "valid": False
            }

        # Normalize URL scheme if omitted for heuristic parsing
        has_scheme = bool(re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*://', cleaned_url))
        url_to_parse = cleaned_url if has_scheme else f"http://{cleaned_url}"

        try:
            parsed = urlparse(url_to_parse)
        except Exception as e:
            return {
                "error": f"Invalid URL structure: {str(e)}",
                "valid": False
            }

        netloc = parsed.netloc.lower()
        if not netloc:
            return {
                "error": "Unable to extract valid hostname or domain from URL",
                "valid": False
            }

        # Extract port if present
        port = parsed.port
        hostname = parsed.hostname or netloc.split(":")[0]
        path = parsed.path
        query = parsed.query

        # Anatomy breakdown for the user
        domain_parts = hostname.split(".")
        is_two_level_tld = (
            len(domain_parts) >= 3 and
            len(domain_parts[-1]) == 2 and
            domain_parts[-2] in {"co", "com", "org", "net", "edu", "gov", "ac", "ne"}
        )
        if is_two_level_tld:
            tld = ".".join(domain_parts[-2:])
            subdomains = domain_parts[:-3] if len(domain_parts) > 3 else []
            main_domain = ".".join(domain_parts[-3:]) if len(domain_parts) >= 3 else hostname
        else:
            tld = domain_parts[-1] if len(domain_parts) > 1 else ""
            subdomains = domain_parts[:-2] if len(domain_parts) > 2 else []
            main_domain = ".".join(domain_parts[-2:]) if len(domain_parts) >= 2 else hostname

        # Heuristic checks
        indicators: List[Dict[str, Any]] = []

        # 1. IP Address as Hostname
        is_ip, ip_version = cls._check_ip_address(hostname)
        if is_ip:
            indicators.append({
                "id": "ip_based_url",
                "name": f"IP Address Hostname ({ip_version})",
                "severity": "high",
                "weight": 40,
                "evidence": hostname,
                "description": (
                    "The URL directs to a numeric IP address rather than a registered domain name. "
                    "Legitimate organizations rarely serve client-facing login portals directly from raw IP addresses."
                )
            })

        # 2. Punycode & IDN Homograph Attack
        if hostname.startswith("xn--") or "xn--" in hostname:
            indicators.append({
                "id": "punycode_homoglyph",
                "name": "Punycode / IDN Domain Encoding",
                "severity": "critical",
                "weight": 60,
                "evidence": hostname,
                "description": (
                    "The domain utilizes Punycode ('xn--') encoding, which converts non-ASCII Unicode characters "
                    "into ASCII strings. Attackers frequently use international characters that visually mimic Latin letters "
                    "(e.g., Cyrillic 'а' vs Latin 'a') to deceive users into visiting fake portals."
                )
            })

        # 3. Brand Typosquatting / Homoglyph Masquerade
        typosquat_finding = cls._check_typosquatting(hostname, main_domain)
        if typosquat_finding:
            indicators.append(typosquat_finding)

        # 4. Brand Keyword Abuse in Subdomain or Path (e.g. paypal.security-login.xyz)
        brand_abuse_finding = cls._check_brand_keyword_abuse(hostname, main_domain, path)
        if brand_abuse_finding:
            indicators.append(brand_abuse_finding)

        # 5. Excessive Subdomain Depth
        if len(subdomains) >= 3:
            indicators.append({
                "id": "excessive_subdomains",
                "name": f"Excessive Subdomain Levels ({len(subdomains)} subdomains)",
                "severity": "medium",
                "weight": 25,
                "evidence": ".".join(subdomains),
                "description": (
                    f"Found {len(subdomains)} nested subdomains. Phishers create deep subdomain chains "
                    "to push the actual malicious root domain off visible mobile screen address bars."
                )
            })

        # 6. High-Risk / Suspicious TLD
        if tld in cls.SUSPICIOUS_TLDS:
            indicators.append({
                "id": "suspicious_tld",
                "name": f"Suspicious Top-Level Domain (.{tld})",
                "severity": "medium",
                "weight": 20,
                "evidence": f".{tld}",
                "description": (
                    f"The domain uses the '.{tld}' top-level domain. These TLDs are frequently favored by "
                    "threat actors due to cheap or free automated registration and minimal identity verification."
                )
            })

        # 7. Known URL Shortener
        if hostname in cls.SHORTENERS:
            indicators.append({
                "id": "url_shortener",
                "name": f"URL Shortener Service ({hostname})",
                "severity": "medium",
                "weight": 20,
                "evidence": hostname,
                "description": (
                    f"The link uses '{hostname}', an anonymizing URL shortening service. Shorteners mask "
                    "the true destination address and bypass initial perimeter inspection."
                )
            })

        # 8. Suspicious Phishing Keywords in Path / Query
        is_trusted_site = any(cls._is_authentic_brand_domain(b, hostname) for b in cls.TARGET_BRANDS)
        found_keywords = [] if is_trusted_site else cls._find_phishing_keywords(f"{hostname} {path} {query}")
        if found_keywords:
            severity = "high" if len(found_keywords) >= 3 else ("medium" if len(found_keywords) >= 1 else "low")
            indicators.append({
                "id": "phishing_keywords",
                "name": f"Authentication & Security Keywords Detected ({len(found_keywords)})",
                "severity": severity,
                "weight": 15 * min(3, len(found_keywords)),
                "evidence": ", ".join(found_keywords),
                "description": (
                    f"The URL contains keywords strongly correlated with credential harvesting or social engineering: "
                    f"[{', '.join(found_keywords)}]. Phishing sites mimic login, verification, and recovery routes."
                )
            })

        # 9. Misleading Special Characters (@ symbol, double slashes)
        if "@" in parsed.netloc or "@" in cleaned_url.split("?")[0]:
            indicators.append({
                "id": "at_symbol_obfuscation",
                "name": "Deceptive '@' Character in URL",
                "severity": "critical",
                "weight": 55,
                "evidence": "@ detected in authority",
                "description": (
                    "The '@' character instructs browsers to treat text preceding it as HTTP basic authentication "
                    "credentials, routing the visitor to the host that follows it. For example, 'http://trusted.com@evil.com' "
                    "navigates to evil.com."
                )
            })

        # 10. Abnormal URL Length
        url_len = len(cleaned_url)
        if url_len > 120:
            indicators.append({
                "id": "unusually_long_url",
                "name": f"Unusually Long URL ({url_len} characters)",
                "severity": "medium",
                "weight": 20,
                "evidence": f"{url_len} characters",
                "description": (
                    "Excessively long URLs are often used to hide malicious domains past the visible edge of "
                    "mobile address bars, or to pass obfuscated payloads and redirection tokens."
                )
            })
        elif url_len > 75:
            indicators.append({
                "id": "elevated_url_length",
                "name": f"Elevated URL Length ({url_len} characters)",
                "severity": "low",
                "weight": 10,
                "evidence": f"{url_len} characters",
                "description": "The URL length is moderately high, which warrants inspection of parameters."
            })

        # 11. Multiple Hyphens in Hostname
        hyphen_count = hostname.count("-")
        if hyphen_count >= 2:
            indicators.append({
                "id": "excessive_hyphens",
                "name": f"Multiple Hyphens in Domain ({hyphen_count} hyphens)",
                "severity": "medium",
                "weight": 20,
                "evidence": hostname,
                "description": (
                    "Phishing domains frequently concatenate brand names and security phrases with multiple hyphens "
                    "(e.g., 'secure-paypal-login-account-update.com') to appear authentic."
                )
            })

        # 12. Non-Standard Port
        if port and port in cls.UNUSUAL_PORTS:
            indicators.append({
                "id": "suspicious_port",
                "name": f"Non-Standard Port Usage (Port {port})",
                "severity": "medium",
                "weight": 25,
                "evidence": f":{port}",
                "description": (
                    f"Port {port} is not standard HTTP (80) or HTTPS (443). Running web portals on unusual ports "
                    "is common in makeshift botnet proxies or staging environments."
                )
            })

        # 13. Hex / Percent Encoding Obfuscation
        percent_encodings = re.findall(r'%[0-9a-fA-F]{2}', cleaned_url)
        if len(percent_encodings) >= 4:
            indicators.append({
                "id": "hex_obfuscation",
                "name": f"Heavy Hex/Percent Encoding ({len(percent_encodings)} tokens)",
                "severity": "medium",
                "weight": 20,
                "evidence": f"{len(percent_encodings)} hex tokens",
                "description": (
                    "The URL uses repeated percent-encoding (%xx) to obfuscate malicious path names or special "
                    "characters from basic pattern filters."
                )
            })

        # 14. HTTPS Protocol Evaluation
        scheme = parsed.scheme.lower() if has_scheme else "http"
        https_assessment = cls._evaluate_https(scheme, len(indicators))
        if https_assessment:
            indicators.append(https_assessment)

        # Statistical Machine Learning Threat Classification
        ml_analysis = None
        try:
            ml_analysis = MLEngine.predict_url(url_to_parse)
        except Exception as e:
            ml_analysis = {
                "ml_enabled": False,
                "error": str(e),
                "phishing_probability": 0.0,
                "prediction": "Unavailable"
            }

        # Compute calibrated hybrid risk score (Heuristic + ML Ensemble)
        risk_result = RiskScorer.calculate(indicators, context_type="url", ml_analysis=ml_analysis)

        # Compile final response
        anatomy = {
            "scheme": scheme,
            "hostname": hostname,
            "main_domain": main_domain,
            "subdomains": subdomains,
            "tld": tld,
            "path": path or "/",
            "query": query or None,
            "port": port or (443 if scheme == "https" else 80),
            "is_ip": is_ip,
            "ip_version": ip_version,
            "length": url_len,
        }

        return {
            "valid": True,
            "input_url": cleaned_url,
            "normalized_url": url_to_parse,
            "anatomy": anatomy,
            "ml_analysis": ml_analysis,
            "risk_score": risk_result["risk_score"],
            "classification": risk_result["classification"],
            "severity_counts": risk_result["severity_counts"],
            "indicators": indicators,
            "recommendations": risk_result["recommendations"],
            "summary": risk_result["summary"],
        }

    @classmethod
    def _check_ip_address(cls, hostname: str) -> (bool, str):
        """Check if hostname is a raw IPv4 or IPv6 address."""
        # Strip square brackets for IPv6 if present
        host_clean = hostname.strip("[]")
        try:
            ip_obj = ipaddress.ip_address(host_clean)
            return True, f"IPv{ip_obj.version}"
        except ValueError:
            pass

        # Check for hex/octal or dotted decimal patterns
        if re.match(r'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$', host_clean):
            return True, "IPv4 (Dotted Decimal)"

        return False, ""

    @classmethod
    def _find_phishing_keywords(cls, text: str) -> List[str]:
        """Find occurrences of phishing keywords."""
        found = set()
        lower_text = text.lower()
        for kw in cls.PHISHING_KEYWORDS:
            # Word boundary or hyphen/dot delimited
            pattern = rf'(?:^|[\W_-]){re.escape(kw)}(?:$|[\W_-])'
            if re.search(pattern, lower_text):
                found.add(kw)
        return sorted(list(found))

    @classmethod
    def _check_typosquatting(cls, hostname: str, main_domain: str) -> Dict[str, Any]:
        """
        Detect homoglyphs and typosquatting of major target brands.
        e.g., paypa1, micros0ft, arnazon, googIe.
        """
        domain_without_tld = main_domain.split(".")[0] if "." in main_domain else main_domain

        # Common leetspeak substitutions
        char_subs = {
            '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's',
            '8': 'b', 'vv': 'w', 'rn': 'm', 'cl': 'd'
        }

        normalized_domain = domain_without_tld.lower()
        for char, repl in char_subs.items():
            normalized_domain = normalized_domain.replace(char, repl)

        for brand in cls.TARGET_BRANDS:
            if cls._is_authentic_brand_domain(brand, hostname):
                continue
            # If the normalized domain equals a brand but the actual domain does NOT match the authentic brand
            if brand in normalized_domain and brand not in domain_without_tld:
                return {
                    "id": "brand_typosquatting",
                    "name": f"Brand Typosquatting / Homoglyph ({brand.title()})",
                    "severity": "critical",
                    "weight": 70,
                    "evidence": f"Domain '{domain_without_tld}' mimics '{brand}'",
                    "description": (
                        f"The domain appears to impersonate '{brand.title()}' using character substitutions "
                        f"or homoglyphs (e.g. replacing 'l' with '1' or 'o' with '0'). This is a definitive phishing tactic."
                    )
                }

            # Levenshtein distance check for close typos (1 edit distance)
            if len(domain_without_tld) >= 5 and abs(len(domain_without_tld) - len(brand)) <= 1:
                dist = cls._levenshtein_distance(domain_without_tld, brand)
                if dist == 1 and domain_without_tld != brand:
                    return {
                        "id": "brand_typosquatting",
                        "name": f"Typosquatted Brand Name ({brand.title()})",
                        "severity": "critical",
                        "weight": 65,
                        "evidence": f"'{domain_without_tld}' is 1 character different from '{brand}'",
                        "description": (
                            f"The domain closely mimics the legitimate brand '{brand.title()}'. "
                            f"Attackers register misspelled versions of popular domains to trap users who mistype URLs."
                        )
                    }

        return None

    @classmethod
    def _check_brand_keyword_abuse(cls, hostname: str, main_domain: str, path: str) -> Dict[str, Any]:
        """
        Check if a major brand is placed inside subdomains or path of an unrelated domain.
        Example: paypal.com.account-update.xyz
        """
        for brand in cls.TARGET_BRANDS:
            if cls._is_authentic_brand_domain(brand, hostname):
                continue
            # Brand is present in hostname, but the main domain is completely different
            if brand in hostname:
                brand_domain_match = f"{brand}." in main_domain or main_domain.startswith(f"{brand}.")
                if not brand_domain_match:
                    return {
                        "id": "brand_subdomain_abuse",
                        "name": f"Misleading Brand Subdomain ({brand.title()})",
                        "severity": "high",
                        "weight": 50,
                        "evidence": f"Host: {hostname} | Registered Domain: {main_domain}",
                        "description": (
                            f"The URL contains the brand name '{brand.title()}' in its subdomain or host prefix, "
                            f"but the actual registered root domain is '{main_domain}'. This deceptive technique tricks "
                            "users into trusting the address."
                        )
                    }
        return None

    @classmethod
    def _evaluate_https(cls, scheme: str, prior_indicator_count: int) -> Dict[str, Any]:
        """
        Evaluates HTTPS / HTTP usage. Explicitly educates user that HTTPS is NOT a guarantee of safety.
        """
        if scheme == "http":
            return {
                "id": "insecure_http",
                "name": "Unencrypted HTTP Protocol",
                "severity": "high" if prior_indicator_count > 0 else "medium",
                "weight": 25,
                "evidence": "http://",
                "description": (
                    "The website uses plaintext HTTP instead of secure HTTPS. Any data entered (passwords, payment info) "
                    "can be intercepted via Man-in-the-Middle (MitM) attacks. Legitimate banks and portals require HTTPS."
                )
            }
        elif scheme == "https":
            return {
                "id": "https_awareness_notice",
                "name": "HTTPS Encryption Present (Not a Guarantee of Safety)",
                "severity": "info",
                "weight": 0,
                "evidence": "https://",
                "description": (
                    "HTTPS encrypts communication between the browser and server, but DOES NOT guarantee legitimacy. "
                    "Over 80% of phishing websites now utilize free, automated SSL/TLS certificates (e.g., Let's Encrypt)."
                )
            }
        return None

    @staticmethod
    def _levenshtein_distance(s1: str, s2: str) -> int:
        """Standard Levenshtein distance between two strings."""
        if len(s1) < len(s2):
            return URLAnalyzer._levenshtein_distance(s2, s1)
        if len(s2) == 0:
            return len(s1)

        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row

        return previous_row[-1]
