import {
  PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

export default function WarningsPieChart({ breakdown }) {
  const data = [
    { name: "Critical", value: breakdown.critical, color: "#EF4444" },
    { name: "Moderate", value: breakdown.moderate, color: "#F59E0B" },
    { name: "Low",      value: breakdown.low,      color: "#10B981" },
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1E2130] border border-[#2A2D3E] rounded-xl p-3 text-sm">
          <p style={{ color: payload[0].payload.color }}
             className="font-semibold">
            {payload[0].name}
          </p>
          <p className="text-white">{payload[0].value} warnings</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="bg-[#1A1D2E] rounded-2xl p-5 flex flex-col
                      items-center justify-center h-full min-h-[220px]">
        <span className="text-4xl mb-3">✅</span>
        <p className="text-green-400 font-semibold">No Warnings</p>
        <p className="text-gray-500 text-sm mt-1">Model is clean</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1D2E] rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">
        Warnings Distribution
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.color}
                style={{ filter: `drop-shadow(0 0 4px ${entry.color}60)` }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: "#9CA3AF", fontSize: 12 }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}