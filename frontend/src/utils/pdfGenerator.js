import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates an executive cybersecurity audit PDF report for a given scan record.
 * Uses jsPDF and jspdf-autotable to produce a polished, professional multi-page document.
 */
export function generateScanPdf(scan) {
  if (!scan) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Color tokens
  const darkNavy = [7, 17, 31];
  const emerald = [16, 185, 129];
  const slateDark = [15, 23, 42];
  const slateText = [51, 65, 85];
  const slateLight = [241, 245, 249];

  // Header Banner Background (Deep Navy)
  doc.setFillColor(...darkNavy);
  doc.rect(0, 0, pageWidth, 90, 'F');

  // Emerald Top Stripe
  doc.setFillColor(...emerald);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Title & Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('PHISHSHIELD', 40, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129);
  doc.text('CYBERSECURITY & THREAT DEFENSE PLATFORM', 40, 58);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('EXECUTIVE SECURITY AUDIT MEMORANDUM', 40, 72);

  // Right-aligned report metadata in header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`REPORT #${scan.id || 'N/A'}`, pageWidth - 40, 42, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${scan.created_at || new Date().toLocaleString()}`, pageWidth - 40, 58, { align: 'right' });
  doc.text('Confidential Document', pageWidth - 40, 72, { align: 'right' });

  let y = 115;

  // 1. Executive Summary & Verdict Card
  const riskScore = scan.risk_score || 0;
  const classification = (scan.classification || 'Unknown').toUpperCase();
  
  let riskColor = [16, 185, 129]; // Safe (green)
  if (classification.includes('CRITICAL')) riskColor = [220, 38, 38];
  else if (classification.includes('HIGH')) riskColor = [234, 88, 12];
  else if (classification.includes('MEDIUM')) riskColor = [217, 119, 6];

  // Section Heading
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...slateDark);
  doc.text('1. EXECUTIVE VERDICT & TARGET SUMMARY', 40, y);
  y += 12;

  // Summary card outline & background
  doc.setFillColor(...slateLight);
  doc.roundedRect(40, y, pageWidth - 80, 80, 8, 8, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(40, y, pageWidth - 80, 80, 8, 8, 'S');

  // Verdict pill
  doc.setFillColor(...riskColor);
  doc.roundedRect(55, y + 16, 140, 48, 6, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(classification, 125, y + 38, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Risk Score: ${riskScore} / 100`, 125, y + 54, { align: 'center' });

  // Details next to verdict pill
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...slateText);
  doc.text('Inspection Type:', 215, y + 26);
  doc.text('Target Identifier:', 215, y + 42);
  doc.text('Indicators Found:', 215, y + 58);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text((scan.scan_type || 'URL').toUpperCase(), 320, y + 26);
  
  const targetId = scan.target_identifier || 'N/A';
  const displayTarget = targetId.length > 38 ? targetId.substring(0, 35) + '...' : targetId;
  doc.text(displayTarget, 320, y + 42);
  doc.text(`${(scan.indicators || []).length} Detected Indicators`, 320, y + 58);

  y += 105;

  // 2. Detected Indicators Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...slateDark);
  doc.text('2. THREAT INDICATORS & HEURISTIC SIGNATURES', 40, y);
  y += 10;

  const indicatorRows = (scan.indicators || []).map((ind, idx) => [
    `#${idx + 1}`,
    ind.name || ind.id || 'Threat Indicator',
    (ind.severity || 'Medium').toUpperCase(),
    ind.evidence || 'Pattern detected',
    ind.description || ''
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Indicator Name', 'Severity', 'Trigger / Evidence', 'Analysis Description']],
    body: indicatorRows.length > 0 ? indicatorRows : [['-', 'No Malicious Indicators Detected', 'CLEAN', 'All parameters within safe threshold.', 'Target verified safe by heuristic engine.']],
    margin: { left: 40, right: 40 },
    theme: 'grid',
    headStyles: {
      fillColor: darkNavy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: slateText,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 110, fontStyle: 'bold' },
      2: { cellWidth: 65, halign: 'center' },
      3: { cellWidth: 140 },
      4: { cellWidth: 'auto' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        const text = String(data.cell.raw).toUpperCase();
        if (text.includes('HIGH') || text.includes('CRITICAL')) {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else if (text.includes('MED')) {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fontStyle = 'bold';
        } else if (text.includes('CLEAN') || text.includes('LOW')) {
          data.cell.styles.textColor = [5, 150, 105];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  y = doc.lastAutoTable.finalY + 25;

  // Check if we need a new page for Recommendations
  if (y > pageHeight - 140) {
    doc.addPage();
    y = 40;
  }

  // 3. Actionable Security Recommendations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...slateDark);
  doc.text('3. ACTIONABLE SECURITY RECOMMENDATIONS', 40, y);
  y += 10;

  const recommendationRows = (scan.recommendations || []).map((rec) => [
    rec.action || 'Recommended Action',
    rec.detail || '',
    (rec.type || 'GUIDANCE').toUpperCase()
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Action Required', 'Remediation Guidance', 'Priority']],
    body: recommendationRows.length > 0 ? recommendationRows : [['Target Safe', 'No remediation actions required. Domain and content signatures clear.', 'LOW']],
    margin: { left: 40, right: 40 },
    theme: 'grid',
    headStyles: {
      fillColor: slateDark,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: slateText,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 140, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 80, halign: 'center', fontStyle: 'bold' },
    },
  });

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(40, pageHeight - 35, pageWidth - 40, pageHeight - 35);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('PhishShield Threat Intelligence · Automated Security Inspection Engine', 40, pageHeight - 22);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 40, pageHeight - 22, { align: 'right' });
  }

  // Trigger browser download
  doc.save(`phishshield_report_${scan.id || 'scan'}.pdf`);
}
