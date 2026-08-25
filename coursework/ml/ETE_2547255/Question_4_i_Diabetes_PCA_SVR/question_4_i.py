"""
Question 4(i): Machine Learning Pipeline for Predicting Diabetes Progression
Dimensionality Reduction (PCA) + Support Vector Regression (SVR)

Academic Implementation for MCA Machine Learning Practical Examination
Author: Vishwas Vashishtha (Reg No: 2547255)
Course: MCA Machine Learning (MCA521)
"""

import os
import time
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Headless backend for clean non-GUI script execution
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split, GridSearchCV, KFold
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.svm import SVR
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Set seed for exact reproducibility
RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)

# Output Directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")
PLOTS_DIR = os.path.join(BASE_DIR, "plots")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(PLOTS_DIR, exist_ok=True)

# Styling for Plots
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.size'] = 10
plt.rcParams['axes.titlesize'] = 12
plt.rcParams['axes.labelsize'] = 11

def main():
    print("=" * 80)
    print(" QUESTION 4(i): DIABETES DISEASE PROGRESSION PREDICTION (PCA + SVR) ")
    print("=" * 80)

    # ---------------------------------------------------------
    # Step 1: Load Dataset
    # ---------------------------------------------------------
    print("\n[Step 1] Loading Diabetes Dataset from sklearn.datasets...")
    diabetes = load_diabetes(as_frame=True)
    X_raw = diabetes.data
    y_raw = diabetes.target
    feature_names = diabetes.feature_names

    print(f"  • Dataset Shape        : {X_raw.shape[0]} samples, {X_raw.shape[1]} features")
    print(f"  • Feature Names        : {list(feature_names)}")
    print(f"  • Target Variable Info : Quantitative measure of disease progression 1 year after baseline")
    print(f"  • Target Range         : Min = {y_raw.min():.1f}, Max = {y_raw.max():.1f}, Mean = {y_raw.mean():.2f}, Std = {y_raw.std():.2f}")

    # ---------------------------------------------------------
    # Step 2: Train-Test Split
    # ---------------------------------------------------------
    print("\n[Step 2] Splitting dataset into Training (80%) and Testing (20%) sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X_raw, y_raw, test_size=0.2, random_state=RANDOM_STATE
    )
    print(f"  • Training Samples : {X_train.shape[0]}")
    print(f"  • Testing Samples  : {X_test.shape[0]}")

    # ---------------------------------------------------------
    # Step 3: Dimensionality Reduction Analysis (PCA)
    # ---------------------------------------------------------
    print("\n[Step 3] Analyzing Principal Component Analysis (PCA) on Training Data...")
    scaler_temp = StandardScaler()
    X_train_scaled = scaler_temp.fit_transform(X_train)

    pca_full = PCA(random_state=RANDOM_STATE)
    pca_full.fit(X_train_scaled)

    exp_var = pca_full.explained_variance_ratio_
    cum_var = np.cumsum(exp_var)

    pca_summary_df = pd.DataFrame({
        'Principal Component': [f'PC{i+1}' for i in range(len(exp_var))],
        'Eigenvalue': pca_full.explained_variance_,
        'Explained Variance Ratio': exp_var,
        'Cumulative Variance Ratio': cum_var
    })
    pca_summary_df.to_csv(os.path.join(OUTPUT_DIR, "pca_variance_summary.csv"), index=False)
    print("  • PCA Explained Variance Table:")
    print(pca_summary_df.to_string(index=False))

    # Choose number of components that captures ~85-90% variance
    n_components_chosen = 6  # PC1 to PC6 captures ~88.7% variance
    print(f"\n  [Dimensionality Reduction Decision]")
    print(f"  Selected n_components = {n_components_chosen}")
    print(f"  Justification: 6 components retain {cum_var[n_components_chosen-1]*100:.2f}% of total variance while reducing dimension by 40% (10 -> 6).")

    # Plot 1: PCA Scree & Cumulative Variance
    fig, ax1 = plt.subplots(figsize=(8, 5))
    color = '#1F4E79'
    ax1.set_xlabel('Principal Components', fontweight='bold')
    ax1.set_ylabel('Individual Explained Variance Ratio', color=color, fontweight='bold')
    bars = ax1.bar([f'PC{i+1}' for i in range(len(exp_var))], exp_var, color=color, alpha=0.7, label='Individual Variance')
    ax1.tick_params(axis='y', labelcolor=color)
    ax1.set_ylim(0, max(exp_var) * 1.2)

    # Highlight chosen threshold
    ax1.axvline(x=n_components_chosen - 0.5, color='#C00000', linestyle='--', linewidth=1.5, label=f'Cutoff ({n_components_chosen} PCs)')

    ax2 = ax1.twinx()
    color2 = '#C00000'
    ax2.set_ylabel('Cumulative Explained Variance Ratio', color=color2, fontweight='bold')
    ax2.plot([f'PC{i+1}' for i in range(len(exp_var))], cum_var, color=color2, marker='o', linewidth=2, label='Cumulative Variance')
    ax2.tick_params(axis='y', labelcolor=color2)
    ax2.set_ylim(0, 1.05)
    ax2.axhline(y=cum_var[n_components_chosen-1], color='gray', linestyle=':', alpha=0.7)

    plt.title('Question 4(i): PCA Explained Variance & Scree Plot (Diabetes Dataset)', fontweight='bold', pad=15)
    fig.tight_layout()
    plot1_path = os.path.join(PLOTS_DIR, "01_pca_explained_variance.png")
    plt.savefig(plot1_path, dpi=300)
    plt.close()
    print(f"  • Saved Plot: {plot1_path}")

    # Plot 4: PCA Component Loadings Heatmap
    pca_loadings = pd.DataFrame(
        pca_full.components_[:n_components_chosen, :],
        columns=feature_names,
        index=[f'PC{i+1}' for i in range(n_components_chosen)]
    )
    plt.figure(figsize=(10, 5))
    sns.heatmap(pca_loadings, annot=True, fmt=".2f", cmap="vlag", center=0, cbar_kws={'label': 'Loading Coefficient'})
    plt.title('Question 4(i): PCA Component Loadings (Feature Contribution Matrix)', fontweight='bold', pad=12)
    plt.xlabel('Original Clinical Features', fontweight='bold')
    plt.ylabel('Selected Principal Components', fontweight='bold')
    plt.tight_layout()
    plot4_path = os.path.join(PLOTS_DIR, "04_pca_feature_loadings.png")
    plt.savefig(plot4_path, dpi=300)
    plt.close()
    print(f"  • Saved Plot: {plot4_path}")

    # ---------------------------------------------------------
    # Step 4: Model A - Baseline SVR (Original 10 Features)
    # ---------------------------------------------------------
    print("\n[Step 4] Training Model A: Baseline SVR (Original 10 Scaled Features)...")
    baseline_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('svr', SVR())
    ])

    param_grid_baseline = {
        'svr__C': [1.0, 10.0, 50.0, 100.0, 200.0],
        'svr__gamma': ['scale', 'auto', 0.01, 0.05, 0.1],
        'svr__epsilon': [1.0, 5.0, 10.0, 15.0, 20.0],
        'svr__kernel': ['rbf', 'linear']
    }

    cv_strategy = KFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    grid_baseline = GridSearchCV(
        baseline_pipeline,
        param_grid=param_grid_baseline,
        cv=cv_strategy,
        scoring='neg_root_mean_squared_error',
        n_jobs=1
    )

    t0_base = time.perf_counter()
    grid_baseline.fit(X_train, y_train)
    t_train_base = time.perf_counter() - t0_base

    best_baseline = grid_baseline.best_estimator_
    print(f"  • Baseline Best Parameters   : {grid_baseline.best_params_}")
    print(f"  • Baseline Tuning/Train Time : {t_train_base*1000:.2f} ms")

    # Predict & measure inference time
    t0_pred_base = time.perf_counter()
    y_pred_base = best_baseline.predict(X_test)
    t_pred_base = time.perf_counter() - t0_pred_base

    mae_base = mean_absolute_error(y_test, y_pred_base)
    mse_base = mean_squared_error(y_test, y_pred_base)
    rmse_base = float(np.sqrt(mse_base))
    r2_base = float(r2_score(y_test, y_pred_base))

    print(f"  • Baseline Test Metrics -> MAE: {mae_base:.3f}, MSE: {mse_base:.3f}, RMSE: {rmse_base:.3f}, R²: {r2_base:.4f}")

    # ---------------------------------------------------------
    # Step 5: Model B - Reduced Model (PCA + SVR)
    # ---------------------------------------------------------
    print(f"\n[Step 5] Training Model B: PCA ({n_components_chosen} Components) + SVR Pipeline...")
    reduced_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('pca', PCA(n_components=n_components_chosen, random_state=RANDOM_STATE)),
        ('svr', SVR())
    ])

    param_grid_reduced = {
        'svr__C': [1.0, 10.0, 50.0, 100.0, 200.0],
        'svr__gamma': ['scale', 'auto', 0.01, 0.05, 0.1],
        'svr__epsilon': [1.0, 5.0, 10.0, 15.0, 20.0],
        'svr__kernel': ['rbf', 'linear']
    }

    grid_reduced = GridSearchCV(
        reduced_pipeline,
        param_grid=param_grid_reduced,
        cv=cv_strategy,
        scoring='neg_root_mean_squared_error',
        n_jobs=1
    )

    t0_red = time.perf_counter()
    grid_reduced.fit(X_train, y_train)
    t_train_red = time.perf_counter() - t0_red

    best_reduced = grid_reduced.best_estimator_
    print(f"  • Reduced Best Parameters    : {grid_reduced.best_params_}")
    print(f"  • Reduced Tuning/Train Time  : {t_train_red*1000:.2f} ms")

    # Predict & measure inference time
    t0_pred_red = time.perf_counter()
    y_pred_red = best_reduced.predict(X_test)
    t_pred_red = time.perf_counter() - t0_pred_red

    mae_red = mean_absolute_error(y_test, y_pred_red)
    mse_red = mean_squared_error(y_test, y_pred_red)
    rmse_red = float(np.sqrt(mse_red))
    r2_red = float(r2_score(y_test, y_pred_red))

    print(f"  • Reduced Test Metrics  -> MAE: {mae_red:.3f}, MSE: {mse_red:.3f}, RMSE: {rmse_red:.3f}, R²: {r2_red:.4f}")

    # ---------------------------------------------------------
    # Step 6: Direct Single Fit Training Time Benchmark
    # ---------------------------------------------------------
    # Measure direct fit time of optimal models on train split
    t0_fit_base = time.perf_counter()
    best_baseline.fit(X_train, y_train)
    t_direct_base = (time.perf_counter() - t0_fit_base) * 1000

    t0_fit_red = time.perf_counter()
    best_reduced.fit(X_train, y_train)
    t_direct_red = (time.perf_counter() - t0_fit_red) * 1000

    # ---------------------------------------------------------
    # Step 7: Comparison Table & Metrics Summary
    # ---------------------------------------------------------
    print("\n[Step 7] Model Comparison & Comprehensive Evaluation Matrix:")
    comparison_df = pd.DataFrame([
        {
            'Model Pipeline': 'Model A (Baseline SVR)',
            'Input Dimension': '10 Original Features',
            'MAE': round(mae_base, 3),
            'MSE': round(mse_base, 3),
            'RMSE': round(rmse_base, 3),
            'R² Score': round(r2_base, 4),
            'Single Fit Time (ms)': round(t_direct_base, 2),
            'Inference Time (ms)': round(t_pred_base * 1000, 3)
        },
        {
            'Model Pipeline': f'Model B (PCA[{n_components_chosen}] + SVR)',
            'Input Dimension': f'{n_components_chosen} Principal Components',
            'MAE': round(mae_red, 3),
            'MSE': round(mse_red, 3),
            'RMSE': round(rmse_red, 3),
            'R² Score': round(r2_red, 4),
            'Single Fit Time (ms)': round(t_direct_red, 2),
            'Inference Time (ms)': round(t_pred_red * 1000, 3)
        }
    ])

    comparison_csv_path = os.path.join(OUTPUT_DIR, "q4_metrics_comparison.csv")
    comparison_df.to_csv(comparison_csv_path, index=False)
    print(comparison_df.to_string(index=False))

    # ---------------------------------------------------------
    # Step 8: Visualizations
    # ---------------------------------------------------------
    print("\n[Step 8] Generating High-Quality Evaluation Visualizations...")

    # Plot 2: Actual vs Predicted Scatter Plot
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

    # Baseline Plot
    ax1.scatter(y_test, y_pred_base, color='#1F4E79', alpha=0.75, edgecolors='k', s=50, label='Predictions')
    min_val_1 = min(y_test.min(), y_pred_base.min()) - 10
    max_val_1 = max(y_test.max(), y_pred_base.max()) + 10
    ax1.plot([min_val_1, max_val_1], [min_val_1, max_val_1], color='#C00000', linestyle='--', linewidth=2, label=r'Ideal Fit ($y=\hat{y}$)')
    ax1.set_title(f'Baseline SVR (10 Features)\n$R^2 = {r2_base:.4f}$, RMSE = {rmse_base:.2f}', fontweight='bold')
    ax1.set_xlabel('Actual Disease Progression', fontweight='bold')
    ax1.set_ylabel('Predicted Disease Progression', fontweight='bold')
    ax1.set_xlim(min_val_1, max_val_1)
    ax1.set_ylim(min_val_1, max_val_1)
    ax1.legend(loc='upper left')

    # Reduced Plot
    ax2.scatter(y_test, y_pred_red, color='#2E74B5', alpha=0.75, edgecolors='k', s=50, label='Predictions')
    min_val_2 = min(y_test.min(), y_pred_red.min()) - 10
    max_val_2 = max(y_test.max(), y_pred_red.max()) + 10
    ax2.plot([min_val_2, max_val_2], [min_val_2, max_val_2], color='#C00000', linestyle='--', linewidth=2, label=r'Ideal Fit ($y=\hat{y}$)')
    ax2.set_title(f'Reduced PCA + SVR ({n_components_chosen} Components)\n$R^2 = {r2_red:.4f}$, RMSE = {rmse_red:.2f}', fontweight='bold')
    ax2.set_xlabel('Actual Disease Progression', fontweight='bold')
    ax2.set_ylabel('Predicted Disease Progression', fontweight='bold')
    ax2.set_xlim(min_val_2, max_val_2)
    ax2.set_ylim(min_val_2, max_val_2)
    ax2.legend(loc='upper left')

    plt.suptitle('Question 4(i): Actual vs. Predicted Disease Progression on Test Set', fontweight='bold', fontsize=13, y=1.02)
    plt.tight_layout()
    plot2_path = os.path.join(PLOTS_DIR, "02_actual_vs_predicted_svr.png")
    plt.savefig(plot2_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"  • Saved Plot: {plot2_path}")

    # Plot 3: Metrics Comparison Bar Chart
    fig, (ax_r2, ax_err) = plt.subplots(1, 2, figsize=(10, 4.5))

    models = ['Baseline SVR\n(10 Features)', f'PCA+SVR\n({n_components_chosen} Components)']
    r2_scores = [r2_base, r2_red]
    colors = ['#1F4E79', '#2E74B5']

    bars1 = ax_r2.bar(models, r2_scores, color=colors, width=0.45, edgecolor='black')
    ax_r2.set_title('Model Goodness of Fit ($R^2$ Score)', fontweight='bold')
    ax_r2.set_ylabel(r'$R^2$ Score (Higher is Better)', fontweight='bold')
    ax_r2.set_ylim(0, max(r2_scores) * 1.25)
    for bar in bars1:
        yval = bar.get_height()
        ax_r2.text(bar.get_x() + bar.get_width()/2.0, yval + 0.015, f"{yval:.4f}", ha='center', va='bottom', fontweight='bold')

    x = np.arange(len(models))
    width = 0.28
    ax_err.bar(x - width/2, [mae_base, mae_red], width, label='MAE', color='#595959', edgecolor='black')
    ax_err.bar(x + width/2, [rmse_base, rmse_red], width, label='RMSE', color='#A6A6A6', edgecolor='black')
    ax_err.set_title('Error Comparison (MAE & RMSE)', fontweight='bold')
    ax_err.set_ylabel('Error in Target Scale (Lower is Better)', fontweight='bold')
    ax_err.set_xticks(x)
    ax_err.set_xticklabels(models)
    ax_err.set_ylim(0, max(rmse_base, rmse_red) * 1.25)
    ax_err.legend(loc='upper right')

    plt.suptitle('Question 4(i): Performance Comparison of SVR Architectures', fontweight='bold', fontsize=12, y=1.02)
    plt.tight_layout()
    plot3_path = os.path.join(PLOTS_DIR, "03_model_comparison_metrics.png")
    plt.savefig(plot3_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"  • Saved Plot: {plot3_path}")

    # ---------------------------------------------------------
    # Step 9: Save Comprehensive Execution Summary
    # ---------------------------------------------------------
    summary_text = f"""================================================================================
 QUESTION 4(i) EXPERIMENTAL RESULTS & DETAILED ANALYSIS
================================================================================
Student Name : Vishwas Vashishtha
Register No  : 2547255
Dataset      : Scikit-learn Diabetes Dataset (442 samples, 10 features)
Task         : Predict disease progression 1 year after baseline

1. DIMENSIONALITY REDUCTION (PCA):
   - Original Features: 10 ({', '.join(feature_names)})
   - Selected Principal Components: {n_components_chosen}
   - Cumulative Explained Variance Retained: {cum_var[n_components_chosen-1]*100:.2f}%
   - Dimensionality Reduction Ratio: 40% reduction in feature space

2. MODEL CONFIGURATIONS & HYPERPARAMETERS:
   - Baseline SVR Best Parameters: {grid_baseline.best_params_}
   - Reduced PCA+SVR Best Parameters: {grid_reduced.best_params_}

3. TEST SET PERFORMANCE COMPARISON:
   - Baseline SVR (10 Features) : R² = {r2_base:.4f}, RMSE = {rmse_base:.3f}, MAE = {mae_base:.3f}
   - Reduced PCA+SVR ({n_components_chosen} PCs) : R² = {r2_red:.4f}, RMSE = {rmse_red:.3f}, MAE = {mae_red:.3f}

4. ACCURACY, COMPUTATIONAL COST & INTERPRETABILITY ANALYSIS:
   a) Model Accuracy / Performance:
      - Baseline SVR achieves R² = {r2_base:.4f} and RMSE = {rmse_base:.3f}.
      - Reduced PCA+SVR achieves R² = {r2_red:.4f} and RMSE = {rmse_red:.3f}.
      - PCA retains the primary linear variance directions and preserves competitive predictive power while dropping 4 dimensions.
   b) Computational Cost:
      - Direct Single Fit Time: Baseline = {t_direct_base:.2f} ms vs Reduced = {t_direct_red:.2f} ms.
      - In SVR, kernel computation scales quadratically with samples O(n_samples^2 * n_features). Reducing feature dimension lowers matrix product calculations per kernel evaluation.
   c) Interpretability:
      - Baseline features (bmi, bp, s1-s6) have direct clinical and physiological meaning.
      - PCA creates orthogonal linear combinations (principal components), which obscures direct physiological attribution although component loadings show feature contributions.

5. CONCLUSION:
   The baseline SVR utilizing all 10 clinical features yielded the optimal predictive accuracy (R² = {r2_base:.4f}). Applying PCA to 6 components maintained substantial variance ({cum_var[n_components_chosen-1]*100:.2f}%) with a competitive R² of {r2_red:.4f}, demonstrating that PCA effectively compresses clinical feature representations with minimal loss in performance.
================================================================================
"""
    summary_path = os.path.join(OUTPUT_DIR, "q4_execution_summary.txt")
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(summary_text.strip())
    print(f"\n[Step 9] Summary exported to: {summary_path}")

    print("\n" + "=" * 80)
    print(" QUESTION 4(i) EXECUTION COMPLETED SUCCESSFULLY WITH 0 ERRORS ")
    print("=" * 80)

if __name__ == "__main__":
    main()
