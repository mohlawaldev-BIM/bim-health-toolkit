export function parseReport(jsonData) {
  return {
    meta:            jsonData.meta            || {},
    overall:         jsonData.overall         || {},
    scores:          jsonData.scores          || {},
    recommendations: jsonData.recommendations || [],
  };
}

export function getScoreColor(score) {
  if (score >= 75) return "#10B981";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
}

export function getGradeColor(grade) {
  const map = {
    A: "#10B981",
    B: "#3B82F6",
    C: "#F59E0B",
    D: "#F97316",
    F: "#EF4444",
  };
  return map[grade] || "#6B7280";
}

export function getPriorityColor(priority) {
  const map = {
    High:   { bg: "#EF444420", text: "#EF4444", border: "#EF444440" },
    Medium: { bg: "#F59E0B20", text: "#F59E0B", border: "#F59E0B40" },
    Low:    { bg: "#10B98120", text: "#10B981", border: "#10B98140" },
  };
  return map[priority] || { bg: "#6B728020", text: "#6B7280", border: "#6B728040" };
}