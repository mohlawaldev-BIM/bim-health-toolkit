# -*- coding: utf-8 -*-
# Extracts and categorizes all Revit model warnings

# Keywords that make a warning CRITICAL
CRITICAL_KEYWORDS = [
    "duplicate",
    "overlap",
    "not in correct position",
    "identical instances",
    "same location",
    "constraint",
    "sketch",
    "cannot be joined",
    "fails",
    "error",
]

# Keywords that make a warning MODERATE
MODERATE_KEYWORDS = [
    "room",
    "area",
    "unconnected",
    "slightly off",
    "highlighted",
    "not joined",
    "missing",
]

def categorize_warning(description):
    """
    Given a warning description string, returns:
    'Critical', 'Moderate', or 'Low'
    """
    text = description.lower()

    for keyword in CRITICAL_KEYWORDS:
        if keyword in text:
            return "Critical"

    for keyword in MODERATE_KEYWORDS:
        if keyword in text:
            return "Moderate"

    return "Low"


def run_warnings_check(doc):
    """
    Main function. Pass in the Revit document (doc).
    Returns a dictionary with all warning data.
    """
    # Get all warnings from the model
    all_warnings = doc.GetWarnings()

    # Storage for results
    results = {
        "total": 0,
        "critical": [],
        "moderate": [],
        "low": [],
    }

    for warning in all_warnings:
        # Get the warning description text
        description = warning.GetDescriptionText()

        # Get the IDs of elements involved
        failing_ids = [
            eid.IntegerValue 
            for eid in warning.GetFailingElements()
        ]

        # Build a warning entry
        entry = {
            "description": description,
            "element_ids": failing_ids,
            "element_count": len(failing_ids),
        }

        # Categorize and store
        category = categorize_warning(description)

        if category == "Critical":
            results["critical"].append(entry)
        elif category == "Moderate":
            results["moderate"].append(entry)
        else:
            results["low"].append(entry)

    # Set totals
    results["total"] = (
        len(results["critical"]) +
        len(results["moderate"]) +
        len(results["low"])
    )

    results["critical_count"] = len(results["critical"])
    results["moderate_count"] = len(results["moderate"])
    results["low_count"] = len(results["low"])

    return results