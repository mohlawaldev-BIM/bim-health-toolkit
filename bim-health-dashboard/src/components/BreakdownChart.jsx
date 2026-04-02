import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { getScoreColor } from "../utils/reportLoader";

export default function BreakdownChart({ scores }) {
  const data = [
    { name: "Warnings",   score: scores.warnings.score   },
    { name: "Bloat",      score: scores.bloat.score      },
    { name: "Parameters", score: scores.parameters.score },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="bg-[#1E2130] border border-[#2A2D3E] rounded-xl p-3 text-sm">
          <p className="text-gray-400">{payload[0].payload.name}</p>
          <p className="text-white font-bold text-lg">{val}/100</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#1A1D2E] rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">
        Score Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2130" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#6B7280", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#6B7280", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getScoreColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}