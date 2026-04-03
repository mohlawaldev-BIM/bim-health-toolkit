import { useEffect } from "react";

const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    color: "#EF4444",
    label: "Warnings Audit",
    desc: "Extracts every active Revit warning and classifies it as Critical, Moderate, or Low using keyword analysis — with a penalty-based scoring system.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    color: "#F59E0B",
    label: "File Bloat Detection",
    desc: "Scans for in-place families, imported CAD files, excessive view counts, and oversized family libraries that inflate file size and hurt performance.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
    color: "#10B981",
    label: "Parameter Completeness",
    desc: "Checks Walls, Floors, Doors, Windows, and other key categories for missing required parameters — from built-in fields to custom COBie and UniClass data.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    color: "#4F6CF7",
    label: "Health Score & Grading",
    desc: "Combines all three checks into a single weighted score out of 100, with a letter grade from A to F and a prioritised list of actionable recommendations.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    color: "#A78BFA",
    label: "PDF Export",
    desc: "Generates a branded 4-page PDF report — cover page, score breakdown, recommendations, and element detail tables — ready to share with clients or your team.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    color: "#34D399",
    label: "Trend Tracking",
    desc: "Upload multiple reports across a session to see how your model's health score evolves over time, with per-check trend lines and score delta indicators.",
  },
];

const howItWorks = [
  { step: "01", title: "Run the Check", desc: "Open your Revit model and click Run Check in the BIMHealthToolkit ribbon tab. The pyRevit plugin scans your model in seconds." },
  { step: "02", title: "Get the Report", desc: "A JSON report is automatically saved to your Desktop, and an in-Revit WPF dialog shows your instant score summary." },
  { step: "03", title: "Load the Dashboard", desc: "Drag and drop the JSON file into this dashboard to see the full visual breakdown — charts, scores, and expandable recommendations." },
  { step: "04", title: "Fix & Improve", desc: "Work through the prioritised recommendations, re-run the check, and watch your BIM Health Score climb over time." },
];

export default function AboutModal({ onClose }) {

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{
          background: "linear-gradient(180deg, #1A1D2E 0%, #141622 100%)",
          border: "1px solid #2A2D3E",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(79,108,247,0.08)",
        }}
      >
        {/* ── Top glow accent ───────────────────────────────────────── */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #4F6CF780, transparent)" }}
        />

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="relative p-8 pb-0">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-xl flex items-center
                       justify-center text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
            style={{ background: "#1E2130", border: "1px solid #2A2D3E" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Logo + title */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #4F6CF7, #7C3AED)",
                boxShadow: "0 0 28px #4F6CF740",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                BIM Health Toolkit
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Version 1.0.0 · Built for Autodesk Revit
              </p>
            </div>
          </div>

          {/* Tagline */}
          <div
            className="rounded-2xl p-5 mb-6"
            style={{ background: "#4F6CF710", border: "1px solid #4F6CF725" }}
          >
            <p className="text-[15px] text-gray-300 leading-relaxed">
              BIM Health Toolkit is a quality assurance system for Autodesk Revit models.
              Like <span className="text-white font-medium">ESLint for code</span> or{" "}
              <span className="text-white font-medium">Lighthouse for websites</span>, it
              scans your model and produces an objective{" "}
              <span className="text-[#4F6CF7] font-semibold">BIM Health Score</span> — a
              single number from 0 to 100 that tells you exactly how production-ready
              your model is.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px mb-6" style={{ background: "#2A2D3E" }} />
        </div>

        {/* ── Scrollable body ───────────────────────────────────────── */}
        <div className="px-8 pb-8 flex flex-col gap-8">

          {/* How It Works */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              How It Works
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {howItWorks.map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="rounded-2xl p-4 relative overflow-hidden"
                  style={{ background: "#1E2130", border: "1px solid #2A2D3E" }}
                >
                  <span
                    className="text-5xl font-black absolute -top-2 -right-1 select-none"
                    style={{ color: "#2A2D3E", lineHeight: 1 }}
                  >
                    {step}
                  </span>
                  <p className="text-xs font-bold text-[#4F6CF7] mb-1.5 uppercase tracking-wide">
                    Step {step}
                  </p>
                  <p className="text-sm font-semibold text-white mb-1.5">{title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              What It Checks
            </h3>
            <div className="flex flex-col gap-2.5">
              {features.map(({ icon, color, label, desc }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 rounded-2xl p-4"
                  style={{ background: "#1E2130", border: "1px solid #2A2D3E" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: color + "18", color }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">{label}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Score system */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              Scoring System
            </h3>
            <div
              className="rounded-2xl p-5"
              style={{ background: "#1E2130", border: "1px solid #2A2D3E" }}
            >
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                The overall score is a weighted combination of all three checks:
              </p>
              <div
                className="rounded-xl px-4 py-3 font-mono text-sm text-center text-gray-300 mb-5"
                style={{ background: "#0F1117", border: "1px solid #2A2D3E" }}
              >
                Score = (Warnings × <span className="text-[#EF4444]">35%</span>) +
                (Bloat × <span className="text-[#F59E0B]">30%</span>) +
                (Parameters × <span className="text-[#10B981]">35%</span>)
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { grade: "A", range: "90–100", label: "Excellent",  color: "#10B981" },
                  { grade: "B", range: "75–89",  label: "Good",        color: "#3B82F6" },
                  { grade: "C", range: "60–74",  label: "Needs Work",  color: "#F59E0B" },
                  { grade: "D", range: "40–59",  label: "Poor",        color: "#F97316" },
                  { grade: "F", range: "0–39",   label: "Critical",    color: "#EF4444" },
                ].map(({ grade, range, label, color }) => (
                  <div
                    key={grade}
                    className="rounded-xl p-3 text-center"
                    style={{ background: color + "12", border: `1px solid ${color}30` }}
                  >
                    <p className="text-xl font-black mb-1" style={{ color }}>{grade}</p>
                    <p className="text-[10px] font-semibold text-gray-400">{range}</p>
                    <p className="text-[9px] text-gray-600 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Privacy note */}
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-4"
            style={{ background: "#10B98110", border: "1px solid #10B98125" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="#10B981" strokeWidth="2" strokeLinecap="round" className="shrink-0">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="text-green-400 font-semibold">100% local processing.</span>{" "}
              Your model data and reports never leave your machine. Everything runs inside
              Revit and your browser — no servers, no uploads.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-600">
              Built as a BIM development portfolio project ·{" "}
              <span className="text-gray-500">v1.0.0</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
