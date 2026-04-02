# -*- coding: utf-8 -*-
# Calculates BIM Health Scores from all check results

import json
import os
from datetime import datetime


# ── Scoring weights (must add up to 100) ──────────────────────────────────
WEIGHTS = {
    "warnings":  35,
    "bloat":     30,
    "parameter": 35,
}


def calculate_warnings_score(warnings_results):
    """
    Score based on total warnings and severity.
    Fewer warnings = higher score.

    Penalty system:
    - Each Critical warning = -5 points
    - Each Moderate warning = -2 points
    - Each Low warning      = -0.5 points
    Starting score: 100
    Floor: 0
    """
    score = 100.0

    score -= warnings_results["critical_count"] * 5.0
    score -= warnings_results["moderate_count"] * 2.0
    score -= warnings_results["low_count"]      * 0.5

    # Clamp between 0 and 100
    score = max(0.0, min(100.0, score))

    # Build breakdown
    breakdown = {
        "score":          round(score, 1),
        "total_warnings": warnings_results["total"],
        "critical":       warnings_results["critical_count"],
        "moderate":       warnings_results["moderate_count"],
        "low":            warnings_results["low_count"],
        "penalties": {
            "critical": warnings_results["critical_count"] * 5.0,
            "moderate": warnings_results["moderate_count"] * 2.0,
            "low":      warnings_results["low_count"]      * 0.5,
        }
    }

    return score, breakdown


def calculate_bloat_score(bloat_results):
    """
    Score based on file bloat indicators.
    Cleaner model = higher score.

    Penalty system:
    - Each bloat flag        = -15 points
    - Each in-place family   = -5  points
    - Each CAD import        = -8  points
    Starting score: 100
    Floor: 0
    """
    score = 100.0

    score -= bloat_results["flag_count"]       * 15.0
    score -= bloat_results["inplace_families"] * 5.0
    score -= bloat_results["cad_imports"]      * 8.0

    score = max(0.0, min(100.0, score))

    breakdown = {
        "score":            round(score, 1),
        "total_families":   bloat_results["total_families"],
        "inplace_families": bloat_results["inplace_families"],
        "cad_imports":      bloat_results["cad_imports"],
        "total_elements":   bloat_results["total_elements"],
        "total_views":      bloat_results["total_views"],
        "total_types":      bloat_results["total_family_types"],
        "flags":            bloat_results["flags"],
        "penalties": {
            "flags":          bloat_results["flag_count"]       * 15.0,
            "inplace":        bloat_results["inplace_families"] * 5.0,
            "cad_imports":    bloat_results["cad_imports"]      * 8.0,
        }
    }

    return score, breakdown


def calculate_parameter_score(parameter_results):
    """
    Score based on parameter completeness percentage.
    Directly maps completeness % to score.
    Example: 78% complete = 78/100
    """
    score = parameter_results["completeness_pct"]
    score = max(0.0, min(100.0, score))

    breakdown = {
        "score":            round(score, 1),
        "total_checked":    parameter_results["total_checked"],
        "total_complete":   parameter_results["total_complete"],
        "total_incomplete": parameter_results["total_incomplete"],
        "completeness_pct": parameter_results["completeness_pct"],
        "missing_summary":  parameter_results["missing_summary"],
        "by_category":      parameter_results["by_category"],
    }

    return score, breakdown


def calculate_overall_score(w_score, b_score, p_score):
    """
    Combines the 3 sub-scores using weights.
    """
    overall = (
        (w_score * WEIGHTS["warnings"]  / 100.0) +
        (b_score * WEIGHTS["bloat"]     / 100.0) +
        (p_score * WEIGHTS["parameter"] / 100.0)
    )
    return round(overall, 1)


def get_grade(score):
    """
    Converts a numeric score to a letter grade + status label.
    """
    if score >= 90:
        return "A", "Excellent"
    elif score >= 75:
        return "B", "Good"
    elif score >= 60:
        return "C", "Needs Improvement"
    elif score >= 40:
        return "D", "Poor"
    else:
        return "F", "Critical"


