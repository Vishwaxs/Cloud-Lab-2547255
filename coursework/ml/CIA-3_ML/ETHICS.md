# Ethics and Responsible-Use Statement

**Project:** District-level flood-risk classification for Assam
**Course:** MCA 521-4 Machine Learning — CIA-3, ML for Social Good Ensemble Challenge

This model is a **decision-support prototype built for a university assessment**. It is
not validated for operational use and must not be used to issue public flood warnings.
The authoritative sources remain the **Central Water Commission** flood bulletins and
**ASDMA**.

---

## 1. What the model does and does not do

**Does:** estimate the probability that a given Assam district will be *reported
flood-affected* on a given day of the monsoon season, using rainfall observed **up to the
previous day**.

**Does not:** predict flood depth, extent, timing within the day, which villages will
flood, or the damage that will follow. It does not predict floods caused by mechanisms
absent from the data — embankment breaches, dam releases, landslide-dammed rivers, or
rainfall falling upstream in Arunachal Pradesh, Bhutan or Meghalaya, which drives much of
the Brahmaputra's discharge.

---

## 2. False positives and false negatives — asymmetric costs

| | Meaning | Consequence |
|---|---|---|
| **False positive** | Model says flood; none occurs | Wasted mobilisation: relief materials staged, boats moved, staff on standby. Costly and, if repeated, erodes trust and produces alert fatigue — a real harm, because the *next* warning gets ignored. |
| **False negative** | Model says no flood; flood occurs | Communities unprepared. Potential loss of life, livestock, crops and property. **Far more severe.** |

**The costs are not symmetric, so the decision threshold should not be 0.5.** We tune the
threshold on the training data to maximise F1, but an operational deployment should push
the threshold *lower* to buy recall at the cost of precision — a missed flood is worse
than a wasted mobilisation.

On the untouched 2026 test set the best model still produces substantial errors in both
directions (see `results/metrics/model_comparison.csv`). **At this performance level the
model is not fit to drive action on its own.**

---

## 3. Bias and fairness

**Geographic bias is the dominant fairness problem here, and it is severe.**

- **Dhemaji is excluded entirely.** It is the *most* flood-affected district in the ASDMA
  record (89 positive days, a 32% positive rate), yet the Central Water Commission
  publishes only **2 rainfall observations for it, ever**. A model that cannot see the
  worst-affected district systematically under-serves the people most exposed.
- **21 of Assam's 35 districts are covered.** The 14 excluded districts — including
  Majuli, Charaideo, Biswanath, Hojai, Dima Hasao, Udalguri and Kamrup Metropolitan — have
  no usable rainfall feed. Exclusion is driven by *monitoring infrastructure*, not by flood
  risk, and under-monitored areas are frequently the less-resourced ones.
- **Station density varies from 44% to 85% of days by district.** Districts with sparser
  networks get noisier features and therefore less reliable predictions — the model is
  quietly less accurate exactly where measurement is weakest.

**Consequence:** improving flood monitoring in Assam is a prerequisite for equitable
prediction. The model inherits, and risks entrenching, existing gaps in who gets measured.

---

## 4. A leakage artefact we found and removed

An engineered feature, `rain_obs_prev7d` (the number of days in the previous week with any
rainfall observation), was initially included as a data-density control. SHAP identified it
as the second-strongest positive contributor, which prompted investigation.

**Finding:** within the same district, stations report on **~1.31 more days** in the week
before a flood day than before a non-flood day (point-biserial r = 0.14 — comparable to the
genuine rainfall features). Monitoring intensifies during flood events, so the count
partially encodes the outcome it was meant to predict.

The feature was **removed**. Test PR-AUC fell from 0.293 to 0.268 as a result. We report the
lower, honest figure. This is a good illustration of why explainability is a *safety* tool
and not decoration: the leak was invisible in the headline metrics and obvious in SHAP.

---

## 5. Privacy

No personally identifiable information is used. All inputs are **district-level aggregate**
rainfall measurements from government monitoring stations and **district-level** flood
status from public ASDMA reports.

The DRIMS reports do contain counts of affected people, relief-camp inmates and casualties.
These are **aggregate counts, never individual records**, and none of them enter the feature
matrix — they are same-day outcomes and were excluded on leakage grounds as well as
privacy grounds. The finest spatial unit used is the district.

---

## 5a. A demonstrated blind spot — the July 2026 floods

The clearest evidence for the limits of this model comes from the test season itself.

The worst flood day of 2026 was **20 July (16 districts affected)**. The model's recall on
that day was **0.36**, against **0.56** across the season — it failed hardest exactly when
it mattered most.

**Rainfall measured inside Assam that week averaged 7.8 mm/day, against a season average of
7.9 mm/day.** External reporting (IMD; an Assam University study) attributes the floods to
sustained extreme rainfall over **upstream catchments in Nagaland and Arunachal Pradesh**,
which swelled the Dikhow, Disang, Janji and Dhansiri until they overtopped embankments.

This is not a tuning failure — it is a **data-availability boundary**. It has a direct
ethical consequence: **a system with this blind spot would have been quietest during the
event that most needed a warning.** Any deployment must therefore ingest upstream
catchment rainfall and river levels before it is trusted at all, and must fail loudly
rather than silently when its inputs do not cover the driving mechanism.

---

## 6. Uncertainty

- **Only two flood seasons of labels exist** (2025, 2026-partial). This is a small
  evidentiary base for a claim about a recurring annual hazard, and the single largest
  limitation of the work.
- The test season (2026) is **partial** — May to mid-August — and weighted toward peak
  monsoon, so its positive rate (11.1%) exceeds the training season's (8.1%). Train and
  test are not drawn from identical distributions.
- Predicted probabilities are **not calibrated**; they rank days, they are not
  reliable literal probabilities of flooding.
- Performance is reported on a single chronological split. With one held-out season there
  is no way to place a confidence interval on the generalisation estimate.

---

## 7. Human oversight

This model must operate strictly as an **advisory input to a human decision-maker**, never
as an automated trigger. Any deployment should:

1. present the probability **alongside its SHAP explanation**, so an officer can see whether
   a flag rests on genuine rainfall or merely on the district's historical base rate;
2. present the **official CWC river-level bulletin next to** the model output, since river
   level is the physically direct indicator and the model does not observe it;
3. **log every prediction and every outcome**, so real-world performance is measured rather
   than assumed;
4. route final warning decisions through ASDMA and district disaster-management
   authorities.

---

## 8. Limits on deployment — explicit

**This model should not be deployed operationally in its current form.** In addition to the
gaps above:

- Recall on the untouched test season is well below what a life-safety system requires.
- It has never been validated against an independent flood record.
- It has no access to river level, discharge, embankment condition, or upstream rainfall —
  the variables that actually drive Brahmaputra and Barak flooding.
- It cannot generalise beyond Assam, beyond the monsoon season, or to districts absent from
  the training data.

**The honest summary: this project demonstrates that a defensible, leakage-safe ML pipeline
can be built end-to-end from real Assam government data, and that publicly available
rainfall alone carries a weak but genuine flood signal. It does not demonstrate a system
ready to protect anyone.** Saying so is part of doing the work responsibly.

---

## 9. Data provenance and acknowledgements

All data is open public government data — see `DATA_SOURCES.md` for full citations:
ASDMA DRIMS daily flood reports; Central Water Commission rainfall via the National Water
Data Portal; Assam Water Resources Department danger levels.

Software acknowledged: scikit-learn, XGBoost, SHAP, imbalanced-learn, pandas, NumPy,
Matplotlib, seaborn, pdfplumber.
