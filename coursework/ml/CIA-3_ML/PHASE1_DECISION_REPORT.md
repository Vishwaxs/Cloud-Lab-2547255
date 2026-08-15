# Phase 1 Decision Report — ML CIA-3, Assam Flood

**Course:** MCA 521-4 Machine Learning · **Assessment:** CIA-3 · **Total:** 25 marks
**Prepared:** 2026-08-14 · **Status:** pre-implementation. No model has been trained.

Every figure below was measured from files on disk or from a live query to the source
portal. Where something is not yet measured, it says so explicitly.

---

## 1. Exact CIA-3 requirements

Source: `CIA 3 @Machine learning .docx.pdf` (3 pages), CHRIST (Deemed to be University),
Department of Computer Science.

**Framing:** "ML for Social Good Challenge". Build an end-to-end AI solution addressing a
real human or environmental problem **using advanced ensemble machine learning**. Choose
one of four missions: **Health, Earth (Environment), Inclusion, Crisis (Disaster response)**.

**Mark breakdown:**

| Q | Requirement | CO / RBT | Marks |
|---|---|---|---|
| 1 | **Real-world impact framing** — problem, beneficiaries, prediction target, measurable impact; justify why ML suits it; dataset source and **unit of analysis**; responsible-use limitations | CO5 / L2 | 5 |
| 2 | **Data wrangling & feature engineering** — leakage-safe pipeline; missing values, duplicates, invalid data, outliers, dtypes, categorical encoding, numerical scaling, **class imbalance**; EDA; domain-informed features; justify every decision; reproducible train/val/test | CO2 / L3 | 6 |
| 3 | **Ensemble architecture, tuning, comparison** — baseline (single Decision Tree *or* Logistic Regression); (a) bagging e.g. Random Forest; (b) boosting e.g. XGBoost/LightGBM/CatBoost/AdaBoost; (c) heterogeneous **stacking or voting**; correct CV; no leakage in meta-learning; compare on one untouched test set via ROC-AUC, F1, precision, recall, confusion matrix; show whether best ensemble beats baseline | CO2, CO3 / L3 | **8** |
| 4 | **Explainability & ethics** — SHAP/LIME or equivalent at **global and individual** level; interpret features in domain language; bias/fairness, privacy, uncertainty, FP/FN costs, human oversight, deployment limits | CO3, CO5 / L5 | 4 |
| 5 | **Three-minute pitch + live demo** — 0:00–0:35 problem/beneficiaries; 0:35–1:15 cleaning, EDA, feature engineering; 1:15–2:10 baseline vs bagging/boosting/stacking; 2:10–3:00 live prediction on one realistic **synthetic** record, local explanation, ethics, limitations. Show repo, a compact results visual, live model output | CO5 / L4 | 2 |

**Required submission:** codebase/notebook · README with reproducibility instructions and
dataset citation · results/figures · explainability output · ethics statement · 3-minute video.

**General instructions:** open/public dataset with citation; no PII or confidential data;
acknowledge borrowed code/figures/assets; academic integrity applies.

### Consequences that constrain everything downstream

1. **The target must be categorical.** ROC-AUC, F1, precision, recall and a confusion
   matrix are all classification metrics. A regression target would forfeit most of Q3.
2. **Class imbalance must be present and handled.** Q2 names it explicitly.
3. **A synthetic record is explicitly permitted — but only for the demo** (Q5), not for training.
4. Q3 alone is 8/25. The ensemble comparison is the centre of gravity, not the storytelling.

---

## 2. What the faculty video demonstrates

File: `ml_for_social_good_challenge.mp4` — **77 seconds**, 1920×1080, 30 fps, produced with
**Pictory** (AI video tool), stock footage plus burned-in captions.

Inspected by extracting 24 evenly-spaced frames (no ffmpeg available, so **the audio track
could not be transcribed**; the burned-in captions appear to carry the full narration).

Content, verbatim from the captions:

