# -*- coding: utf-8 -*-

# parameter_check.py
# Checks model elements for missing required parameters

import clr
clr.AddReference("RevitAPI")
from Autodesk.Revit.DB import (
    FilteredElementCollector,
    BuiltInCategory,
    BuiltInParameter,
    FamilyInstance,
    ElementId,
    StorageType,
)

# ── Categories we care about checking ─────────────────────────────────────
# These are the most common BIM elements that need complete data
TARGET_CATEGORIES = [
    BuiltInCategory.OST_Walls,
    BuiltInCategory.OST_Floors,
    BuiltInCategory.OST_Roofs,
    BuiltInCategory.OST_Doors,
    BuiltInCategory.OST_Windows,
    BuiltInCategory.OST_Columns,
    BuiltInCategory.OST_StructuralColumns,
    BuiltInCategory.OST_Furniture,
    BuiltInCategory.OST_MechanicalEquipment,
    BuiltInCategory.OST_ElectricalEquipment,
    BuiltInCategory.OST_PlumbingFixtures,
]

# ── Required built-in parameters every element should have ────────────────
REQUIRED_BUILTIN_PARAMS = [
    (BuiltInParameter.ALL_MODEL_MARK,        "Mark"),
    (BuiltInParameter.ALL_MODEL_DESCRIPTION, "Description"),
    (BuiltInParameter.ALL_MODEL_TYPE_COMMENTS,"Type Comments"),
]

# ── Required custom parameter names (shared/project parameters) ───────────
# These are the names your company requires on every element
# You can edit this list to match your company standards
REQUIRED_CUSTOM_PARAMS = [
    "UniClass Code",
    "UniClass Description",
    "COBie.Type.Category",
    "Manufacturer",
    "Model",
]


def get_param_value(element, param):
    """
    Safely get a parameter value from an element.
    Returns the value as string, or None if missing/empty.
    """
    try:
        if param is None:
            return None
        if not param.HasValue:
            return None

        storage = param.StorageType

        if storage == StorageType.String:
            val = param.AsString()
            return val if val and val.strip() != "" else None

        elif storage == StorageType.Integer:
            return str(param.AsInteger())

        elif storage == StorageType.Double:
            return str(param.AsDouble())

        elif storage == StorageType.ElementId:
            eid = param.AsElementId()
            if eid == ElementId.InvalidElementId:
                return None
            return str(eid.IntegerValue)

        return None
    except:
        return None


def check_element(element):
    """
    Check a single element for missing required parameters.
    Returns a dict with element info and list of missing params.
    """
    missing = []

    # ── Check built-in parameters ──────────────────────────────────────────
    for bip, name in REQUIRED_BUILTIN_PARAMS:
        try:
            param = element.get_Parameter(bip)
            value = get_param_value(element, param)
            if value is None:
                missing.append(name)
        except:
            missing.append(name + " (error)")

    # ── Check custom parameters ────────────────────────────────────────────
    for param_name in REQUIRED_CUSTOM_PARAMS:
        try:
            param = element.LookupParameter(param_name)
            if param is None:
                # Parameter doesn't exist on this element — skip silently
                # (not all elements have all custom params)
                continue
            value = get_param_value(element, param)
            if value is None:
                missing.append(param_name)
        except:
            pass

    # ── Get element name/category for reporting ────────────────────────────
    try:
        category_name = element.Category.Name
    except:
        category_name = "Unknown"

    try:
        element_id = element.Id.IntegerValue
    except:
        element_id = -1

    try:
        type_name = element.Name
    except:
        type_name = "Unknown"

    return {
        "id":            element_id,
        "category":      category_name,
        "type_name":     type_name,
        "missing_params": missing,
        "missing_count":  len(missing),
        "is_complete":    len(missing) == 0,
    }


def run_parameter_check(doc):
    """
    Main function. Checks all target category elements
    for missing required parameters.
    Returns a full results dictionary.
    """
    results = {
        "total_checked":    0,
        "total_complete":   0,
        "total_incomplete": 0,
        "elements":         [],
        "by_category":      {},
        "missing_summary":  {},
    }

    for category in TARGET_CATEGORIES:
        try:
            elements = (
                FilteredElementCollector(doc)
                .OfCategory(category)
                .WhereElementIsNotElementType()
                .ToElements()
            )
        except:
            continue

        for element in elements:
            result = check_element(element)
            results["elements"].append(result)
            results["total_checked"] += 1

            # ── Track by category ──────────────────────────────────────────
            cat = result["category"]
            if cat not in results["by_category"]:
                results["by_category"][cat] = {
                    "total":      0,
                    "complete":   0,
                    "incomplete": 0,
                }
            results["by_category"][cat]["total"] += 1

            if result["is_complete"]:
                results["total_complete"] += 1
                results["by_category"][cat]["complete"] += 1
            else:
                results["total_incomplete"] += 1
                results["by_category"][cat]["incomplete"] += 1

            # ── Track which params are most commonly missing ───────────────
            for param_name in result["missing_params"]:
                if param_name not in results["missing_summary"]:
                    results["missing_summary"][param_name] = 0
                results["missing_summary"][param_name] += 1

    # ── Calculate completeness percentage ─────────────────────────────────
    if results["total_checked"] > 0:
        results["completeness_pct"] = round(
            (results["total_complete"] / float(results["total_checked"])) * 100, 1
        )
    else:
        results["completeness_pct"] = 100.0

    return results