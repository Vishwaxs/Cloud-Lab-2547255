# 3-Minute Video — Script & Frames

Two parts: **A = what you say**, **B = what's on screen**, **C = AI prompts** (only if you
want generated B-roll).

---

# PART A — SCRIPT (read this aloud)

## 0:00–0:35 — Problem

> Assam floods every single year. About 40% of the state is flood-prone, and the same
> districts go under, most years.
>
> The people who act on that are district disaster authorities — they decide where to move
> boats and relief supplies *before* the water arrives.
>
> So I asked: using only rainfall we've already measured, can we flag which districts will
> be reported flood-affected tomorrow?
>
> One district, one day, yes or no. That's my prediction target.

## 0:35–1:15 — Data & features

> No Assam flood dataset existed, so I built one. Labels from ASDMA's daily flood reports,
> rainfall from the Central Water Commission.
>
> The labels came as 285 PDFs, and that's where the work was. The portal gave me six wrong
> report types — urban flood and storm reports mixed in. It gave me two wrong dates
> entirely. And the PDF text broke district names mid-word, so Lakhimpur appeared three
> different ways.
>
> After cleaning: 5,773 district-days, 9% flood-affected. Properly imbalanced.
>
> For features I used rainfall built up over 3, 7 and 15 days — floods build as ground
> saturates. And rainfall compared to each district's own normal, because 100mm a week is
> routine in Cachar and extreme in Nalbari.

## 1:15–2:10 — Models

> I split by time. All of 2025 trains, all of 2026 is the test set, untouched. A random
> split would put July 14th in training and July 15th in test — that leaks.
>
> Logistic Regression as baseline, then Random Forest for bagging, XGBoost for boosting,
> and stacking plus soft voting. I selected on PR-AUC, not accuracy — at 9% positives,
> guessing "no flood" every time gives you 91% accuracy and is useless.
>
> Honest result: the ensembles did not beat the baseline. Logistic Regression got 0.77
> ROC-AUC, best ensemble 0.75.
>
> Why? With ten features the rainfall-to-flood relationship is close to monotonic, which
> suits a linear model. The trees kept splitting on district and memorising each district's
> 2025 rate — and those rates shifted in 2026. The question asked whether the ensemble
> wins. It didn't.

## 2:10–3:00 — Demo, SHAP, the key finding

**Run live:** `python src/predict_demo.py`

> Live prediction on a synthetic record — Lakhimpur, peak monsoon, 168mm in a week, 2.6
> times normal. Model says 0.92, flags it. SHAP shows the 15-day rainfall is doing the work.
>
> SHAP also caught my own mistake. I'd added a feature counting rainfall observations. SHAP
> ranked it second — so I checked, and stations report on 1.3 more days right before a
> flood. Monitoring ramps up during floods, so it was leaking the answer. I removed it and
> my score dropped from 0.293 to 0.268. I'm reporting the lower number.
>
> **And here's the main finding.** [show case_study_july2026.png]
>
> Worst flood day of 2026 was July 20th, 16 districts. My model caught 4 of 11. Recall 0.36,
> against its season average of 0.56. It failed worst exactly when it mattered.
>
> Rainfall inside Assam that week? 7.8mm a day, against a season average of 7.9. Completely
> normal. The water came from a cloudburst over Nagaland and Arunachal — upstream, outside
> my data. My own reports show it: rivers above danger level go from "Nil" to Burhidihing,
> Disang, Dikhow, Dhansiri in 48 hours.
>
> That's not something I could tune away. It's a data boundary, and it's the first thing I'd
> fix. Dhemaji, the worst-hit district, is excluded entirely — CWC publishes almost no
> rainfall for it. 21 of 35 districts. Two seasons.
>
> The pipeline is sound. The data isn't there yet.

---

# PART B — FRAMES (what's on screen, in order)

| # | Time | Show |
|---|---|---|
| 1 | 0:00–0:15 | Flood visual (B-roll or a real photo) |
| 2 | 0:15–0:35 | `data/processed/assam_flood_district_day.csv` open — the district×date table |
| 3 | 0:35–0:55 | The pipeline diagram in notebook §2 |
| 4 | 0:55–1:15 | `results/figures/eda_overview.png` |
| 5 | 1:15–1:35 | GitHub repo page (scroll the README) |
| 6 | 1:35–2:10 | `results/figures/model_comparison.png` |
| 7 | 2:10–2:30 | **Terminal — run `python src/predict_demo.py` live** |
| 8 | 2:30–2:40 | `results/figures/shap_local_waterfall.png` |
| 9 | 2:40–3:00 | `results/figures/case_study_july2026.png` |

---

# PART C — AI PROMPTS (optional, B-roll only)

Only needed for frame #1. Everything else is your own output. If you skip this, use a real
licensed photo instead.

**Veo 3.1 (Gemini app or Flow) — pick one:**

```
Slow aerial push over a wide swollen brown river in monsoon light, overcast grey sky,
flooded green farmland on both banks, cinematic, no text, no people, 8 seconds
```

```
Heavy monsoon rain falling on brown floodwater covering a rural road, static shot,
overcast, documentary style, no text, no people, 6 seconds
```

**Caption to burn onto any generated clip:**
```
AI-generated illustration
```

**Optional title card (Nano Banana / Gemini image):**
```
Minimal dark title card, text "Assam Flood Risk — Machine Learning CIA-3",
white sans-serif, subtle blue water texture, 16:9
```

---

# PART D — HOW TO RECORD

1. Open in tabs: notebook, GitHub repo, the 4 PNGs, a terminal at repo root.
2. Start **OBS** or **Xbox Game Bar** (`Win+G`) — 1080p, mic on.
3. Record **one take per section** (4 takes). A fumble costs 35s, not 3 min.
4. Run `predict_demo.py` live during take 4 — don't screenshot it.
5. Assemble in Clipchamp / Google Vids / DaVinci. Add captions.
6. Export MP4 1080p. **Time it — hard cut at 3:00.**

**Before you submit:**
- [ ] under 3:00
- [ ] repo shown
- [ ] `model_comparison.png` shown
- [ ] demo run live
- [ ] said the word "synthetic" for the demo record
- [ ] said the limits out loud (Dhemaji, 21/35, two seasons)
- [ ] credited any Veo clip