> "Welcome to your Machine Learning CIA 3 submission guide for the 'ML for Social Good' Ensemble Challenge!"
> 1. Choose one of four mission domains
> 2. Build and submit a complete ML pipeline repository
> 3. Show data cleaning, feature engineering, and ensemble training
> 4. **Include SHAP explainability and address model ethics**
> 5. Record and submit a crisp video pitch with demo
> "Check the google classroom for full instructions and deadline details."
> "Good luck, class, and let's build some AI for good!"

**Two conclusions that change the plan:**

- **This is a submission checklist, not a student exemplar.** There is no prior student
  video to out-produce. The working assumption that we must beat a faculty-made showcase
  is incorrect — the video simply restates the rubric. Production effort beyond a clean,
  clearly-narrated 3-minute screen recording earns nothing, because Q5 is worth **2 marks**.
- **The video says "SHAP", where the PDF says "SHAP/LIME or an equivalent defensible
  method".** Where the two differ, matching the video costs nothing. **Use SHAP.**

⚠️ There may be additional instructions or a deadline on **Google Classroom** that I have
no access to. Please check it — the video points there for "full instructions".

---

## 3. What previous labs / the repository already contain

| Lab | Topic | Key techniques evidenced in code |
|---|---|---|
| Lab 1 | Data preprocessing & visualisation (AQI data) | pandas, missing-value treatment, category standardisation, outlier treatment |
| Lab 2 | Data exploration & inference | EDA, transformation, merging, relationship analysis |
| Lab 3 | Simple linear regression | `LinearRegression`, `train_test_split`, MAE/MSE/R², pickling |
| Lab 4 | KNN classification & metrics | `KNeighborsClassifier`, `StandardScaler`, `PCA`, `cross_val_score`, precision/recall/F1, confusion matrix |
| Lab 5 | Linear regression via gradient descent | manual GD, `StandardScaler`, `LabelEncoder` |
| Lab 6 | Logistic Regression vs KNN | `LogisticRegression`, model comparison, timing, full metric suite |
| Lab 8 | ID3 decision tree (from scratch) + `CategoricalNB` | entropy/information gain by hand, `DecisionTreeClassifier`, `SVC` |
| Lab 9 | SVM + PCA (+ LDA extra credit) | `SVC`, `PCA`, `LDA`, `Pipeline`, `cross_val_score` |
| LabActivity | Decision tree on Iris | `DecisionTreeClassifier`, **`GridSearchCV`**, `plot_tree` |
| CIA-1 | Road accident analysis | pure pandas/seaborn EDA, IQR outliers, correlation — no sklearn |

**Already covered:** train/test split, cross-validation, GridSearchCV, scaling, encoding,
pipelines, PCA, the full classification metric suite, confusion matrices, decision trees,
logistic regression.

**Never covered anywhere in the repo:**
- ❌ Any ensemble — no `RandomForest`, no bagging, no boosting, no stacking/voting
- ❌ SHAP or LIME
- ❌ Class-imbalance handling (no SMOTE, no `class_weight`)
- ❌ `ColumnTransformer`, `StratifiedKFold`, `roc_auc_score`
- ❌ Time-aware / chronological splitting

This is the **LAB → CIA-3 progression**: the labs taught single models and correct
evaluation; CIA-3 requires ensembles, explainability and imbalance handling on top. The
ensembles genuinely *are* new learning, which is exactly what Q1/Q4 reward. Several labs
already contain a "Self-Learning Notes" section, so the format is familiar to the marker.

Also note: the repo already demonstrates a consistent notebook idiom — *Aim → Objectives →
Dataset Description → Problem Statement → Required Libraries → numbered Tasks, each with
"Purpose" / "Why This Step Is Needed" / "Observations"*. The CIA-3 notebook should follow
it, mapping tasks onto Q1–Q5.

---

## 4. Recommended Assam flood ML problem

> **Given rainfall conditions in an Assam district up to a given day of the flood season,
> predict whether that district will be reported flood-affected.**

