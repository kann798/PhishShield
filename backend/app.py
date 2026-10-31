"""
PhishShield Backend API Application.
Flask REST API powering the Phishing Detection Tool.
Provides endpoints for URL and Email inspection, scan history persistence,
threat metrics dashboard, and downloadable security reports.
"""
import os
import io
import csv
import json
import zipfile
import logging
from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS
from analyzers.url_analyzer import URLAnalyzer
from analyzers.email_analyzer import EmailAnalyzer
import database as db

# Initialize Flask Application
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Request size limits (Max 512KB)
app.config['MAX_CONTENT_LENGTH'] = 512 * 1024

# Logging configuration (privacy-conscious: avoid logging email body text)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger("PhishShield")

# Initialize database
db.init_db()


@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({
        "success": False,
        "error": "Payload exceeds maximum allowed size limit (512KB)"
    }), 413


@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        "success": False,
        "error": "Bad request. Please verify the JSON request format."
    }), 400


@app.errorhandler(500)
def internal_server_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({
        "success": False,
        "error": "An unexpected server error occurred during analysis."
    }), 500


@app.route('/api/health', methods=['GET'])
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify API, database readiness, and ML engine status."""
    try:
        conn = db.get_db_connection()
        conn.execute("SELECT 1")
        conn.close()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return jsonify({
        "status": "healthy",
        "service": "PhishShield Threat Intelligence Engine",
        "version": "1.1.0",
        "database": db_status,
        "ml_engine": {
            "status": "operational",
            "models": {
                "url": "RandomForestClassifier (15 Lexical/Structural Feature Vectors)",
                "email": "TF-IDF (1-2 ngrams) + LogisticRegression Classifier"
            }
        }
    }), 200


@app.route('/api/analyze/url', methods=['POST'])
@app.route('/analyze/url', methods=['POST'])
def analyze_url():
    """
    Inspect a user-submitted URL string for phishing indicators,
    domain spoofing, typosquatting, and suspicious structural patterns.
    """
    data = request.get_json(silent=True)
    if not data or "url" not in data:
        return jsonify({
            "success": False,
            "error": "Missing 'url' field in request payload"
        }), 400

    raw_url = data.get("url", "")
    if not isinstance(raw_url, str) or not raw_url.strip():
        return jsonify({
            "success": False,
            "error": "URL cannot be empty"
        }), 400

    # Offline heuristic analysis (Zero SSRF risk)
    analysis = URLAnalyzer.analyze(raw_url)

    if not analysis.get("valid"):
        return jsonify({
            "success": False,
            "error": analysis.get("error", "Invalid URL provided")
        }), 400

    # Persist scan result to SQLite
    try:
        scan_id = db.save_scan(
            scan_type="url",
            target_identifier=analysis["input_url"],
            risk_score=analysis["risk_score"],
            classification=analysis["classification"],
            indicator_count=len(analysis.get("indicators", [])),
            indicators=analysis.get("indicators", []),
            recommendations=analysis.get("recommendations", []),
            details={
                **analysis.get("anatomy", {}),
                "anatomy": analysis.get("anatomy", {}),
                "ml_analysis": analysis.get("ml_analysis"),
                "url_security_indicators": analysis.get("url_security_indicators", []),
                "domain_and_url_details": analysis.get("domain_and_url_details", {}),
                "detected_indicator_count": analysis.get("detected_indicator_count"),
                "main_threat_category": analysis.get("main_threat_category"),
                "key_ml_indicators": analysis.get("key_ml_indicators", []),
                "recommendations_4_cards": analysis.get("recommendations_4_cards", []),
                "final_verdict_title": analysis.get("final_verdict_title"),
                "final_verdict_explanation": analysis.get("final_verdict_explanation"),
                "summary_explanation": analysis.get("summary_explanation"),
                "risk_level": analysis.get("risk_level")
            },
            is_sample=0
        )
        analysis["scan_id"] = scan_id
    except Exception as e:
        logger.error(f"Failed to record scan to database: {e}")
        analysis["scan_id"] = None

    return jsonify({
        "success": True,
        "data": analysis
    }), 200


@app.route('/api/analyze/email', methods=['POST'])
@app.route('/analyze/email', methods=['POST'])
def analyze_email():
    """
    Inspect email content and optional headers for phishing signatures,
    social engineering tactics, credential requests, and embedded links.
    """
    data = request.get_json(silent=True)
    if not data or "email_content" not in data:
        return jsonify({
            "success": False,
            "error": "Missing 'email_content' in request payload"
        }), 400

    raw_email = data.get("email_content", "")
    if not isinstance(raw_email, str) or not raw_email.strip():
        return jsonify({
            "success": False,
            "error": "Email content cannot be empty"
        }), 400

    analysis = EmailAnalyzer.analyze(raw_email)

    if not analysis.get("valid"):
        return jsonify({
            "success": False,
            "error": analysis.get("error", "Unable to analyze email content")
        }), 400

    # Persist scan result to SQLite (strictly sanitized identifier, no raw body storage)
    try:
        scan_id = db.save_scan(
            scan_type="email",
            target_identifier=analysis["target_identifier"],
            risk_score=analysis["risk_score"],
            classification=analysis["classification"],
            indicator_count=len(analysis.get("indicators", [])),
            indicators=analysis.get("indicators", []),
            recommendations=analysis.get("recommendations", []),
            details={
                "headers": analysis.get("headers", {}),
                "sender_summary": analysis.get("sender_summary", {}),
                "social_engineering_triggers": analysis.get("social_engineering_triggers", []),
                "extracted_urls_count": len(analysis.get("extracted_urls", [])),
                "ml_analysis": analysis.get("ml_analysis")
            },
            is_sample=0
        )
        analysis["scan_id"] = scan_id
    except Exception as e:
        logger.error(f"Failed to record email scan to database: {e}")
        analysis["scan_id"] = None

    return jsonify({
        "success": True,
        "data": analysis
    }), 200


@app.route('/api/scans', methods=['GET'])
@app.route('/scans', methods=['GET'])
def list_scans():
    """Retrieve scan history with optional filtering by type, risk level, or keyword search."""
    scan_type = request.args.get("type", None)
    risk_level = request.args.get("risk", None)
    search = request.args.get("search", None)
    limit = request.args.get("limit", 50, type=int)
    offset = request.args.get("offset", 0, type=int)

    scans = db.get_scans(
        limit=min(limit, 200),
        offset=offset,
        scan_type=scan_type,
        risk_level=risk_level,
        search=search
    )

    return jsonify({
        "success": True,
        "count": len(scans),
        "data": scans
    }), 200


@app.route('/api/scans/<int:scan_id>', methods=['GET'])
def get_scan(scan_id):
    """Retrieve complete findings for a specific scan."""
    scan = db.get_scan_by_id(scan_id)
    if not scan:
        return jsonify({
            "success": False,
            "error": f"Scan record with ID #{scan_id} not found"
        }), 404

    return jsonify({
        "success": True,
        "data": scan
    }), 200


@app.route('/api/scans/<int:scan_id>', methods=['DELETE'])
def delete_scan_record(scan_id):
    """Delete a single scan record."""
    success = db.delete_scan(scan_id)
    if not success:
        return jsonify({
            "success": False,
            "error": f"Scan #{scan_id} not found or could not be deleted"
        }), 404

    return jsonify({
        "success": True,
        "message": f"Scan #{scan_id} successfully deleted"
    }), 200


@app.route('/api/scans', methods=['DELETE'])
@app.route('/scans', methods=['DELETE'])
def clear_scans():
    """Clear all records from scan history."""
    deleted_count = db.clear_all_scans()
    return jsonify({
        "success": True,
        "message": f"Cleared {deleted_count} scan records from history"
    }), 200


@app.route('/api/dashboard/stats', methods=['GET'])
@app.route('/api/stats', methods=['GET'])
@app.route('/dashboard/stats', methods=['GET'])
@app.route('/stats', methods=['GET'])
def dashboard_stats():
    """Retrieve aggregate statistics, risk distributions, and recent scan logs."""
    stats = db.get_dashboard_stats()
    return jsonify({
        "success": True,
        "data": stats
    }), 200


@app.route('/api/reports/<int:scan_id>/export', methods=['GET'])
@app.route('/reports/<int:scan_id>/export', methods=['GET'])
def export_report(scan_id):
    """Export a scan analysis report as JSON or CSV."""
    scan = db.get_scan_by_id(scan_id)
    if not scan:
        return jsonify({
            "success": False,
            "error": f"Scan record with ID #{scan_id} not found"
        }), 404

    export_format = request.args.get("format", "json").lower()

    if export_format == "pdf":
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        story = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#07111f')
        )
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#10b981')
        )

        story.append(Paragraph("<b>PHISHSHIELD — EXECUTIVE SECURITY REPORT</b>", title_style))
        story.append(Paragraph(f"Scan #{scan['id']} · Generated on {scan['created_at']} · Confidential", subtitle_style))
        story.append(Spacer(1, 15))

        # Summary Table
        summary_data = [
            ["Target Identifier", scan["target_identifier"]],
            ["Inspection Type", scan["scan_type"].upper()],
            ["Risk Classification", scan["classification"]],
            ["Risk Score", f"{scan['risk_score']} / 100"],
            ["Total Indicators", str(len(scan["indicators"]))]
        ]
        summary_table = Table(summary_data, colWidths=[150, 390])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1e293b')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 15))

        # Indicators Table
        story.append(Paragraph("<b>DETECTED THREAT INDICATORS</b>", styles['Heading3']))
        story.append(Spacer(1, 6))
        ind_data = [["Indicator", "Severity", "Trigger / Evidence"]]
        for ind in scan["indicators"]:
            ind_data.append([
                ind.get("name", ""),
                ind.get("severity", "").upper(),
                ind.get("evidence", "")[:60]
            ])
        if len(ind_data) == 1:
            ind_data.append(["No Threat Indicators Detected", "CLEAN", "All parameters within threshold"])

        ind_table = Table(ind_data, colWidths=[180, 80, 280])
        ind_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#07111f')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('FONTSIZE', (0, 0), (-1, -1), 8.5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(ind_table)
        story.append(Spacer(1, 15))

        # Recommendations Table
        story.append(Paragraph("<b>RECOMMENDED MITIGATION ACTIONS</b>", styles['Heading3']))
        story.append(Spacer(1, 6))
        rec_data = [["Action Required", "Guidance", "Priority"]]
        for rec in scan["recommendations"]:
            rec_data.append([
                rec.get("action", ""),
                rec.get("detail", "")[:70],
                rec.get("type", "").upper()
            ])
        if len(rec_data) == 1:
            rec_data.append(["Target Verified Clean", "No remediation necessary.", "LOW"])

        rec_table = Table(rec_data, colWidths=[160, 300, 80])
        rec_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('FONTSIZE', (0, 0), (-1, -1), 8.5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(rec_table)

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()

        return Response(
            pdf_bytes,
            mimetype="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=phishshield_report_{scan_id}.pdf"}
        )

    if export_format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Metadata rows
        writer.writerow(["PHISHSHIELD SECURITY ANALYSIS REPORT"])
        writer.writerow(["Scan ID", scan["id"]])
        writer.writerow(["Scan Type", scan["scan_type"].upper()])
        writer.writerow(["Target / Identifier", scan["target_identifier"]])
        writer.writerow(["Scan Timestamp", scan["created_at"]])
        writer.writerow(["Calculated Risk Score", f"{scan['risk_score']}/100"])
        writer.writerow(["Classification", scan["classification"]])
        writer.writerow(["Sample Data Indicator", "YES" if scan["is_sample"] else "NO"])
        writer.writerow([])

        # Indicators Table
        writer.writerow(["DETECTED INDICATORS"])
        writer.writerow(["Indicator ID", "Name", "Severity", "Evidence", "Description"])
        for ind in scan["indicators"]:
            writer.writerow([
                ind.get("id", ""),
                ind.get("name", ""),
                ind.get("severity", "").upper(),
                ind.get("evidence", ""),
                ind.get("description", "")
            ])
        writer.writerow([])

        # Recommendations Table
        writer.writerow(["SECURITY RECOMMENDATIONS"])
        writer.writerow(["Action", "Recommended Guidance", "Priority Type"])
        for rec in scan["recommendations"]:
            writer.writerow([
                rec.get("action", ""),
                rec.get("detail", ""),
                rec.get("type", "").upper()
            ])

        response_data = output.getvalue()
        output.close()

        return Response(
            response_data,
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment; filename=phishshield_report_{scan_id}.csv"}
        )

    # Default: JSON Export
    report_data = {
        "report_title": "PhishShield Security Analysis Report",
        "generated_at": scan["created_at"],
        "scan_metadata": {
            "scan_id": scan["id"],
            "type": scan["scan_type"],
            "target": scan["target_identifier"],
            "is_sample": scan["is_sample"]
        },
        "risk_evaluation": {
            "score": scan["risk_score"],
            "classification": scan["classification"],
            "total_indicators": scan["indicator_count"]
        },
        "indicators": scan["indicators"],
        "recommendations": scan["recommendations"],
        "technical_details": scan["details"]
    }

    return Response(
        json.dumps(report_data, indent=2),
        mimetype="application/json",
        headers={"Content-Disposition": f"attachment; filename=phishshield_report_{scan_id}.json"}
    )



@app.route('/api/extension/download', methods=['GET'])
@app.route('/extension/download', methods=['GET'])
def download_extension_zip():
    """Package and serve the PhishShield browser extension as a downloadable ZIP package."""
    ext_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'extension'))
    if not os.path.exists(ext_dir):
        return jsonify({"success": False, "error": "Extension directory not found"}), 404

    memory_file = io.BytesIO()
    with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(ext_dir):
            for file in files:
                file_path = os.path.join(root, file)
                archive_name = os.path.relpath(file_path, ext_dir)
                zf.write(file_path, arcname=archive_name)

    memory_file.seek(0)
    return Response(
        memory_file.getvalue(),
        mimetype="application/zip",
        headers={"Content-Disposition": "attachment; filename=phishshield-extension.zip"}
    )


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend_or_api_info(path):
    """
    Serves the React frontend SPA if compiled in frontend/dist,
    otherwise provides a helpful online JSON status page instead of a 404 error.
    """
    if path.startswith('api/'):
        return jsonify({
            "error": f"API endpoint /{path} not found on PhishShield Threat Intelligence API",
            "available_endpoints": ["/api/health", "/api/analyze/url", "/api/analyze/email", "/api/scans", "/api/stats"]
        }), 404

    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))
    root_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dist'))
    if not os.path.exists(frontend_dist) and os.path.exists(root_dist):
        frontend_dist = root_dist

    if path != "":
        requested_file = os.path.join(frontend_dist, path)
        if os.path.exists(requested_file) and not os.path.isdir(requested_file):
            return send_from_directory(frontend_dist, path)

    index_html = os.path.join(frontend_dist, 'index.html')
    if os.path.exists(index_html):
        return send_from_directory(frontend_dist, 'index.html')

    # Friendly status response if backend URL is opened directly in browser
    return jsonify({
        "service": "PhishShield Threat Intelligence Engine",
        "status": "online",
        "version": "1.1.0",
        "message": "PhishShield Backend API is running successfully on Render!",
        "endpoints": {
            "health_check": "/api/health",
            "url_analysis": "/api/analyze/url",
            "email_analysis": "/api/analyze/email",
            "scan_history": "/api/scans",
            "metrics_stats": "/api/stats"
        }
    }), 200


if __name__ == '__main__':
    logger.info("Starting PhishShield Threat Intelligence Backend on port 5000...")
    app.run(host='127.0.0.1', port=5000, debug=True)