def get_recommendations(w_breakdown, b_breakdown, p_breakdown):
    """
    Generates a prioritized list of fix recommendations
    based on what the checks found.
    """
    recommendations = []

    # ── Warnings recommendations ───────────────────────────────────────────
    if w_breakdown["critical"] > 0:
        recommendations.append({
            "priority": "High",
            "category": "Warnings",
            "action":   "Fix {} critical warning(s) immediately — "
                        "these affect model integrity".format(
                            w_breakdown["critical"]
                        ),
        })

    if w_breakdown["moderate"] > 0:
        recommendations.append({
            "priority": "Medium",
            "category": "Warnings",
            "action":   "Resolve {} moderate warning(s) before "
                        "issuing the model".format(
                            w_breakdown["moderate"]
                        ),
        })

    if w_breakdown["low"] > 10:
        recommendations.append({
            "priority": "Low",
            "category": "Warnings",
            "action":   "Clean up {} low-priority warning(s) "
                        "to keep the model tidy".format(
                            w_breakdown["low"]
                        ),
        })

    # ── Bloat recommendations ──────────────────────────────────────────────
    if b_breakdown["cad_imports"] > 0:
        recommendations.append({
            "priority": "High",
            "category": "File Bloat",
            "action":   "Remove {} imported CAD file(s) — "
                        "use linked CAD instead".format(
                            b_breakdown["cad_imports"]
                        ),
        })

    if b_breakdown["inplace_families"] > 0:
        recommendations.append({
            "priority": "High",
            "category": "File Bloat",
            "action":   "Replace {} in-place family(ies) with "
                        "loadable families".format(
                            b_breakdown["inplace_families"]
                        ),
        })

    if b_breakdown["total_families"] > 200:
        recommendations.append({
            "priority": "Medium",
            "category": "File Bloat",
            "action":   "Run 'Purge Unused' to reduce family "
                        "count (currently {})".format(
                            b_breakdown["total_families"]
                        ),
        })

    if b_breakdown["total_views"] > 100:
        recommendations.append({
            "priority": "Medium",
            "category": "File Bloat",
            "action":   "Delete unused views — currently {} views "
                        "in the model".format(
                            b_breakdown["total_views"]
                        ),
        })

    # ── Parameter recommendations ──────────────────────────────────────────
    if p_breakdown["total_incomplete"] > 0:
        # Find the most commonly missing parameter
        if p_breakdown["missing_summary"]:
            top_missing = max(
                p_breakdown["missing_summary"],
                key=lambda k: p_breakdown["missing_summary"][k]
            )
            recommendations.append({
                "priority": "Medium",
                "category": "Parameters",
                "action":   "Fill in '{}' parameter — missing on "
                            "{} element(s)".format(
                                top_missing,
                                p_breakdown["missing_summary"][top_missing]
                            ),
            })

        recommendations.append({
            "priority": "Medium",
            "category": "Parameters",
            "action":   "Complete data for {} incomplete "
                        "element(s)".format(
                            p_breakdown["total_incomplete"]
                        ),
        })

    # Sort by priority: High first, then Medium, then Low
    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    recommendations.sort(
        key=lambda x: priority_order.get(x["priority"], 3)
    )

    return recommendations


# score_calculator.py  — replace the full generate_report function

