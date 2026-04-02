# -*- coding: utf-8 -*-
# script.py — Phase 3A (WPF UI)
import sys
import os

# ── Path fix ───────────────────────────────────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))
if script_dir not in sys.path:
    sys.path.insert(0, script_dir)

import importlib

# ── Import all modules ─────────────────────────────────────────────────────
warnings_mod  = importlib.import_module("checks.warnings_check")
bloat_mod     = importlib.import_module("checks.bloat_check")
parameter_mod = importlib.import_module("checks.parameter_check")
score_mod     = importlib.import_module("checks.score_calculator")

run_warnings_check  = warnings_mod.run_warnings_check
run_bloat_check     = bloat_mod.run_bloat_check
run_parameter_check = parameter_mod.run_parameter_check
generate_report     = score_mod.generate_report

# ── Revit + pyRevit imports ────────────────────────────────────────────────
from pyrevit import forms, revit, script as pyscript
doc    = revit.doc
output = pyscript.get_output()

# ── WPF imports ────────────────────────────────────────────────────────────
import clr
clr.AddReference("PresentationFramework")
clr.AddReference("PresentationCore")
clr.AddReference("WindowsBase")

from System.Windows       import Window
from System.Windows.Markup import XamlReader
from System.Windows.Controls import TextBlock, Border, StackPanel
from System.Windows.Media  import SolidColorBrush, Color
from System.IO             import StringReader
from System                import Uri
import System.Windows

# ── Run all checks ─────────────────────────────────────────────────────────
output.print_md("# BIM Health Toolkit — Running Checks...")
output.print_md("**[1/4]** Extracting warnings...")
warnings_results = run_warnings_check(doc)

output.print_md("**[2/4]** Detecting file bloat...")
bloat_results = run_bloat_check(doc)

output.print_md("**[3/4]** Checking parameters...")
parameter_results = run_parameter_check(doc)

output.print_md("**[4/4]** Calculating score...")
report, filepath = generate_report(
    doc, warnings_results, bloat_results, parameter_results
)

overall = report["overall"]
scores  = report["scores"]
recs    = report["recommendations"]

output.print_md("**Done! Launching UI...**")

# ── Load XAML ──────────────────────────────────────────────────────────────
xaml_path = os.path.join(script_dir, "BIMHealthUI.xaml")
with open(xaml_path, "r") as f:
    xaml_str = f.read()

window = XamlReader.Parse(xaml_str)

# ── Helper: score → hex color ──────────────────────────────────────────────
def score_color(score):
    if score >= 75:
        return "#10B981"   # green
    elif score >= 50:
        return "#F59E0B"   # amber
    else:
        return "#EF4444"   # red

def hex_to_brush(hex_color):
    hex_color = hex_color.lstrip("#")
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    return SolidColorBrush(Color.FromRgb(r, g, b))

# ── Populate header ────────────────────────────────────────────────────────
window.FindName("ModelNameText").Text = "Model: {}".format(
    report["meta"]["model_name"]
)
window.FindName("DateText").Text = "Generated: {}".format(
    report["meta"]["generated_at"]
)

# ── Populate overall score ─────────────────────────────────────────────────
overall_score = overall["score"]
window.FindName("OverallScoreText").Text  = str(overall_score)
window.FindName("StatusText").Text        = "{} — {}".format(
    overall["grade"], overall["status"]
)
window.FindName("GradeText").Text = overall["grade"]

# Color the grade badge by score
badge_color = score_color(overall_score)
window.FindName("GradeBadge").Background = hex_to_brush(badge_color)

# ── Populate score bars ────────────────────────────────────────────────────
BAR_MAX_WIDTH = 510   # max pixel width of the bar at 100/100

def set_bar(bar_name, score_name, score, color_hex):
    bar_width = int((score / 100.0) * BAR_MAX_WIDTH)
    window.FindName(bar_name).Width      = bar_width
    window.FindName(bar_name).Background = hex_to_brush(color_hex)
    window.FindName(score_name).Text     = "{}/100".format(score)

set_bar(
    "WarningsBar", "WarningsScoreText",
    scores["warnings"]["score"],
    score_color(scores["warnings"]["score"])
)
set_bar(
    "BloatBar", "BloatScoreText",
    scores["bloat"]["score"],
    score_color(scores["bloat"]["score"])
)
set_bar(
    "ParamBar", "ParamScoreText",
    scores["parameters"]["score"],
    score_color(scores["parameters"]["score"])
)

# ── Populate recommendations ───────────────────────────────────────────────
panel = window.FindName("RecommendationsPanel")

priority_colors = {
    "High":   "#EF4444",
    "Medium": "#F59E0B",
    "Low":    "#10B981",
}

if recs:
    for rec in recs:
        color = priority_colors.get(rec["priority"], "#6B7280")

        # Outer card border
        card = Border()
        card.SetResourceReference(
            Border.StyleProperty,
            "RecCard"
        )

        # Inner stack
        inner = StackPanel()

        # Priority badge + category
        header = TextBlock()
        header.Text = "[{}] {}".format(rec["priority"], rec["category"])
        header.FontSize   = 11
        header.Foreground = hex_to_brush(color)
        header.Margin     = System.Windows.Thickness(0, 0, 0, 4)

        # Action text
        action = TextBlock()
        action.Text       = rec["action"]
        action.FontSize   = 12
        action.Foreground = hex_to_brush("#E0E0E0")
        action.TextWrapping = System.Windows.TextWrapping.Wrap

        inner.Children.Add(header)
        inner.Children.Add(action)
        card.Child = inner
        panel.Children.Add(card)
else:
    no_rec = TextBlock()
    no_rec.Text       = "No issues found — model is in great shape!"
    no_rec.Foreground = hex_to_brush("#10B981")
    no_rec.FontSize   = 13
    panel.Children.Add(no_rec)

# ── Button events ──────────────────────────────────────────────────────────
def open_dashboard(sender, args):
    import subprocess
    # Opens the JSON file location for now
    # Phase 3B will replace this with the actual web dashboard URL
    subprocess.Popen(
        'explorer /select,"{}"'.format(filepath)
    )

def close_window(sender, args):
    window.Close()

window.FindName("OpenDashboardBtn").Click += open_dashboard
window.FindName("CloseBtn").Click         += close_window

# ── Show the window ────────────────────────────────────────────────────────
window.ShowDialog()