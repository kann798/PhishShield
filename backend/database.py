"""
Database Module for PhishShield.
Provides SQLite persistence for scan records, history management,
privacy-preserving audit trails, and aggregate dashboard threat metrics.
"""
import sqlite3
import json
import os
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

DB_FILE = os.environ.get("DATABASE_PATH", "phishing_detector.db")


def get_db_connection() -> sqlite3.Connection:
    """Create and return a configured SQLite connection."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database tables and seed baseline sample data if empty."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_type TEXT NOT NULL,           -- 'url' or 'email'
            target_identifier TEXT NOT NULL,   -- sanitized url or email subject/snippet
            risk_score INTEGER NOT NULL,       -- 0 - 100
            classification TEXT NOT NULL,     -- 'Low', 'Medium', 'High', 'Critical'
            indicator_count INTEGER NOT NULL,  -- count of triggered indicators
            indicators_json TEXT NOT NULL,     -- JSON array of findings
            recommendations_json TEXT NOT NULL,-- JSON array of action items
            details_json TEXT NOT NULL,        -- sanitized anatomy or header metadata
            is_sample BOOLEAN DEFAULT 0,       -- 1 if synthetic sample data
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_scans_type ON scans(scan_type)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_scans_class ON scans(classification)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_scans_created ON scans(created_at)")

    conn.commit()

    # Check if empty, seed synthetic sample data
    cursor.execute("SELECT COUNT(*) FROM scans")
    count = cursor.fetchone()[0]
    if count == 0:
        _seed_sample_data(cursor)
        conn.commit()

    conn.close()


def _seed_sample_data(cursor: sqlite3.Cursor):
    """Seed initial synthetic demonstration data, clearly identified as sample records."""
    samples = [
        (
            "url",
            "http://192.168.1.45/paypal-login/verify.php",
            88,
            "Critical",
            3,
            json.dumps([
                {
                    "id": "ip_based_url",
                    "name": "IP Address Hostname (IPv4)",
                    "severity": "high",
                    "evidence": "192.168.1.45",
                    "description": "Host uses a raw IP address instead of a trusted domain."
                },
                {
                    "id": "phishing_keywords",
                    "name": "Authentication & Security Keywords Detected (login, verify)",
                    "severity": "high",
                    "evidence": "login, verify",
                    "description": "Path mimics financial credential portal."
                },
                {
                    "id": "insecure_http",
                    "name": "Unencrypted HTTP Protocol",
                    "severity": "high",
                    "evidence": "http://",
                    "description": "Credentials transmitted in plaintext without TLS."
                }
            ]),
            json.dumps([
                {"action": "Do Not Provide Credentials", "detail": "Never enter passwords on numeric IP hosts.", "type": "danger"},
                {"action": "Reject Direct IP Hosts", "detail": "Legitimate banking portals require verified domain certificates.", "type": "warning"}
            ]),
            json.dumps({"scheme": "http", "hostname": "192.168.1.45", "is_ip": True, "path": "/paypal-login/verify.php"}),
            1,
            "2026-10-27 10:15:00"
        ),
        (
            "url",
            "https://www.google.com/search?q=cybersecurity+training",
            0,
            "Low",
            0,
            json.dumps([]),
            json.dumps([
                {"action": "Standard Browsing Vigilance", "detail": "Legitimate domain with valid HTTPS encryption.", "type": "info"}
            ]),
            json.dumps({"scheme": "https", "hostname": "www.google.com", "is_ip": False, "path": "/search"}),
            1,
            "2026-10-27 10:45:00"
        ),
        (
            "email",
            "[Urgent: Account Suspension Notice] - Microsoft 365 Support <admin@security-notice.xyz>",
            82,
            "Critical",
            4,
            json.dumps([
                {
                    "id": "display_name_spoofing",
                    "name": "Display Name Brand Spoofing (Microsoft)",
                    "severity": "critical",
                    "evidence": "Display: 'Microsoft 365 Support' | Domain: 'security-notice.xyz'",
                    "description": "Display name pretends to be Microsoft but domain is an untrusted 3rd party."
                },
                {
                    "id": "urgent_coercion",
                    "name": "Account Suspension Threat (24 hours)",
                    "severity": "high",
                    "evidence": "'account suspended within 24 hours'",
                    "description": "Coercive psychological manipulation."
                },
                {
                    "id": "credential_solicitation",
                    "name": "Credential Solicitation",
                    "severity": "high",
                    "evidence": "'verify your password immediately'",
                    "description": "Requesting password submission via link."
                }
            ]),
            json.dumps([
                {"action": "Do Not Click Links", "detail": "Directly visit portal.office.com instead.", "type": "danger"},
                {"action": "Report Phishing Email", "detail": "Submit sample to organizational security team.", "type": "action"}
            ]),
            json.dumps({"has_headers": True, "subject": "Urgent: Account Suspension Notice", "sender": "admin@security-notice.xyz"}),
            1,
            "2026-10-27 11:10:00"
        ),
        (
            "url",
            "http://bit.ly/3xY8a9Q",
            35,
            "Medium",
            2,
            json.dumps([
                {
                    "id": "url_shortener",
                    "name": "URL Shortener Service (bit.ly)",
                    "severity": "medium",
                    "evidence": "bit.ly",
                    "description": "Shortened link masks destination."
                },
                {
                    "id": "insecure_http",
                    "name": "Unencrypted HTTP Protocol",
                    "severity": "medium",
                    "evidence": "http://",
                    "description": "Initial redirect over HTTP."
                }
            ]),
            json.dumps([
                {"action": "Expand Shortened URLs", "detail": "Inspect target destination before opening.", "type": "info"}
            ]),
            json.dumps({"scheme": "http", "hostname": "bit.ly", "is_ip": False, "path": "/3xY8a9Q"}),
            1,
            "2026-10-27 11:30:00"
        ),
        (
            "email",
            "[Weekly Engineering Team Digest] - Internal Security Newsletter <security@company.internal>",
            5,
            "Low",
            0,
            json.dumps([]),
            json.dumps([
                {"action": "Internal Message Verified", "detail": "No suspicious external requests or anomalous headers detected.", "type": "info"}
            ]),
            json.dumps({"has_headers": True, "subject": "Weekly Engineering Team Digest", "sender": "security@company.internal"}),
            1,
            "2026-10-27 11:55:00"
        )
    ]

    cursor.executemany("""
        INSERT INTO scans (
            scan_type, target_identifier, risk_score, classification,
            indicator_count, indicators_json, recommendations_json, details_json,
            is_sample, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, samples)