**Mission:** Earth (Environment). **Unit of analysis:** one district on one calendar date.

**Why this and not the alternatives:**
- It is a **binary classification** problem → fits every Q3 metric.
- It is **naturally imbalanced** → Q2's imbalance requirement is genuine, not manufactured.
- Features are **physically causal** (rain drives flooding), so SHAP output will be
  interpretable in plain domain language for Q4.
- Beneficiaries are concrete: district disaster-management authorities, ASDMA, residents.

⚠️ **Scope caveat requiring your decision.** Mission Earth's listed examples are AQI,
forest-fire risk and clean-water accessibility. Flood is *not* named. The column heading is
"**Possible** problem", which reads as illustrative, and flood is unambiguously
environmental — but flood also arguably belongs to **Mission Crisis (disaster response)**,
whose example is "classify and prioritise incoming emergency-help requests", which does not
match what we are building. **Confirm with faculty that flood risk under Mission Earth is
acceptable.** This is the single cheapest way to protect 5 marks on Q1.

---

## 5. Recommended target variable

`flood_affected` ∈ {0, 1} — was district *d* listed as flood-affected in the ASDMA DRIMS
Daily Flood Report for date *t*?

Derived from the report's **`Name Of Revenue Circle Affected`** block, which lists one row
per affected district. A district present → 1; a district absent on a day where a report
exists → 0.

**Optional stretch (only if the binary version is fully working):** a 3-class severity
target from population/crop-area affected. Not recommended initially — it splits the
positive class and weakens the headline comparison.

---

## 6. Recommended input features

Only information available **at or before** the prediction date.

**Rainfall (primary, district-aggregated per day):**
- same-day rainfall; 3-, 7-, 15-day rolling totals
- days since last heavy-rain event; consecutive wet days
- rainfall vs that district's seasonal norm (anomaly)
- district max vs mean across its stations (spatial spread)
- number of reporting stations that day (data-density control)

**Temporal:** month, day-of-year, week-of-season, monsoon phase (pre/peak/post).

**Spatial/static:** district (encoded); optionally whether the district contains one of the
26 official danger-level gauges, and whether it sits on the Brahmaputra or Barak system.

**Optional auxiliary (10 districts only):** temperature, humidity, pressure, wind, solar
radiation. **Recommendation: exclude from the main model** — available for only 10 of 22
districts, so including them either drops half the data or injects a large missing block.
Better used as an EDA aside.

**Explicitly excluded as leakage** — these are same-day *consequences*, not predictors:
population affected, crop area affected, relief camps, inmates, lives lost, animals
affected, houses damaged, embankments breached, rescue operations.

---

## 7. Best dataset / source — recommended

A **purpose-built two-source join**, both official, both already downloaded:

**Labels — ASDMA DRIMS Daily Flood Reports**
<https://sdrf.assam.gov.in/dfr/> → Download Report → Flood (public, no login)
`data/raw/drims_daily_flood/` — **285 PDFs** retrieved.

**Features — CWC Assam daily rainfall (NWDP)**
<https://nwdp.nwic.gov.in> — Rainfall (Manual - Daily), Central Water Commission
`rainfall_manual_daily_cwc_as_2021_2025.csv` (66,145 rows, 80 stations, 23 districts)
`rainfall_manual_daily_cwc_as_2026_2030.csv` (11,886 rows, 74 stations, 22 districts)

**Supporting reference — Assam WRD official danger levels**
26 gauges with Danger Level, Highest Flood Level and HFL date, incl. 6 Brahmaputra gauges.
`data/raw/reference/assam_river_danger_levels.csv`

**Alignment:** by **district name** and **calendar date**. Both sources are daily and
district-attributed, so the join is direct. Rainfall is station-level and must first be
aggregated to district-day (mean *and* max).

**Limitation of the join:** rainfall station density varies by district, so a district-day
mean is not a uniform-quality measurement. Carry station count as a feature and say so in
the limitations section.

