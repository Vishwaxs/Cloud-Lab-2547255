# Predicting District-Level Flood Risk in Assam

**ML for Social Good Ensemble Challenge — Mission Earth**
MCA 521-4 Machine Learning · CIA-3 · CHRIST (Deemed to be University)

An end-to-end, leakage-safe machine-learning pipeline that predicts whether an Assam
district will be reported flood-affected on a given day of the monsoon season, using only
rainfall observed up to the previous day.

---

## Headline result — stated honestly

| Model | ROC-AUC | PR-AUC |
|---|---|---|
| **Baseline: LogisticRegression** | **0.767** | **0.268** |
| Best ensemble: soft Voting (LR+RF+XGB) | 0.751 | 0.208 |

**The best ensemble did not outperform the baseline.** Q3 asks us to *demonstrate whether*
it does — here it does not, and §4.6 of the notebook analyses why (near-monotonic signal,
tree overfitting on district identity, a single training season). We report this rather
than tuning until the ensemble wins.

### Why performance is low — and why that is the most useful finding

The 2026 season was worse than 2025 (like-for-like, 1 May → 13 Aug: **393 district-days
affected vs 315, +25%**). The worst single day was **20 July 2026 — 16 districts**, and the
model performed *worse* than its own average precisely then: **recall 0.36 on that day vs
0.56 across the season**.

**Rainfall measured inside Assam that week averaged 7.8 mm/day against a season average of
7.9 mm/day** — a statistically normal week. External reporting (IMD; an Assam University
study) attributes the July 2026 floods to sustained extreme rainfall over **upstream
catchments in Nagaland and Arunachal Pradesh**, which swelled the south-bank tributaries
Dikhow, Disang, Janji and Dhansiri until they overtopped embankments. Our independently
parsed DRIMS reports corroborate this — rivers above danger level go from `Nil` on 15–18
July to *Burhidihing, Brahmaputra, Disang, Dikhou, Dhansiri* across 19–24 July.

> **The model was not under-tuned. It was structurally blind to the driver.** No
> hyperparameter search over in-Assam rainfall can recover a signal that was never inside
> Assam.

This converts a mediocre metric into a specific, actionable diagnosis, and it independently
validates the limitation declared *before* the result was seen. See
`results/figures/case_study_july2026.png` and `src/case_study_july2026.py`.

**A data leak we found and removed:** SHAP flagged an engineered feature
(`rain_obs_prev7d`) as the second-strongest contributor. Investigation showed rainfall
stations report on ~1.31 more days in the week *before* a flood day — monitoring
intensifies during floods, so the feature partly encoded the outcome. Removing it dropped
PR-AUC from 0.293 to **0.268**. The lower, honest figure is the one reported.

---

## The problem

Assam floods every year; ASDMA treats it as an annual event and the state reports ~39.6% of
its land area as flood-prone. District disaster-management authorities must decide **where
to pre-position boats, relief material and staff before the water arrives**.

| | |
|---|---|
| **Unit of analysis** | one district on one calendar date of the flood season |
| **Target** | `flood_affected` ∈ {0,1} — reported flood-affected by ASDMA that day |
| **Features** | rainfall accumulations and anomalies up to the **previous** day |
| **Dataset** | 5,773 district-days · 534 positive (**9.25%**) · 21 districts · 277 dates |
| **Split** | chronological — train 2025 season, test 2026 season (untouched) |

---

## Data sources — all open government data

| Role | Source |
|---|---|
| **Labels** | ASDMA **DRIMS** Daily Flood Reports · <https://sdrf.assam.gov.in/dfr/> |
| **Features** | **Central Water Commission** daily rainfall, National Water Data Portal · <https://nwdp.nwic.gov.in> |
| **Reference** | Assam Water Resources Dept — river danger levels · <https://waterresources.assam.gov.in/portlets/flood-information-system> |
| **Context** | Government of Assam Flood Memoranda 2015–2025 |

No personally identifiable or confidential data is used. Full provenance, including every
source we **rejected** and why, is in [`DATA_SOURCES.md`](DATA_SOURCES.md).

### Building the labels was the hard part

285 DRIMS PDFs were parsed. Verification caught four distinct defects:

1. **Wrong PDF sections create false positives** — sections like *Population And Crop Area
   Affected* list districts with all-zero rows that were **not** reported affected.
2. **6 wrong report types** served by the portal (Urban Flood, Storm) — excluded.
3. **2 wrong dates** — the file requested for `2025-05-24` contains `2025-05-22`. The date
   *inside* each PDF is authoritative.
4. **PDF line-wrap splits names** — `Lakhimp ur`, `Dima- Hasao`. 49 raw variants → 33 districts.

Verification: **0 count mismatches**, **275/278** dates agree between two independent
sections, **8/8** manual spot-checks correct. See [`PHASE2_DATASET_AUDIT.md`](PHASE2_DATASET_AUDIT.md).

---

## Reproducing this work

