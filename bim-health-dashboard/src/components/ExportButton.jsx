import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:          [15,  17,  23],
  surface:     [26,  29,  46],
  surface2:    [30,  33,  48],
  border:      [42,  45,  62],
  white:       [255, 255, 255],
  muted:       [160, 160, 180],
  faint:       [75,  85,  99],
  blue:        [79,  108, 247],
  green:       [16,  185, 129],
  amber:       [245, 158, 11],
  red:         [239, 68,  68],
  purple:      [124, 58,  237],
};

// ── Helpers ────────────────────────────────────────────────────────────────
function scoreColor(score) {
  if (score >= 75) return C.green;
  if (score >= 50) return C.amber;
  return C.red;
}

function gradeColor(grade) {
  const map = {
    A: C.green, B: C.blue,
    C: C.amber, D: C.amber, F: C.red,
  };
  return map[grade] || C.muted;
}

function priorityColor(priority) {
  return priority === "High"   ? C.red
       : priority === "Medium" ? C.amber
       : C.green;
}

function hex(rgb) {
  return "#" + rgb.map(v =>
    v.toString(16).padStart(2, "0")
  ).join("");
}

// ── Draw rounded rect ──────────────────────────────────────────────────────
function roundRect(doc, x, y, w, h, r, fillColor, strokeColor) {
  if (fillColor) {
    doc.setFillColor(...fillColor);
    doc.roundedRect(x, y, w, h, r, r, "F");
  }
  if (strokeColor) {
    doc.setDrawColor(...strokeColor);
    doc.roundedRect(x, y, w, h, r, r, "S");
  }
}

// ── Draw progress bar ──────────────────────────────────────────────────────
function progressBar(doc, x, y, w, h, score, r) {
  roundRect(doc, x, y, w,   h, r, C.surface2);
  roundRect(doc, x, y, w * (score / 100), h, r, scoreColor(score));
}

// ── Page setup helpers ─────────────────────────────────────────────────────
const PAGE_W  = 210;
const PAGE_H  = 297;
const MARGIN  = 20;
const CONTENT = PAGE_W - MARGIN * 2;

function addPageBackground(doc) {
  doc.setFillColor(...C.bg);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
}

function addHeader(doc, title, pageNum, totalPages) {
  // Top bar
  doc.setFillColor(...C.surface);
  doc.rect(0, 0, PAGE_W, 14, "F");

  // Logo dot
  doc.setFillColor(...C.blue);
  doc.circle(MARGIN - 4, 7, 2.5, "F");

  // Title
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.setFont("helvetica", "normal");
  doc.text("BIM Health Toolkit  /  " + title, MARGIN + 2, 9);

  // Page number
  doc.text(
    "Page " + pageNum + " of " + totalPages,
    PAGE_W - MARGIN, 9,
    { align: "right" }
  );
}

function addFooter(doc, generatedAt) {
  doc.setFillColor(...C.surface);
  doc.rect(0, PAGE_H - 12, PAGE_W, 12, "F");
  doc.setFontSize(7);
  doc.setTextColor(...C.faint);
  doc.text("Generated: " + generatedAt, MARGIN, PAGE_H - 4);
  doc.text(
    "BIM Health Toolkit v1.0.0",
    PAGE_W - MARGIN, PAGE_H - 4,
    { align: "right" }
  );
}

