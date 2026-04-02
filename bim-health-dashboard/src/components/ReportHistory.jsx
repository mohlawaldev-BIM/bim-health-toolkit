// src/components/ReportHistory.jsx
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import { clearHistory } from "../utils/reportHistory";
import { getScoreColor } from "../utils/reportLoader";

// ── Custom tooltip for the trend chart ────────────────────────────────────
function TrendTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-[#1E2130] border border-[#2A2D3E]
                    rounded-xl p-3 text-xs min-w-35">
      <p className="text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center
                                justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full"
                 style={{ backgroundColor: p.color }}/>
            <span className="text-gray-400">{p.name}</span>
          </div>
          <span className="font-semibold text-white">
            {p.value}/100
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Score delta badge ──────────────────────────────────────────────────────
function DeltaBadge({ delta }) {
  if (delta === null) return null;

  const positive = delta >= 0;
  const color    = positive ? "#10B981" : "#EF4444";
  const arrow    = positive ? "↑" : "↓";

  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full ml-2"
      style={{
        backgroundColor: color + "20",
        color,
      }}
    >
      {arrow} {Math.abs(delta).toFixed(1)} pts
    </span>
  );
}

// ── Single history row ─────────────────────────────────────────────────────
function HistoryRow({ entry, isLatest, onClick }) {
  const color = getScoreColor(entry.overall);

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between
                 rounded-xl px-4 py-3 cursor-pointer
                 transition-all duration-150 group"
      style={{
        backgroundColor: isLatest ? "#4F6CF715" : "#1E2130",
        border: isLatest
          ? "1px solid #4F6CF740"
          : "1px solid transparent",
      }}
    >
      {/* Left — date + model */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center
                     justify-center text-xs font-bold shrink-0"
          style={{
            backgroundColor: color + "20",
            color,
          }}
        >
          {entry.grade}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-200 leading-tight">
            {entry.model_name}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {entry.generated_at}
          </p>
        </div>
      </div>

      {/* Right — score + sub scores */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3">
          {[
            { label: "W", value: entry.scores.warnings,   color: "#EF4444" },
            { label: "B", value: entry.scores.bloat,      color: "#F59E0B" },
            { label: "P", value: entry.scores.parameters, color: "#10B981" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-[10px] text-gray-500">{s.label}</p>
              <p className="text-xs font-semibold"
                 style={{ color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div className="text-right">
          <p
            className="text-lg font-bold"
            style={{ color }}
          >
            {entry.overall}
          </p>
          <p className="text-[10px] text-gray-500">/ 100</p>
        </div>

        {isLatest && (
          <span className="text-[10px] bg-[#4F6CF720] text-[#4F6CF7]
                           border border-[#4F6CF740] px-2 py-0.5
                           rounded-full font-medium">
            Latest
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ReportHistory({
  history,
  trendData,
  currentModelName,
  delta,
  onSelectReport,
  onHistoryCleared,
}) {
  const [activeLines, setActiveLines] = useState({
    overall:    true,
    warnings:   false,
    bloat:      false,
    parameters: false,
  });

  const [showAll, setShowAll] = useState(false);

  if (!history || history.length === 0) return null;

  const displayedHistory = showAll ? history : history.slice(-5);

  const toggleLine = (key) => {
    setActiveLines(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-[#1A1D2E] rounded-2xl p-5 mt-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-300">
            Report History
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {history.length} report{history.length !== 1 ? "s" : ""} this session
          </p>
        </div>
        <button
          onClick={() => {
            clearHistory();
            onHistoryCleared();
          }}
          className="text-xs text-gray-600 hover:text-red-400
                     transition-colors cursor-pointer"
        >
          Clear history
        </button>
      </div>

      {/* ── Trend chart (only show if 2+ reports) ───────────────────────── */}
      {trendData && trendData.length >= 2 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <p className="text-xs text-gray-500 mr-2">
              Trend for: <span className="text-gray-300 font-medium">
                {currentModelName}
              </span>
            </p>

            {/* Line toggles */}
            {[
              { key: "overall",    label: "Overall",    color: "#4F6CF7" },
              { key: "warnings",   label: "Warnings",   color: "#EF4444" },
              { key: "bloat",      label: "Bloat",      color: "#F59E0B" },
              { key: "parameters", label: "Parameters", color: "#10B981" },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => toggleLine(key)}
                className="flex items-center gap-1.5 text-[11px]
                           px-2.5 py-1 rounded-full transition-all
                           cursor-pointer"
                style={{
                  backgroundColor: activeLines[key]
                    ? color + "20" : "#1E2130",
                  color: activeLines[key] ? color : "#4B5563",
                  border: `1px solid ${activeLines[key]
                    ? color + "40" : "transparent"}`,
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: activeLines[key] ? color : "#4B5563"
                  }}
                />
                {label}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2130" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6B7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#6B7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <ReferenceLine
                y={75}
                stroke="#10B98130"
                strokeDasharray="4 4"
                label={{
                  value: "Good",
                  fill: "#10B98160",
                  fontSize: 10,
                  position: "insideRight",
                }}
              />
              <Tooltip content={<TrendTooltip />} />

              {activeLines.overall && (
                <Line
                  type="monotone"
                  dataKey="overall"
                  name="Overall"
                  stroke="#4F6CF7"
                  strokeWidth={2.5}
                  dot={{ fill: "#4F6CF7", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
              {activeLines.warnings && (
                <Line
                  type="monotone"
                  dataKey="warnings"
                  name="Warnings"
                  stroke="#EF4444"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ fill: "#EF4444", r: 3 }}
                />
              )}
              {activeLines.bloat && (
                <Line
                  type="monotone"
                  dataKey="bloat"
                  name="Bloat"
                  stroke="#F59E0B"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ fill: "#F59E0B", r: 3 }}
                />
              )}
              {activeLines.parameters && (
                <Line
                  type="monotone"
                  dataKey="parameters"
                  name="Parameters"
                  stroke="#10B981"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ fill: "#10B981", r: 3 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── History list ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        {[...displayedHistory].reverse().map((entry, i) => (
          <HistoryRow
            key={entry.id}
            entry={entry}
            isLatest={i === 0}
            onClick={() => onSelectReport(entry.id)}
          />
        ))}
      </div>

      {history.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-xs text-gray-500
                     hover:text-gray-300 transition-colors
                     cursor-pointer text-center"
        >
          {showAll
            ? "Show less"
            : "Show all " + history.length + " reports"
          }
        </button>
      )}

    </div>
  );
}