def save_scan(
    scan_type: str,
    target_identifier: str,
    risk_score: int,
    classification: str,
    indicator_count: int,
    indicators: list,
    recommendations: list,
    details: dict,
    is_sample: int = 0
) -> int:
    """Save an analysis scan result to the database."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO scans (
            scan_type, target_identifier, risk_score, classification,
            indicator_count, indicators_json, recommendations_json, details_json,
            is_sample, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        scan_type,
        target_identifier,
        risk_score,
        classification,
        indicator_count,
        json.dumps(indicators),
        json.dumps(recommendations),
        json.dumps(details),
        is_sample,
        datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
    ))

    scan_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return scan_id


def get_scans(
    limit: int = 50,
    offset: int = 0,
    scan_type: Optional[str] = None,
    risk_level: Optional[str] = None,
    search: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Retrieve list of scan records with optional filtering."""
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM scans WHERE 1=1"
    params = []

    if scan_type and scan_type.lower() != "all":
        query += " AND scan_type = ?"
        params.append(scan_type.lower())

    if risk_level and risk_level.lower() != "all":
        query += " AND LOWER(classification) = ?"
        params.append(risk_level.lower())

    if search:
        query += " AND (target_identifier LIKE ? OR indicators_json LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term])

    query += " ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    result = []
    for row in rows:
        result.append({
            "id": row["id"],
            "scan_type": row["scan_type"],
            "target_identifier": row["target_identifier"],
            "risk_score": row["risk_score"],
            "classification": row["classification"],
            "indicator_count": row["indicator_count"],
            "indicators": json.loads(row["indicators_json"]),
            "recommendations": json.loads(row["recommendations_json"]),
            "details": json.loads(row["details_json"]),
            "is_sample": bool(row["is_sample"]),
            "created_at": row["created_at"]
        })
    return result