---

## 8. Alternative dataset options (and why they are not first choice)

| Option | Verdict |
|---|---|
| **ASDMA Flood Memoranda 2015–2025** (11 PDFs, downloaded, text-extractable) | Granularity is **annual × district** ≈ 385 rows — too coarse and too small to train four model families on. **Keep for problem framing, EDA context and impact narrative.** Genuinely valuable for Q1. |
| **Assam WRD river water level** (`rwl_tel_hr_assam_999_*.csv`) | **Rejected.** Only **3 stations** (all NH road crossings, none among the 26 official gauges); `River`/`Basin` columns all `-`; `RL_of_zeroGauge` and `MeanSeaLevel` both `0`, so readings are gauge stage (e.g. `0.296 m`) with no datum to convert to mSL — they cannot be compared to danger levels (e.g. Dibrugarh `105.70 m`). This kills the intuitive "river level vs danger level" design. |
| **CWC national river water level (NWDP)** | **Rejected — no Brahmaputra and no Barak basin exist in the published data.** Only peninsular/western basins; Ganga and Indus also absent. ⚠️ "Brahmani and Baitarni" is an Odisha/Jharkhand basin and must not be mistaken for the Brahmaputra. |
| **Assam WRD daily rainfall** (43 stations, 2001–2020; 38 stations, 2021–2023) | Secondary. Does not cover the 2025/2026 label seasons. Useful for long-run climatology context only. |
| **CWC telemetry hourly rainfall** (137,659 rows) | Secondary — value column is ~74% null. |
| **Assam meteorology** (temp/humidity/pressure/wind/solar) | 10 stations / 10 districts, 2022–2025. Auxiliary only. |
| **Generic Kaggle "flood prediction" dataset** | **Rejected.** Not Assam-specific, provenance unclear. Would undermine Q1's "describe the dataset source". |
| **IMD** | Public district rainfall is presented through interactive dashboards rather than a documented bulk API; NWDP already supplies CWC-observed rainfall for Assam in machine-readable CSV, so IMD was not pursued. Revisit only if district coverage proves insufficient. |

---

## 9. Historical time coverage

**Binding constraint: the labels.** Verified by probing the DRIMS portal date by date:

| Season | Label coverage | Reports retrieved |
|---|---|---|
| 2025 | 2025-05-01 → 2025-10-31 | 181 |
| 2026 | 2026-05-01 → 2026-08-13 (season in progress) | 104 |

Dates outside these windows return the HTML form, not a PDF — **no report exists off-season**.
4 in-season dates have no report (2025-05-03, 2025-05-04, 2025-09-28, 2026-05-30); these are
logged as `absent` and treated as missing, **not** as "no flood".

Reports are filed on *every* in-season day, not only flood days, so real negatives exist —
several sampled days list no affected districts at all.

Rainfall extends far wider (2021→2026 for CWC; 2001→2020 for Assam WRD), but **it cannot be
used for supervised training beyond the label window.**

➡️ **Effective modelling window: two flood seasons.** This is the dataset's principal
weakness and must be stated plainly in Q1's responsible-use limitations and again in Q4.

---

## 10. Geographic coverage

- **Labels:** state-wide — DRIMS covers all Assam districts and revenue circles.
- **Features:** **22 districts** carry CWC daily rainfall in both label seasons, out of
  Assam's 35. Verified district list (CWC spelling): Baksa, Barpeta, Bongaigaon, Cachar,
  Chirang, Dhemaji*, Dhubri, Dibrugarh, Goalpara, Golaghat, Hailakandi, Jorhat, Kamrup,
  Karbi Anglong, Karimganj, Kokrajhar, Lakhimpur, Marigaon, Nagaon, Nalbari, Sivsagar,
  Sonitpur, Tinsukia. (*Dhemaji present 2021–2025, absent from the 2026 file.)
- **Excluded for want of rainfall data:** ~13 districts including Majuli, Charaideo,
  Biswanath, Hojai, Dima Hasao, South Salmara, Bajali, Tamulpur, Udalguri, Darrang.

