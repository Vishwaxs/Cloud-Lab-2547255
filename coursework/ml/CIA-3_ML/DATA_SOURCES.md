# Data Sources — Assam Flood Prediction (CIA-3, ML for Social Good Ensemble Challenge)

All data below is **open public government data**. Nothing here is personally
identifiable or confidential. Every file was retrieved by the scripts in `src/`,
which are re-runnable and record what they fetched.

Retrieved: **2026-08-14**

---

## 1. Why this mission and this target

The assignment (CIA 3, MCA 521-4) requires an **ensemble classification** solution:
a Decision Tree / Logistic Regression baseline versus bagging, boosting, and a
stacking/voting ensemble, compared on ROC-AUC / F1 / precision / recall / confusion
matrix, with SHAP or LIME explainability and explicit class-imbalance handling.

That constrains the target to be **categorical and naturally imbalanced**. The
formulation chosen is:

> **Unit of analysis:** one *district* on one *calendar date* during the flood season.
> **Target:** was that district reported flood-affected on that date? (binary)
> **Features:** rainfall accumulations and derived hydro-meteorological indicators
> available *at or before* that date.

This sits under **Mission Earth (Environment)**.

> **Scope note for the evaluator:** the brief lists AQI, forest-fire risk and
> clean-water accessibility as *possible* problems under Mission Earth. Flood risk is
> not named explicitly. The column is headed "Possible problem", so it reads as
> illustrative rather than exhaustive, and recurring flood is squarely an
> environmental/disaster-response problem. This is worth confirming with the faculty
> before the submission is finalised.

---

## 2. What was acquired

### 2.1 Labels — DRIMS daily flood reports (ASDMA)

| | |
|---|---|
| **Publisher** | Disaster Reporting and Information Management System (DRIMS), Assam State Disaster Management Authority (ASDMA), Government of Assam |
| **Access** | <https://sdrf.assam.gov.in/dfr/> → *Download Report → Flood* (public form, no login) |
| **Format** | One server-generated PDF per calendar date |
| **Local path** | `data/raw/drims_daily_flood/` |
| **Script** | `src/download_drims_flood_reports.ps1` |

Each report gives, per district **and** per revenue circle: districts affected,
villages affected, population affected (M/F/children), crop area affected (hectares),
relief camps and inmates, human lives lost/missing, animals affected, houses damaged,
embankments breached, and **rivers flowing above danger level per the CWC 08:00 bulletin**.

**Verified coverage** (established by probing, not assumed):

| Season | Range | Notes |
|---|---|---|
| 2025 | 2025-05-01 → 2025-10-31 | reports filed daily through the season |
| 2026 | 2026-05-01 → present | season still in progress at retrieval |

Dates outside these windows return the HTML form rather than a PDF — i.e. **no report
exists off-season**. Reports are filed on *every* in-season day, not only on flood
days, so the source supplies genuine negative cases as well as positives. A handful of
in-season dates legitimately have no report; these are logged as `absent` in
`data/raw/drims_daily_flood/_download_log.csv` and are treated as missing, **not** as
"no flood".

### 2.2 Features — daily rainfall

| Dataset | Rows | Stations | Districts | Coverage | File |
|---|---|---|---|---|---|
| CWC Assam, manual daily | 66,145 | 80 | 23 | 2021-01-11 → 2025-12-31 | `rainfall/rainfall_manual_daily_cwc_as_2021_2025.csv` |
| CWC Assam, manual daily | 11,886 | 74 | 22 | 2026-01-03 → 2026-08-12 | `rainfall/rainfall_manual_daily_cwc_as_2026_2030.csv` |
| Assam WRD, manual daily | 28,019 | 43 | 16 | 2001 → 2020 | `rainfall/rainfall_manual_daily_assam_as_1991_2020.csv` |
| Assam WRD, manual daily | 11,270 | 38 | 15 | 2021 → 2023 | `rainfall/rainfall_manual_daily_assam_as_2021_2025.csv` |
| CWC Assam, telemetry hourly | 137,659 | 40 | 22 | 2021 → 2025 | `rainfall/rainfall_tel_hr_cwc_as_2021_2025.csv` |

**The CWC manual-daily series is the primary feature source** — it is the only one that
covers both label seasons at daily resolution across most districts. The telemetry
hourly series is ~74% null in the value column and is treated as secondary.

Overlap with the labelled seasons:

| Season | Rainfall rows | Districts | Distinct dates |
|---|---|---|---|
| 2025-05-01 → 2025-10-31 | 12,265 | 22 | 159 |
| 2026-05-01 → 2026-08-13 | 9,332 | 22 | 104 |

→ roughly **5,800 district-day rows** available for modelling.

### 2.3 Features — auxiliary meteorology (Assam Water Department telemetry)

Air temperature, relative humidity, atmospheric pressure, wind speed, wind direction,
solar radiation. Each ~215k–225k hourly rows, but only **10 stations across 10
districts**, 2022 → 2025. Usable as supplementary features for those districts only;
not a state-wide signal. Stored in `data/raw/weather/`.

### 2.4 Reference — official danger levels

`data/raw/reference/assam_river_danger_levels.csv` — 26 gauge stations with official
**Danger Level (m)**, **Highest Flood Level (m)** and HFL date, covering the
Brahmaputra (6 gauges) plus Barak, Kushiyara, Subansiri, Kopili, Manas, Beki and others.

