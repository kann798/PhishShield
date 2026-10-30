/**
 * Unified Forensic Report Exporter (Client-side JSON & CSV).
 * Ensures instant, reliable, 100% offline-compatible downloads for ALL scans
 * (including client-side heuristics, server-side SQLite records, and synthetic samples).
 */

/**
 * Format and trigger client-side download of a scan record as structured JSON.
 * @param {Object} scan - The full scan record object.
 */
export function exportScanAsJson(scan) {
  if (!scan) return;

  const exportPayload = {
    report_title: "PHISHSHIELD SECURITY ANALYSIS REPORT",
    generator: "PhishShield v1.2 Threat Intelligence Engine",
    exported_at: new Date().toISOString(),
    scan_id: scan.id,
    scan_type: (scan.scan_type || 'url').toUpperCase(),
    target_identifier: scan.target_identifier || scan.input_url || 'Unknown',
    risk_score: scan.risk_score ?? 0,
    classification: scan.classification || 'Low',
    verdict: scan.verdict || (scan.risk_score >= 70 ? 'Phishing' : scan.risk_score >= 35 ? 'Suspicious' : 'Safe'),
    is_sample: Boolean(scan.is_sample),
    created_at: scan.created_at || new Date().toISOString(),
    indicators_count: scan.indicator_count || scan.indicators?.length || 0,
    indicators: (scan.indicators || []).map((ind, idx) => ({
      id: ind.id || `IND-${idx + 1}`,
      name: ind.name || 'Threat Finding',
      severity: (ind.severity || 'low').toUpperCase(),
      evidence: ind.evidence || '',
      description: ind.description || ''
    })),
    recommendations: (scan.recommendations || []).map((rec, idx) => ({
      id: `REC-${idx + 1}`,
      action: rec.action || 'Precautionary Security Action',
      detail: rec.detail || '',
      priority: (rec.type || rec.priority || 'standard').toUpperCase()
    })),
    technical_details: scan.details || scan.anatomy || {}
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const filename = `phishshield_report_${scan.id || 'scan'}.json`;

  triggerBlobDownload(blob, filename);
}

/**
 * Format and trigger client-side download of a scan record as structured CSV.
 * @param {Object} scan - The full scan record object.
 */
export function exportScanAsCsv(scan) {
  if (!scan) return;

  const rows = [];
  
  // Escape cell value according to RFC 4180 CSV specifications
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Section 1: Header & Metadata
  rows.push(['PHISHSHIELD SECURITY ANALYSIS REPORT']);
  rows.push(['Scan ID', escapeCell(scan.id)]);
  rows.push(['Scan Type', escapeCell((scan.scan_type || 'url').toUpperCase())]);
  rows.push(['Target / Identifier', escapeCell(scan.target_identifier || scan.input_url || '')]);
  rows.push(['Scan Timestamp', escapeCell(scan.created_at || new Date().toISOString())]);
  rows.push(['Calculated Risk Score', escapeCell(`${scan.risk_score ?? 0}/100`)]);
  rows.push(['Classification', escapeCell(scan.classification || 'Low')]);
  rows.push(['Verdict', escapeCell(scan.verdict || (scan.risk_score >= 70 ? 'Phishing' : scan.risk_score >= 35 ? 'Suspicious' : 'Safe'))]);
  rows.push(['Sample Data Indicator', escapeCell(scan.is_sample ? 'YES' : 'NO')]);
  rows.push([]);

  // Section 2: Detected Indicators Table
  rows.push(['DETECTED THREAT INDICATORS']);
  rows.push(['Indicator ID', 'Name', 'Severity', 'Evidence', 'Technical Description']);
  const indicators = scan.indicators || [];
  if (indicators.length > 0) {
    indicators.forEach((ind, idx) => {
      rows.push([
        escapeCell(ind.id || `IND-${idx + 1}`),
        escapeCell(ind.name || 'Threat Finding'),
        escapeCell((ind.severity || 'low').toUpperCase()),
        escapeCell(ind.evidence || 'N/A'),
        escapeCell(ind.description || '')
      ]);
    });
  } else {
    rows.push(['N/A', 'No malicious indicators detected', 'CLEAN', 'All parameters within normal thresholds', 'Clean heuristic signature']);
  }
  rows.push([]);

  // Section 3: Mitigation Recommendations Table
  rows.push(['RECOMMENDED MITIGATION ACTIONS']);
  rows.push(['Action Required', 'Guidance & Detail', 'Priority / Type']);
  const recommendations = scan.recommendations || [];
  if (recommendations.length > 0) {
    recommendations.forEach((rec) => {
      rows.push([
        escapeCell(rec.action || ''),
        escapeCell(rec.detail || ''),
        escapeCell((rec.type || rec.priority || 'standard').toUpperCase())
      ]);
    });
  } else {
    rows.push(['Routine Security Caution', 'Target verified clean. Exercise normal awareness.', 'LOW']);
  }

  const csvContent = rows.map(r => Array.isArray(r) ? r.join(',') : r).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `phishshield_report_${scan.id || 'scan'}.csv`;

  triggerBlobDownload(blob, filename);
}

/**
 * Universal browser-safe helper to programmatically trigger a download from a Blob.
 */
function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

