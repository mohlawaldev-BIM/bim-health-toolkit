import { getScoreColor } from "../utils/reportLoader";

export default function ScoreCard({ label, icon, score, weight, details }) {
  const color    = getScoreColor(score);
  const barWidth = `${score}%`;

  return (
    <div className="bg-[#1A1D2E] rounded-2xl p-5 flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-medium text-gray-300">{label}</span>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            backgroundColor: color + "20",
            color
          }}
        >
          {weight}% weight
        </span>
      </div>

      {/* Score number */}
      <div className="flex items-end gap-1">
        <span
          className="text-3xl font-bold"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-gray-500 text-sm mb-1">/100</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-[#1E2130] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: barWidth,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}60`
          }}
        />
      </div>

      {/* Details */}
      {details && (
        <div className="grid grid-cols-2 gap-2 mt-1">
          {details.map((d, i) => (
            <div key={i} className="bg-[#1E2130] rounded-lg px-3 py-2">
              <div className="text-xs text-gray-500">{d.label}</div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {d.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}