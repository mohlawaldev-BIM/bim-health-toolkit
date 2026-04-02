// Manages report history stored in memory (session only)

const HISTORY_KEY = "bim_health_history";

// ── Save a report to history ───────────────────────────────────────────────
export function saveToHistory(report) {
  const history = getHistory();

  const entry = {
    id:           Date.now(),
    model_name:   report.meta.model_name,
    generated_at: report.meta.generated_at,
    generated_date: report.meta.generated_date,
    overall:      report.overall.score,
    grade:        report.overall.grade,
    status:       report.overall.status,
    scores: {
      warnings:   report.scores.warnings.score,
      bloat:      report.scores.bloat.score,
      parameters: report.scores.parameters.score,
    },
    recommendations_count: report.recommendations.length,
  };

  // Avoid exact duplicates (same model + same timestamp)
  const isDuplicate = history.some(
    h => h.model_name   === entry.model_name &&
         h.generated_at === entry.generated_at
  );

  if (!isDuplicate) {
    history.push(entry);
    // Keep last 20 reports only
    const trimmed = history.slice(-20);
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  }

  return getHistory();
}

// ── Get full history ───────────────────────────────────────────────────────
export function getHistory() {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ── Clear history ──────────────────────────────────────────────────────────
export function clearHistory() {
  sessionStorage.removeItem(HISTORY_KEY);
}

// ── Get trend data for a specific model ───────────────────────────────────
export function getTrendData(history, modelName) {
  return history
    .filter(h => h.model_name === modelName)
    .sort((a, b) => new Date(a.generated_at) - new Date(b.generated_at))
    .map(h => ({
      date:       h.generated_date,
      overall:    h.overall,
      warnings:   h.scores.warnings,
      bloat:      h.scores.bloat,
      parameters: h.scores.parameters,
      grade:      h.grade,
    }));
}

// ── Get score delta (change from previous report) ──────────────────────────
export function getScoreDelta(history, modelName, currentScore) {
  const modelHistory = history
    .filter(h => h.model_name === modelName)
    .sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at));

  if (modelHistory.length < 2) return null;

  const previous = modelHistory[1].overall;
  return currentScore - previous;
}