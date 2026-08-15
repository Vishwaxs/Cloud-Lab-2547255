# Phase 2 Dataset Audit — Assam Flood District-Day Dataset

**Status:** label construction complete and verified. **No modelling has been done.**
No scaling, resampling, encoding or feature selection has been applied.

Produced by `src/parse_drims_reports.py` → `src/district_crosswalk.py` → `src/build_dataset.py`.
Machine-readable audit: `reports/phase2_audit.txt`, `data/processed/audit_district_coverage.csv`.

---

## Headline numbers

| | |
|---|---|
| **Final rows (district-days)** | **5,773** |
| **Positive (`flood_affected`=1)** | **534** |
| **Negative** | **5,239** |
| **Class balance** | **9.25% positive** |
| **Negatives : positives** | **9.8 : 1** |
| Districts | 21 |
| Dates | 277 |
| Date range | 2025-05-02 → 2026-08-13 |
| Duplicate district-days | **0** |

| Split | Rows | Dates | Positives | Positive % |
|---|---|---|---|---|
| `train_2025` | 3,611 | 174 | 294 | 8.14% |
| `test_2026` | 2,162 | 103 | 240 | 11.10% |

The imbalance is real and moderate — strong enough to make Q2's class-imbalance
requirement meaningful, not so extreme that the positive class is unlearnable.

---

## Label quality — what the parser had to survive

The first parser attempt was wrong, and checking it caught four separate defects. Each
is now handled explicitly in code.

**1. Wrong sections produce false positives.** Sections such as
`Population And Crop Area Affected` list districts with all-zero rows that were *not*
reported affected — on 2026-06-20 that section names Bongaigaon while the affected
districts are only Dhemaji, Dibrugarh and Charaideo. Only two sections are authoritative
and both are used: `District Affected` (count + comma list) and
`Name Of Revenue Circle Affected` (one row per affected district).

**2. The portal serves the wrong report type.** 6 of 285 downloaded PDFs were not
riverine flood reports and are **excluded**:

| Date | Actual report type |
|---|---|
| 2025-06-07, 2025-08-02, 2025-09-20, 2025-09-30, 2026-05-22 | Assam **Urban** Flood Report |
| 2025-06-16 | Assam **Storm** Report |

**3. The portal serves the wrong date.** Two files contain a different date's report:

| Requested | Actually contained |
|---|---|
| 2025-05-24 | 2025-05-22 |
| 2025-09-21 | 2025-09-28 |

The title line inside each PDF is therefore treated as authoritative and the filename as
a hint only. 2025-05-22 then arrived twice (once correctly, once via the 05-24 file); the
duplicate was resolved by keeping the copy whose filename matched its own internal date.

**4. PDF line-wrap splits district names mid-word.** `Lakhimpur` appears as `Lakhimp ur`
and `Lakhimpu r`; `Dima-Hasao` as `Dima- Hasao`; `Kamrup (M)` as `Kamr up M`. Matching on
a letters-only key collapses these without fuzzy matching. This reduced 49 raw name
variants to **33 distinct districts**.

**Cross-validation between the two authoritative sections: 275 / 278 dates agree.** The
3 remaining disagreements are recorded, not silently resolved:

| Date | Disagreement |
|---|---|
| 2025-10-06 | in revenue-circle block only: Dhemaji, Jorhat, Kokrajhar |
| 2026-07-02 | in district list only: Dhemaji, Dibrugarh |
| 2026-07-23 | in district list only: Hojai |

The union of both sections is used, so these 3 dates are treated as affected. They are
6 district-days out of 534 positives (~1%).

**Declared-count check: 0 mismatches.** On every retained date the report's own
"No. of Districts Affected" figure equals the number of districts parsed from the list.

### Manual spot-check against raw PDF text — 8/8 correct

| Date | District | Label | Present in PDF text |
|---|---|---|---|
| 2026-08-08 | Sonitpur | 1 | ✅ yes |
| 2025-07-07 | Sivasagar | 1 | ✅ yes |
| 2026-06-30 | Nalbari | 1 | ✅ yes |
| 2026-06-20 | Dibrugarh | 1 | ✅ yes |
| 2025-07-15 | Nagaon | 1 | ✅ yes |
| 2025-05-05 | Baksa | 0 | ✅ no |
| 2025-07-15 | Cachar | 0 | ✅ no |
| 2026-06-20 | Cachar | 0 | ✅ no |