```bash
pip install -r requirements.txt

# 1. (optional) re-download raw data — PowerShell, ~500 MB
./src/download_raw_data.ps1
./src/download_drims_flood_reports.ps1
./src/parse_danger_levels.ps1

# 2. pipeline
python src/parse_drims_reports.py    # 285 PDFs   -> labels + parse audit
python src/build_dataset.py          # join + audit -> processed dataset
python src/train_models.py           # all models  -> comparison + figures
python src/explain_model.py          # SHAP global + local
python src/predict_demo.py           # live demo on a synthetic record
```

Or open [`notebooks/CIA3_Assam_Flood_Ensemble.ipynb`](notebooks/CIA3_Assam_Flood_Ensemble.ipynb),
which presents the whole story end to end.

`RANDOM_STATE = 42` throughout. `data/raw/_manifest.csv` records the URL, byte size and
SHA256 of every downloaded file so a third party can verify identical inputs.

---

## Repository layout

```
CIA-3_ML/
├── README.md                     this file
├── DATA_SOURCES.md               provenance, citations, rejected sources
├── ETHICS.md                     responsible-use statement (Q4)
├── MASTER_PLAN.md                execution plan and rubric mapping
├── PHASE1_DECISION_REPORT.md     requirements + dataset decision
├── PHASE2_DATASET_AUDIT.md       label-quality audit
├── requirements.txt
│
├── src/
│   ├── download_raw_data.ps1            NWDP CSV acquisition + manifest
│   ├── download_drims_flood_reports.ps1 DRIMS PDF acquisition
│   ├── parse_danger_levels.ps1          Assam WRD danger-level scrape
│   ├── parse_drims_reports.py           PDF -> flood labels (section-anchored)
│   ├── district_crosswalk.py            explicit district name mapping
│   ├── build_dataset.py                 join, feature engineering, audit
│   ├── train_models.py                  Q2 + Q3: pipeline, ensembles, comparison
│   ├── explain_model.py                 Q4: SHAP global + local
│   └── predict_demo.py                  Q5: live synthetic-record demo
│
├── notebooks/CIA3_Assam_Flood_Ensemble.ipynb
├── data/{raw,interim,processed}/
├── models/                       trained pipelines + metadata
├── results/{figures,metrics}/
├── reports/phase2_audit.txt
└── video/VIDEO_SCRIPT.md
```

---

## Method summary

**Leakage controls** — same-day rainfall is never a feature; all rolling windows are
`.shift(1)`-ed; no DRIMS outcome fields (population, relief camps, damage) enter the
feature matrix; imputation/scaling/encoding live inside the `Pipeline`; SMOTE is applied
inside the CV fold only; `StackingClassifier` uses internal CV so the meta-learner sees
only out-of-fold predictions; the split is chronological with **0 date overlap**.

**Engineered features** — 3/7/15-day rainfall accumulations, 7-day maximum, wet-day count,
state-wide (catchment) rainfall, and **rainfall anomaly versus each district's own
climatological norm** computed from CWC 2021–2024, a period preceding *both* modelled
seasons so it cannot leak.

**Models** — LogisticRegression and DecisionTree baselines; RandomForest (bagging);
XGBoost and AdaBoost (boosting); StackingClassifier and soft VotingClassifier
(heterogeneous). Tuned with `RandomizedSearchCV` over `TimeSeriesSplit`, selecting on
**PR-AUC** — at 9% positives, predicting "no flood" everywhere scores 91% accuracy and is
worthless.

**Self-learning concepts** (neither appears in any course lab):
1. **Class-imbalance handling** — `class_weight='balanced'`, SMOTE-inside-CV, and
   decision-threshold tuning on the training F1 curve.
2. **SHAP explainability** — global beeswarm/bar plus per-prediction waterfall.

---

## Limitations — please read before interpreting any result

1. **Dhemaji, the most flood-affected district, is excluded.** CWC publishes only **2
   rainfall observations for it, ever**. The model is blind to the worst-hit district.
2. **21 of Assam's 35 districts** are covered; exclusion tracks monitoring infrastructure,
   not flood risk.
3. **Two flood seasons of labels only** (2025, 2026 partial).
4. The model does **not** observe river level, discharge, embankment condition, or upstream
   rainfall in Arunachal / Bhutan / Meghalaya — major real flood drivers.
5. Probabilities are **not calibrated**; they rank days.
6. **This is a decision-support prototype, not a warning system.** CWC and ASDMA bulletins
   remain authoritative. See [`ETHICS.md`](ETHICS.md).

---

## Acknowledgements

Data: Assam State Disaster Management Authority (DRIMS); Central Water Commission and the
National Water Informatics Centre (National Water Data Portal); Water Resources Department,
Government of Assam.

Software: scikit-learn, XGBoost, SHAP, imbalanced-learn, pandas, NumPy, Matplotlib,
seaborn, pdfplumber, PyMuPDF. All figures and code in this repository are our own work
unless cited otherwise.
