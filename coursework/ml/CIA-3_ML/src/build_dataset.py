"""
CIA-3 - Stage 2: join DRIMS flood labels to CWC daily rainfall and audit the result.

Inputs
  data/interim/drims_affected_long.csv    (from parse_drims_reports.py)
  data/interim/drims_daily_summary.csv
  data/raw/rainfall/rainfall_manual_daily_cwc_as_2021_2025.csv
  data/raw/rainfall/rainfall_manual_daily_cwc_as_2026_2030.csv

Outputs
  data/processed/assam_flood_district_day.csv   the modelling table
  data/processed/audit_*.csv                    audit artefacts
  reports/phase2_audit.txt                      the human-readable audit

RULES OBSERVED
  * No scaling, no resampling (SMOTE/over/under), no feature selection, no encoding.
    Those belong strictly after the train/test boundary and are NOT done here.
  * Rolling rainfall features are STRICTLY BACKWARD-LOOKING (closed='left' semantics
    are achieved by shifting), computed per district over the daily series. A
    chronological split is applied afterwards, so no future information reaches the
    training rows.
  * Nothing is imputed or interpolated. Missing stays missing and is reported.
"""
from __future__ import annotations

import os
import sys

import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from district_crosswalk import to_canonical  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "raw")
INTERIM = os.path.join(ROOT, "data", "interim")
PROC = os.path.join(ROOT, "data", "processed")
REPORTS = os.path.join(ROOT, "reports")

TRAIN_END = "2025-12-31"   # 2025 season -> train ; 2026 season -> test
RAIN_COL = "Manual Daily Rainfall (mm)"
MIN_RAIN_COVERAGE = 0.20   # a district needs rainfall on >=20% of report days to be modellable

# Columns offered to the model in Phase 3. Same-day rainfall is deliberately absent:
# it would not be known at the time a next-day warning is issued.
FEATURES = ["rain_prev3d_sum", "rain_prev7d_sum", "rain_prev15d_sum", "rain_prev7d_max",
            "rain_anom_7d", "rain_anom_15d", "rain_state_prev3d", "wet_days_prev7d",
            "rain_obs_prev7d", "month", "day_of_year", "district"]

out_lines: list[str] = []


def say(msg: str = "") -> None:
    print(msg)
    out_lines.append(msg)