**Negative class verified as genuine.** 94 retained dates report
`No. of Districts Affected: 0` with `Nil` rows throughout and `Rivers flowing above
danger level: Nil`. These are real no-flood days, not parse failures.

---

## District crosswalk

Built explicitly in `src/district_crosswalk.py` — **no fuzzy matching**, because a wrong
auto-match would silently mislabel a district. **Zero unmapped names on either side.**

| Source spelling | Canonical | Note |
|---|---|---|
| `MARIGAON` (CWC) | Morigaon | spelling variant |
| `SIVSAGAR` (CWC) | Sivasagar | spelling variant |
| `KARIMGANJ` (CWC) | Sribhumi | **district renamed in 2024 — same district** |
| `Kamrup (M)` (DRIMS) | Kamrup Metropolitan | kept **separate** from Kamrup (Rural) |
| `Dima-Hasao` | Dima Hasao | |
| `Karbi Anglong West` | West Karbi Anglong | |
| `South Salmara` | South Salmara-Mankachar | |

CWC also publishes district names in UPPERCASE, which the letters-only key handles.

| | Count |
|---|---|
| Districts in DRIMS | 33 |
| Districts in CWC rainfall | 23 |
| **In both (modellable)** | **22** |
| In rainfall but never flooded | 1 (Dhubri) |
| Flooded but no rainfall feed | 11 (Bajali, Biswanath, Charaideo, Darrang, Dima Hasao, Hojai, Kamrup Metropolitan, Majuli, South Salmara-Mankachar, Udalguri, West Karbi Anglong) |

---

## ⚠️ The most important finding: Dhemaji was dropped

**Dhemaji is the single most flood-affected district in the data — 89 positive days, a
32% positive rate — and CWC publishes only 2 rainfall observations for it, ever
(one in 2022, one in 2023).**

Keeping it would mean asking the model to predict floods from no input at all. It is
therefore excluded (rainfall coverage 0% < the 20% threshold), costing 89 positives.

This must be stated in the CIA-3 limitations section. It is a genuine coverage gap in
the public data, not a modelling choice — and it means **the model is blind to the
district that floods most**.

---

## Rainfall coverage and missingness

Nothing has been imputed. Missing stays missing.

- **35.9%** of district-days have no same-day rainfall observation at all.
- Mean stations reporting per district-day: **5.47**.
- Missingness is *coverage* (absent station-days), not null cells — the CWC value column
  itself has 0 nulls.

Feature-level missingness after anchoring on the 15-day window:

| Feature | Missing | % |
|---|---|---|
| `rain_prev15d_sum` | 0 | 0.0% |
| `rain_obs_prev7d` | 0 | 0.0% |
| `rain_prev7d_sum` | 188 | 3.3% |
| `rain_prev7d_max` | 188 | 3.3% |
| `rain_prev3d_sum` | 766 | 13.3% |
| `month`, `day_of_year`, `district` | 0 | 0.0% |

`rain_prev1d` was **dropped from the feature set** — 39% missing made it unusable.
Remaining NaNs are deliberately **left in the file** to be imputed inside the modelling
pipeline *after* the split.

Per-district rainfall coverage ranges from **44.0%** (Karbi Anglong) to **84.8%**
(Sribhumi) — full table in `data/processed/audit_district_coverage.csv`. `rain_obs_prev7d`
is carried as a feature so the model can discount barely-observed district-days.

---

## Date coverage and missing dates

| Season | Calendar days | With a usable report | Missing |
|---|---|---|---|
| 2025-05-01 → 2025-10-31 | 184 | 175 | 9 |
| 2026-05-01 → 2026-08-13 | 105 | 103 | 2 |

Missing 2025: 05-03, 05-04, 05-24, 06-07, 06-16, 08-02, 09-20, 09-21, 09-30.
Missing 2026: 05-22, 05-30.

These are dropped entirely — **never encoded as "no flood"**, which would manufacture
false negatives.

---

## Leakage checks — all pass