➡️ The model is **district-level, not village-level**, and covers roughly two-thirds of
Assam's districts. Say this explicitly rather than implying state-wide coverage.

---

## 11. Expected number of usable records

Measured from the rainfall files, restricted to the label windows:

| Season | Rainfall rows | Districts | Distinct dates | Stations |
|---|---|---|---|---|
| 2025-05-01 → 2025-10-31 | 12,265 | 22 | 159 | 73 |
| 2026-05-01 → 2026-08-13 | 9,332 | 22 | 104 | 74 |

After aggregating station-days to district-days:

- 2025: 159 dates × 22 districts ≈ **3,498 rows**
- 2026: 104 dates × 22 districts ≈ **2,288 rows**
- **Total ≈ 5,800 district-day rows (upper bound)**

This is an **upper bound**: it assumes every district reports rainfall on every date. The
true figure will be lower and is only knowable after the join. ~5,000+ rows with ~10–15
engineered features is comfortably adequate for the four required model families.

---

## 12. Missing-data situation

**Measured:**
- CWC daily rainfall value column: **0 nulls** in both 2021-2025 and 2026 files. Missing
  data appears as *absent station-days*, not null cells — so the gap is in coverage, not values.
- CWC telemetry hourly rainfall: 102,350 / 137,659 null (~74%) — a reason to prefer the daily series.
- 4 DRIMS in-season dates absent (§9).
- Rainfall station count varies by district and over time (80 → 74 stations between files).
- 13 districts have no rainfall feed at all (§10).

**Not yet measured — and I will not estimate it:**
- **The class balance (positive rate).** A quick recon parser bled across PDF section
  boundaries and returned school names, water-supply schemes and road names as "districts"
  (265 on one day), so its output is meaningless. The real rate needs the production
  section-bounded parser. **This is the first number to establish in Phase 2**, because it
  determines the imbalance strategy and whether ROC-AUC or PR-AUC should lead.

---

## 13. How the target will be created

1. For each of the 285 PDFs, parse **section-bounded, label-anchored** blocks — locate
   `Name Of Revenue Circle Affected`, read the `District` column of its rows, stop at the
   next section header (`Villages Affected`). Never parse by fixed column index: column
   counts vary from 8 to 13 across PDFs while row labels stay stable.
2. Normalise district names through an **explicit crosswalk** (§14) to a single canonical set.
3. Build the full district × date grid for all in-season dates where a report exists.
4. `flood_affected = 1` where the district appears in that date's affected list, else `0`.
5. Drop the 4 absent dates entirely — do **not** encode them as 0.
6. Audit: row count, per-season positive counts, per-district positive counts, and a
   manual spot-check of ~10 dates against the original PDFs before any modelling.

---

## 14. Potential data-leakage risks

| # | Risk | Mitigation |
|---|---|---|
| 1 | **Outcome fields as features** — population affected, relief camps, damage, lives lost are same-day *consequences* of the flood being predicted. Including any would be catastrophic leakage and near-perfect accuracy. | Whitelist features explicitly; never `df.drop(target)`. |
| 2 | **Rolling-window leakage** — computing 7-day rainfall totals across the whole dataset before splitting leaks future values backwards. | Compute rolling features **within each district, strictly backward-looking**, and only after the chronological split boundary is fixed. |
| 3 | **Random splitting of time-series data** — adjacent days are highly correlated; a random split puts 14 July in train and 15 July in test, inflating scores. | **Chronological split** (§15). |
| 4 | **Scaler/encoder fitted on all data** | Fit inside a `Pipeline`, on training folds only. |
| 5 | **Stacking meta-learner leakage** — training the meta-model on base predictions made on data the base models saw. | Use `StackingClassifier` with internal CV (`cv=`), never in-sample base predictions. |
| 6 | **Imbalance resampling before splitting** — SMOTE on the full set copies synthetic neighbours of test rows into train. | Resample **inside the CV fold only**, via `imblearn.Pipeline`; or prefer `class_weight='balanced'`. |
| 7 | **District identity as a shortcut** — a district flooding often could be memorised rather than learned from rainfall. | Report per-district performance; check SHAP does not rank district above all rainfall features. |