Scraped from the Assam Water Resources Department Flood Information System
(<https://waterresources.assam.gov.in/portlets/flood-information-system>) by
`src/parse_danger_levels.ps1`. The source table merges the *River* column with
`rowspan`; the parser forward-fills it. No value is imputed or corrected.

### 2.5 Context — ASDMA flood memoranda 2015–2025

`data/raw/asdma/` — 11 annual Flood Memoranda submitted by the Government of Assam to
the Ministry of Home Affairs (~100 MB total). Text is extractable (not scanned).
These carry district-wise annual area, population, agriculture and damage tables.

Their granularity is **annual × district** (~35 districts × 11 years ≈ 385 rows), which
is too coarse and too small to train the ensemble on. They are retained for **problem
framing, EDA context and impact narrative**, not as model training data.

---

## 3. What was rejected, and why

Recording these keeps the dataset justification honest and prevents re-treading.

**CWC national river water level (NWDP)** — contains **no Brahmaputra and no Barak
basin**. The published basins are peninsular and western only (Godavari, Krishna,
Cauvery, Mahanadi, Narmada, Tapi, Sabarmati, Mahi, Pennar, Subernarekha, Brahmani &
Baitarni, and west-flowing groups); Ganga and Indus are likewise absent. Trans-boundary
basins appear to be withheld.
⚠️ *"Brahmani and Baitarni" is an Odisha/Jharkhand basin and must not be mistaken for
the Brahmaputra.*

**Assam Water Department river water level** (`rwl_tel_hr_assam_999_*.csv`) — downloaded
and profiled, but **not usable as the core flood signal**:
- only **3 stations** (NH15 Fakirpara Tangni, NH17 Boko, NH15 Dhansirighat), all road
  crossings — none of them among the 26 official danger-level gauges;
- `River`, `Basin` and `Tributary` columns are all `-`;
- `RL_of_zeroGauge` and `MeanSeaLevel` are both `0`, so the readings are gauge stage
  (e.g. `0.296 m`) with **no datum** to convert them to reduced level. They therefore
  cannot be compared against the danger levels in §2.4, which are in mSL (e.g. Dibrugarh
  `105.70 m`).

The originally-envisaged design — *river level vs. official danger level* — is therefore
**not supportable from public data** and was abandoned. The DRIMS district-day label is
the defensible replacement. The danger-level table is still valuable: DRIMS reports the
rivers above danger level each day, which the table contextualises.

**Groundwater level (Assam)** — 3 stations, ~3 months. Discarded.

**Generic Kaggle "flood prediction" datasets** — not Assam-specific and of unclear
provenance; rejected in favour of the sources above.

---

## 4. Known issues to handle in preprocessing

1. **District name crosswalk.** The rainfall CSVs and DRIMS disagree on spelling —
   CWC writes `Marigaon` / `Sivsagar`, DRIMS writes `Morigaon` / `Sivasagar`. A explicit
   crosswalk table is required before joining; fuzzy matching alone is not safe here.
2. **The DRIMS parser must be label-anchored.** A loose "number followed by a comma-list"
   heuristic also matches the *revenue circle* rows and picks up OCR noise. Extraction
   must key off the section labels (`Name of Affected Districts`,
   `Name Of Revenue Circle Affected`, `Population And Crop Area Affected`) and read the
   `District` column of those blocks specifically.
3. **Column counts vary between PDFs** (8–13 columns observed across 2025/2026) even
   though row labels are stable — parse by row label, never by fixed column index.
4. **Districts have been reorganised.** Assam created and renamed districts during the
   covered period (e.g. `Sribhumi` for Karimganj, Bajali split from Barpeta). The
   crosswalk must fix a single consistent district set across both seasons.
5. **Leakage.** Same-day flood-consequence fields (relief camps, population affected,
   damage) are *outcomes*, not predictors — they must never enter the feature matrix.
   Rainfall features must use only values available up to the prediction timestamp, and
   the train/test split should be **chronological**, not random.
6. **Only two seasons of labels.** This is the principal limitation of the dataset and
   must be stated in the responsible-use / limitations section rather than glossed over.

---

## 5. Reproducing the dataset

```powershell
# 1. NWDP CSVs (rainfall, river level, weather, groundwater) -> data/raw/
./src/download_raw_data.ps1

# 2. Official danger levels -> data/raw/reference/assam_river_danger_levels.csv
./src/parse_danger_levels.ps1

# 3. DRIMS daily flood report PDFs -> data/raw/drims_daily_flood/
./src/download_drims_flood_reports.ps1
```

`data/raw/_manifest.csv` records the source URL, byte size and SHA256 of every CSV, so a
third party can verify they obtained identical files.

The DRIMS portal is rate-sensitive: sustained requests cause the session to drop and
return the HTML form instead of a PDF. The script is sequential with a delay and is
safely re-runnable — it skips files already on disk, so re-running fills gaps.

---

## 6. Citation

- Assam State Disaster Management Authority (ASDMA), *Disaster Reporting and Information
  Management System (DRIMS) — Daily Flood Reports*, Government of Assam.
  <https://sdrf.assam.gov.in/dfr/> (retrieved 14 August 2026).
- National Water Informatics Centre, Ministry of Jal Shakti, Government of India,
  *National Water Data Portal* — rainfall, river water level and meteorological
  observations for Assam, published by the Central Water Commission and the Assam Water
  Department. <https://nwdp.nwic.gov.in> (retrieved 14 August 2026).
- Water Resources Department, Government of Assam, *Flood Information System — River-wise
  Danger Level and Highest Water Level*.
  <https://waterresources.assam.gov.in/portlets/flood-information-system> (retrieved 14 August 2026).
- Government of Assam, *Flood Memoranda to the Ministry of Home Affairs, 2015–2025*.
  <https://asdma.assam.gov.in/documents-detail/assam-flood-memorandum> (retrieved 14 August 2026).