def get_scan_by_id(scan_id: int) -> Optional[Dict[str, Any]]:
    """Fetch complete details for a single scan record."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scans WHERE id = ?", (scan_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "id": row["id"],
        "scan_type": row["scan_type"],
        "target_identifier": row["target_identifier"],
        "risk_score": row["risk_score"],
        "classification": row["classification"],
        "indicator_count": row["indicator_count"],
        "indicators": json.loads(row["indicators_json"]),
        "recommendations": json.loads(row["recommendations_json"]),
        "details": json.loads(row["details_json"]),
        "is_sample": bool(row["is_sample"]),
        "created_at": row["created_at"]
    }


def delete_scan(scan_id: int) -> bool:
    """Delete a single scan record."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM scans WHERE id = ?", (scan_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


def clear_all_scans() -> int:
    """Clear all records from scan history."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM scans")
    count = cursor.rowcount
    conn.commit()
    conn.close()
    return count


def get_dashboard_stats() -> Dict[str, Any]:
    """Calculate aggregated metrics and trend distributions for the dashboard."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Total counts
    cursor.execute("SELECT COUNT(*) FROM scans")
    total_scans = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM scans WHERE scan_type = 'url'")
    total_urls = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM scans WHERE scan_type = 'email'")
    total_emails = cursor.fetchone()[0]

    # Suspicious vs Clean
    # Clean = Low risk (score <= 25), Suspicious = Medium, High, Critical (score > 25)
    cursor.execute("SELECT COUNT(*) FROM scans WHERE classification IN ('Medium', 'High', 'Critical')")
    suspicious_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM scans WHERE classification = 'Low'")
    clean_count = cursor.fetchone()[0]

    # Risk Distribution
    risk_distribution = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
    cursor.execute("SELECT classification, COUNT(*) FROM scans GROUP BY classification")
    for row in cursor.fetchall():
        cls_name = row[0]
        if cls_name in risk_distribution:
            risk_distribution[cls_name] = row[1]

    # Sample data indicator count
    cursor.execute("SELECT COUNT(*) FROM scans WHERE is_sample = 1")
    sample_records_count = cursor.fetchone()[0]

    # Recent scans (last 8) sorted by actual completion timestamp in descending order
    cursor.execute("SELECT id, scan_type, target_identifier, risk_score, classification, indicator_count, is_sample, created_at FROM scans ORDER BY created_at DESC, id DESC LIMIT 8")
    recent_rows = cursor.fetchall()
    recent_scans = []
    for r in recent_rows:
        c_at = r["created_at"]
        iso_str = f"{c_at.replace(' ', 'T')}Z" if "Z" not in c_at and "+" not in c_at else c_at
        recent_scans.append({
            "id": r["id"],
            "scan_type": r["scan_type"],
            "target_identifier": r["target_identifier"],
            "risk_score": r["risk_score"],
            "classification": r["classification"],
            "indicator_count": r["indicator_count"],
            "is_sample": bool(r["is_sample"]),
            "created_at": r["created_at"],
            "created_at_iso": iso_str
        })

    # Scans aggregated by classification for charts
    chart_distribution = [
        {"name": "Low Risk", "value": risk_distribution["Low"], "color": "#10b981"},
        {"name": "Medium Risk", "value": risk_distribution["Medium"], "color": "#f59e0b"},
        {"name": "High Risk", "value": risk_distribution["High"], "color": "#f97316"},
        {"name": "Critical Risk", "value": risk_distribution["Critical"], "color": "#ef4444"},
    ]

    conn.close()

    return {
        "total_scans": total_scans,
        "total_urls": total_urls,
        "total_emails": total_emails,
        "suspicious_count": suspicious_count,
        "clean_count": clean_count,
        "risk_distribution": risk_distribution,
        "chart_distribution": chart_distribution,
        "sample_records_count": sample_records_count,
        "recent_scans": recent_scans,
        "latest_scan": recent_scans[0] if recent_scans else None,
    }