// ── PAGE 1 — Cover ─────────────────────────────────────────────────────────
function buildCoverPage(doc, report) {
  addPageBackground(doc);
  addHeader(doc, "Overview", 1, 4);
  addFooter(doc, report.meta.generated_at);

  const { overall, meta, scores, recommendations } = report;
  const color = scoreColor(overall.score);
  const gColor = gradeColor(overall.grade);

  // ── Hero card ────────────────────────────────────────────────────────────
  roundRect(doc, MARGIN, 22, CONTENT, 80, 6, C.surface);

  // Score circle (simulated with filled circle + inner circle)
  const cx = MARGIN + 44, cy = 62, cr = 28;
  doc.setFillColor(...C.surface2);
  doc.circle(cx, cy, cr, "F");
  doc.setFillColor(...color);
  doc.setDrawColor(...color);
  doc.setLineWidth(3.5);
  doc.circle(cx, cy, cr, "S");

  // Score number
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...color);
  doc.text(String(overall.score), cx, cy + 2, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.muted);
  doc.text("out of 100", cx, cy + 9, { align: "center" });

  // Right side text
  const tx = MARGIN + 82;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.muted);
  doc.text("Overall Health Score", tx, 38);

  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.white);
  doc.text(overall.status, tx, 54);

  // Grade badge
  roundRect(doc, tx, 58, 28, 10, 3, [...gColor, 30]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gColor);
  doc.text("Grade  " + overall.grade, tx + 14, 65, { align: "center" });

  // Meta info
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.faint);
  doc.text("Model: " + meta.model_name,  tx, 80);
  doc.text("Date:  " + meta.generated_at, tx, 86);

  // ── 3 mini score cards ───────────────────────────────────────────────────
  const cards = [
    {
      label: "Warnings",
      score: scores.warnings.score,
      weight: scores.warnings.weight,
    },
    {
      label: "File Bloat",
      score: scores.bloat.score,
      weight: scores.bloat.weight,
    },
    {
      label: "Parameters",
      score: scores.parameters.score,
      weight: scores.parameters.weight,
    },
  ];

  const cardW = (CONTENT - 8) / 3;
  cards.forEach((card, i) => {
    const cx2 = MARGIN + i * (cardW + 4);
    const cy2 = 108;
    const col  = scoreColor(card.score);

    roundRect(doc, cx2, cy2, cardW, 36, 4, C.surface);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.muted);
    doc.text(card.label, cx2 + 6, cy2 + 8);

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...col);
    doc.text(String(card.score), cx2 + 6, cy2 + 22);

    doc.setFontSize(7);
    doc.setTextColor(...C.faint);
    doc.text("/100  •  " + card.weight + "% weight", cx2 + 24, cy2 + 22);

    progressBar(doc, cx2 + 6, cy2 + 28, cardW - 12, 3, card.score, 1.5);
  });

  // ── Summary stats row ────────────────────────────────────────────────────
  const stats = [
    {
      label: "Total Warnings",
      value: scores.warnings.breakdown.total_warnings,
    },
    {
      label: "Families Loaded",
      value: scores.bloat.breakdown.total_families,
    },
    {
      label: "Elements Checked",
      value: scores.parameters.breakdown.total_checked,
    },
    {
      label: "Recommendations",
      value: recommendations.length,
    },
  ];

  const statW = (CONTENT - 6) / 4;
  stats.forEach((stat, i) => {
    const sx = MARGIN + i * (statW + 2);
    const sy = 152;
    roundRect(doc, sx, sy, statW, 24, 3, C.surface);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.white);
    doc.text(String(stat.value), sx + statW / 2, sy + 11,
             { align: "center" });

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.faint);
    doc.text(stat.label, sx + statW / 2, sy + 19,
             { align: "center" });
  });

  // ── About this report ────────────────────────────────────────────────────
  roundRect(doc, MARGIN, 184, CONTENT, 36, 4, C.surface);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.muted);
  doc.text("About This Report", MARGIN + 6, 194);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.faint);
  const about = [
    "This report was generated by BIM Health Toolkit, which scans Revit models",
    "for quality issues across three categories: model warnings, file bloat, and",
    "parameter completeness. Each category is scored independently then combined",
    "into an overall health score using weighted averages.",
  ];
  about.forEach((line, i) => {
    doc.text(line, MARGIN + 6, 202 + i * 5);
  });
}

