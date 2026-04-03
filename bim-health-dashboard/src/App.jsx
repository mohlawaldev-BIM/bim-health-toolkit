import { useState, useRef, useEffect } from "react";
import { parseReport, getScoreColor } from "./utils/reportLoader";
import Header            from "./components/Header";
import ScoreRing         from "./components/ScoreRing";
import ScoreCard         from "./components/ScoreCard";
import BreakdownChart    from "./components/BreakdownChart";
import WarningsPieChart  from "./components/WarningsPieChart";
import RecommendationsList from "./components/RecommendationsList";
import {
  saveToHistory,
  getHistory,
  getTrendData,
  getScoreDelta,
} from "./utils/reportHistory";
import ReportHistory from "./components/ReportHistory";
import ExportButton      from "./components/ExportButton";
import AboutModal from "./components/AboutModal";

export default function App() {
  const [report,   setReport]   = useState(null);
  const [dragging, setDragging] = useState(false);
  const [history,   setHistory]   = useState(getHistory());
  const [trendData, setTrendData] = useState([]);
  const [delta,     setDelta]     = useState(null);
  const [showAbout, setShowAbout] = useState(false);

  const fileRef = useRef();

  // ── Load report from file ────────────────────────────────────────────────
  const loadFile = (file) => {
    if (!file || !file.name.endsWith(".json")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data   = JSON.parse(e.target.result);
        const parsed = parseReport(data);
        setReport(parsed);

        // ── Save to history ──────────────────────────────────────────────
        const newHistory = saveToHistory(data);
        setHistory(newHistory);
        setTrendData(getTrendData(newHistory, data.meta.model_name));
        setDelta(getScoreDelta(
          newHistory,
          data.meta.model_name,
          data.overall.score
        ));
      } catch {
        alert("Invalid JSON file. Please use a BIM Health report.");
      }
    };
    reader.readAsText(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    loadFile(e.dataTransfer.files[0]);
  };

  // ── No report loaded — show drop zone ────────────────────────────────────
  if (!report) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center p-8 font-sans">
        <div className="w-full max-w-120">

          {/* Header */}
          <div className="text-center mb-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-[18px] flex items-center justify-center mx-auto mb-5"
                style={{
                  background: "linear-gradient(135deg, #4F6CF7, #7C3AED)",
                  boxShadow: "0 0 32px #4F6CF740"
                }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <h1 className="text-[26px] font-bold text-white mb-2 tracking-tight">
              BIM Health Toolkit
            </h1>
            {/* About button */}
            <button
              onClick={() => setShowAbout(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                        font-medium transition-all duration-200 cursor-pointer
                        hover:text-white mb-3"
              style={{
                background: "#1A1D2E",
                border: "1px solid #2A2D3E",
                color: "#9CA3AF",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#1E2235";
                e.currentTarget.style.borderColor = "#4F6CF740";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#1A1D2E";
                e.currentTarget.style.borderColor = "#2A2D3E";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              About the app
            </button>
            <p className="text-sm text-gray-500 leading-relaxed">
              Scan your Revit models for warnings, bloat,<br/>
              and parameter completeness — instantly.
            </p>
          </div>

          {/* Drop Zone */}
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileRef.current.click()}
            className={`
              border-[1.5px] border-dashed rounded-[20px] p-12
              text-center cursor-pointer transition-all duration-200
              ${dragging
                ? "border-[#4F6CF760] bg-[#1E2235]"
                : "border-[#2A2D3E] bg-[#1A1D2E] hover:border-[#4F6CF760] hover:bg-[#1E2235]"
              }
            `}
          >
            <div className="w-13 h-13 bg-[#1E2130] border border-[#2A2D3E] rounded-[14px] flex items-center justify-center
                            mx-auto mb-5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="#4F6CF7" strokeWidth="1.8" strokeLinecap="round"
                  strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>

            <p className="text-[15px] font-semibold text-[#E0E0E0] mb-1.5">
              Drop your JSON report here
            </p>
            <p className="text-[13px] text-gray-600 mb-6">
              or click to browse files
            </p>

            <div className="inline-flex items-center gap-2 bg-[#4F6CF715] border border-[#4F6CF730] rounded-[10px] px-4 py-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#4F6CF7" strokeWidth="2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span className="text-xs text-[#4F6CF7] font-medium">
                .json files only
              </span>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => loadFile(e.target.files[0])}
            />
          </div>

          {/* Feature pills */}
          <div className="grid grid-cols-3 gap-2.5 mt-5">
            {[
              { color: "#EF4444", label: "Warnings",   sub: "Critical & moderate",
                icon: <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/> },
              { color: "#F59E0B", label: "File Bloat", sub: "Families & imports",
                icon: <rect x="2" y="3" width="20" height="14" rx="2"/> },
              { color: "#10B981", label: "Parameters", sub: "Data completeness",
                icon: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></> },
            ].map(({ color, label, sub, icon }) => (
              <div key={label}
                  className="bg-[#1A1D2E] border border-[#1E2130]
                              rounded-xl p-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
                    style={{ background: color + "15" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke={color} strokeWidth="2" strokeLinecap="round">
                    {icon}
                  </svg>
                </div>
                <p className="text-xs font-semibold text-[#E0E0E0] mb-0.5">
                  {label}
                </p>
                <p className="text-[11px] text-gray-600">{sub}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-[11px] text-gray-700 mt-5">
            Reports are processed locally — no data leaves your machine
          </p>

        </div>
        {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      </div>
    );
  }

  // ── Report loaded — show dashboard ────────────────────────────────────────
  const { meta, overall, scores, recommendations } = report;
  const w = scores.warnings.breakdown;
  const b = scores.bloat.breakdown;
  const p = scores.parameters.breakdown;

  return (
    <div id="dashboard-root" className="min-h-screen bg-[#0F1117] p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Header meta={meta} />
          <div className="flex items-center gap-3 ml-4">
            <button
              onClick={() => setReport(null)}
              className="px-4 py-2 bg-[#1A1D2E] hover:bg-[#2A2D3E] text-gray-400 text-sm rounded-xl transition-colors
                         cursor-pointer"
            >
              Load New Report
            </button>
            <ExportButton report={report} />
          </div>
        </div>

        {/* Overall score hero */}
        <div className="bg-[#1A1D2E] rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-gray-400 text-sm mb-1">Overall BIM Health Score</p>
            <p className="text-gray-500 text-xs">
              Based on warnings, file bloat and parameter completeness
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="bg-[#1E2130] rounded-xl px-4 py-2">
                <p className="text-xs text-gray-500">Model</p>
                <p className="text-sm font-semibold text-white">
                  {meta.model_name}
                </p>
              </div>
              <div className="bg-[#1E2130] rounded-xl px-4 py-2">
                <p className="text-xs text-gray-500">Issues Found</p>
                <p className="text-sm font-semibold text-white">
                  {recommendations.length} items
                </p>
              </div>
              <div className="bg-[#1E2130] rounded-xl px-4 py-2">
                <p className="text-xs text-gray-500">Elements Checked</p>
                <p className="text-sm font-semibold text-white">
                  {p.total_checked || 0}
                </p>
              </div>
            </div>
          </div>
          <ScoreRing
            score={overall.score}
            grade={overall.grade}
            status={overall.status}
          />
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ScoreCard
            label="Warnings"
            icon="⚠️"
            score={scores.warnings.score}
            weight={scores.warnings.weight}
            details={[
              { label: "Critical", value: w.critical },
              { label: "Moderate", value: w.moderate },
              { label: "Low",      value: w.low       },
              { label: "Total",    value: w.total_warnings },
            ]}
          />
          <ScoreCard
            label="File Bloat"
            icon="🧱"
            score={scores.bloat.score}
            weight={scores.bloat.weight}
            details={[
              { label: "Families",   value: b.total_families   },
              { label: "CAD Imports",value: b.cad_imports      },
              { label: "In-Place",   value: b.inplace_families },
              { label: "Views",      value: b.total_views      },
            ]}
          />
          <ScoreCard
            label="Parameters"
            icon="🏷️"
            score={scores.parameters.score}
            weight={scores.parameters.weight}
            details={[
              { label: "Checked",    value: p.total_checked    },
              { label: "Complete",   value: p.total_complete   },
              { label: "Incomplete", value: p.total_incomplete },
              { label: "Score",      value: p.completeness_pct + "%" },
            ]}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <BreakdownChart scores={scores} />
          <WarningsPieChart breakdown={w} />
        </div>

        {/* Recommendations */}
        <RecommendationsList recommendations={recommendations} />
        {/* Report History */}
        <ReportHistory
          history={history}
          trendData={trendData}
          currentModelName={report?.meta?.model_name}
          delta={delta}
          onSelectReport={(id) => {
            // Highlight selected — future enhancement
            console.log("Selected report:", id);
          }}
          onHistoryCleared={() => {
            setHistory([]);
            setTrendData([]);
            setDelta(null);
          }}
        />

      </div>
    </div>
  );
}