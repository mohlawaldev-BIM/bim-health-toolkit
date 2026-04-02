import { getScoreColor, getGradeColor } from "../utils/reportLoader";

export default function ScoreRing({ score, grade, status }) {
  const radius      = 54;
  const stroke      = 8;
  const circumference = 2 * Math.PI * radius;
  const offset      = circumference - (score / 100) * circumference;
  const color       = getScoreColor(score);
  const gradeColor  = getGradeColor(grade);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          {/* Track */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke="#1E2130"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.4s ease-out",
              filter: `drop-shadow(0 0 6px ${color}60)`
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold"
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-xs text-gray-500 mt-1">out of 100</span>
        </div>
      </div>

      {/* Grade badge */}
      <div
        className="mt-3 px-5 py-1 rounded-full text-sm font-semibold"
        style={{
          backgroundColor: gradeColor + "25",
          color: gradeColor,
          border: `1px solid ${gradeColor}50`
        }}
      >
        Grade {grade} — {status}
      </div>
    </div>
  );
}