// ── PAGE 2 — Score Breakdown ───────────────────────────────────────────────
function buildBreakdownPage(doc, report) {
  doc.addPage();
  addPageBackground(doc);
  addHeader(doc, "Score Breakdown", 2, 4);
  addFooter(doc, report.meta.generated_at);

  const { scores } = report;
  const wb = scores.warnings.breakdown;
  const bb = scores.bloat.breakdown;
  const pb = scores.parameters.breakdown;

  let y = 22;

  // ── Section title ────────────────────────────────────────────────────────
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.white);
  doc.text("Score Breakdown", MARGIN, y + 8);
  y += 18;

  // ── Warnings section ─────────────────────────────────────────────────────
  roundRect(doc, MARGIN, y, CONTENT, 58, 5, C.surface);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.red);
  doc.text("Warnings", MARGIN + 6, y + 10);

  doc.setFontSize(20);
  doc.setTextColor(...scoreColor(wb.score));
  doc.text(String(wb.score), PAGE_W - MARGIN - 6, y + 12,
           { align: "right" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.faint);
  doc.text("/100", PAGE_W - MARGIN - 6, y + 18, { align: "right" });

  progressBar(
    doc, MARGIN + 6, y + 20, CONTENT - 12, 4, wb.score, 2
  );

  // Warnings breakdown grid
  const wItems = [
    { label: "Critical", value: wb.critical, color: C.red   },
    { label: "Moderate", value: wb.moderate, color: C.amber },
    { label: "Low",      value: wb.low,      color: C.green },
    { label: "Total",    value: wb.total_warnings, color: C.muted },
  ];
  const wColW = (CONTENT - 18) / 4;
  wItems.forEach((item, i) => {
    const ix = MARGIN + 6 + i * (wColW + 4);
    const iy = y + 30;
    roundRect(doc, ix, iy, wColW, 20, 3, C.surface2);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...item.color);
    doc.text(String(item.value), ix + wColW / 2, iy + 10,
             { align: "center" });

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.faint);
    doc.text(item.label, ix + wColW / 2, iy + 16,
             { align: "center" });
  });

  y += 66;

  // ── Bloat section ────────────────────────────────────────────────────────
  roundRect(doc, MARGIN, y, CONTENT, 58, 5, C.surface);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.amber);
  doc.text("File Bloat", MARGIN + 6, y + 10);

  doc.setFontSize(20);
  doc.setTextColor(...scoreColor(bb.score));
  doc.text(String(bb.score), PAGE_W - MARGIN - 6, y + 12,
           { align: "right" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.faint);
  doc.text("/100", PAGE_W - MARGIN - 6, y + 18, { align: "right" });

  progressBar(
    doc, MARGIN + 6, y + 20, CONTENT - 12, 4, bb.score, 2
  );

  const bItems = [
    { label: "Families",   value: bb.total_families,   color: C.white },
    { label: "In-Place",   value: bb.inplace_families, color: C.red   },
    { label: "CAD Imports",value: bb.cad_imports,      color: C.amber },
    { label: "Views",      value: bb.total_views,      color: C.muted },
  ];
  const bColW = (CONTENT - 18) / 4;
  bItems.forEach((item, i) => {
    const ix = MARGIN + 6 + i * (bColW + 4);
    const iy = y + 30;
    roundRect(doc, ix, iy, bColW, 20, 3, C.surface2);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...item.color);
    doc.text(String(item.value), ix + bColW / 2, iy + 10,
             { align: "center" });

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.faint);
    doc.text(item.label, ix + bColW / 2, iy + 16,
             { align: "center" });
  });

  y += 66;

  // ── Parameters section ───────────────────────────────────────────────────
  roundRect(doc, MARGIN, y, CONTENT, 58, 5, C.surface);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.green);
  doc.text("Parameters", MARGIN + 6, y + 10);

  doc.setFontSize(20);
  doc.setTextColor(...scoreColor(pb.score));
  doc.text(String(pb.score), PAGE_W - MARGIN - 6, y + 12,
           { align: "right" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.faint);
  doc.text("/100", PAGE_W - MARGIN - 6, y + 18, { align: "right" });

  progressBar(
    doc, MARGIN + 6, y + 20, CONTENT - 12, 4, pb.score, 2
  );

  const pItems = [
    { label: "Checked",    value: pb.total_checked,    color: C.white },
    { label: "Complete",   value: pb.total_complete,   color: C.green },
    { label: "Incomplete", value: pb.total_incomplete, color: C.red   },
    { label: "Score",      value: pb.completeness_pct + "%", color: C.muted },
  ];
  const pColW = (CONTENT - 18) / 4;
  pItems.forEach((item, i) => {
    const ix = MARGIN + 6 + i * (pColW + 4);
    const iy = y + 30;
    roundRect(doc, ix, iy, pColW, 20, 3, C.surface2);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...item.color);
    doc.text(String(item.value), ix + pColW / 2, iy + 10,
             { align: "center" });

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.faint);
    doc.text(item.label, ix + pColW / 2, iy + 16,
             { align: "center" });
  });
}