---

## 15. Recommended train/test strategy

**Chronological, not random.**

- **Train:** 2025 season (2025-05-01 → 2025-10-31)
- **Test (untouched):** 2026 season (2026-05-01 → 2026-08-13)
- **Validation / tuning:** `TimeSeriesSplit` **within** the 2025 training data only.

This mirrors real deployment — fit on last year, predict this year — and gives Q3 the
"same untouched test set" it demands. It is also the honest answer to "how did you prevent
leakage", which is worth marks in itself.

⚠️ **Caveat to monitor:** 2026 is a partial season (May–mid-Aug) while 2025 is full
(May–Oct), so the test set over-weights early monsoon. If train/test distributions prove
too different, the fallback is a chronological split *within* pooled seasons (e.g. first
75% of dates train, last 25% test) — but the year-holdout should be attempted first
because it is the stronger claim. State whichever is used, and why.

Stratification note: with chronological splitting you cannot stratify by class. Report the
positive rate in each split so the marker can see the split is not degenerate.

---

## 16. Recommended ML algorithms

Exactly as Q3 prescribes — no more, no less:

| Role | Model | Why |
|---|---|---|
| **Baseline** | `LogisticRegression` (`class_weight='balanced'`) | Q3 permits DT or LogReg; LogReg gives calibrated probabilities for ROC-AUC and is already familiar from Lab 6. Also fit a single `DecisionTreeClassifier` for contrast — cheap, and covered in Lab 8. |
| **Bagging** | `RandomForestClassifier` | Named in the brief; handles non-linear rainfall thresholds; native feature importances. |
| **Boosting** | `XGBoost` *or* `LightGBM` — pick one | Named in the brief. If installation is a problem, sklearn's `HistGradientBoostingClassifier` or `AdaBoostClassifier` are defensible substitutes; say which and why. |
| **Stacking / voting** | `StackingClassifier` (LogReg + RF + boosting → LogReg meta-learner), with `VotingClassifier(voting='soft')` as comparison | Q3 requires a **heterogeneous** ensemble — the base learners must be different families. |

**Tuning:** `RandomizedSearchCV` over a small, defensible grid with `TimeSeriesSplit`,
scoring on F1 or PR-AUC (not accuracy). Keep grids small and explainable — you must defend
every hyperparameter in the viva.

**Metrics:** ROC-AUC, F1, precision, recall, confusion matrix — all on the same untouched
test set, presented as one comparison table plus one grouped bar chart.

⚠️ **Be prepared for the ensemble *not* to beat the baseline.** Q3 says "demonstrate
**whether** the best ensemble outperforms the baseline" — it does not require that it does.
An honest "RF beat LogReg on recall but not on ROC-AUC, and here is why" is worth full
marks and is far safer than tuning until the desired answer appears.

---

## 17. Recommended self-learning concepts (choose 2)

**Concept 1 — Class-imbalance handling.** *(strongest choice)*
Never taught in any lab. Directly required by Q2. Compare `class_weight='balanced'` vs
SMOTE-inside-CV vs no treatment, and add **decision-threshold tuning** — moving the
threshold off 0.5 to trade precision for recall. This connects straight to Q4's
false-negative cost argument: a missed flood warning is far worse than a false alarm.

**Concept 2 — SHAP explainability.**
Never taught in any lab. Required by Q4 (4 marks) and named explicitly in the faculty
video. Deliver a global beeswarm/bar plot plus a local waterfall/force plot for one
prediction — which is exactly the 2:10–3:00 video segment.

*Not recommended:* cross-validation (already in Labs 4 and 9 — not new learning);
hyperparameter tuning (GridSearchCV already used in LabActivity).

