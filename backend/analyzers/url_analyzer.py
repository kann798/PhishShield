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

    # Legitimate TLDs — used to skip typosquatting checks on valid extensions
    LEGITIMATE_TLDS = {
        'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'in', 'io', 'ai', 'co',
        'uk', 'us', 'ca', 'de', 'fr', 'it', 'es', 'nl', 'ru', 'cn', 'jp', 'kr',
        'au', 'nz', 'br', 'mx', 'ch', 'se', 'no', 'fi', 'dk', 'be', 'at', 'pl',
        'za', 'sg', 'hk', 'tw', 'ie', 'app', 'dev', 'tech', 'online', 'site',
        'store', 'shop', 'blog', 'live', 'news', 'me', 'info', 'biz', 'pro', 'tv',
        'cc', 'ws', 'mobi', 'name', 'agency', 'cloud', 'global', 'xyz', 'top',
        'club', 'icu', 'click', 'vip', 'work', 'fit', 'link', 'fun', 'zone',
        'today', 'space', 'website', 'page', 'life', 'world', 'network', 'digital',
        'tk', 'ml', 'ga', 'cf', 'gq', 'buzz', 'cam', 'monster', 'rest', 'country',
        'guru', 'surf', 'cfd', 'loan', 'id', 'ph', 'th', 'my', 'vn', 'ar', 'cl',
        'pe', 'ec', 'uy', 'py', 'bo', 've', 'cr', 'gt', 'hn', 'sv', 'ni', 'pa',
        'do', 'cu', 'pt', 'gr', 'cz', 'sk', 'hu', 'ro', 'bg', 'hr', 'rs', 'si',
        'lt', 'lv', 'ee', 'is', 'lu', 'mt', 'cy', 'cat', 'eu', 'asia',
    }

    # Target TLDs to check against for typosquatting mimicry
    TARGET_CHECK_TLDS = ['com', 'org', 'net', 'in', 'edu', 'gov', 'io', 'ai', 'co', 'info', 'biz', 'app', 'dev']

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

        # 3b. TLD Typosquatting / Lookalike TLD Detection
        tld_typosquat = cls._check_tld_typosquatting(tld)
        if tld_typosquat:
            indicators.append(tld_typosquat)

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

        # Build the exact 11 URL Security Indicators table matching PhishShield specification
        detected_brand = None
        for b in cls.TARGET_BRANDS:
            if b in hostname.lower() or b in path.lower():
                detected_brand = b
                break

        is_brand_impersonation = False
        brand_obs = "No brand impersonation detected"
        if detected_brand:
            if not cls._is_authentic_brand_domain(detected_brand, hostname):
                is_brand_impersonation = True
                brand_obs = f"Uses '{detected_brand}' in hostname / subdomain"
                if "login.microsoft.com" in hostname.lower():
                    brand_obs = "Uses 'login.microsoft.com' in subdomain"
                elif detected_brand in ".".join(subdomains):
                    brand_obs = f"Uses '{detected_brand}' in subdomain"
            else:
                brand_obs = f"Authentic {detected_brand.title()} domain"

        domain_mismatch = is_brand_impersonation and (main_domain.lower() != f"{detected_brand}.com" if detected_brand else False)
        mismatch_obs = f"Actual registered domain: {main_domain}" if domain_mismatch else f"Registered domain matches identity ({main_domain})"

        is_suspicious_domain = is_brand_impersonation or (tld in cls.SUSPICIOUS_TLDS) or (typosquat_finding is not None) or (tld_typosquat is not None)
        if is_brand_impersonation and detected_brand:
            suspicious_domain_obs = f"Domain is not an official {detected_brand.title()} domain"
        elif is_trusted_site:
            suspicious_domain_obs = f"Official {detected_brand.title() if detected_brand else 'verified'} domain"
        elif is_suspicious_domain:
            suspicious_domain_obs = f"Domain has suspicious indicators or untrusted TLD (.{tld})"
        else:
            suspicious_domain_obs = "Domain is registered with standard reputation"

        typosquat_detected = typosquat_finding is not None or tld_typosquat is not None or (is_brand_impersonation and detected_brand is not None)
        if typosquat_finding is not None:
            typosquat_obs = typosquat_finding.get("evidence", "Similar to official brand domain")
        elif tld_typosquat is not None:
            typosquat_obs = tld_typosquat.get("evidence", "Suspicious TLD mimics legitimate extension")
        elif is_brand_impersonation and detected_brand:
            typosquat_obs = f"Similar to official {detected_brand.title()} domain"
        else:
            typosquat_obs = "No typosquatting detected"

        suspicious_subdomains = len(subdomains) >= 2 or is_brand_impersonation
        if subdomains:
            subdomain_obs = ".".join(subdomains)
        else:
            subdomain_obs = "No subdomains used"

        is_shortener = hostname in cls.SHORTENERS
        shortener_obs = f"URL shortener detected ({hostname})" if is_shortener else "No URL shortener used"

        ip_obs = f"Direct raw {ip_version} address used" if is_ip else "No IP address used"

        kw_obs = f"Contains {', '.join(found_keywords[:5])}" if found_keywords else "No suspicious keywords detected"

        cred_keywords = ["login", "verify", "signin", "auth", "account", "password", "credential", "security", "update", "claim"]
        cred_in_path = any(ck in path.lower() for ck in cred_keywords)
        if cred_in_path:
            matching_ck = [ck for ck in cred_keywords if ck in path.lower()][0]
            cred_path_obs = f"Contains /{matching_ck} (login related)" if path == f"/{matching_ck}" else f"Contains {path} (login related)"
        else:
            cred_path_obs = "No credential-related path detected"

        is_unusual_structure = len(subdomains) >= 3 or ("@" in cleaned_url) or (port and port in cls.UNUSUAL_PORTS) or is_brand_impersonation
        if len(subdomains) >= 3 or is_brand_impersonation:
            structure_obs = "Uses multiple subdomains to look legitimate"
        elif is_unusual_structure:
            structure_obs = "Contains anomalous structural traits"
        else:
            structure_obs = "Standard URL structure"

        # Construct the 11 items
        url_security_indicators = [
            {
                "id": 1,
                "indicator": "Protocol (HTTPS)",
                "result": "Present" if scheme == "https" else "Insecure",
                "observation": "Uses HTTPS (does not guarantee safety)" if scheme == "https" else "Uses unencrypted HTTP protocol",
                "severity": "Info" if scheme == "https" else "High",
                "is_flagged": scheme != "https"
            },
            {
                "id": 2,
                "indicator": "Brand Impersonation",
                "result": "Detected" if is_brand_impersonation else "Not detected",
                "observation": brand_obs,
                "severity": "High" if is_brand_impersonation else "Low",
                "is_flagged": is_brand_impersonation
            },
            {
                "id": 3,
                "indicator": "Suspicious Domain",
                "result": "Detected" if is_suspicious_domain else "Not detected",
                "observation": suspicious_domain_obs,
                "severity": "High" if is_suspicious_domain else "Low",
                "is_flagged": is_suspicious_domain
            },
            {
                "id": 4,
                "indicator": "Registered Domain Mismatch",
                "result": "Detected" if domain_mismatch else "Not detected",
                "observation": mismatch_obs,
                "severity": "High" if domain_mismatch else "Low",
                "is_flagged": domain_mismatch
            },
            {
                "id": 5,
                "indicator": "Typosquatting",
                "result": "Suspicious" if typosquat_detected else "Not detected",
                "observation": typosquat_obs,
                "severity": "Critical" if (typosquat_finding is not None or tld_typosquat is not None) else ("Medium" if typosquat_detected else "Low"),
                "is_flagged": typosquat_detected
            },
            {
                "id": 6,
                "indicator": "Suspicious Subdomains",
                "result": "Detected" if suspicious_subdomains else "Not detected",
                "observation": subdomain_obs,
                "severity": "High" if (len(subdomains) >= 3 or is_brand_impersonation) else ("Medium" if suspicious_subdomains else "Low"),
                "is_flagged": suspicious_subdomains
            },
            {
                "id": 7,
                "indicator": "URL Shortener",
                "result": "Detected" if is_shortener else "Not detected",
                "observation": shortener_obs,
                "severity": "Medium" if is_shortener else "Low",
                "is_flagged": is_shortener
            },
            {
                "id": 8,
                "indicator": "Raw IP Address",
                "result": "Detected" if is_ip else "Not detected",
                "observation": ip_obs,
                "severity": "High" if is_ip else "Low",
                "is_flagged": is_ip
            },
            {
                "id": 9,
                "indicator": "Suspicious Keywords",
                "result": "Detected" if found_keywords else "Not detected",
                "observation": kw_obs,
                "severity": "High" if len(found_keywords) >= 2 else ("Medium" if found_keywords else "Low"),
                "is_flagged": bool(found_keywords)
            },
            {
                "id": 10,
                "indicator": "Credential-related Path",
                "result": "Detected" if cred_in_path else "Not detected",
                "observation": cred_path_obs,
                "severity": "High" if cred_in_path else "Low",
                "is_flagged": cred_in_path
            },
            {
                "id": 11,
                "indicator": "Unusual URL Structure",
                "result": "Detected" if is_unusual_structure else "Not detected",
                "observation": structure_obs,
                "severity": "High" if is_unusual_structure else "Low",
                "is_flagged": is_unusual_structure
            }
        ]

        # Calculate detected count (non-safe indicators)
        detected_count = sum(1 for item in url_security_indicators if item["is_flagged"] and item["indicator"] != "Protocol (HTTPS)")

        # Main Threat Category
        if is_brand_impersonation:
            main_threat_category = "Brand Impersonation"
        elif is_ip:
            main_threat_category = "Raw IP Host"
        elif is_shortener:
            main_threat_category = "URL Shortener"
        elif typosquat_detected:
            main_threat_category = "Typosquatting"
        elif cred_in_path or found_keywords:
            main_threat_category = "Credential Harvesting"
        elif risk_result["risk_score"] >= 50:
            main_threat_category = "Deceptive Link"
        else:
            main_threat_category = "None"

        # Domain and URL Details
        url_structure_label = "Multiple subdomains (Brand Impersonation)" if (is_brand_impersonation and len(subdomains) >= 2) else (
            "Multiple nested subdomains" if len(subdomains) >= 3 else (
                "Direct numeric IP host" if is_ip else "Standard domain structure"
            )
        )
        domain_and_url_details = {
            "full_url": cleaned_url,
            "hostname": hostname,
            "registered_domain": main_domain,
            "is_registered_domain_suspicious": is_brand_impersonation or domain_mismatch or is_suspicious_domain,
            "subdomains": ".".join(subdomains) if subdomains else "None",
            "tld": f".{tld}" if tld and not tld.startswith(".") else (tld or ".com"),
            "protocol": f"HTTPS ({port or 443})" if scheme == "https" else f"HTTP ({port or 80})",
            "port": str(port or (443 if scheme == "https" else 80)),
            "url_path": path or "/",
            "url_structure": url_structure_label
        }

        # Key ML Indicators
        is_threat = risk_result["risk_score"] >= 50 or is_brand_impersonation or is_ip or typosquat_detected
        if is_threat:
            key_ml_indicators = [
                "Brand impersonation patterns",
                "Suspicious subdomain structure",
                "Login related keywords",
                "Domain mismatch",
                "Potential credential harvesting"
            ]
        else:
            key_ml_indicators = [
                "Lexical patterns within legitimate statistical thresholds",
                "Standard domain structure",
                "No credential harvesting keywords",
                "Domain matches authentic registry"
            ]

        # 4 Recommendations Cards
        brand_label = detected_brand.title() if detected_brand else "the service"
        if is_threat:
            recommendations_4_cards = [
                {
                    "title": "Do not visit this URL",
                    "detail": "This URL may be a phishing site.",
                    "icon": "shield-alert",
                    "variant": "danger"
                },
                {
                    "title": "Do not enter credentials",
                    "detail": "Never provide passwords or personal details.",
                    "icon": "key",
                    "variant": "danger"
                },
                {
                    "title": "Verify the official website",
                    "detail": f"Access {brand_label} through the official website.",
                    "icon": "check-circle",
                    "variant": "warning"
                },
                {
                    "title": "Report this URL",
                    "detail": "Report to your security team anti-phishing platform.",
                    "icon": "flag",
                    "variant": "danger"
                }
            ]
        else:
            recommendations_4_cards = [
                {
                    "title": "Safe to browse",
                    "detail": "No obvious signs of phishing detected on this URL.",
                    "icon": "shield-check",
                    "variant": "success"
                },
                {
                    "title": "Check address bar",
                    "detail": "Ensure the domain name exactly matches what you expect.",
                    "icon": "globe",
                    "variant": "info"
                },
                {
                    "title": "Look for SSL padlock",
                    "detail": "Verify that the site uses HTTPS before entering any information.",
                    "icon": "lock",
                    "variant": "info"
                },
                {
                    "title": "Stay vigilant",
                    "detail": "Always verify unsolicited links received in emails or SMS.",
                    "icon": "info",
                    "variant": "info"
                }
            ]

        # Final Verdict Content
        risk_level = (
            "Critical" if risk_result["risk_score"] >= 76 else (
                "High" if risk_result["risk_score"] >= 51 else (
                    "Medium" if risk_result["risk_score"] >= 26 else "Low"
                )
            )
        )
        final_verdict_title = f"Suspicious URL — {risk_level} Risk" if is_threat else f"Likely Safe URL — {risk_level} Risk"

        if is_brand_impersonation:
            final_verdict_explanation = (
                f"This URL uses {brand_label} branding in a subdomain, but the actual registered domain is {main_domain}. "
                f"It contains login-related keywords and shows multiple phishing indicators. It should be treated as suspicious and avoided."
            )
        elif is_threat:
            final_verdict_explanation = (
                f"This URL exhibits elevated threat indicators including {main_threat_category.lower()}. "
                f"It is likely intended for deception or credential solicitation and should not be accessed."
            )
        else:
            final_verdict_explanation = (
                f"This URL directs to {hostname} ({main_domain}). It exhibits standard domain structure, valid security protocols, "
                f"and no anomalous phishing indicators. Standard safe browsing practices apply."
            )

        summary_explanation = (
            f"This URL is highly likely to be a phishing attempt due to brand impersonation and suspicious domain structure."
            if is_brand_impersonation else (
                f"This URL shows elevated threat indicators and should be treated with caution."
                if is_threat else
                f"This URL appears to be a legitimate and safe website with standard domain reputation."
            )
        )

        return {
            "valid": True,
            "input_url": cleaned_url,
            "normalized_url": url_to_parse,
            "anatomy": anatomy,
            "ml_analysis": ml_analysis,
            "risk_score": risk_result["risk_score"],
            "classification": risk_result["classification"],
            "risk_level": risk_level,
            "severity_counts": risk_result["severity_counts"],
            "indicators": indicators,
            "url_security_indicators": url_security_indicators,
            "domain_and_url_details": domain_and_url_details,
            "detected_indicator_count": f"{detected_count} / 11",
            "detected_count_num": detected_count,
            "main_threat_category": main_threat_category,
            "key_ml_indicators": key_ml_indicators,
            "recommendations_4_cards": recommendations_4_cards,
            "final_verdict_title": final_verdict_title,
            "final_verdict_explanation": final_verdict_explanation,
            "summary_explanation": summary_explanation,
            "recommendations": risk_result["recommendations"],
            "summary": summary_explanation,
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
    def _check_tld_typosquatting(cls, tld: str):
        """
        Detect lookalike / typosquatted TLDs that mimic legitimate extensions.
        e.g., .corn -> .com, .c0m -> .com, .rn -> .in, .0rg -> .org, .n3t -> .net
        """
        if not tld:
            return None
        tld_clean = tld.lower().lstrip(".")
        if not tld_clean or tld_clean in cls.LEGITIMATE_TLDS:
            return None

        # Character substitution pairs: (from, to, explanation)
        char_subs = [
            ('rn', 'm', "homoglyph 'rn' -> 'm'"),
            ('vv', 'w', "homoglyph 'vv' -> 'w'"),
            ('cl', 'd', "homoglyph 'cl' -> 'd'"),
            ('0', 'o', "leetspeak '0' -> 'o'"),
            ('1', 'i', "leetspeak '1' -> 'i'"),
            ('1', 'l', "leetspeak '1' -> 'l'"),
            ('3', 'e', "leetspeak '3' -> 'e'"),
            ('4', 'a', "leetspeak '4' -> 'a'"),
            ('5', 's', "leetspeak '5' -> 's'"),
            ('7', 't', "leetspeak '7' -> 't'"),
            ('8', 'b', "leetspeak '8' -> 'b'"),
        ]

        def _make_indicator(target, reason):
            return {
                "id": "tld_typosquatting",
                "name": f"Lookalike / Typosquatted TLD (.{tld_clean})",
                "severity": "critical",
                "weight": 70,
                "evidence": f"TLD '.{tld_clean}' mimics legitimate '.{target}' via {reason}",
                "description": (
                    f"The domain uses '.{tld_clean}' which visually mimics the legitimate '.{target}' extension "
                    f"through {reason}. This is a TLD typosquatting technique used to deceive users."
                )
            }

        # 1. Direct single-substitution match against target TLDs
        for sub_from, sub_to, reason in char_subs:
            if sub_from in tld_clean:
                candidate = tld_clean.replace(sub_from, sub_to)
                if candidate in cls.TARGET_CHECK_TLDS:
                    return _make_indicator(candidate, reason)

        # 2. Full normalization pass
        normalized = tld_clean
        for sub_from, sub_to, _ in [
            ('rn', 'm', ''), ('vv', 'w', ''), ('cl', 'd', ''),
            ('0', 'o', ''), ('1', 'i', ''), ('3', 'e', ''),
            ('4', 'a', ''), ('5', 's', ''), ('7', 't', ''), ('8', 'b', ''),
        ]:
            normalized = normalized.replace(sub_from, sub_to)
        if normalized != tld_clean and normalized in cls.TARGET_CHECK_TLDS:
            return _make_indicator(normalized, "character substitution")

        # 3. Special case: .rn mimicking .in (visual homoglyph)
        if tld_clean == 'rn':
            return _make_indicator('in', "visual homoglyph 'rn' -> 'in'")

        # 4. Levenshtein edit distance = 1 from any target TLD
        for target in cls.TARGET_CHECK_TLDS:
            if abs(len(tld_clean) - len(target)) <= 1:
                d_raw = cls._levenshtein_distance(tld_clean, target)
                if d_raw == 1:
                    return _make_indicator(target, "1-character typo/edit distance")
                d_norm = cls._levenshtein_distance(normalized, target)
                if d_norm == 1:
                    return _make_indicator(target, "1-character typo after normalization")

        # 5. Any digits in TLD is suspicious (TLDs should be alphabetic)
        if any(c.isdigit() for c in tld_clean):
            for target in cls.TARGET_CHECK_TLDS:
                if cls._levenshtein_distance(normalized, target) <= 1:
                    return _make_indicator(target, "numeric substitution")

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