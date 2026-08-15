"""
CIA-3 - Stage 4: SHAP explainability, global and individual (rubric Q4, 4 marks).

Two models are explained, deliberately:
  * the BEST OVERALL model (the LogisticRegression baseline), because Q4 asks to explain
    "the best model" and on this data the baseline won;
  * the best tree ensemble (XGBoost), because the assignment is an ensemble challenge and
    a tree explainer gives the richer beeswarm view.

Outputs
  results/figures/shap_global_*.png     global importance (bar + beeswarm)
  results/figures/shap_local_*.png      individual prediction waterfall
  results/metrics/shap_feature_importance.csv
  results/metrics/explainability_notes.txt
"""
from __future__ import annotations

import json
import os
import warnings

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap

warnings.filterwarnings("ignore")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROC = os.path.join(ROOT, "data", "processed")
FIG = os.path.join(ROOT, "results", "figures")
MET = os.path.join(ROOT, "results", "metrics")
MODELS = os.path.join(ROOT, "models")
os.makedirs(FIG, exist_ok=True)

notes: list[str] = []


def say(m=""):
    print(m)
    notes.append(m)


def feature_names(pipe):
    """Recover post-ColumnTransformer feature names."""
    return list(pipe.named_steps["prep"].get_feature_names_out())


def transform(pipe, X):
    return pipe.named_steps["prep"].transform(X)


