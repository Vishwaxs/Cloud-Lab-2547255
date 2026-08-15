"""
CIA-3 - Stage 5: live demo. Predict on ONE realistic SYNTHETIC district-day record
and explain the prediction locally (rubric Q5, 2:10-3:00 of the video).

The record below is SYNTHETIC - constructed by hand for demonstration. It is not an
observation and is not presented as one. The assignment explicitly asks for a
"live prediction on one realistic synthetic record".

Run:  python src/predict_demo.py
      python src/predict_demo.py --dry     (a quiet monsoon record instead)
"""
from __future__ import annotations

import argparse
import json
import os

import joblib
import numpy as np
import pandas as pd
import shap

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = os.path.join(ROOT, "models")
PROC = os.path.join(ROOT, "data", "processed")

# --------------------------------------------------------------- synthetic records
# Values are chosen to sit inside the observed ranges for the district and month.
WET = {
    "district": "Lakhimpur",
    "month": 7,
    "day_of_year": 200,          # ~19 July, peak monsoon
    "rain_prev3d_sum": 96.0,     # three very wet days
    "rain_prev7d_sum": 168.0,
    "rain_prev15d_sum": 240.0,
    "rain_prev7d_max": 61.0,
    "rain_anom_7d": 2.6,         # 2.6x the district's seasonal norm
    "rain_anom_15d": 2.1,
    "rain_state_prev3d": 44.0,   # the whole state is wet -> basin-wide loading
    "wet_days_prev7d": 5.0,
}
DRY = {
    "district": "Lakhimpur",
    "month": 7,
    "day_of_year": 200,
    "rain_prev3d_sum": 4.0,
    "rain_prev7d_sum": 11.0,
    "rain_prev15d_sum": 26.0,
    "rain_prev7d_max": 6.0,
    "rain_anom_7d": 0.17,
    "rain_anom_15d": 0.23,
    "rain_state_prev3d": 6.0,
    "wet_days_prev7d": 0.0,
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry", action="store_true", help="use the quiet-monsoon record")
    args = ap.parse_args()

    meta = json.load(open(os.path.join(MODELS, "model_metadata.json"), encoding="utf-8"))
    model = joblib.load(os.path.join(MODELS, "best_model.joblib"))
    thr = meta["best_threshold"]
    FEATURES = meta["features_numeric"] + meta["features_categorical"]

    rec = DRY if args.dry else WET
    X = pd.DataFrame([rec])[FEATURES]

    print("=" * 66)
    print("LIVE DEMO - SYNTHETIC RECORD (not a real observation)")
    print("=" * 66)
    print(f"model      : {meta['best_model']}")
    print(f"threshold  : {thr:.3f}   (tuned on the 2025 training season only)")
    print("")
    print(f"district                : {rec['district']}")
    print(f"date (synthetic)        : day {rec['day_of_year']} of the year, month {rec['month']}")
    print(f"rainfall, previous 3d   : {rec['rain_prev3d_sum']:.0f} mm")
    print(f"rainfall, previous 7d   : {rec['rain_prev7d_sum']:.0f} mm")
    print(f"rainfall, previous 15d  : {rec['rain_prev15d_sum']:.0f} mm")
    print(f"vs district norm (7d)   : {rec['rain_anom_7d']:.2f}x")
    print(f"wet days in last 7      : {rec['wet_days_prev7d']:.0f}")
    print(f"state-wide 3d rainfall  : {rec['rain_state_prev3d']:.0f} mm")

    proba = float(model.predict_proba(X)[0, 1])
    flag = proba >= thr

    print("")
    print("-" * 66)
    print(f"PREDICTED FLOOD PROBABILITY : {proba:.3f}")
    print(f"DECISION (>= {thr:.3f})          : {'FLOOD RISK FLAGGED' if flag else 'no flag'}")
    print("-" * 66)

    # ------------------------------------------------- local SHAP explanation
    df = pd.read_csv(os.path.join(PROC, "assam_flood_district_day.csv"))
    Xtr = df[df.split == "train_2025"][FEATURES]
    prep = model.named_steps["prep"]
    names = list(prep.get_feature_names_out())
    expl = shap.LinearExplainer(model.named_steps["clf"], prep.transform(Xtr))
    sv = expl(prep.transform(X))

    contrib = (pd.DataFrame({"feature": names, "shap": sv.values[0]})
               .assign(a=lambda d: d.shap.abs())
               .sort_values("a", ascending=False).drop(columns="a").head(6))
    print("\nWHY (top local SHAP contributions):")
    for _, r in contrib.iterrows():
        direction = "raises" if r.shap > 0 else "lowers"
        print(f"   {r.feature:<28} {r.shap:+.3f}  ({direction} the risk)")

    print("\nPlain reading:")
    if flag:
        print("   Sustained heavy rainfall over the preceding two weeks, well above this")
        print("   district's seasonal norm, is what drives the flag. This is a decision-")
        print("   support signal only - the official CWC bulletin remains authoritative.")
    else:
        print("   Antecedent rainfall is far below the district's seasonal norm, so the")
        print("   model sees no accumulation-driven flood signal for this day.")
    print("\nLimitations: 21 of 35 districts covered; Dhemaji excluded (no rainfall feed);")
    print("two seasons of labels only; river level and upstream rainfall are NOT observed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
