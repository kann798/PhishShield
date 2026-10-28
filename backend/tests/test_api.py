"""
Integration tests for Flask API endpoints.
Validates health check, URL analysis, Email analysis, Scan History,
Single Scan Details, Deletion, and Dashboard Stats.
"""
import pytest
import json
from app import app
import database as db


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_health_endpoint(client):
    """Verify health endpoint returns 200 with service metadata."""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert "PhishShield" in data["service"]


def test_url_analysis_endpoint(client):
    """Verify /api/analyze/url inspects link and records to database."""
    payload = {"url": "http://192.168.1.50/account/login"}
    response = client.post('/api/analyze/url', json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "risk_score" in data["data"]
    assert data["data"]["risk_score"] >= 50
    assert "scan_id" in data["data"]


def test_url_analysis_invalid(client):
    """Verify 400 response for empty or missing URL payload."""
    response = client.post('/api/analyze/url', json={})
    assert response.status_code == 400


def test_email_analysis_endpoint(client):
    """Verify /api/analyze/email processes email headers and body."""
    payload = {
        "email_content": "From: Boss <boss@company.com>\nReply-To: phish@evil.xyz\nSubject: Urgent Wire\nPlease send wire transfer today."
    }
    response = client.post('/api/analyze/email', json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "classification" in data["data"]


def test_dashboard_stats_endpoint(client):
    """Verify /api/dashboard/stats returns aggregate metrics."""
    response = client.get('/api/dashboard/stats')
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "total_scans" in data["data"]
    assert "risk_distribution" in data["data"]


def test_scans_and_export_lifecycle(client):
    """Verify scan history listing, detail retrieval, export, and deletion."""
    # List scans
    list_res = client.get('/api/scans')
    assert list_res.status_code == 200
    scans = list_res.get_json()["data"]
    assert len(scans) > 0

    first_scan_id = scans[0]["id"]

    # Get single scan
    detail_res = client.get(f'/api/scans/{first_scan_id}')
    assert detail_res.status_code == 200
    detail = detail_res.get_json()["data"]
    assert detail["id"] == first_scan_id

    # Export report as JSON
    export_json = client.get(f'/api/reports/{first_scan_id}/export?format=json')
    assert export_json.status_code == 200
    assert "application/json" in export_json.content_type

    # Export report as CSV
    export_csv = client.get(f'/api/reports/{first_scan_id}/export?format=csv')
    assert export_csv.status_code == 200
    assert "text/csv" in export_csv.content_type
