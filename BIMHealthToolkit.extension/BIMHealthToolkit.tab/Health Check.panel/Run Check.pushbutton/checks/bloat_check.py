# -*- coding: utf-8 -*-

# bloat_check.py
# Detects file bloat sources in the Revit model

import clr
clr.AddReference("RevitAPI")
from Autodesk.Revit.DB import (
    FilteredElementCollector,
    Family,
    ImportInstance,
    FamilyInstance,
    View,
    ElementId,
    BuiltInCategory,
    FamilySymbol,
)


def run_bloat_check(doc):
    """
    Scans the model for bloat sources.
    Returns a dictionary with all bloat data.
    """
    results = {}

    # 1. Total Families loaded
    all_families = (
        FilteredElementCollector(doc)
        .OfClass(Family)
        .ToElements()
    )
    results["total_families"] = len(all_families)

    #2. In-place families (performance killers)
    inplace_families = [f for f in all_families if f.IsInPlace]
    results["inplace_families"] = len(inplace_families)
    results["inplace_family_names"] = [
        f.Name for f in inplace_families
    ]

    # 3. Imported CAD files
    cad_imports = (
        FilteredElementCollector(doc)
        .OfClass(ImportInstance)
        .ToElements()
    )
    results["cad_imports"] = len(cad_imports)
    results["cad_import_names"] = []
    for cad in cad_imports:
        try:
            results["cad_import_names"].append(
                cad.Category.Name if cad.Category else "Unknown"
            )
        except:
            results["cad_import_names"].append("Unknown")

    # ── 4. Total elements in model ─────────────────────────────────────────
    all_elements = (
        FilteredElementCollector(doc)
        .WhereElementIsNotElementType()
        .ToElements()
    )
    results["total_elements"] = len(all_elements)

    # 5. Total views (unused views bloat models)
    all_views = (
        FilteredElementCollector(doc)
        .OfClass(View)
        .ToElements()
    )
    # Filter out template views
    real_views = [v for v in all_views if not v.IsTemplate]
    results["total_views"] = len(real_views)

    # 6. Family Symbols (types)
    all_symbols = (
        FilteredElementCollector(doc)
        .OfClass(FamilySymbol)
        .ToElements()
    )
    results["total_family_types"] = len(all_symbols)

    # 7. Bloat Flags (things that are clearly problematic)
    flags = []

    if results["total_families"] > 200:
        flags.append("Too many families loaded (>{})".format(
            results["total_families"]
        ))

    if results["inplace_families"] > 0:
        flags.append("{} in-place family(ies) detected — bad for performance".format(
            results["inplace_families"]
        ))

    if results["cad_imports"] > 0:
        flags.append("{} CAD import(s) detected — should be linked, not imported".format(
            results["cad_imports"]
        ))

    if results["total_views"] > 100:
        flags.append("Too many views ({}) — consider cleaning up unused views".format(
            results["total_views"]
        ))

    if results["total_family_types"] > 500:
        flags.append("Too many family types ({}) — consider purging unused types".format(
            results["total_family_types"]
        ))

    results["flags"] = flags
    results["flag_count"] = len(flags)

    return results