# BIM Health Toolkit

> A quality assurance system for Autodesk Revit models — like ESLint for BIM.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Revit](https://img.shields.io/badge/Revit-2024-orange)
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
- [Report History & Trend Tracking](#report-history--trend-tracking)
- [Deployment](#deployment)
- [Tech Stack](#tech-stack)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

BIM Health Toolkit is a two-part system that scans Autodesk Revit models and produces an objective **BIM Health Score** — a single number from 0 to 100 that reflects the overall quality of a model.

It works like **Lighthouse for websites**, but for BIM models:

- Run the **pyRevit plugin** inside Revit to scan the model
- Upload the generated **JSON report** to the **web dashboard**
- Get a full breakdown of issues, recommendations, charts, and a PDF report

This tool is built for BIM managers, architects, engineers, and consultants who want to enforce model quality standards before issuing files to collaborators.

---

## The Problem

Most companies using Autodesk Revit produce models, but:

- They do not measure model quality objectively
- Models accumulate warnings, bloat, and missing data over time
- Teams receive poor-quality files from collaborators, causing delays
- There is no standard "model health" check before file issuance

This leads to:

- Coordination issues and clashes
- Slow, bloated models that are hard to work with
- Incomplete data for downstream uses like COBie, cost estimation, and FM

BIM Health Toolkit solves this by providing a systematic, repeatable, and objective quality check — similar to how software developers use linters and CI/CD pipelines.

---

## Features

### Core
- **Warnings Audit** — extracts all Revit model warnings and categorizes them as Critical, Moderate, or Low
- **File Bloat Detection** — detects families, CAD imports, in-place families, and oversized view counts
- **Parameter Completeness Check** — verifies required parameters are filled across key element categories
- **BIM Health Score** — weighted score out of 100 combining all three checks
- **Recommendations Engine** — prioritized, actionable fix list with element-level detail

### Dashboard
- Interactive score ring with grade badge
- Score breakdown cards with progress bars
- Warnings distribution pie chart
- Score breakdown bar chart
- Expandable recommendation cards with affected element lists
- Report history across multiple uploads
- Trend line chart showing score changes over time
- Dark-themed, responsive UI

### Export
- **JSON report** saved to Desktop on every scan
- **4-page PDF report** with cover page, score breakdown, recommendations, and element detail tables

### Plugin (Revit)
- One-click ribbon button inside Revit
- WPF dialog showing instant score summary
- "Open Web Dashboard" button linking to deployed site

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      REVIT (Desktop)                        │
│                                                             │
│   ┌──────────────┐    ┌──────────────────────────────────┐  │
│   │ pyRevit Tab  │───▶│         Health Check Engine      │  │
│   │ "Run Check"  │    │                                  │  │
│   └──────────────┘    │  ┌────────────────────────────┐  │  │
│                        │  │  warnings_check.py         │  │  │
│                        │  │  bloat_check.py            │  │  │
│                        │  │  parameter_check.py        │  │  │
│                        │  │  score_calculator.py       │  │  │
│                        │  └────────────────────────────┘  │  │
│                        └──────────────┬───────────────────┘  │
│                                       │                      │
│   ┌──────────────┐                    ▼                      │
│   │  WPF Dialog  │◀──── Score + Recommendations             │
│   │ Score: 87    │                                           │
│   │ Grade: B     │────▶  JSON saved to Desktop              │
│   └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │  User uploads JSON
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   WEB DASHBOARD (Browser)                   │
│                                                             │
│   Score Ring  │  Score Cards  │  Charts  │  Recommendations │
│   Trend Chart │  PDF Export   │  History │  Element Detail  │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
BIMHealthToolkit/
│
├── BIMHealthToolkit.extension/          ← pyRevit Extension
│   └── BIMHealthToolkit.tab/
│       └── Health Check.panel/
│           └── Run Check.pushbutton/
│               ├── script.py            ← Main entry point
│               ├── BIMHealthUI.xaml     ← WPF dialog layout
│               └── checks/
│                   ├── __init__.py
│                   ├── warnings_check.py
│                   ├── bloat_check.py
│                   ├── parameter_check.py
│                   └── score_calculator.py
│
└── bim-health-dashboard/                ← React Web App
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── ScoreRing.jsx
    │   │   ├── ScoreCard.jsx
    │   │   ├── BreakdownChart.jsx
    │   │   ├── WarningsPieChart.jsx
    │   │   ├── RecommendationsList.jsx
    │   │   ├── ReportHistory.jsx
    │   │   └── ExportButton.jsx
    │   ├── utils/
    │   │   ├── reportLoader.js
    │   │   └── reportHistory.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## Prerequisites

Before you begin, make sure you have the following installed:

| Tool | Version | Purpose |
|---|---|---|
| Windows 10 / 11 | — | Required for Revit |
| Autodesk Revit | 2022 – 2024 | BIM authoring tool |
| pyRevit | Latest | Python scripting for Revit |
| VS Code | Latest | Code editor |
| Node.js | 18+ | Web dashboard dev server |
| npm | 9+ | Package manager |

---

## Installation

### Part 1 — pyRevit Plugin

#### Step 1 — Install pyRevit

1. Download the latest installer from [pyRevit Releases](https://github.com/pyrevitlabs/pyRevit/releases)
2. Run the `.exe` as Administrator
3. Ensure **"Attach to Revit"** is checked during installation
4. Open Revit — you should see a **pyRevit** tab in the ribbon

#### Step 2 — Create the extension folder

Create the following folder structure. The naming conventions (`.extension`, `.tab`, `.panel`, `.pushbutton`) are required by pyRevit:

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

1. In Revit, click the **pyRevit tab**
2. Click **pyRevit → Settings**
3. Under **Custom Extension Directories**, click **Add Folder**
4. Point it to your `BIMHealthToolkit.extension` folder
5. Click **Save Settings**, then **Reload**

You should now see a **BIMHealthToolkit** tab in Revit with a **Run Check** button.

---

### Part 2 — Web Dashboard

#### Step 1 — Clone or create the project

```bash
npm create vite@latest bim-health-dashboard -- --template react
cd bim-health-dashboard
npm install
```

#### Step 2 — Install dependencies

```bash
npm install recharts jspdf jspdf-autotable html2canvas
npm install -D @tailwindcss/vite tailwindcss autoprefixer postcss
```

#### Step 3 — Configure Tailwind v4

Update `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Update `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@import "tailwindcss";

@layer base {
  *, *::before, *::after { box-sizing: border-box; }
  body {
    background-color: #0F1117;
    color: #E0E0E0;
    font-family: 'Inter', sans-serif;
  }
}
```

#### Step 4 — Start the development server

```bash
npm run dev
```

Open your browser at `http://localhost:5173`

---

## Usage

### Running a Health Check

1. Open Autodesk Revit 2024
2. Open any Revit model (`.rvt`)
3. Click the **BIMHealthToolkit** tab in the ribbon
4. Click **Run Check**
5. Wait for all four checks to complete (progress shown in pyRevit output)
6. A **WPF dialog** opens showing your overall score, sub-scores, and recommendations
7. A **JSON report** is saved to your Desktop automatically

### Viewing the Dashboard

1. Go to the deployed dashboard (or run `npm run dev` locally)
2. Drag and drop your JSON file from the Desktop into the drop zone
3. The full dashboard loads instantly with:
   - Overall health score and grade
   - Score breakdown cards
   - Warnings and bloat charts
   - Expandable recommendations with element detail
4. Click **Export PDF** to generate a branded 4-page report

---

## Health Score System

The overall BIM Health Score is calculated using a weighted average of three sub-scores:

```
Overall Score = (Warnings × 35%) + (Bloat × 30%) + (Parameters × 35%)
```

### Grade Scale

| Score | Grade | Status |
|---|---|---|
| 90 – 100 | A | Excellent |
| 75 – 89 | B | Good |
| 60 – 74 | C | Needs Improvement |
| 40 – 59 | D | Poor |
| 0 – 39 | F | Critical |

### Score Colors

| Color | Range | Meaning |
|---|---|---|
| 🟢 Green | 75 – 100 | Passing |
| 🟡 Amber | 50 – 74 | Needs attention |
| 🔴 Red | 0 – 49 | Failing |

---

## Checks Explained

### 1. Warnings Audit

Extracts all warnings from the Revit model using `doc.GetWarnings()` and categorizes them by severity.

**Penalty system:**

| Category | Penalty per warning |
|---|---|
| Critical | −5 points |
| Moderate | −2 points |
| Low | −0.5 points |

**Critical keywords** (triggers Critical category):
`duplicate`, `overlap`, `identical instances`, `same location`, `constraint`, `fails`, `error`, and more.

**Moderate keywords** (triggers Moderate category):
`room`, `area`, `unconnected`, `slightly off`, `not joined`, `missing`, and more.

Everything else is classified as **Low**.

---

### 2. File Bloat Detection

Scans the model for elements that increase file size and reduce performance.

**Checks performed:**

| Check | Trigger | Penalty |
|---|---|---|
| Too many families | > 200 families | −15 points (flag) |
| In-place families | Any found | −5 points each |
| CAD imports | Any found | −8 points each |
| Too many views | > 100 views | −15 points (flag) |
| Too many family types | > 500 types | −15 points (flag) |

**Recommendations generated:**
- Remove CAD imports (use linked CAD instead)
- Replace in-place families with loadable families
- Run `Purge Unused` to reduce family count
- Delete unused views

---

### 3. Parameter Completeness

Checks elements across key Revit categories for missing required parameters.

**Checked categories:**
Walls, Floors, Roofs, Doors, Windows, Columns, Structural Columns, Furniture, Mechanical Equipment, Electrical Equipment, Plumbing Fixtures.

**Required built-in parameters:**

| Parameter | API Name |
|---|---|
| Mark | `ALL_MODEL_MARK` |
| Description | `ALL_MODEL_DESCRIPTION` |
| Type Comments | `ALL_MODEL_TYPE_COMMENTS` |

**Required custom parameters** (configurable in `parameter_check.py`):

```python
REQUIRED_CUSTOM_PARAMS = [
    "UniClass Code",
    "UniClass Description",
    "COBie.Type.Category",
    "Manufacturer",
    "Model",
]
```

The score is directly mapped from completeness percentage:
`78% complete → 78/100`

---

## Configuration

### Customizing Required Parameters

Open `checks/parameter_check.py` and edit the `REQUIRED_CUSTOM_PARAMS` list to match your company's BIM standards:

```python
REQUIRED_CUSTOM_PARAMS = [
    "Your Company Parameter",
    "Project Code",
    "Asset ID",
    # Add as many as needed
]
```

### Customizing Warning Categories

Open `checks/warnings_check.py` and edit the keyword lists:

```python
CRITICAL_KEYWORDS = [
    "duplicate",
    "overlap",
    # Add your own critical keywords
]

MODERATE_KEYWORDS = [
    "room",
    "unconnected",
    # Add your own moderate keywords
]
```

### Adjusting Score Weights

Open `checks/score_calculator.py` and edit the `WEIGHTS` dictionary. Values must add up to 100:

```python
WEIGHTS = {
    "warnings":  35,   # Change these values
    "bloat":     30,
    "parameter": 35,
}
```

---

## JSON Report Format

Every scan produces a JSON file saved to your Desktop. The filename format is:

```
BIMHealth_ModelName_YYYYMMDD_HHMMSS.json
```

The report structure:

```json
{
  "meta": {
    "model_name": "rac_advanced_sample_project",
    "model_path": "C:\\...\\model.rvt",
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
        "critical": 3,
        "moderate": 7,
        "low": 21,
        "total_warnings": 31
      }
    },
    "bloat": { "..." : "..." },
    "parameters": { "..." : "..." }
  },
  "recommendations": [
    {
      "priority": "High",
      "category": "Warnings",
      "action": "Fix 3 critical warning(s) immediately",
      "detail": [ { "description": "...", "element_ids": [123, 456] } ],
      "detail_type": "warnings"
    }
  ]
}
```

---

## Web Dashboard

The dashboard is a React single-page application that reads the JSON report and displays it visually.

### Components

| Component | Purpose |
|---|---|
| `Header.jsx` | Model name and generation date |
| `ScoreRing.jsx` | Animated SVG score ring with grade badge |
| `ScoreCard.jsx` | Individual score card for each check |
| `BreakdownChart.jsx` | Bar chart of all three sub-scores |
| `WarningsPieChart.jsx` | Donut chart of warning distribution |
| `RecommendationsList.jsx` | Grouped, expandable recommendations |
| `ReportHistory.jsx` | Session history with trend line chart |
| `ExportButton.jsx` | 4-page PDF generation |

### Utilities

| File | Purpose |
|---|---|
| `reportLoader.js` | Parses and validates JSON report |
| `reportHistory.js` | Session-based history management |

---

## PDF Export

Clicking **Export PDF** generates a dark-themed, branded 4-page PDF using `jsPDF` and `jspdf-autotable`.

### Pages

| Page | Content |
|---|---|
| 1 — Cover | Score ring, grade, 3 score cards, 4 stat boxes, report description |
| 2 — Breakdown | Detailed breakdown of all 3 checks with progress bars and sub-metrics |
| 3 — Recommendations | Full prioritized list grouped by High / Medium / Low |
| 4 — Element Detail | Tables of affected elements for each issue |

> **Note:** jsPDF does not support emoji. All icons in the PDF use plain text or geometric shapes drawn with the jsPDF shape API.

---

## Report History & Trend Tracking

The dashboard tracks every report uploaded during a session using `sessionStorage`.

### Features

- **History list** — all uploaded reports with scores, grades, and sub-scores
- **Trend chart** — line chart showing score changes over time for the same model
- **Toggle lines** — switch between Overall, Warnings, Bloat, and Parameters lines
- **Score delta** — shows improvement or decline from the previous report
- **Reference line** — dashed line at 75 (the "Good" threshold)

> History is session-only — it resets when the browser tab is closed. Persistent history across sessions is planned for a future release.

---

## Deployment

The web dashboard can be deployed to any static hosting provider. Vercel is recommended.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Build the project
npm run build

# Deploy
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments on every push.

### After Deploying

Update the `open_dashboard` function in `script.py` with your live URL:

```python
def open_dashboard(sender, args):
    import subprocess
    deployed_url = "https://your-project.vercel.app"
    subprocess.Popen(
        ["cmd", "/c", "start", deployed_url],
        shell=False
    )
```

---

## Tech Stack

### Plugin (pyRevit)
| Tool | Purpose |
|---|---|
| pyRevit | Rapid Revit plugin development framework |
| IronPython 2.7 | Python runtime inside Revit |
| Revit API | Access to Revit model data |
| WPF / XAML | Native Windows UI for the Revit dialog |

### Web Dashboard
| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Tailwind CSS | 4 | Utility-first styling |
| Vite | 8 | Build tool |
| Recharts | 3 | Charts (bar, pie, line) |
| jsPDF | 4 | PDF generation |
| jspdf-autotable | latest | Table rendering in PDFs |
| html2canvas | 1 | Screenshot fallback |

---

## Roadmap

### v1.1
- [ ] Persistent report history (localStorage or backend)
- [ ] Custom scoring presets per company standard
- [ ] Batch check multiple models at once
- [ ] Email report delivery

### v1.2
- [ ] AI-powered fix suggestions using an LLM
- [ ] Clash detection integration
- [ ] Revit model comparison (diff between two reports)
- [ ] COBie completeness check

### v2.0
- [ ] Web-based model upload (IFC / Speckle)
- [ ] Team dashboard with multi-model overview
- [ ] CI/CD integration — auto-check on model save
- [ ] API for third-party integration

---

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please follow existing code style and add comments for any new check logic.

---

## License

MIT License — see `LICENSE` for details.

---

## Author

Built as part of a BIM Development portfolio project exploring the intersection of BIM data engineering and frontend development.

> *"BIM should be efficient. This tool helps make it so."*