// ── PAGE 3 — Recommendations ───────────────────────────────────────────────
function buildRecommendationsPage(doc, report) {
  doc.addPage();
  addPageBackground(doc);
  addHeader(doc, "Recommendations", 3, 4);
  addFooter(doc, report.meta.generated_at);

  const { recommendations } = report;
  let y = 26;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.white);
  doc.text("Recommendations", MARGIN, y);
  y += 12;

  if (recommendations.length === 0) {
    roundRect(doc, MARGIN, y, CONTENT, 24, 4, C.surface);
    doc.setFontSize(9);
    doc.setTextColor(...C.green);
    doc.text("No issues found — model is in great shape!",
             PAGE_W / 2, y + 14, { align: "center" });
    return;
  }

  const groups = [
    { label: "High Priority",   color: C.red,   items: recommendations.filter(r => r.priority === "High")   },
    { label: "Medium Priority", color: C.amber, items: recommendations.filter(r => r.priority === "Medium") },
    { label: "Low Priority",    color: C.green, items: recommendations.filter(r => r.priority === "Low")    },
  ];

  groups.forEach(group => {
    if (group.items.length === 0) return;

    // Group label
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...group.color);
    doc.text(
      group.label.toUpperCase() + "  (" + group.items.length + ")",
      MARGIN, y
    );
    y += 5;

    group.items.forEach(rec => {
      // Check if we need a new page
      if (y > PAGE_H - 30) {
        doc.addPage();
        addPageBackground(doc);
        addHeader(doc, "Recommendations (cont.)", 3, 4);
        addFooter(doc, report.meta.generated_at);
        y = 26;
      }

      const cardH = 18;
      roundRect(doc, MARGIN, y, CONTENT, cardH, 3, C.surface);

      // Priority pill
      const pillW = 18;
      roundRect(
        doc,
        MARGIN + 4, y + 4,
        pillW, 8, 2,
        [...priorityColor(rec.priority), 30]
      );
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...priorityColor(rec.priority));
      doc.text(
        rec.priority.toUpperCase(),
        MARGIN + 4 + pillW / 2,
        y + 9.5,
        { align: "center" }
      );

      // Category
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.faint);
      doc.text(rec.category, MARGIN + 26, y + 9.5);

      // Action text
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.white);
      const maxW = CONTENT - 70;
      const lines = doc.splitTextToSize(rec.action, maxW);
      doc.text(lines[0], MARGIN + 68, y + 9.5);

      // Detail count badge
      if (rec.detail && rec.detail.length > 0) {
        const badge = rec.detail.length + " items";
        doc.setFontSize(6);
        doc.setTextColor(...C.muted);
        doc.text(badge, PAGE_W - MARGIN - 4, y + 9.5,
                 { align: "right" });
      }

      y += cardH + 3;
    });

    y += 4;
  });
}

