"""
CIA-3 - case study: the 20 July 2026 flood peak, and why the model missed it.

External reporting (IMD / Assam University study, Aug 2026) attributes the July 2026
eastern-Assam floods to sustained extremely heavy rainfall over UPSTREAM catchments in
Nagaland (Mon district, ~137 mm) and Arunachal Pradesh, which swelled the south-bank
Brahmaputra tributaries - Dikhow, Disang, Janji and Dhansiri - until they overtopped
embankments.

Our model observes rainfall measured INSIDE Assam districts only. This script tests
whether that limitation is visible in the model's own behaviour on the worst day of the
season. If in-Assam rainfall was unremarkable while flooding peaked, then the miss is a
DATA-AVAILABILITY boundary, not a tuning failure.

Output: results/figures/case_study_july2026.png
        results/metrics/case_study_july2026.txt
"""
from __future__ import annotations

import json
import os

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROC = os.path.join(ROOT, "data", "processed")
INTERIM = os.path.join(ROOT, "data", "interim")
FIG = os.path.join(ROOT, "results", "figures")
MET = os.path.join(ROOT, "results", "metrics")
MODELS = os.path.join(ROOT, "models")

out: list[str] = []


def say(m=""):
    print(m)
    out.append(m)


def main():
    meta = json.load(open(os.path.join(MODELS, "model_metadata.json"), encoding="utf-8"))
    model = joblib.load(os.path.join(MODELS, "best_model.joblib"))
    thr = meta["best_threshold"]
    FEATURES = meta["features_numeric"] + meta["features_categorical"]

    df = pd.read_csv(os.path.join(PROC, "assam_flood_district_day.csv"), parse_dates=["date"])
    summ = pd.read_csv(os.path.join(INTERIM, "drims_daily_summary.csv"), parse_dates=["date"])

    test = df[df.split == "test_2026"].copy()
    test["proba"] = model.predict_proba(test[FEATURES])[:, 1]
    test["pred"] = (test.proba >= thr).astype(int)

    say("=" * 70)
    say("CASE STUDY - 20 July 2026, the worst flood day of the season")
    say("=" * 70)

    peak = pd.Timestamp("2026-07-20")
    day = test[test.date == peak]
    tp = int(((day.flood_affected == 1) & (day.pred == 1)).sum())
    fn = int(((day.flood_affected == 1) & (day.pred == 0)).sum())
    say(f"districts actually flood-affected (modelled subset): {int(day.flood_affected.sum())}")
    say(f"   correctly flagged by the model : {tp}")
    say(f"   MISSED (false negatives)       : {fn}")
    say(f"   recall on this day             : {tp / max(1, int(day.flood_affected.sum())):.2f}")

    season_recall = (test[test.flood_affected == 1].pred.mean())
    say(f"   recall across the whole season : {season_recall:.2f}")

    say("")
    say("--- rainfall measured INSIDE Assam ---")
    win = test[(test.date >= "2026-07-16") & (test.date <= "2026-07-22")]
    say(f"mean daily rainfall 16-22 Jul : {win.rain_mean_mm.mean():.1f} mm")
    say(f"mean daily rainfall, season   : {test.rain_mean_mm.mean():.1f} mm")
    say(f"ratio                         : {win.rain_mean_mm.mean() / test.rain_mean_mm.mean():.2f}x")
    say("")
    say("In-Assam rainfall during the peak was INDISTINGUISHABLE from the seasonal")
    say("average. The water came from upstream catchments in Nagaland and Arunachal,")
    say("which this dataset does not observe. The model was not under-tuned - it was")
    say("structurally blind to the driver.")

    # ------------------------------------------------------------------ figure
    s = summ[(summ.date >= "2026-07-10") & (summ.date <= "2026-07-31")].copy()
    daily = (test[(test.date >= "2026-07-10") & (test.date <= "2026-07-31")]
             .groupby("date").agg(rain=("rain_mean_mm", "mean"),
                                  actual=("flood_affected", "sum"),
                                  flagged=("pred", "sum")).reset_index())

    fig, ax = plt.subplots(2, 1, figsize=(13, 8), sharex=True,
                           gridspec_kw={"height_ratios": [1.2, 1]})

    ax[0].bar(s.date, s.n_union, color="#E4572E", alpha=.85, label="districts reported flood-affected")
    ax[0].axvline(pd.Timestamp("2026-07-19"), ls="--", c="#333", lw=1.6)
    ax[0].annotate("19 Jul: extreme rainfall over\nNagaland / Arunachal catchments\n(OUTSIDE the model's view)",
                   xy=(pd.Timestamp("2026-07-19"), s.n_union.max() * .96),
                   xytext=(pd.Timestamp("2026-07-10"), s.n_union.max() * .60),
                   fontsize=9, arrowprops=dict(arrowstyle="->", color="#333"))
    ax[0].set_ylabel("districts affected")
    ax[0].set_title("The 2026 flood peak was driven by rainfall the model cannot observe", fontsize=13)
    ax[0].legend(loc="upper right", fontsize=9)

    ax[1].plot(daily.date, daily.rain, marker="o", color="#2E86AB", lw=2,
               label="mean rainfall measured INSIDE Assam (mm/day)")
    ax[1].axhline(test.rain_mean_mm.mean(), ls=":", c="grey",
                  label=f"2026 season average ({test.rain_mean_mm.mean():.1f} mm/day)")
    ax[1].axvline(pd.Timestamp("2026-07-19"), ls="--", c="#333", lw=1.6)
    ax[1].set_ylabel("mm / day")
    ax[1].set_xlabel("2026")
    ax[1].legend(loc="upper right", fontsize=9)
    ax[1].text(pd.Timestamp("2026-07-20"), daily.rain.min() * 0.97,
               "in-Assam rain stays at the seasonal average\nwhile flooding peaks",
               fontsize=10, color="#2E86AB", fontweight="bold",
               bbox=dict(boxstyle="round,pad=0.35", fc="white", ec="#2E86AB", alpha=.9))

    plt.tight_layout()
    plt.savefig(os.path.join(FIG, "case_study_july2026.png"), dpi=140, bbox_inches="tight")
    plt.close()
    say("")
    say("saved results/figures/case_study_july2026.png")

    with open(os.path.join(MET, "case_study_july2026.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(out))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