def main() -> int:
    os.makedirs(PROC, exist_ok=True)
    os.makedirs(REPORTS, exist_ok=True)

    # ---------------------------------------------------------------- labels
    lon = pd.read_csv(os.path.join(INTERIM, "drims_affected_long.csv"))
    summ = pd.read_csv(os.path.join(INTERIM, "drims_daily_summary.csv"))
    lon["date"] = pd.to_datetime(lon["date"])
    summ["date"] = pd.to_datetime(summ["date"])
    lon["district"] = lon["district_raw"].map(to_canonical)

    report_dates = pd.Index(sorted(summ["date"].unique()))

    # ---------------------------------------------------------------- rainfall
    rain = pd.concat([
        pd.read_csv(os.path.join(RAW, "rainfall", "rainfall_manual_daily_cwc_as_2021_2025.csv"), low_memory=False),
        pd.read_csv(os.path.join(RAW, "rainfall", "rainfall_manual_daily_cwc_as_2026_2030.csv"), low_memory=False),
    ], ignore_index=True)
    rain["date"] = pd.to_datetime(rain["Data Acquisition Time"], errors="coerce", dayfirst=True).dt.normalize()
    rain["district"] = rain["District"].map(to_canonical)
    rain = rain.dropna(subset=["date", "district"])
    rain[RAIN_COL] = pd.to_numeric(rain[RAIN_COL], errors="coerce")

    # station-day -> district-day
    dd = (rain.groupby(["district", "date"])
               .agg(rain_mean_mm=(RAIN_COL, "mean"),
                    rain_max_mm=(RAIN_COL, "max"),
                    rain_sum_mm=(RAIN_COL, "sum"),
                    n_stations=(RAIN_COL, "count"))
               .reset_index())

    # ------------------------------------------------------- modellable districts
    drims_d = set(lon["district"].dropna())
    rain_d = set(dd["district"])
    districts = sorted(drims_d & rain_d)
    say(f"districts in DRIMS               : {len(drims_d)}")
    say(f"districts in CWC rainfall        : {len(rain_d)}")
    say(f"modellable (both)                : {len(districts)}")
    say("")

    # ------------------------------------------------------------------ the grid
    # One row per (district, date) for every date on which a flood report exists.
    grid = pd.MultiIndex.from_product([districts, report_dates], names=["district", "date"]).to_frame(index=False)

    pos = lon[lon["district"].isin(districts)][["district", "date"]].drop_duplicates()
    pos["flood_affected"] = 1
    df = grid.merge(pos, on=["district", "date"], how="left")
    df["flood_affected"] = df["flood_affected"].fillna(0).astype(int)

    # attach rainfall (left join: absent station-days stay NaN, never zero)
    df = df.merge(dd, on=["district", "date"], how="left")

    # ------------------------------------------------- backward-only rolling feats
    df = df.sort_values(["district", "date"]).reset_index(drop=True)
    g = df.groupby("district", group_keys=False)
    # NOTE: shift(1) first => a row never sees its OWN day's rain in an accumulation.
    for w in (3, 7, 15):
        df[f"rain_prev{w}d_sum"] = g["rain_mean_mm"].apply(
            lambda s: s.shift(1).rolling(w, min_periods=1).sum())
    df["rain_prev1d"] = g["rain_mean_mm"].apply(lambda s: s.shift(1))
    df["rain_prev7d_max"] = g["rain_mean_mm"].apply(
        lambda s: s.shift(1).rolling(7, min_periods=1).max())

    # calendar features (no leakage: known in advance)
    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month
    df["day_of_year"] = df["date"].dt.dayofyear

    # count of observed rainfall days in the previous week - a data-density control,
    # so the model can discount districts that were barely observed.
    df["rain_obs_prev7d"] = g["n_stations"].apply(
        lambda s: s.shift(1).notna().rolling(7, min_periods=1).sum())

    # wet-day count: how many of the previous 7 days exceeded 10mm. Sustained moderate
    # rain saturates soil differently from one extreme burst of the same total.
    df["wet_days_prev7d"] = g["rain_mean_mm"].apply(
        lambda s: (s.shift(1) > 10).rolling(7, min_periods=1).sum())

    # ---------------------------------------------------------- domain features
    # (i) RAINFALL ANOMALY vs the district's own climatological norm.
    #     100mm in a week is unremarkable in Cachar and extreme in Nalbari, so the raw
    #     total is not comparable across districts - which is why tree models fall back
    #     on memorising district identity. The norm is computed from CWC 2021-2024 ONLY,
    #     a period that precedes BOTH the training (2025) and test (2026) seasons, so it
    #     cannot leak in either direction.
    clim_src = dd[(dd["date"] >= "2021-01-01") & (dd["date"] <= "2024-12-31")]
    clim = (clim_src.groupby(["district", clim_src["date"].dt.month])["rain_mean_mm"]
                    .mean().rename("clim_daily_mm").reset_index()
                    .rename(columns={"date": "month"}))
    say(f"climatology baseline: {len(clim_src):,} district-days from 2021-2024, "
        f"{clim['district'].nunique()} districts")
    df["month"] = df["date"].dt.month
    df = df.merge(clim, on=["district", "month"], how="left")
    # Ratio of the last 7 days' rain to what that district normally gets in 7 days.
    # Districts with a near-zero climatological mean produce enormous ratios, which
    # dominate a scaled linear model, so the ratio is capped at 10x the norm. The cap
    # is a stated modelling choice, not a silent repair.
    df["rain_anom_7d"] = (df["rain_prev7d_sum"] /
                          (df["clim_daily_mm"] * 7).replace(0, np.nan)).clip(upper=10)
    df["rain_anom_15d"] = (df["rain_prev15d_sum"] /
                           (df["clim_daily_mm"] * 15).replace(0, np.nan)).clip(upper=10)

    # (ii) BASIN-WIDE SIGNAL. Assam floods are driven by rain across the whole
    #      Brahmaputra/Barak catchment, not only inside the district boundary. The
    #      state-wide mean for the same day is a cheap proxy for catchment-wide loading.
    state = (df.groupby("date")["rain_mean_mm"].mean().rename("rain_state_mean").reset_index())
    state["rain_state_prev3d"] = state["rain_state_mean"].shift(1).rolling(3, min_periods=1).sum()
    df = df.merge(state[["date", "rain_state_prev3d"]], on="date", how="left")

    df["split"] = np.where(df["date"] <= TRAIN_END, "train_2025", "test_2026")

    # ------------------------------------------------------ usability filtering
    # (a) drop districts with effectively no rainfall feed. Dhemaji is the crucial
    #     case: it is the MOST flood-affected district in DRIMS (89 positive days)
    #     yet CWC publishes only 2 Dhemaji rainfall observations ever (2022, 2023).
    #     Keeping it would mean asking the model to predict floods from nothing.
    # (b) require rain_prev15d_sum, the longest backward window, as the anchor.
    #     Shorter-window NaNs are LEFT IN PLACE and imputed inside the modelling
    #     pipeline after the split - not here.
    before_rows, before_pos = len(df), int(df["flood_affected"].sum())
    cov_by_d = df.assign(has=df["rain_mean_mm"].notna()).groupby("district")["has"].mean()
    dropped_districts = sorted(cov_by_d[cov_by_d < MIN_RAIN_COVERAGE].index)
    df = df[~df["district"].isin(dropped_districts)]
    df = df[df["rain_prev15d_sum"].notna()].reset_index(drop=True)

    say("--- usability filtering ---")
    say(f"districts dropped (rainfall coverage < {MIN_RAIN_COVERAGE:.0%}): {dropped_districts}")
    for d in dropped_districts:
        say(f"    {d}: coverage={cov_by_d[d]:.1%}, positives lost="
            f"{int(before_pos - df['flood_affected'].sum()) if len(dropped_districts)==1 else 'see below'}")
    say(f"rows {before_rows:,} -> {len(df):,}   positives {before_pos} -> {int(df['flood_affected'].sum())}")
    say("")

    # ====================================================================== AUDIT
    say("=" * 70)
    say("PHASE 2 DATASET AUDIT")
    say("=" * 70)

    n = len(df)
    p = int(df["flood_affected"].sum())
    say(f"total rows                       : {n:,}")
    say(f"positive rows (flood_affected=1) : {p:,}")
    say(f"negative rows                    : {n - p:,}")
    say(f"positive percentage              : {100 * p / n:.2f}%")
    say(f"negatives : positives            : {(n - p) / p:.1f} : 1" if p else "no positives!")
    say("")
    say(f"districts represented            : {df['district'].nunique()}")
    say(f"dates represented                : {df['date'].nunique()}")
    say(f"date range                       : {df['date'].min().date()} -> {df['date'].max().date()}")
    say("")

    for sp in ("train_2025", "test_2026"):
        s = df[df["split"] == sp]
        sp_p = int(s["flood_affected"].sum())
        say(f"{sp:<12} rows={len(s):>6,}  dates={s['date'].nunique():>4}  "
            f"pos={sp_p:>5}  pos%={100 * sp_p / len(s):.2f}%")
    say("")

    # --- missing dates inside each season -----------------------------------
    say("--- missing report dates within season windows ---")
    for lo, hi, lbl in [("2025-05-01", "2025-10-31", "2025"), ("2026-05-01", "2026-08-13", "2026")]:
        want = pd.date_range(lo, hi, freq="D")
        have = set(report_dates)
        miss = [d.date() for d in want if d not in have]
        say(f"  {lbl}: {len(want)} calendar days, {len(want) - len(miss)} with a report, {len(miss)} missing")
        if miss:
            say(f"        missing: {miss}")
    say("")

    # --- duplicates ----------------------------------------------------------
    dup = df.duplicated(["district", "date"]).sum()
    say(f"duplicate district-days          : {dup}")

    # --- rainfall coverage / missingness ------------------------------------
    say("")
    say("--- rainfall coverage ---")
    miss_rain = df["rain_mean_mm"].isna().sum()
    say(f"rows with NO rainfall observation: {miss_rain:,}  ({100 * miss_rain / n:.1f}%)")
    say(f"rows with rainfall               : {n - miss_rain:,}")
    say(f"mean stations per district-day   : {df['n_stations'].mean():.2f}")
    cov = (df.assign(has=df["rain_mean_mm"].notna())
             .groupby("district")
             .agg(rows=("has", "size"), with_rain=("has", "sum"),
                  pos=("flood_affected", "sum")))
    cov["rain_pct"] = (100 * cov["with_rain"] / cov["rows"]).round(1)
    cov["pos_pct"] = (100 * cov["pos"] / cov["rows"]).round(2)
    cov = cov.sort_values("rain_pct")
    say(cov.to_string())

    # --- leakage checks ------------------------------------------------------
    say("")
    say("--- feature-level missingness (left as NaN for in-pipeline imputation) ---")
    for c in FEATURES:
        if c in df.columns:
            v = int(df[c].isna().sum())
            say(f"  {c:<18} {v:>6,}  ({100 * v / len(df):.1f}%)")

    say("")
    say("--- leakage checks ---")
    say(f"MODEL FEATURES = {FEATURES}")
    say("1. same-day rainfall is NOT a feature "
        "(rain_mean_mm/max/sum kept in the file for EDA only, excluded from FEATURES)")
    say("2. all rolling features use .shift(1) before rolling -> a row never sees its own day")
    say(f"3. no DRIMS outcome fields (population, camps, damage) were read into the table; "
        f"columns present: {list(df.columns)}")
    say("4. split is chronological, not random: "
        f"train <= {TRAIN_END} ({df[df.split=='train_2025']['date'].max().date()}), "
        f"test >= {df[df.split=='test_2026']['date'].min().date()}")
    ov = set(df[df.split == "train_2025"]["date"]) & set(df[df.split == "test_2026"]["date"])
    say(f"5. train/test date overlap       : {len(ov)} (must be 0)")

    # --- examples ------------------------------------------------------------
    say("")
    say("--- verified POSITIVE examples ---")
    ex_p = df[(df.flood_affected == 1) & df.rain_prev7d_sum.notna()].sort_values(
        "rain_prev7d_sum", ascending=False)
    say(ex_p.head(6)[["district", "date", "flood_affected", "rain_mean_mm",
                      "rain_prev3d_sum", "rain_prev7d_sum", "n_stations"]].to_string(index=False))
    say("")
    say("--- verified NEGATIVE examples ---")
    ex_n = df[(df.flood_affected == 0) & df.rain_prev7d_sum.notna()]
    say(ex_n.head(6)[["district", "date", "flood_affected", "rain_mean_mm",
                      "rain_prev3d_sum", "rain_prev7d_sum", "n_stations"]].to_string(index=False))

    # ------------------------------------------------------------------ persist
    df.to_csv(os.path.join(PROC, "assam_flood_district_day.csv"), index=False)
    cov.to_csv(os.path.join(PROC, "audit_district_coverage.csv"))
    summ.to_csv(os.path.join(PROC, "audit_drims_daily_summary.csv"), index=False)
    with open(os.path.join(REPORTS, "phase2_audit.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(out_lines))

    say("")
    say(f"written: data/processed/assam_flood_district_day.csv  ({len(df):,} rows)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
