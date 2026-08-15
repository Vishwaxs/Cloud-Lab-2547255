# Submission Checklist — CIA-3

Everything except the video is built and verified. Work through this in order; the git push
comes **before** recording so you can show a live repo URL on camera.

---

## STEP 1 — Verify (2 min)

```powershell
cd D:\Vvs_Project\coursework\ml\CIA-3_ML
python src\predict_demo.py          # should print PREDICTED FLOOD PROBABILITY : 0.918
```

Open `notebooks/CIA3_Assam_Flood_Ensemble.ipynb` and confirm you see charts, not empty
cells. It was executed with 18/18 code cells producing output, 0 errors, 8 figures.

- [ ] demo prints 0.918 and `FLOOD RISK FLAGGED`
- [ ] notebook shows rendered figures

---

## STEP 2 — Commit and push (5 min)

`.gitignore` already excludes `data/raw/` (507 MB) — **do not commit raw data.** It is fully
reproducible from the scripts in `src/`.

```powershell
cd D:\Vvs_Project\coursework\ml
git checkout -b cia3-assam-flood
git add coursework/ml/CIA-3_ML
git status                          # confirm NO data/raw files are staged
git commit -m "CIA-3: Assam flood risk classification - end-to-end ensemble pipeline"
git push -u origin cia3-assam-flood
```

Copy the resulting GitHub URL — you will show it at 1:15 in the video.

- [ ] `git status` shows no `data/raw` files
- [ ] pushed, URL copied

---

## STEP 3 — Record the video (~45 min)

Full narration is in `video/VIDEO_SCRIPT.md`. Keep to the assignment's timestamps.

**Before recording — open these five things in this order:**
1. `results/figures/eda_overview.png`
2. `results/figures/model_comparison.png`
3. `results/figures/case_study_july2026.png`
4. `results/figures/shap_local_waterfall.png`
5. A terminal at the repo root, ready to run `python src/predict_demo.py`

Plus the GitHub repo page and the executed notebook.

**Record with:** OBS Studio, or Xbox Game Bar (`Win + G`) — 1080p, microphone on.
**Record one take per section**, so a fumble costs 35 seconds, not 3 minutes.

| Time | Section | On screen |
|---|---|---|
| 0:00–0:35 | Problem, beneficiaries, target | flood imagery / the district×date table |
| 0:35–1:15 | Data cleaning, EDA, feature engineering | pipeline diagram → `eda_overview.png` |
| 1:15–2:10 | Baseline vs bagging/boosting/stacking | `model_comparison.png` + repo URL |
| 2:10–3:00 | **Live** demo, SHAP, July-2026 case study, ethics, limits | terminal → `shap_local_waterfall.png` → `case_study_july2026.png` |

**Run `python src/predict_demo.py` live on camera** — the brief asks for "the live model
output", so run it rather than showing a screenshot.

**Assemble in** Google Vids / Clipchamp / DaVinci Resolve. Add captions. Export MP4 1080p.

- [ ] under 3:00 (check with a stopwatch)
- [ ] repository shown on screen
- [ ] a results visual shown
- [ ] live model output actually run
- [ ] synthetic record described **as synthetic**
- [ ] limitations stated aloud (Dhemaji, 21/35 districts, two seasons)
- [ ] audio clear, no music over narration

---

## STEP 4 — Submit on Google Classroom (5 min)

Assignment: **CIA 3 : ML FOR SOCIAL GOOD CHALLENGE**, 4 MCA (ML-MCA521-4).

**Attach:**

| # | File | Notes |
|---|---|---|
| 1 | `2547255_CIA3_Assam_Flood.zip` | 3.0 MB — full codebase, executed notebook, README, results, models. Already built at `D:\Vvs_Project\coursework\ml\` |
| 2 | Your video MP4 | If large, upload to Drive → share **"Anyone with the link – Viewer"** → attach the link |
| 3 | GitHub repo link | paste into the private comment |

Then click **Mark as done**.

- [ ] ZIP attached
- [ ] video attached or Drive link shared with correct permissions
- [ ] repo link in comment
- [ ] **Mark as done** clicked

---

## What the ZIP contains (maps to the rubric)

| Brief requires | In the ZIP |
|---|---|
| Codebase / notebook | `src/` (9 scripts) + `notebooks/CIA3_Assam_Flood_Ensemble.ipynb` (executed) |
| README with execution steps + dataset citation | `README.md`, `DATA_SOURCES.md` |
| Trained pipeline / reproducible training script | `models/*.joblib` + `src/train_models.py` |
| Results / figures | `results/figures/` (8 PNGs), `results/metrics/` |
| Explainability output | `results/figures/shap_*.png`, `results/metrics/shap_feature_importance.csv` |
| Ethics statement | `ETHICS.md` |
| 3-minute video | recorded separately in Step 3 |

Raw data is deliberately excluded (507 MB) and is reproducible via
`src/download_raw_data.ps1` and `src/download_drims_flood_reports.ps1`.
`data/raw/_manifest.csv` records the SHA256 of every source file.

---

## If you are short on time — priority order

1. **Record the video.** It is the only missing deliverable. 2 marks, but its absence also
   undercuts Q1–Q4 evidence.
2. **Submit the ZIP.** That carries 23 of the 25 marks.
3. Git push is nice-to-have — the ZIP alone satisfies "codebase".

## Three things to be ready for in the viva

1. **"Why does the ensemble lose to the baseline?"** → near-monotonic rainfall signal, trees
   overfit district base rates that shifted 8.1% → 11.1% between seasons, one training season.
2. **"Why is performance low?"** → the July-2026 case study: in-Assam rain was 7.8 vs 7.9
   mm/day during the worst flood; the driver was upstream in Nagaland/Arunachal, which the
   data does not observe.
3. **"What would you do differently?"** → acquire upstream catchment rainfall and river
   levels at the 26 danger-level gauges; extend beyond two seasons; get rainfall monitoring
   into Dhemaji.