| # | Check | Result |
|---|---|---|
| 1 | Same-day rainfall excluded from features | ✅ `rain_mean_mm`/`max`/`sum` kept for EDA only, not in `FEATURES` |
| 2 | Rolling windows strictly backward-looking | ✅ `.shift(1)` applied before every `.rolling()` — a row never sees its own day |
| 3 | No DRIMS outcome fields present | ✅ population, relief camps, damage, lives lost never read into the table |
| 4 | Chronological split | ✅ train ≤ 2025-10-31, test ≥ 2026-05-01 |
| 5 | Train/test date overlap | ✅ **0** |
| 6 | No resampling/scaling/selection pre-split | ✅ none applied |

**Final feature set for Phase 3:**
`rain_prev3d_sum`, `rain_prev7d_sum`, `rain_prev15d_sum`, `rain_prev7d_max`,
`rain_anom_7d`, `rain_anom_15d`, `rain_state_prev3d`, `wet_days_prev7d`,
`month`, `day_of_year`, `district`

> **Update after Phase 3.** `rain_obs_prev7d` was originally included here as a
> data-density control. SHAP later ranked it the second-strongest positive contributor,
> and investigation showed rainfall stations report on **~1.31 more days** in the week
> before a flood day than before a non-flood day within the same district
> (point-biserial r = 0.14). Monitoring intensifies during flood events, so the feature
> partially encoded the outcome. **It was removed**, and test PR-AUC fell from 0.293 to
> 0.268. The lower figure is the one reported. See `ETHICS.md` §4.

---

## Verified example records

**Positives**

| District | Date | Label | prev3d (mm) | prev7d (mm) | stations |
|---|---|---|---|---|---|
| Sonitpur | 2026-08-08 | 1 | 113.98 | 161.45 | 6 |
| Lakhimpur | 2026-08-03 | 1 | 30.85 | 128.08 | 8 |
| Nalbari | 2026-06-30 | 1 | 94.48 | 124.05 | 1 |
| Sivasagar | 2025-07-07 | 1 | 20.31 | 117.06 | 2 |

**Negatives**

| District | Date | Label | prev3d (mm) | prev7d (mm) | stations |
|---|---|---|---|---|---|
| Baksa | 2025-05-05 | 0 | 2.60 | 2.60 | 6 |
| Baksa | 2025-05-07 | 0 | 28.27 | 30.87 | 1 |
| Baksa | 2025-05-08 | 0 | 31.87 | 34.47 | 3 |
| Cachar | 2025-07-15 | 0 | — | — | — |

The positives carry visibly higher antecedent rainfall than the negatives, which is the
physically expected signal. This is an encouraging sign, **not** evidence the model will
work — that is Phase 3's job to establish on the untouched 2026 test set.

---

## Unresolved data-quality issues

1. **Dhemaji excluded** — the most flood-prone district has no rainfall feed. Biggest
   single limitation; must appear in Q1 responsible-use and Q4 deployment limits.
2. **11 flooded districts have no rainfall feed** and are outside the model's reach.
   The model covers **21 of Assam's 35 districts**.
3. **3 dates disagree between the two authoritative sections** (~1% of positives). Union
   taken; individually listed above.
4. **Test-set positive rate (11.10%) exceeds train (8.14%).** Expected — 2026 is a
   partial season weighted toward peak monsoon, while 2025 runs May–October. Worth
   watching: it means test-set metrics are not perfectly comparable to train-set ones.
5. **Rainfall station density varies** (44%–85% coverage by district). A district-day
   mean is not a uniform-quality measurement; `rain_obs_prev7d` partly controls for this.
6. **Two seasons only.** Unchanged from Phase 1 and still the headline caveat.
7. **Same-day rainfall is excluded by design.** A same-day nowcast would likely score
   higher, but would not reflect what is knowable when a warning must be issued.

---

## Verdict

**The label is reliable enough to proceed.** The evidence: 0 declared-count mismatches,
275/278 section agreement, 8/8 manual spot-checks correct, 0 duplicates, contaminated
report types and wrong-date files identified and excluded, and a fully explicit crosswalk
with zero unmapped names.

The dataset is **5,773 district-days, 9.25% positive, 9.8:1 imbalance, chronologically
split 2025 → 2026** — appropriate for the Q3 ensemble comparison.

**Recommendation: proceed to Phase 3**, with Dhemaji's exclusion and the 21/35 district
coverage stated prominently in the write-up.