def main():
    meta = json.load(open(os.path.join(MODELS, "model_metadata.json"), encoding="utf-8"))
    NUM, CAT = meta["features_numeric"], meta["features_categorical"]
    FEATURES = NUM + CAT

    df = pd.read_csv(os.path.join(PROC, "assam_flood_district_day.csv"), parse_dates=["date"])
    train = df[df.split == "train_2025"]
    test = df[df.split == "test_2026"].reset_index(drop=True)
    Xtr, Xte = train[FEATURES], test[FEATURES]

    say("=" * 72)
    say("Q4  MODEL EXPLAINABILITY (SHAP)")
    say("=" * 72)
    say(f"best overall model : {meta['best_model']}  (PR-AUC {meta['best_model_pr_auc']:.3f})")
    say(f"best ensemble      : {meta['best_ensemble']} (PR-AUC {meta['best_ensemble_pr_auc']:.3f})")
    say("")

    # ============================================================ 1. LINEAR MODEL
    logreg = joblib.load(os.path.join(MODELS, "baseline_logreg.joblib"))
    names = feature_names(logreg)
    Xtr_t = transform(logreg, Xtr)
    Xte_t = transform(logreg, Xte)

    lin_expl = shap.LinearExplainer(logreg.named_steps["clf"], Xtr_t)
    sv_lin = lin_expl(Xte_t)
    sv_lin.feature_names = names

    plt.figure()
    shap.summary_plot(sv_lin.values, Xte_t, feature_names=names, plot_type="bar",
                      max_display=15, show=False)
    plt.title("SHAP global importance — LogisticRegression (best model)", fontsize=11)
    plt.tight_layout(); plt.savefig(os.path.join(FIG, "shap_global_logreg_bar.png"),
                                    dpi=140, bbox_inches="tight"); plt.close()

    plt.figure()
    shap.summary_plot(sv_lin.values, Xte_t, feature_names=names, max_display=15, show=False)
    plt.title("SHAP beeswarm — LogisticRegression", fontsize=11)
    plt.tight_layout(); plt.savefig(os.path.join(FIG, "shap_global_logreg_beeswarm.png"),
                                    dpi=140, bbox_inches="tight"); plt.close()

    imp_lin = (pd.DataFrame({"feature": names,
                             "mean_abs_shap": np.abs(sv_lin.values).mean(0)})
               .sort_values("mean_abs_shap", ascending=False))
    say("--- global feature importance: LogisticRegression (top 12) ---")
    say(imp_lin.head(12).to_string(index=False))

    # ============================================================ 2. TREE ENSEMBLE
    xgb_pipe = joblib.load(os.path.join(MODELS, "xgboost.joblib"))
    names_x = feature_names(xgb_pipe)
    Xte_tx = transform(xgb_pipe, Xte)
    tree_expl = shap.TreeExplainer(xgb_pipe.named_steps["clf"])
    sv_tree = tree_expl.shap_values(Xte_tx)

    plt.figure()
    shap.summary_plot(sv_tree, Xte_tx, feature_names=names_x, max_display=15, show=False)
    plt.title("SHAP beeswarm — XGBoost (best tree ensemble)", fontsize=11)
    plt.tight_layout(); plt.savefig(os.path.join(FIG, "shap_global_xgb_beeswarm.png"),
                                    dpi=140, bbox_inches="tight"); plt.close()

    imp_tree = (pd.DataFrame({"feature": names_x,
                              "mean_abs_shap": np.abs(sv_tree).mean(0)})
                .sort_values("mean_abs_shap", ascending=False))
    say("")
    say("--- global feature importance: XGBoost (top 12) ---")
    say(imp_tree.head(12).to_string(index=False))

    imp_lin.assign(model="LogisticRegression").to_csv(
        os.path.join(MET, "shap_feature_importance.csv"), index=False)
    imp_tree.assign(model="XGBoost").to_csv(
        os.path.join(MET, "shap_feature_importance.csv"), mode="a", header=False, index=False)

    # ======================================================= 3. LOCAL EXPLANATION
    # Explain a real, correctly-identified flood day with high model confidence.
    proba = logreg.predict_proba(Xte)[:, 1]
    thr = meta["best_threshold"]
    hits = np.where((test["flood_affected"].values == 1) & (proba >= thr))[0]
    i = int(hits[np.argmax(proba[hits])]) if len(hits) else int(np.argmax(proba))
    row = test.iloc[i]

    say("")
    say("--- individual prediction explained ---")
    say(f"district={row['district']}  date={row['date'].date()}  "
        f"actual={int(row['flood_affected'])}  predicted_prob={proba[i]:.3f}  threshold={thr:.3f}")
    say(f"  rain_prev3d_sum   = {row['rain_prev3d_sum']:.1f} mm")
    say(f"  rain_prev7d_sum   = {row['rain_prev7d_sum']:.1f} mm")
    say(f"  rain_prev15d_sum  = {row['rain_prev15d_sum']:.1f} mm")
    say(f"  rain_anom_7d      = {row['rain_anom_7d']:.2f} x the district's seasonal norm")
    say(f"  wet_days_prev7d   = {row['wet_days_prev7d']:.0f} of the last 7 days above 10mm")

    plt.figure()
    shap.plots.waterfall(sv_lin[i], max_display=12, show=False)
    plt.title(f"Why the model flagged {row['district']} on {row['date'].date()}", fontsize=11)
    plt.tight_layout(); plt.savefig(os.path.join(FIG, "shap_local_waterfall.png"),
                                    dpi=140, bbox_inches="tight"); plt.close()

    contrib = (pd.DataFrame({"feature": names, "shap_value": sv_lin.values[i]})
               .assign(abs_v=lambda d: d.shap_value.abs())
               .sort_values("abs_v", ascending=False).drop(columns="abs_v"))
    say("")
    say("top contributions for this single prediction:")
    say(contrib.head(8).to_string(index=False))

    # a correctly-identified NON-flood day for contrast
    miss = np.where((test["flood_affected"].values == 0) & (proba < thr))[0]
    j = int(miss[np.argmin(proba[miss])])
    r2 = test.iloc[j]
    say("")
    say(f"contrast - confident NO-FLOOD: district={r2['district']} date={r2['date'].date()} "
        f"prob={proba[j]:.3f}  rain_prev7d={r2['rain_prev7d_sum']:.1f}mm")
    plt.figure()
    shap.plots.waterfall(sv_lin[j], max_display=12, show=False)
    plt.title(f"Why the model did NOT flag {r2['district']} on {r2['date'].date()}", fontsize=11)
    plt.tight_layout(); plt.savefig(os.path.join(FIG, "shap_local_waterfall_negative.png"),
                                    dpi=140, bbox_inches="tight"); plt.close()

    with open(os.path.join(MET, "explainability_notes.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(notes))
    say("")
    say("saved SHAP figures to results/figures/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
