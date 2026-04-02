# BIM Health Toolkit

> A quality assurance system for Autodesk Revit models — like ESLint, but for BIM.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Revit](https://img.shields.io/badge/Revit-2022--2024-orange)
![pyRevit](https://img.shields.io/badge/pyRevit-latest-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![License](https://img.shields.io/badge/license-MIT-purple)

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Part 1 — pyRevit Plugin](#part-1--pyrevit-plugin)
  - [Part 2 — Web Dashboard](#part-2--web-dashboard)
- [Usage](#usage)
- [Health Score System](#health-score-system)
- [Checks Explained](#checks-explained)
  - [Warnings Audit](#1-warnings-audit)
  - [File Bloat Detection](#2-file-bloat-detection)
  - [Parameter Completeness](#3-parameter-completeness)
- [Configuration](#configuration)
- [JSON Report Format](#json-report-format)
- [Web Dashboard](#web-dashboard)
- [PDF Export](#pdf-export)
- [Report History and Trend Tracking](#report-history-and-trend-tracking)
- [Deployment](#deployment)
- [Tech Stack](#tech-stack)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

BIM Health Toolkit is a two-part system that scans Autodesk Revit models and produces an objective **BIM Health Score** — a single number from 0 to 100 reflecting the overall quality of a model.

It works like **Lighthouse for websites**, but for BIM:

1. Run the **pyRevit plugin** inside Revit to scan your open model
2. Upload the generated **JSON report** to the **web dashboard**
3. Get a full visual breakdown of issues, prioritised recommendations, charts, and a downloadable PDF

This tool is built for BIM managers, architects, engineers, and consultants who want to enforce model quality standards before issuing files to collaborators or clients.

---

## The Problem

Most teams using Autodesk Revit produce models without objectively measuring their quality. Over time:

- Models accumulate warnings, bloat, and missing parameter data
- Teams receive poor-quality files from collaborators, causing coordination delays
- There is no standard "model health" check before file issuance

This leads to coordination clashes, slow and bloated models, and incomplete data for downstream uses like COBie exports, cost estimation, and facilities management.

BIM Health Toolkit addresses this by providing a systematic, repeatable, and objective quality check — similar to how software developers use linters and CI/CD pipelines.

---

## Features

### Core Engine
- **Warnings Audit** — extracts all Revit model warnings and classifies them as Critical, Moderate, or Low
- **File Bloat Detection** — detects in-place families, CAD imports, and oversized family and view counts
- **Parameter Completeness Check** — verifies required parameters are filled across key element categories
- **BIM Health Score** — weighted score out of 100 combining all three checks
- **Recommendations Engine** — prioritised, actionable fix list with element-level detail attached to each item

### In-Revit WPF Dialog
- One-click button in the Revit ribbon
- Live progress output during the scan
- WPF dialog showing overall score, sub-scores with animated bars, and a full recommendations list
- "Open Web Dashboard" button to launch the browser report viewer

### Web Dashboard
- Drag-and-drop JSON report loading
- Animated score ring with letter grade badge
- Three score cards (Warnings, Bloat, Parameters) with progress bars and sub-metrics
- Bar chart comparing weighted sub-scores
- Donut chart showing warnings by severity
- Expandable recommendation cards with affected element lists
- Report history panel with trend line chart
- Score delta indicator (improvement or decline from previous scan)
- Dark-themed, fully responsive UI

### Export
- JSON report saved automatically to the Desktop on every scan
- 4-page branded PDF export from the dashboard (cover page, breakdown, recommendations, element detail tables)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       REVIT (Desktop)                        │
│                                                              │
│  ┌──────────────┐    ┌──────────────────────────────────┐   │
│  │ pyRevit Tab  │───▶│        Health Check Engine       │   │
│  │ "Run Check"  │    │                                  │   │
│  └──────────────┘    │  warnings_check.py               │   │
│                      │  bloat_check.py                  │   │
│                      │  parameter_check.py              │   │
│                      │  score_calculator.py             │   │
│                      └──────────────┬───────────────────┘   │
│                                     │                       │
│  ┌──────────────┐                   ▼                       │
│  │  WPF Dialog  │◀─── Score + Recommendations              │
│  │  Score: 87   │                                           │
│  │  Grade: B    │────▶  JSON saved to Desktop              │
│  └──────────────┘                                           │
└──────────────────────────────────────────────────────────────┘
                             │
                             │  User uploads JSON
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                  WEB DASHBOARD (Browser)                     │
│                                                              │
│  Score Ring  │  Score Cards  │  Charts  │  Recommendations  │
│  Trend Chart │  PDF Export   │  History │  Element Detail   │
└──────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
BIMHealthToolkit/
│
├── BIMHealthToolkit.extension/          ← pyRevit Extension root
│   └── BIMHealthToolkit.tab/
│       ├── Health Check.panel/
│       │   ├── Run Check.pushbutton/
│       │   │   ├── script.py            ← Main entry point (runs checks + launches WPF)
│       │   │   ├── BIMHealthUI.xaml     ← WPF dialog layout
│       │   │   └── checks/
│       │   │       ├── __init__.py
│       │   │       ├── warnings_check.py
│       │   │       ├── bloat_check.py
│       │   │       ├── parameter_check.py
│       │   │       └── score_calculator.py
│       │   └── View Report.pushbutton/
│       │       └── script.py            ← Stub (planned for v1.1)
│       └── Settings.panel/
│           └── Configure.pushbutton/
│               └── script.py            ← Stub (planned for v1.1)
│
└── bim-health-dashboard/                ← React Web App
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx               ← Model name + generation date
    │   │   ├── ScoreRing.jsx            ← Animated SVG score ring
    │   │   ├── ScoreCard.jsx            ← Per-check score card
    │   │   ├── BreakdownChart.jsx       ← Bar chart of sub-scores
    │   │   ├── WarningsPieChart.jsx     ← Donut chart of warning severity
    │   │   ├── RecommendationsList.jsx  ← Expandable recommendations
    │   │   ├── ReportHistory.jsx        ← Session history + trend chart
    │   │   └── ExportButton.jsx         ← PDF export trigger
    │   ├── utils/
    │   │   ├── reportLoader.js          ← Parses and validates JSON report
    │   │   └── reportHistory.js         ← Session-based history management
    │   ├── App.jsx                      ← Root app + file loading logic
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    └── eslint.config.js
```

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Windows 10 / 11 | — | Required for Revit |
| Autodesk Revit | 2022 – 2024 | BIM authoring tool |
| pyRevit | Latest | Python scripting framework for Revit |
| Node.js | 18+ | Web dashboard development server |
| npm | 9+ | Package manager |

---

## Installation

### Part 1 — pyRevit Plugin

#### Step 1 — Install pyRevit

1. Download the latest installer from [pyRevit Releases](https://github.com/pyrevitlabs/pyRevit/releases)
2. Run the `.exe` as Administrator
3. Ensure **"Attach to Revit"** is checked during installation
4. Open Revit — you should see a **pyRevit** tab in the ribbon

#### Step 2 — Create the extension folder structure

pyRevit uses a strict folder naming convention. Each suffix (`.extension`, `.tab`, `.panel`, `.pushbutton`) tells pyRevit how to render the element in the Revit ribbon.

Copy the plugin files into the following structure:

```
C:\Users\YourName\AppData\Roaming\myPyrevitExtensions\
└── BIMHealthToolkit.extension\
    └── BIMHealthToolkit.tab\
        └── Health Check.panel\
            └── Run Check.pushbutton\
                ├── script.py
                ├── BIMHealthUI.xaml
                └── checks\
                    ├── __init__.py
                    ├── warnings_check.py
                    ├── bloat_check.py
                    ├── parameter_check.py
                    └── score_calculator.py
```

#### Step 3 — Register the extension with pyRevit

1. In Revit, click the **pyRevit** tab
2. Go to **pyRevit → Settings**
3. Under **Custom Extension Directories**, click **Add Folder**
4. Point it to your `BIMHealthToolkit.extension` folder (not to any subfolder)
5. Click **Save Settings**, then **Reload**

You should now see a **BIMHealthToolkit** tab in the Revit ribbon with a **Run Check** button.

---

### Part 2 — Web Dashboard

#### Step 1 — Navigate to the dashboard folder

```bash
cd bim-health-dashboard
```

#### Step 2 — Install dependencies

```bash
npm install
```

This installs all dependencies declared in `package.json`, including React, Recharts, jsPDF, Tailwind CSS, and Vite.

#### Step 3 — Start the development server

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## Usage

### Running a Health Check (inside Revit)

1. Open Autodesk Revit and load any `.rvt` model
2. Click the **BIMHealthToolkit** tab in the ribbon
3. Click **Run Check**
4. Monitor progress in the pyRevit output panel:
   - `[1/4]` Extracting warnings
   - `[2/4]` Detecting file bloat
   - `[3/4]` Checking parameters
   - `[4/4]` Calculating score
5. A **WPF dialog** opens showing your overall score, grade, sub-scores, and recommendations
6. A **JSON report** is automatically saved to your Desktop with the filename format:
   `BIMHealth_ModelName_YYYYMMDD_HHMMSS.json`

### Viewing the Web Dashboard

1. Open the deployed dashboard (or run `npm run dev` locally)
2. Drag and drop your JSON report from the Desktop into the drop zone, or click to browse
3. The dashboard loads instantly, showing:
   - Overall score ring with letter grade
   - Score breakdown cards for Warnings, Bloat, and Parameters
   - Warnings distribution chart
   - Expandable recommendations with element-level detail
4. Click **Export PDF** to generate a branded 4-page report
5. Load additional reports to build up the history panel and view score trends over time

---

## Health Score System

The overall BIM Health Score is a weighted average of three sub-scores:

```
Overall Score = (Warnings Score × 35%) + (Bloat Score × 30%) + (Parameters Score × 35%)
```

### Grade Scale

| Score Range | Grade | Status |
|---|---|---|
| 90 – 100 | A | Excellent |
| 75 – 89 | B | Good |
| 60 – 74 | C | Needs Improvement |
| 40 – 59 | D | Poor |
| 0 – 39 | F | Critical |

### Score Colour Thresholds

| Colour | Range | Meaning |
|---|---|---|
| 🟢 Green | 75 – 100 | Passing |
| 🟡 Amber | 50 – 74 | Needs attention |
| 🔴 Red | 0 – 49 | Failing |

---

## Checks Explained

### 1. Warnings Audit

Extracts all active warnings from the Revit model using the `doc.GetWarnings()` API and classifies each one by severity based on keyword matching against the warning description text.

**Penalty system (starting score: 100):**

| Severity | Penalty per Warning |
|---|---|
| Critical | −5 points |
| Moderate | −2 points |
| Low | −0.5 points |

**Critical keywords** — triggers the Critical category:

`duplicate`, `overlap`, `not in correct position`, `identical instances`, `same location`, `constraint`, `sketch`, `cannot be joined`, `fails`, `error`

**Moderate keywords** — triggers the Moderate category:

`room`, `area`, `unconnected`, `slightly off`, `highlighted`, `not joined`, `missing`

All other warnings are classified as **Low**. The score is clamped between 0 and 100.

---

### 2. File Bloat Detection

Scans the model for elements that increase file size and slow down performance.

**Checks performed:**

| Check | Trigger Condition | Penalty |
|---|---|---|
| Too many families loaded | > 200 families | −15 points (flag) |
| In-place families present | Any found | −5 points each |
| CAD files imported | Any found | −8 points each |
| Too many views | > 100 non-template views | −15 points (flag) |
| Too many family types | > 500 types | −15 points (flag) |

**Recommendations generated:**
- Remove imported CAD files (link them instead)
- Replace in-place families with loadable families
- Run `Purge Unused` to reduce family count
- Delete unused views

---

### 3. Parameter Completeness

Checks all elements in key Revit categories for missing required parameters. The score maps directly from completeness percentage (e.g. 78% complete elements → score of 78/100).

**Checked categories:**
Walls, Floors, Roofs, Doors, Windows, Columns, Structural Columns, Furniture, Mechanical Equipment, Electrical Equipment, Plumbing Fixtures

**Required built-in parameters:**

| Parameter Name | Revit API Constant |
|---|---|
| Mark | `ALL_MODEL_MARK` |
| Description | `ALL_MODEL_DESCRIPTION` |
| Type Comments | `ALL_MODEL_TYPE_COMMENTS` |

**Required custom parameters** (configurable — see [Configuration](#configuration)):

- `UniClass Code`
- `UniClass Description`
- `COBie.Type.Category`
- `Manufacturer`
- `Model`

Custom parameters that do not exist on a given element type are silently skipped — the check only penalises parameters that exist but have no value.

---

## Configuration

All configuration is done by editing the Python source files directly. No external config file is required.

### Customise required parameters

Open `checks/parameter_check.py` and edit the `REQUIRED_CUSTOM_PARAMS` list:

```python
REQUIRED_CUSTOM_PARAMS = [
    "Your Company Parameter",
    "Project Code",
    "Asset ID",
    # Add or remove parameters to match your BIM standards
]
```

### Customise warning severity keywords

Open `checks/warnings_check.py` and edit the keyword lists:

```python
CRITICAL_KEYWORDS = [
    "duplicate",
    "overlap",
    # Add keywords that should trigger Critical classification
]

MODERATE_KEYWORDS = [
    "room",
    "unconnected",
    # Add keywords that should trigger Moderate classification
]
```

### Adjust score weights

Open `checks/score_calculator.py` and edit the `WEIGHTS` dictionary. The three values must always add up to 100:

```python
WEIGHTS = {
    "warnings":  35,
    "bloat":     30,
    "parameter": 35,
}
```

---

## JSON Report Format

Every scan produces a JSON file saved to the user's Desktop. The filename follows this format:

```
BIMHealth_ModelName_YYYYMMDD_HHMMSS.json
```

### Full report schema

```json
{
  "meta": {
    "model_name": "rac_advanced_sample_project",
    "model_path": "C:\\Users\\...\\model.rvt",
    "generated_at": "2024-03-31 14:22:10",
    "generated_date": "2024-03-31",
    "tool_version": "1.0.0"
  },
  "overall": {
    "score": 78.5,
    "grade": "B",
    "status": "Good",
    "weights": { "warnings": 35, "bloat": 30, "parameter": 35 }
  },
  "scores": {
    "warnings": {
      "score": 70.0,
      "weight": 35,
      "weighted": 24.5,
      "breakdown": {
        "score": 70.0,
        "total_warnings": 31,
        "critical": 3,
        "moderate": 7,
        "low": 21,
        "penalties": {
          "critical": 15.0,
          "moderate": 14.0,
          "low": 10.5
        }
      }
    },
    "bloat": {
      "score": 85.0,
      "weight": 30,
      "weighted": 25.5,
      "breakdown": {
        "total_families": 145,
        "inplace_families": 0,
        "cad_imports": 2,
        "total_elements": 8432,
        "total_views": 74,
        "total_types": 312,
        "flags": ["2 CAD import(s) detected"],
        "penalties": { "flags": 0, "inplace": 0, "cad_imports": 16.0 }
      }
    },
    "parameters": {
      "score": 88.0,
      "weight": 35,
      "weighted": 30.8,
      "breakdown": {
        "total_checked": 412,
        "total_complete": 363,
        "total_incomplete": 49,
        "completeness_pct": 88.0,
        "missing_summary": { "Mark": 31, "Manufacturer": 18 },
        "by_category": { "Walls": { "total": 87, "complete": 82, "incomplete": 5 } }
      }
    }
  },
  "recommendations": [
    {
      "priority": "High",
      "category": "Warnings",
      "action": "Fix 3 critical warning(s) immediately — these affect model integrity",
      "detail": [
        { "description": "Duplicate wall instances at...", "element_ids": [123, 456], "element_count": 2 }
      ],
      "detail_type": "warnings"
    }
  ]
}
```

---

## Web Dashboard

The dashboard is a React single-page application that reads a JSON report and displays it as an interactive visual report. All processing happens locally in the browser — no data is sent to any server.

### Components

| Component | Purpose |
|---|---|
| `Header.jsx` | Displays model name and report generation date |
| `ScoreRing.jsx` | Animated SVG ring showing the overall score and grade badge |
| `ScoreCard.jsx` | Individual score card for each of the three checks |
| `BreakdownChart.jsx` | Recharts bar chart comparing all three weighted sub-scores |
| `WarningsPieChart.jsx` | Recharts donut chart of warning severity distribution |
| `RecommendationsList.jsx` | Grouped, expandable recommendation cards with element detail |
| `ReportHistory.jsx` | Session history list and trend line chart per model |
| `ExportButton.jsx` | Triggers 4-page PDF generation via jsPDF |

### Utilities

| File | Purpose |
|---|---|
| `reportLoader.js` | Parses the JSON structure and provides colour helper functions |
| `reportHistory.js` | Manages session-based history storage using `sessionStorage` |

---

## PDF Export

Clicking **Export PDF** generates a dark-themed, branded PDF using `jsPDF` and `jspdf-autotable`. The file is downloaded directly to the browser's default download folder.

### PDF Pages

| Page | Content |
|---|---|
| 1 — Cover | Score ring, grade, three score summary cards, model metadata |
| 2 — Score Breakdown | Detailed breakdown of all three checks with sub-metrics and progress bars |
| 3 — Recommendations | Full prioritised list grouped by High, Medium, and Low priority |
| 4 — Element Detail | Tables listing affected elements for each flagged issue |

> **Note:** jsPDF does not render emoji. All icons in the PDF use plain text labels or geometric shapes drawn with the jsPDF drawing API.

---

## Report History and Trend Tracking

Every report uploaded during a browser session is tracked automatically using `sessionStorage`.

### Features

- **History list** — all reports uploaded this session, showing score, grade, and sub-scores
- **Trend chart** — line chart of score changes over time for the same model name
- **Toggle lines** — switch between Overall, Warnings, Bloat, and Parameters trend lines
- **Score delta** — shows the point change (positive or negative) from the previous report for the same model
- **Reference line** — dashed line at 75 marking the "Good" threshold

> History is session-only and resets when the browser tab is closed. Persistent cross-session history is planned for v1.1.

---

## Deployment

The web dashboard is a static React app and can be deployed to any static hosting provider.

### Deploy to Vercel (recommended)

```bash
# Build the project
npm run build

# Deploy via Vercel CLI
npm install -g vercel
vercel --prod
```

Alternatively, connect your GitHub repository to Vercel for automatic deployments on every push to `main`.

### After deploying — connect the Revit plugin

Update the `open_dashboard` function in `script.py` to open your live URL when the button is clicked:

```python
def open_dashboard(sender, args):
    import subprocess
    deployed_url = "https://your-project.vercel.app"
    subprocess.Popen(["cmd", "/c", "start", deployed_url], shell=False)
```

---

## Tech Stack

### pyRevit Plugin

| Tool | Purpose |
|---|---|
| pyRevit | Rapid Revit plugin development framework |
| IronPython 2.7 | Python runtime embedded inside Revit |
| Revit API | Access to model data (warnings, elements, families, views) |
| WPF / XAML | Native Windows UI for the in-Revit results dialog |

### Web Dashboard

| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI component framework |
| Tailwind CSS | 4 | Utility-first styling |
| Vite | 8 | Build tool and development server |
| Recharts | 3 | Bar, pie, and line charts |
| jsPDF | 4 | PDF generation |
| jspdf-autotable | 5 | Table rendering inside PDF pages |
| html2canvas | 1 | Screenshot fallback for PDF export |

---

## Roadmap

### v1.1
- [ ] Persistent report history across sessions (localStorage or lightweight backend)
- [ ] Configurable scoring presets per company BIM standard
- [ ] Batch check multiple models from a folder
- [ ] "View Report" and "Configure" ribbon buttons (currently stubs)
- [ ] Email report delivery

### v1.2
- [ ] AI-powered fix suggestions using an LLM
- [ ] Revit model comparison — diff between two health reports
- [ ] COBie completeness check
- [ ] Clash detection integration

### v2.0
- [ ] Web-based model upload via IFC or Speckle
- [ ] Team dashboard with multi-model overview
- [ ] CI/CD integration — auto-check on model save
- [ ] API for third-party integration

---

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes with a clear message: `git commit -m "Add: description of change"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request with a description of what was changed and why

Please follow the existing code style. Any new check logic should include inline comments explaining the scoring rationale.

---

## License

MIT License — see `LICENSE` for details.

---

## Author

Built as part of a BIM development portfolio project exploring the intersection of BIM data engineering and modern frontend development.

> *"BIM should be data-rich and model-clean. This tool helps make it so."*