def generate_report(doc, warnings_results, bloat_results, parameter_results):

    w_score, w_breakdown = calculate_warnings_score(warnings_results)
    b_score, b_breakdown = calculate_bloat_score(bloat_results)
    p_score, p_breakdown = calculate_parameter_score(parameter_results)

    overall = calculate_overall_score(w_score, b_score, p_score)
    grade, status = get_grade(overall)

    recommendations = get_recommendations(
        w_breakdown, b_breakdown, p_breakdown
    )

    try:
        model_name = doc.Title
    except:
        model_name = "Unknown Model"

    try:
        model_path = doc.PathName
    except:
        model_path = "Not saved"

    # ── Build enriched detail blocks ───────────────────────────────────────

    # Critical warnings — full list
    critical_warnings_detail = []
    for w in warnings_results["critical"]:
        critical_warnings_detail.append({
            "description": w["description"],
            "element_ids": w["element_ids"],
            "element_count": w["element_count"],
        })

    # Moderate warnings — full list
    moderate_warnings_detail = []
    for w in warnings_results["moderate"]:
        moderate_warnings_detail.append({
            "description": w["description"],
            "element_ids": w["element_ids"],
            "element_count": w["element_count"],
        })

    # Low warnings — full list
    low_warnings_detail = []
    for w in warnings_results["low"]:
        low_warnings_detail.append({
            "description": w["description"],
            "element_ids": w["element_ids"],
            "element_count": w["element_count"],
        })

    # In-place family names
    inplace_family_names = bloat_results.get("inplace_family_names", [])

    # CAD import names
    cad_import_names = bloat_results.get("cad_import_names", [])

    # Missing parameter detail — which elements are missing what
    missing_param_detail = {}
    for element in parameter_results["elements"]:
        if not element["is_complete"]:
            for param in element["missing_params"]:
                if param not in missing_param_detail:
                    missing_param_detail[param] = []
                missing_param_detail[param].append({
                    "id":       element["id"],
                    "category": element["category"],
                    "type":     element["type_name"],
                })

    # ── Attach detail to matching recommendations ──────────────────────────
    for rec in recommendations:
        cat      = rec["category"]
        priority = rec["priority"]
        action   = rec["action"]

        if cat == "Warnings" and priority == "High":
            rec["detail"] = critical_warnings_detail
            rec["detail_type"] = "warnings"

        elif cat == "Warnings" and priority == "Medium":
            rec["detail"] = moderate_warnings_detail
            rec["detail_type"] = "warnings"

        elif cat == "Warnings" and priority == "Low":
            rec["detail"] = low_warnings_detail
            rec["detail_type"] = "warnings"

        elif cat == "File Bloat" and "in-place" in action.lower():
            rec["detail"] = [{"name": n} for n in inplace_family_names]
            rec["detail_type"] = "families"

        elif cat == "File Bloat" and "cad" in action.lower():
            rec["detail"] = [{"name": n} for n in cad_import_names]
            rec["detail_type"] = "cad"

        elif cat == "Parameters" and "fill in" in action.lower():
            # Find which param this rec is about
            for param_name, elements in missing_param_detail.items():
                if param_name.lower() in action.lower():
                    rec["detail"] = elements[:50]  # cap at 50 for performance
                    rec["detail_type"] = "parameters"
                    break

        else:
            rec["detail"] = []
            rec["detail_type"] = "none"

    # ── Build final report ─────────────────────────────────────────────────
    report = {
        "meta": {
            "model_name":     model_name,
            "model_path":     model_path,
            "generated_at":   datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "generated_date": datetime.now().strftime("%Y-%m-%d"),
            "tool_version":   "1.0.0",
        },
        "overall": {
            "score":  overall,
            "grade":  grade,
            "status": status,
            "weights": WEIGHTS,
        },
        "scores": {
            "warnings": {
                "score":     w_breakdown["score"],
                "weight":    WEIGHTS["warnings"],
                "weighted":  round(w_score * WEIGHTS["warnings"] / 100.0, 1),
                "breakdown": w_breakdown,
            },
            "bloat": {
                "score":     b_breakdown["score"],
                "weight":    WEIGHTS["bloat"],
                "weighted":  round(b_score * WEIGHTS["bloat"] / 100.0, 1),
                "breakdown": b_breakdown,
            },
            "parameters": {
                "score":     p_breakdown["score"],
                "weight":    WEIGHTS["parameter"],
                "weighted":  round(p_score * WEIGHTS["parameter"] / 100.0, 1),
                "breakdown": p_breakdown,
            },
        },
        "recommendations": recommendations,
    }

    # ── Save JSON ──────────────────────────────────────────────────────────
    desktop   = os.path.join(os.path.expanduser("~"), "Desktop")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_name = model_name.replace(" ", "_").replace(".rvt", "")
    filename  = "BIMHealth_{}_{}.json".format(safe_name, timestamp)
    filepath  = os.path.join(desktop, filename)

    with open(filepath, "w") as f:
        json.dump(report, f, indent=2)

    return report, filepath