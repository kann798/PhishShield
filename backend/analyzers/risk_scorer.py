"""
Risk Scorer Module for PhishShield.
Computes calibrated heuristic risk scores (0-100), classifications (Low, Medium, High, Critical),
and synthesizes actionable security recommendations.
"""
from typing import List, Dict, Any, Tuple


class RiskScorer:
    """
    Evaluates detected indicators and computes normalized threat scores.
    Uses documented heuristic weights and diminishing-returns compounding
    to prevent runaway scores while highlighting critical threats.
    """

    # Classification Thresholds
    THRESHOLDS = {
        "Low": (0, 25),
        "Medium": (26, 50),
        "High": (51, 75),
        "Critical": (76, 100),
    }

    # Base severity default weights
    SEVERITY_WEIGHTS = {
        "info": 0,
        "low": 10,
        "medium": 25,
        "high": 45,
        "critical": 75,
    }

    @classmethod
    def calculate(
        cls,
        indicators: List[Dict[str, Any]],
        context_type: str = "url",
        ml_analysis: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Calculate total risk score and classify result based on detected indicators
        and statistical Machine Learning inference probabilities.

        Args:
            indicators: List of indicator dicts containing 'severity', 'weight', 'name', etc.
            context_type: 'url' or 'email'
            ml_analysis: Optional ML classification output dict from MLEngine

        Returns:
            Dict containing risk_score, classification, severity_summary, and recommendations.
        """
        ml_prob = 0.0
        if ml_analysis and ml_analysis.get("ml_enabled"):
            ml_prob = float(ml_analysis.get("phishing_probability", 0.0))

        if not indicators:
            # Baseline when heuristic indicators are 0
            if ml_prob >= 75.0:
                score = int(round(ml_prob * 0.70))
                classification = "High" if score >= 51 else "Medium"
            elif ml_prob >= 50.0:
                score = int(round(ml_prob * 0.55))
                classification = "Medium"
            else:
                score = 0
                classification = "Low"

            return {
                "risk_score": score,
                "classification": classification,
                "severity_counts": {"info": 0, "low": 0, "medium": 0, "high": 0, "critical": 0},
                "recommendations": cls.generate_recommendations([], classification, context_type),
                "summary": "No suspicious indicators detected. The analyzed input appears safe, though general vigilance is always advised." if score == 0 else "ML model detected potential statistical anomalies despite absence of overt signatures."
            }

        severity_counts = {"info": 0, "low": 0, "medium": 0, "high": 0, "critical": 0}
        total_raw_weight = 0

        # Tally severities and weights
        for ind in indicators:
            sev = ind.get("severity", "low").lower()
            if sev in severity_counts:
                severity_counts[sev] += 1
            else:
                severity_counts["low"] += 1

            # Indicator can supply its own weight or fallback to standard severity weight
            weight = ind.get("weight", cls.SEVERITY_WEIGHTS.get(sev, 10))
            total_raw_weight += weight

        # Calibrated scoring:
        # If any single critical indicator exists, floor is 75.
        # If any single high indicator exists, floor is 50.
        # Otherwise, score accumulates using non-linear scaling capped at 100.
        has_critical = severity_counts["critical"] > 0
        has_high = severity_counts["high"] > 0
        has_medium = severity_counts["medium"] > 0

        if has_critical:
            # Range 75 - 100
            score = 75 + min(25, int(total_raw_weight * 0.25))
        elif has_high:
            # Range 50 - 75
            score = 50 + min(25, int(total_raw_weight * 0.35))
        elif has_medium:
            # Range 25 - 50
            score = 25 + min(25, int(total_raw_weight * 0.40))
        else:
            # Low / Info range 0 - 25
            score = min(25, int(total_raw_weight * 0.50))

        # Hybrid ensemble with Machine Learning inference
        if ml_analysis and ml_analysis.get("ml_enabled"):
            # Ensemble: 65% heuristic determinism, 35% statistical ML probability
            ensemble_score = int(round(0.65 * score + 0.35 * ml_prob))
            if has_critical:
                score = max(75, ensemble_score)
            elif has_high:
                score = max(50, ensemble_score)
            elif has_medium:
                score = max(25, ensemble_score)
            else:
                score = ensemble_score

        score = max(0, min(100, score))

        # Classification assignment
        if score >= 76:
            classification = "Critical"
        elif score >= 51:
            classification = "High"
        elif score >= 26:
            classification = "Medium"
        else:
            classification = "Low"

        recommendations = cls.generate_recommendations(indicators, classification, context_type)

        # Context summary
        if classification == "Critical":
            summary = (
                "CRITICAL THREAT DETECTED: Multiple high-confidence phishing or attack vectors identified. "
                "Do NOT interact, authenticate, or supply sensitive data."
            )
        elif classification == "High":
            summary = (
                "HIGH RISK DETECTED: Strong phishing indicators found (e.g., brand impersonation, urgent coercion, or deceptive domain). "
                "Exercise extreme caution."
            )
        elif classification == "Medium":
            summary = (
                "SUSPICIOUS CONTENT: Several anomalous or deceptive traits detected. "
                "Verify legitimacy through official out-of-band communication before proceeding."
            )
        else:
            summary = (
                "LOW RISK: Analysis did not identify distinct malicious patterns. "
                "Always verify HTTPS certificates and inspect destination addresses before sharing sensitive credentials."
            )

        return {
            "risk_score": score,
            "classification": classification,
            "severity_counts": severity_counts,
            "recommendations": recommendations,
            "summary": summary,
        }

    @classmethod
    def generate_recommendations(
        cls, indicators: List[Dict[str, Any]], classification: str, context_type: str
    ) -> List[Dict[str, str]]:
        """
        Generate actionable recommendations based on detected findings and classification.
        """
        recs = []
        indicator_ids = {ind.get("id", "") for ind in indicators}

        if classification in ("High", "Critical"):
            recs.append({
                "action": "Do Not Provide Credentials",
                "detail": "Never enter passwords, MFA codes, credit card numbers, or social security numbers on this destination.",
                "type": "danger"
            })
            recs.append({
                "action": "Avoid Direct Link Clicking",
                "detail": "Navigate directly to the official website by manually typing the known bookmarked address.",
                "type": "warning"
            })
            if context_type == "email":
                recs.append({
                    "action": "Report Phishing Email",
                    "detail": "Forward this message to your organization's security operations center (SOC) or abuse@ provider.",
                    "type": "action"
                })
        elif classification == "Medium":
            recs.append({
                "action": "Verify Through Official Channels",
                "detail": "Contact the purported sender or service provider using an official phone number or established portal.",
                "type": "warning"
            })
            recs.append({
                "action": "Inspect Full Domain Name",
                "detail": "Check the exact domain spelling in your browser address bar to detect typosquatting or fake subdomains.",
                "type": "info"
            })

        # Specific indicator-driven recommendations
        if "ip_based_url" in indicator_ids:
            recs.append({
                "action": "Reject Direct IP Hosts",
                "detail": "Legitimate enterprise services use registered domain names with public SSL/TLS certificates, not raw IP addresses.",
                "type": "danger"
            })

        if "url_shortener" in indicator_ids:
            recs.append({
                "action": "Expand Shortened URLs",
                "detail": "Use a link unshortener or URL inspection tool to preview the final destination before visiting.",
                "type": "info"
            })

        if "punycode_homoglyph" in indicator_ids or "brand_typosquatting" in indicator_ids:
            recs.append({
                "action": "Examine Character Substitutions",
                "detail": "Attacker domains often replace Latin characters with Look-alike Cyrillic or numeric equivalents (e.g., '1' for 'l').",
                "type": "danger"
            })

        if "reply_to_mismatch" in indicator_ids:
            recs.append({
                "action": "Sender/Reply-To Inconsistency",
                "detail": "The email reply address differs from the visible sender header, a common indicator of business email compromise (BEC).",
                "type": "warning"
            })

        if "urgent_coercion" in indicator_ids:
            recs.append({
                "action": "Resist High-Pressure Tactics",
                "detail": "Phishers use synthetic urgency ('Account Suspended in 24 Hours') to bypass rational judgment. Pause and verify.",
                "type": "warning"
            })

        if "suspicious_attachment" in indicator_ids:
            recs.append({
                "action": "Never Execute Unsolicited Attachments",
                "detail": "Do not open executable, script, or macro-enabled documents (.exe, .iso, .vbs, .docm) from unexpected senders.",
                "type": "danger"
            })

        # General baseline hygiene
        recs.append({
            "action": "Enable Multi-Factor Authentication (MFA)",
            "detail": "Hardware security keys or authenticator apps safeguard accounts even if login credentials are leaked.",
            "type": "info"
        })

        return recs
