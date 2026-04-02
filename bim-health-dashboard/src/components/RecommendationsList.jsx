import { useState } from "react";
import { getPriorityColor } from "../utils/reportLoader";

// ── Detail drawer components ───────────────────────────────────────────────

function WarningsDetail({ items }) {
  if (!items || items.length === 0) return (
    <p className="text-xs text-gray-500 italic">No detail available.</p>
  );

  return (
    <div className="flex flex-col gap-2">
      {items.map((w, i) => (
        <div key={i}
             className="bg-[#0F1117] rounded-xl p-3 border
                        border-[#2A2D3E]">
          <p className="text-xs text-gray-300 leading-relaxed mb-2">
            {w.description}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-gray-500">
              Affects {w.element_count} element(s)
            </span>
            {w.element_ids && w.element_ids.slice(0, 6).map((id, j) => (
              <span key={j}
                    className="text-[10px] bg-[#1E2130] text-gray-400
                               px-2 py-0.5 rounded-md font-mono">
                #{id}
              </span>
            ))}
            {w.element_ids && w.element_ids.length > 6 && (
              <span className="text-[10px] text-gray-500 italic">
                +{w.element_ids.length - 6} more
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function FamiliesDetail({ items }) {
  if (!items || items.length === 0) return (
    <p className="text-xs text-gray-500 italic">No families found.</p>
  );

  return (
    <div className="flex flex-col gap-2">
      {items.map((f, i) => (
        <div key={i}
             className="flex items-center gap-3 bg-[#0F1117]
                        rounded-xl px-3 py-2.5 border border-[#2A2D3E]">
          <div className="w-6 h-6 rounded-md bg-[#F59E0B15] flex
                          items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
          </div>
          <span className="text-xs text-gray-300 font-medium">
            {f.name || "Unnamed Family"}
          </span>
        </div>
      ))}
    </div>
  );
}

function ParametersDetail({ items }) {
  if (!items || items.length === 0) return (
    <p className="text-xs text-gray-500 italic">No elements found.</p>
  );

  // Group by category
  const grouped = items.reduce((acc, el) => {
    const cat = el.category || "Unknown";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(el);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-3">
      {Object.entries(grouped).map(([category, elements]) => (
        <div key={category}>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider
                        font-semibold mb-1.5">
            {category} ({elements.length})
          </p>
          <div className="flex flex-col gap-1.5">
            {elements.slice(0, 8).map((el, i) => (
              <div key={i}
                   className="flex items-center justify-between
                              bg-[#0F1117] rounded-lg px-3 py-2
                              border border-[#2A2D3E]">
                <span className="text-xs text-gray-300">
                  {el.type || "Unknown Type"}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  #{el.id}
                </span>
              </div>
            ))}
            {elements.length > 8 && (
              <p className="text-[10px] text-gray-500 italic px-1">
                +{elements.length - 8} more elements...
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CadDetail({ items }) {
  if (!items || items.length === 0) return (
    <p className="text-xs text-gray-500 italic">No CAD files found.</p>
  );

  return (
    <div className="flex flex-col gap-2">
      {items.map((c, i) => (
        <div key={i}
             className="flex items-center gap-3 bg-[#0F1117]
                        rounded-xl px-3 py-2.5 border border-[#2A2D3E]">
          <div className="w-6 h-6 rounded-md bg-[#EF444415] flex
                          items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0
                       002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <span className="text-xs text-gray-300 font-medium">
            {c.name || "Unknown CAD File"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Detail router ──────────────────────────────────────────────────────────
function DetailDrawer({ detailType, detail }) {
  if (!detail || detail.length === 0 || detailType === "none") return (
    <p className="text-xs text-gray-500 italic pt-1">
      No additional detail available.
    </p>
  );

  switch (detailType) {
    case "warnings":    return <WarningsDetail    items={detail} />;
    case "families":    return <FamiliesDetail    items={detail} />;
    case "parameters":  return <ParametersDetail  items={detail} />;
    case "cad":         return <CadDetail         items={detail} />;
    default:            return null;
  }
}

// ── Single recommendation card ─────────────────────────────────────────────
function RecCard({ rec }) {
  const [open, setOpen]   = useState(false);
  const colors            = getPriorityColor(rec.priority);
  const hasDetail         = rec.detail && rec.detail.length > 0
                            && rec.detail_type !== "none";

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* ── Card header ─────────────────────────────────────────────────── */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">

            {/* Priority + category badges */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[10px] font-semibold px-2 py-0.5
                           rounded-full uppercase tracking-wide"
                style={{
                  backgroundColor: colors.text + "25",
                  color: colors.text,
                }}
              >
                {rec.priority}
              </span>
              <span className="text-[10px] text-gray-500 font-medium">
                {rec.category}
              </span>
            </div>

            {/* Action text */}
            <p className="text-sm text-gray-200 leading-relaxed">
              {rec.action}
            </p>

          </div>

          {/* Expand toggle — only show if detail exists */}
          {hasDetail && (
            <button
              onClick={() => setOpen(!open)}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center
                         justify-center transition-all duration-200 mt-0.5
                         cursor-pointer"
              style={{
                backgroundColor: colors.text + "15",
                border: `1px solid ${colors.text}30`,
              }}
              title={open ? "Hide details" : "Show details"}
            >
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke={colors.text} strokeWidth="2.5" strokeLinecap="round"
                style={{
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          )}
        </div>

        {/* Detail count badge */}
        {hasDetail && (
          <button
            onClick={() => setOpen(!open)}
            className="mt-2 flex items-center gap-1.5 cursor-pointer
                       group"
          >
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full
                         transition-opacity"
              style={{
                backgroundColor: colors.text + "15",
                color: colors.text,
              }}
            >
              {rec.detail.length} item{rec.detail.length !== 1 ? "s" : ""}
              — {open ? "hide" : "view"} details
            </span>
          </button>
        )}
      </div>

      {/* ── Expandable drawer ────────────────────────────────────────────── */}
      {open && hasDetail && (
        <div
          className="px-4 pb-4 pt-1 border-t"
          style={{ borderColor: colors.text + "20" }}
        >
          <DetailDrawer
            detailType={rec.detail_type}
            detail={rec.detail}
          />
        </div>
      )}

    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export default function RecommendationsList({ recommendations }) {

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-[#1A1D2E] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">
          Recommendations
        </h3>
        <div className="flex flex-col items-center py-6">
          <span className="text-4xl mb-3">🏆</span>
          <p className="text-green-400 font-semibold">All clear!</p>
          <p className="text-gray-500 text-sm mt-1">
            No issues found in this model
          </p>
        </div>
      </div>
    );
  }

  // ── Group by priority ────────────────────────────────────────────────────
  const high   = recommendations.filter(r => r.priority === "High");
  const medium = recommendations.filter(r => r.priority === "Medium");
  const low    = recommendations.filter(r => r.priority === "Low");

  const Section = ({ label, color, items }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color }}
          >
            {label}
          </span>
          <span className="text-xs text-gray-600">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {items.map((rec, i) => (
            <RecCard key={i} rec={rec} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#1A1D2E] rounded-2xl p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-300">
          Recommendations
        </h3>
        <span className="text-xs bg-[#1E2130] text-gray-400
                         px-2 py-1 rounded-full">
          {recommendations.length} total
        </span>
      </div>

      {/* Grouped sections */}
      <Section label="High Priority"   color="#EF4444" items={high}   />
      <Section label="Medium Priority" color="#F59E0B" items={medium} />
      <Section label="Low Priority"    color="#10B981" items={low}    />

    </div>
  );
}