---

## 18. What will be demonstrated in the video

3 minutes, following the assignment's timestamps exactly. A clean screen recording with
clear narration — Q5 is **2 marks**, so production value is not where effort belongs.

| Time | Content |
|---|---|
| 0:00–0:35 | Assam's recurring annual flood; beneficiaries (district authorities, ASDMA, residents); what we predict — district-level flood risk from rainfall |
| 0:35–1:15 | Data sources on screen (ASDMA DRIMS + CWC/NWDP); the district×date unit; cleaning, the district crosswalk, engineered rainfall-accumulation features |
| 1:15–2:10 | Results table + bar chart: baseline vs RF vs boosting vs stacking on ROC-AUC/F1/precision/recall; confusion matrix of the best model |
| 2:10–3:00 | **Live prediction on one clearly-labelled synthetic district-day record**; SHAP local explanation; FP vs FN costs; limitations (two seasons only, 22 of 35 districts, district-level not village-level); human oversight — decision support, never an automated warning |

Explicitly **not** claimed: that the model can prevent floods, that it replaces CWC/ASDMA
official warnings, or that it is validated for operational use.

---

## 19. Potential CIA-3 mark-loss risks

| # | Risk | Marks at stake | Mitigation |
|---|---|---|---|
| 1 | **Flood judged out of scope for Mission Earth** | Q1 · 5 | **Confirm with faculty now** (§4). Fallback framing: Mission Crisis. |
| 2 | **DRIMS parser mis-extracts districts** — already demonstrated to be easy to get wrong | Q2 · 6 and the entire target | Section-bounded label-anchored parser; manual spot-check of ~10 dates against source PDFs; publish an audit table. |
| 3 | **Leakage via outcome columns** — would produce ~99% accuracy and read as a red flag | Q2, Q3 · up to 14 | Explicit feature whitelist; chronological split; document it as a deliberate design decision. |
| 4 | **Only two seasons of labels** — marker may judge the evidence base thin | Q1, Q4 | State it up front as a known limitation rather than letting the marker find it. Strengthen context using the 2015–2025 memoranda. |
| 5 | **Ensemble fails to beat baseline** | Q3 · 8 | Report honestly with analysis; Q3 asks "whether", not "that". |
| 6 | **Boosting library not installed** (XGBoost/LightGBM absent from the venv) | Q3 · 8 | Verify install early; `HistGradientBoostingClassifier` / `AdaBoost` fallback documented. |
| 7 | **Stacking meta-learner leakage** | Q3 · 8 | `StackingClassifier(cv=...)`, never in-sample base predictions. |
| 8 | **SHAP omitted or global-only** — Q4 demands global **and** individual | Q4 · 4 | Both plots; interpret in rainfall/flood language, not "feature_7 has high SHAP value". |
| 9 | **Video over 3 minutes or wrong order** | Q5 · 2 | Script to the timestamps; rehearse; hard-cut at 3:00. |
| 10 | **Missing README / citation / ethics statement** — a listed submission requirement | across | `DATA_SOURCES.md` already covers provenance and citation; add reproducibility steps and a standalone ethics statement. |
| 11 | **Unacknowledged borrowed code/assets** | integrity | Cite SHAP, sklearn, XGBoost and all data sources. |
| 12 | **Additional Google Classroom instructions not seen** | unknown | ⚠️ **Please check Google Classroom** — the faculty video refers to it for full instructions and the deadline. |

---

## Recommendation

Proceed on the DRIMS × CWC-rainfall district-day formulation. Before Phase 2 begins, two
things need your input:

1. **Confirm Mission Earth covers flood risk** with your faculty (protects 5 marks).
2. **Check Google Classroom** for instructions or a deadline I cannot see.

First task in Phase 2, before any modelling: build the section-bounded DRIMS parser and
**measure the actual class balance** — that number determines the imbalance strategy and
whether ROC-AUC or PR-AUC leads the comparison.