// ── PAGE 4 — Element Detail ────────────────────────────────────────────────
function buildDetailPage(doc, report) {
  doc.addPage();
  addPageBackground(doc);
  addHeader(doc, "Element Detail", 4, 4);
  addFooter(doc, report.meta.generated_at);

  const { recommendations } = report;
  let y = 26;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.white);
  doc.text("Element Detail", MARGIN, y);
  y += 12;

  // Only show recs that have detail
  const withDetail = recommendations.filter(
    r => r.detail && r.detail.length > 0 && r.detail_type !== "none"
  );

  if (withDetail.length === 0) {
    roundRect(doc, MARGIN, y, CONTENT, 24, 4, C.surface);
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text("No element detail available for this report.",
             PAGE_W / 2, y + 14, { align: "center" });
    return;
  }

  withDetail.forEach(rec => {
    if (y > PAGE_H - 50) {
      doc.addPage();
      addPageBackground(doc);
      addHeader(doc, "Element Detail (cont.)", 4, 4);
      addFooter(doc, report.meta.generated_at);
      y = 26;
    }

    // Section title
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...priorityColor(rec.priority));
    doc.text(
      "[" + rec.priority + "]  " + rec.category + "  —  " + rec.action,
      MARGIN, y
    );
    y += 5;

    // ── Warnings table ───────────────────────────────────────────────────
    if (rec.detail_type === "warnings") {
      const tableData = rec.detail.slice(0, 20).map(w => [
        w.description.length > 70
          ? w.description.slice(0, 70) + "..."
          : w.description,
        String(w.element_count),
        w.element_ids.slice(0, 3).join(", ") +
          (w.element_ids.length > 3 ? "..." : ""),
      ]);

      autoTable(doc, {
        startY: y,
        head:   [["Warning Description", "Elements", "Element IDs"]],
        body:   tableData,
        theme:  "plain",
        styles: {
          fontSize:  6.5,
          textColor: [160, 160, 180],
          fillColor: [26, 29, 46],
          cellPadding: 2.5,
        },
        headStyles: {
          fillColor:  [30, 33, 48],
          textColor:  [255, 255, 255],
          fontStyle:  "bold",
          fontSize:   7,
        },
        alternateRowStyles: {
          fillColor: [30, 33, 48],
        },
        columnStyles: {
          0: { cellWidth: 110 },
          1: { cellWidth: 20,  halign: "center" },
          2: { cellWidth: 40 },
        },
        margin: { left: MARGIN, right: MARGIN },
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    // ── Families / CAD table ─────────────────────────────────────────────
    if (rec.detail_type === "families" || rec.detail_type === "cad") {
      const tableData = rec.detail.map(f => [f.name || "Unknown"]);
      autoTable(doc, {
        startY: y,
        head:   [["Name"]],
        body:   tableData,
        theme:  "plain",
        styles: {
          fontSize:  7,
          textColor: [160, 160, 180],
          fillColor: [26, 29, 46],
          cellPadding: 2.5,
        },
        headStyles: {
          fillColor: [30, 33, 48],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [30, 33, 48] },
        margin: { left: MARGIN, right: MARGIN },
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    // ── Parameters table ─────────────────────────────────────────────────
    if (rec.detail_type === "parameters") {
      const tableData = rec.detail.slice(0, 30).map(el => [
        el.category || "Unknown",
        el.type     || "Unknown",
        String(el.id),
      ]);
      autoTable(doc, {
        startY: y,
        head:   [["Category", "Type", "Element ID"]],
        body:   tableData,
        theme:  "plain",
        styles: {
          fontSize:  6.5,
          textColor: [160, 160, 180],
          fillColor: [26, 29, 46],
          cellPadding: 2.5,
        },
        headStyles: {
          fillColor: [30, 33, 48],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize:  7,
        },
        alternateRowStyles: { fillColor: [30, 33, 48] },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 90 },
          2: { cellWidth: 30 },
        },
        margin: { left: MARGIN, right: MARGIN },
      });
      y = doc.lastAutoTable.finalY + 8;
    }
  });
}

// ── Main export function ───────────────────────────────────────────────────
function generatePDF(report) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit:        "mm",
    format:      "a4",
  });

  buildCoverPage(doc, report);
  buildBreakdownPage(doc, report);
  buildRecommendationsPage(doc, report);
  buildDetailPage(doc, report);

  const safeName = (report.meta.model_name || "BIMHealth")
    .replace(/[^a-zA-Z0-9]/g, "_");
  const date = (report.meta.generated_date || "").replace(/-/g, "");
  doc.save("BIMHealth_" + safeName + "_" + date + ".pdf");
}

// ── Button component ───────────────────────────────────────────────────────
export default function ExportButton({ report }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!report || exporting) return;
    setExporting(true);
    setTimeout(() => {
      try {
        generatePDF(report);
      } finally {
        setExporting(false);
      }
    }, 100);
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 px-4 py-2 bg-[#4F6CF7]
                 hover:bg-[#3D5AF5] disabled:opacity-50 text-white
                 text-sm font-semibold rounded-xl transition-colors
                 cursor-pointer disabled:cursor-not-allowed"
    >
      {exporting ? (
        <>
          <div className="w-3.5 h-3.5 border-2 border-white
                          border-t-transparent rounded-full animate-spin"/>
          Generating...
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5"
               strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Export PDF
        </>
      )}
    </button>
  );
}