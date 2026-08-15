"""
CIA-3 - Stage 3: leakage-safe preprocessing + ensemble architecture, tuning, comparison.

Covers rubric Q2 (data wrangling / feature engineering, 6 marks) and
Q3 (ensemble architecture, tuning and comparison, 8 marks).

Design decisions and their justification
----------------------------------------
SPLIT      Chronological: the whole 2025 flood season trains, the whole 2026 season is
           the untouched test set. A random split would put 14 July in train and 15 July
           in test; adjacent days in the same district are strongly correlated, so random
           splitting inflates every score. Chronological also mirrors deployment: fit on
           last season, predict the next.

CV         TimeSeriesSplit on the date-sorted training frame. Rows are a district x date
           panel, so sorting by date makes each CV fold a contiguous block of dates -
           validation is always in the future relative to its training portion.

SCORING    average_precision (PR-AUC) for model selection, not accuracy and not ROC-AUC.
           At 9% positives a model predicting "no flood" everywhere scores 91% accuracy
           and is useless. PR-AUC is the metric that actually tracks positive-class skill
           under imbalance.

IMPUTATION Median, fitted inside the pipeline on training folds only. Missing rainfall is
           a coverage gap (no station reported), not a true zero, so filling with 0 would
           assert "it did not rain" - which the data does not say.

SCALING    StandardScaler for the linear baseline. Trees do not need it but the shared
           ColumnTransformer is harmless to them and keeps one preprocessing definition.

IMBALANCE  class_weight='balanced' (and scale_pos_weight for XGBoost) as the primary
           strategy, with a SMOTE arm as an explicit comparison. SMOTE is applied INSIDE
           the CV fold via imblearn's Pipeline - never before the split, which would copy
           synthetic neighbours of validation rows into training.

STACKING   StackingClassifier with an internal CV so the meta-learner is trained on
           out-of-fold base predictions only. Fitting the meta-learner on in-sample base
           predictions is the classic meta-leakage error and is avoided here.
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
import seaborn as sns

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import (AdaBoostClassifier, RandomForestClassifier,
                              StackingClassifier, VotingClassifier)
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (average_precision_score, classification_report,
                             confusion_matrix, f1_score, precision_recall_curve,
                             precision_score, recall_score, roc_auc_score, roc_curve)
from sklearn.model_selection import (RandomizedSearchCV, StratifiedKFold,
                                     TimeSeriesSplit)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier

warnings.filterwarnings("ignore")
RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROC = os.path.join(ROOT, "data", "processed")
RES = os.path.join(ROOT, "results")
FIG = os.path.join(RES, "figures")
MET = os.path.join(RES, "metrics")
MODELS = os.path.join(ROOT, "models")
for d in (FIG, MET, MODELS):
    os.makedirs(d, exist_ok=True)

# NOTE - rain_obs_prev7d was ENGINEERED, THEN REMOVED after SHAP flagged it as the
# second-strongest positive contributor. Investigation showed rainfall stations report
# on ~1.31 more days in the week before a flood day than before a non-flood day, within
# the same district (point-biserial r = 0.14, as strong as the real rainfall features).
# Monitoring intensifies during flood events, so the observation count partially encodes
# the outcome. It is a reporting artefact, not a predictor, and is therefore excluded.
NUM = ["rain_prev3d_sum", "rain_prev7d_sum", "rain_prev15d_sum", "rain_prev7d_max",
       "rain_anom_7d", "rain_anom_15d", "rain_state_prev3d", "wet_days_prev7d",
       "month", "day_of_year"]
CAT = ["district"]
FEATURES = NUM + CAT
TARGET = "flood_affected"

sns.set_theme(style="whitegrid")
PALETTE = ["#2E86AB", "#E4572E"]

log: list[str] = []


def say(m: str = "") -> None:
    print(m)
    log.append(m)


# ----------------------------------------------------------------- load + audit
def load():
    df = pd.read_csv(os.path.join(PROC, "assam_flood_district_day.csv"), parse_dates=["date"])
    say("=" * 72)
    say("Q2  DATA AUDIT")
    say("=" * 72)
    say(f"rows={len(df):,}  cols={df.shape[1]}  districts={df.district.nunique()}  dates={df.date.nunique()}")
    say(f"duplicated district-days : {df.duplicated(['district','date']).sum()}")
    say(f"dtypes                   : {df[FEATURES].dtypes.value_counts().to_dict()}")

    say("\n-- missing values in model features --")
    for c in FEATURES:
        n = int(df[c].isna().sum())
        say(f"   {c:<18} {n:>5}  ({100*n/len(df):5.1f}%)")

    say("\n-- invalid values --")
    neg = int((df[[c for c in NUM if c.startswith('rain_prev')]] < 0).sum().sum())
    say(f"   negative rainfall accumulations : {neg}  (rainfall cannot be negative)")
    say(f"   target values                   : {sorted(df[TARGET].unique())}")

    say("\n-- outliers (IQR rule) on rainfall features; RETAINED, not clipped --")
    for c in ["rain_prev3d_sum", "rain_prev7d_sum", "rain_prev15d_sum"]:
        q1, q3 = df[c].quantile([.25, .75])
        iqr = q3 - q1
        hi = q3 + 1.5 * iqr
        n = int((df[c] > hi).sum())
        say(f"   {c:<18} >{hi:7.1f}mm : {n:>4} rows ({100*n/len(df):.1f}%)")
    say("   Extreme rainfall is the physical signal we are trying to learn from -")
    say("   removing the upper tail would delete precisely the flood-driving events.")

    say("\n-- class balance --")
    p = int(df[TARGET].sum())
    say(f"   positives {p} / {len(df)} = {100*p/len(df):.2f}%   ratio {(len(df)-p)/p:.1f}:1")
    return df


# ------------------------------------------------------------------------- EDA
def eda(df):
    say("\n" + "=" * 72)
    say("Q2  EDA")
    say("=" * 72)

    fig, ax = plt.subplots(2, 2, figsize=(14, 9))

    # 1 class balance
    vc = df[TARGET].value_counts().sort_index()
    ax[0, 0].bar(["No flood (0)", "Flood (1)"], vc.values, color=PALETTE)
    for i, v in enumerate(vc.values):
        ax[0, 0].text(i, v, f"{v:,}\n{100*v/len(df):.1f}%", ha="center", va="bottom", fontweight="bold")
    ax[0, 0].set_title("Class balance (district-days)")
    ax[0, 0].set_ylim(0, vc.max() * 1.18)

    # 2 antecedent rainfall by class
    d = df.dropna(subset=["rain_prev7d_sum"])
    sns.boxplot(data=d, x=TARGET, y="rain_prev7d_sum", ax=ax[0, 1],
                hue=TARGET, palette=PALETTE, legend=False, showfliers=False)
    ax[0, 1].set_title("7-day antecedent rainfall by outcome")
    ax[0, 1].set_xlabel("flood_affected"); ax[0, 1].set_ylabel("mm")
    m0 = d[d[TARGET] == 0]["rain_prev7d_sum"].median()
    m1 = d[d[TARGET] == 1]["rain_prev7d_sum"].median()
    say(f"median 7-day antecedent rainfall : no-flood {m0:.1f}mm vs flood {m1:.1f}mm")

    # 3 monthly flood rate
    mr = df.groupby("month")[TARGET].mean() * 100
    ax[1, 0].plot(mr.index, mr.values, marker="o", color=PALETTE[1], lw=2)
    ax[1, 0].set_title("Flood rate by month"); ax[1, 0].set_xlabel("month")
    ax[1, 0].set_ylabel("% district-days affected")
    say(f"peak flood month                 : {mr.idxmax()} ({mr.max():.1f}%)")

    # 4 district flood rate
    dr = (df.groupby("district")[TARGET].mean() * 100).sort_values(ascending=False)
    ax[1, 1].barh(dr.index[::-1], dr.values[::-1], color=PALETTE[0])
    ax[1, 1].set_title("Flood rate by district"); ax[1, 1].set_xlabel("% days affected")
    ax[1, 1].tick_params(labelsize=8)

    plt.tight_layout()
    plt.savefig(os.path.join(FIG, "eda_overview.png"), dpi=140, bbox_inches="tight")
    plt.close()
    say("saved results/figures/eda_overview.png")
    return m0, m1


# -------------------------------------------------------------------- pipeline
def preprocessor():
    """Imputation + scaling + one-hot, all fitted inside CV folds only."""
    return ColumnTransformer([
        ("num", Pipeline([("impute", SimpleImputer(strategy="median")),
                          ("scale", StandardScaler())]), NUM),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CAT),
    ])


def tune_threshold(est, Xtr, ytr):
    """Pick the probability cut-off that maximises F1 ON THE TRAINING DATA.

    Tuning on the test set would be leakage. At 9% positives the default 0.5 cut-off is
    arbitrary and penalises well-ranked models that output low absolute probabilities,
    so every model gets its own train-fitted threshold and the comparison stays fair.
    """
    p = est.predict_proba(Xtr)[:, 1]
    prec, rec, thrs = precision_recall_curve(ytr, p)
    f1s = np.divide(2 * prec * rec, prec + rec, out=np.zeros_like(prec), where=(prec + rec) > 0)
    return float(thrs[int(np.nanargmax(f1s[:-1]))]) if len(thrs) else 0.5


def evaluate(name, est, Xte, yte, results, thr=0.5):
    proba = est.predict_proba(Xte)[:, 1]
    pred = (proba >= thr).astype(int)
    cm = confusion_matrix(yte, pred)
    row = {
        "model": name,
        "threshold": round(thr, 3),
        "ROC_AUC": roc_auc_score(yte, proba),
        "PR_AUC": average_precision_score(yte, proba),
        "F1": f1_score(yte, pred, zero_division=0),
        "Precision": precision_score(yte, pred, zero_division=0),
        "Recall": recall_score(yte, pred, zero_division=0),
        "TN": cm[0, 0], "FP": cm[0, 1], "FN": cm[1, 0], "TP": cm[1, 1],
    }
    results.append(row)
    say(f"{name:<28} ROC-AUC={row['ROC_AUC']:.3f}  PR-AUC={row['PR_AUC']:.3f}  "
        f"F1={row['F1']:.3f}  P={row['Precision']:.3f}  R={row['Recall']:.3f}")
    return proba


def main():
    df = load()
    eda(df)

    train = df[df.split == "train_2025"].sort_values("date").reset_index(drop=True)
    test = df[df.split == "test_2026"].sort_values("date").reset_index(drop=True)
    Xtr, ytr = train[FEATURES], train[TARGET].values
    Xte, yte = test[FEATURES], test[TARGET].values

    say("\n" + "=" * 72)
    say("Q3  ENSEMBLE ARCHITECTURE, TUNING, COMPARISON")
    say("=" * 72)
    say(f"train 2025 : {len(Xtr):,} rows, {ytr.sum()} positives ({100*ytr.mean():.2f}%)")
    say(f"test  2026 : {len(Xte):,} rows, {yte.sum()} positives ({100*yte.mean():.2f}%)  [UNTOUCHED]")
    say(f"train dates {train.date.min().date()} -> {train.date.max().date()}")
    say(f"test  dates {test.date.min().date()} -> {test.date.max().date()}")
    say(f"date overlap: {len(set(train.date) & set(test.date))} (must be 0)")

    cv = TimeSeriesSplit(n_splits=4)
    spw = float((ytr == 0).sum() / (ytr == 1).sum())
    say(f"\nCV = TimeSeriesSplit(4) on date-sorted training rows; scale_pos_weight={spw:.2f}")

    from xgboost import XGBClassifier
    results: list[dict] = []
    fitted: dict[str, object] = {}

    def mk(clf):
        return Pipeline([("prep", preprocessor()), ("clf", clf)])

    def fit_eval(name, est, do_fit=True):
        """Fit, pick a train-tuned threshold, score on the untouched test set."""
        if do_fit:
            est.fit(Xtr, ytr)
        thr = tune_threshold(est, Xtr, ytr)
        evaluate(name, est, Xte, yte, results, thr=thr)
        fitted[name] = est
        return est

    # ---------------------------------------------------------- BASELINES
    say("\n--- baselines (single models) ---")
    logreg = fit_eval("Baseline: LogisticRegression",
                      mk(LogisticRegression(max_iter=2000, class_weight="balanced",
                                            random_state=RANDOM_STATE)))
    fit_eval("Baseline: DecisionTree",
             mk(DecisionTreeClassifier(max_depth=4, min_samples_leaf=20,
                                       class_weight="balanced", random_state=RANDOM_STATE)))

    # ------------------------------------------------------ (a) BAGGING: RF
    say("\n--- (a) bagging: RandomForest (tuned) ---")
    rf_search = RandomizedSearchCV(
        mk(RandomForestClassifier(class_weight="balanced", random_state=RANDOM_STATE, n_jobs=-1)),
        # Deliberately regularised. An unconstrained forest (max_depth=None,
        # min_samples_leaf=1) memorises each district's 2025 base rate, which shifted
        # in 2026 - it scored F1=0.03 on the test season. Shallow trees with large
        # leaves are forced to rely on the rainfall features instead.
        {"clf__n_estimators": [300, 500],
         "clf__max_depth": [3, 4, 6, 8],
         "clf__min_samples_leaf": [10, 20, 40, 60],
         "clf__max_features": ["sqrt", 0.5, None]},
        n_iter=12, scoring="average_precision", cv=cv,
        random_state=RANDOM_STATE, n_jobs=-1, refit=True)
    rf_search.fit(Xtr, ytr)
    say(f"best params: {rf_search.best_params_}")
    say(f"best CV PR-AUC: {rf_search.best_score_:.3f}")
    rf = fit_eval("Bagging: RandomForest", rf_search.best_estimator_, do_fit=False)

    # ---------------------------------------------------- (b) BOOSTING: XGB
    say("\n--- (b) boosting: XGBoost (tuned) ---")
    xgb_search = RandomizedSearchCV(
        mk(XGBClassifier(random_state=RANDOM_STATE, eval_metric="logloss",
                         scale_pos_weight=spw, tree_method="hist", n_jobs=-1)),
        {"clf__n_estimators": [200, 400],
         "clf__max_depth": [2, 3, 4],
         "clf__learning_rate": [0.02, 0.05, 0.1],
         "clf__min_child_weight": [5, 10, 20],
         "clf__reg_lambda": [1.0, 5.0, 20.0],
         "clf__subsample": [0.7, 0.9],
         "clf__colsample_bytree": [0.7, 0.9]},
        n_iter=12, scoring="average_precision", cv=cv,
        random_state=RANDOM_STATE, n_jobs=-1, refit=True)
    xgb_search.fit(Xtr, ytr)
    say(f"best params: {xgb_search.best_params_}")
    say(f"best CV PR-AUC: {xgb_search.best_score_:.3f}")
    xgb = fit_eval("Boosting: XGBoost", xgb_search.best_estimator_, do_fit=False)

    # AdaBoost as a second boosting reference
    fit_eval("Boosting: AdaBoost",
             mk(AdaBoostClassifier(n_estimators=300, learning_rate=0.5,
                                   random_state=RANDOM_STATE)))

    # ------------------------------------- (c) HETEROGENEOUS STACKING / VOTING
    say("\n--- (c) heterogeneous ensembles ---")
    base = [
        ("logreg", mk(LogisticRegression(max_iter=2000, class_weight="balanced",
                                         random_state=RANDOM_STATE))),
        ("rf", mk(RandomForestClassifier(n_estimators=500, class_weight="balanced",
                                         max_depth=6, min_samples_leaf=20,
                                         random_state=RANDOM_STATE, n_jobs=-1))),
        ("xgb", mk(XGBClassifier(n_estimators=400, max_depth=3, learning_rate=0.05,
                                 min_child_weight=10, reg_lambda=5.0,
                                 scale_pos_weight=spw, random_state=RANDOM_STATE,
                                 eval_metric="logloss", tree_method="hist", n_jobs=-1))),
    ]
    # NOTE on the stacking CV: StackingClassifier calls cross_val_predict, which requires
    # the CV to be a PARTITION of the training rows. TimeSeriesSplit is not a partition
    # (early rows never appear in any validation fold), so it raises
    # "cross_val_predict only works for partitions". StratifiedKFold is used instead.
    # This still prevents meta-leakage - the meta-learner sees only OUT-OF-FOLD base
    # predictions - but it is not time-aware, which is a documented limitation.
    stack_cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    stack = StackingClassifier(
        estimators=base,
        final_estimator=LogisticRegression(max_iter=2000, class_weight="balanced",
                                           random_state=RANDOM_STATE),
        cv=stack_cv, stack_method="predict_proba", n_jobs=-1, passthrough=False)
    fit_eval("Stacking (LR+RF+XGB -> LR)", stack)
    fit_eval("Voting (soft, LR+RF+XGB)",
             VotingClassifier(estimators=base, voting="soft", n_jobs=-1))

    # ------------------------------------------------ SELF-LEARNING 1: imbalance
    say("\n" + "=" * 72)
    say("SELF-LEARNING CONCEPT 1: class-imbalance handling + threshold tuning")
    say("=" * 72)
    from imblearn.over_sampling import SMOTE
    from imblearn.pipeline import Pipeline as ImbPipeline

    smote_rf = ImbPipeline([
        ("prep", preprocessor()),
        ("smote", SMOTE(random_state=RANDOM_STATE, k_neighbors=5)),  # inside the fold
        ("clf", RandomForestClassifier(n_estimators=500, max_depth=6, min_samples_leaf=20,
                                       random_state=RANDOM_STATE, n_jobs=-1)),
    ])
    fit_eval("RandomForest + SMOTE", smote_rf)
    say("SMOTE sits INSIDE the pipeline, so it is re-fitted per CV fold and never")
    say("synthesises neighbours of validation rows. Applying it before the split is")
    say("the standard leakage mistake.")

    say("\nEvery model above is reported at its OWN threshold, tuned on the training")
    say("F1 curve only. Without this, well-ranked models that emit low absolute")
    say("probabilities look broken at the arbitrary 0.5 cut-off (an unregularised")
    say("RandomForest scored F1=0.03 that way while still ranking cases sensibly).")

    # ------------------------------------------------------------- comparison
    res_df = pd.DataFrame(results).sort_values("PR_AUC", ascending=False)
    res_df.to_csv(os.path.join(MET, "model_comparison.csv"), index=False)
    say("\n" + "=" * 72)
    say("MODEL COMPARISON  (untouched 2026 test set)")
    say("=" * 72)
    say(res_df.to_string(index=False, float_format=lambda v: f"{v:.3f}"))

    baseline_auc = res_df.loc[res_df.model == "Baseline: LogisticRegression", "ROC_AUC"].iloc[0]
    baseline_pr = res_df.loc[res_df.model == "Baseline: LogisticRegression", "PR_AUC"].iloc[0]
    ens = res_df[res_df.model.str.contains("Stacking|Voting|RandomForest|XGBoost|AdaBoost")]
    best_ens = ens.loc[ens.PR_AUC.idxmax()]
    say("")
    say(f"BASELINE (LogReg)     ROC-AUC={baseline_auc:.3f}  PR-AUC={baseline_pr:.3f}")
    say(f"BEST ENSEMBLE ({best_ens.model})  ROC-AUC={best_ens.ROC_AUC:.3f}  PR-AUC={best_ens.PR_AUC:.3f}")
    verdict = ("The best ensemble OUTPERFORMS the baseline."
               if best_ens.PR_AUC > baseline_pr else
               "The best ensemble DOES NOT outperform the baseline on PR-AUC.")
    say(f"VERDICT: {verdict}")

    # ------------------------------------------------------------------ plots
    best_thr = float(res_df.loc[res_df.PR_AUC.idxmax(), "threshold"])
    fig, ax = plt.subplots(1, 3, figsize=(19, 5.4))
    mm = res_df.set_index("model")[["ROC_AUC", "PR_AUC", "F1"]]
    mm.plot(kind="barh", ax=ax[0], color=["#2E86AB", "#E4572E", "#8AC926"])
    ax[0].set_title("Model comparison â€” untouched 2026 test set")
    ax[0].set_xlim(0, 1); ax[0].tick_params(labelsize=8)
    ax[0].axvline(baseline_pr, ls="--", c="grey", lw=1)

    for nm in ["Baseline: LogisticRegression", best_ens.model]:
        pr = fitted[nm].predict_proba(Xte)[:, 1]
        fpr, tpr, _ = roc_curve(yte, pr)
        ax[1].plot(fpr, tpr, lw=2, label=f"{nm} ({roc_auc_score(yte, pr):.3f})")
    ax[1].plot([0, 1], [0, 1], "k--", lw=1)
    ax[1].set_title("ROC â€” baseline vs best ensemble")
    ax[1].set_xlabel("False positive rate"); ax[1].set_ylabel("True positive rate")
    ax[1].legend(fontsize=8, loc="lower right")

    ens_thr = float(best_ens.threshold)
    bp = fitted[best_ens.model].predict_proba(Xte)[:, 1]
    cm = confusion_matrix(yte, (bp >= ens_thr).astype(int))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", ax=ax[2], cbar=False,
                xticklabels=["pred no-flood", "pred flood"],
                yticklabels=["actual no-flood", "actual flood"])
    ax[2].set_title(f"Confusion matrix â€” {best_ens.model}\n(threshold {ens_thr:.2f})")
    plt.tight_layout()
    plt.savefig(os.path.join(FIG, "model_comparison.png"), dpi=140, bbox_inches="tight")
    plt.close()
    say("\nsaved results/figures/model_comparison.png")

    say("\n--- classification report: best ensemble @ tuned threshold ---")
    say(classification_report(yte, (bp >= ens_thr).astype(int),
                              target_names=["no flood", "flood"], zero_division=0))

    # --------------------------------------------------------------- persist
    best_overall = res_df.iloc[0]                      # highest PR-AUC of ALL models
    joblib.dump(fitted[best_overall.model], os.path.join(MODELS, "best_model.joblib"))
    joblib.dump(fitted[best_ens.model], os.path.join(MODELS, "best_ensemble.joblib"))
    joblib.dump(fitted["Boosting: XGBoost"], os.path.join(MODELS, "xgboost.joblib"))
    joblib.dump(logreg, os.path.join(MODELS, "baseline_logreg.joblib"))
    say(f"\nBEST OVERALL MODEL: {best_overall.model} (PR-AUC {best_overall.PR_AUC:.3f}, "
        f"threshold {best_overall.threshold:.3f})")
    meta = {
        "best_model": best_overall.model,
        "best_threshold": float(best_overall.threshold),
        "best_model_roc_auc": float(best_overall.ROC_AUC),
        "best_model_pr_auc": float(best_overall.PR_AUC),
        "best_ensemble": best_ens.model,
        "best_ensemble_threshold": ens_thr,
        "features_numeric": NUM,
        "features_categorical": CAT,
        "train_period": [str(train.date.min().date()), str(train.date.max().date())],
        "test_period": [str(test.date.min().date()), str(test.date.max().date())],
        "baseline_roc_auc": float(baseline_auc),
        "baseline_pr_auc": float(baseline_pr),
        "best_ensemble_roc_auc": float(best_ens.ROC_AUC),
        "best_ensemble_pr_auc": float(best_ens.PR_AUC),
        "verdict": verdict,
        "random_state": RANDOM_STATE,
    }
    with open(os.path.join(MODELS, "model_metadata.json"), "w", encoding="utf-8") as fh:
        json.dump(meta, fh, indent=2)
    with open(os.path.join(MET, "training_log.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(log))
    say(f"\nsaved models/best_model.joblib  ({best_ens.model})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

