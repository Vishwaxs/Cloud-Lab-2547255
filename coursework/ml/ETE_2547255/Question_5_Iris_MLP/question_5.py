"""
Question 5: Multi-Layer Perceptron (MLP) Architecture Comparison on Iris Dataset
Comparing 1 Hidden Layer (8 Neurons) vs. 2 Hidden Layers (8, 4 Neurons)

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

from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, ConfusionMatrixDisplay

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
    print(" QUESTION 5: IRIS MLP CLASSIFIER COMPARISON (1 LAYER: 8 vs 2 LAYERS: 8,4) ")
    print("=" * 80)

    # ---------------------------------------------------------
    # Step 1: Load Iris Dataset
    # ---------------------------------------------------------
    print("\n[Step 1] Loading Iris Dataset from sklearn.datasets...")
    iris = load_iris(as_frame=True)
    X = iris.data
    y = iris.target
    feature_names = list(iris.feature_names)
    target_names = [str(name) for name in iris.target_names]

    print(f"  • Dataset Shape   : {X.shape[0]} samples, {X.shape[1]} features")
    print(f"  • Feature Names   : {feature_names}")
    print(f"  • Target Classes  : {len(target_names)} classes ({target_names})")
    print(f"  • Class Balance   : {dict(pd.Series(y).value_counts().sort_index())} (50 samples each)")

    # ---------------------------------------------------------
    # Step 2: Train-Test Split & Pipeline Setup
    # ---------------------------------------------------------
    print("\n[Step 2] Splitting into Train (80%) and Test (20%) Sets with Stratification...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )
    print(f"  • Training Samples : {X_train.shape[0]} (40 per class)")
    print(f"  • Testing Samples  : {X_test.shape[0]} (10 per class)")

    # ---------------------------------------------------------
    # Step 3: Model Definitions
    # ---------------------------------------------------------
    print("\n[Step 3] Defining MLP Classifier Architectures...")
    # Model 1: 1 Hidden Layer with 8 Neurons
    mlp_8_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('mlp', MLPClassifier(
            hidden_layer_sizes=(8,),
            activation='relu',
            solver='adam',
            learning_rate_init=0.01,
            max_iter=1000,
            random_state=RANDOM_STATE
        ))
    ])

    # Model 2: 2 Hidden Layers with 8 and 4 Neurons (8, 4)
    mlp_8_4_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('mlp', MLPClassifier(
            hidden_layer_sizes=(8, 4),
            activation='relu',
            solver='adam',
            learning_rate_init=0.01,
            max_iter=1000,
            random_state=RANDOM_STATE
        ))
    ])

    # ---------------------------------------------------------
    # Step 4: 5-Fold Stratified Cross-Validation
    # ---------------------------------------------------------
    print("\n[Step 4] Executing 5-Fold Stratified Cross-Validation on Training Split...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    cv_scores_8 = cross_val_score(mlp_8_pipeline, X_train, y_train, cv=cv, scoring='accuracy')
    cv_scores_8_4 = cross_val_score(mlp_8_4_pipeline, X_train, y_train, cv=cv, scoring='accuracy')

    mean_cv_8, std_cv_8 = float(np.mean(cv_scores_8)), float(np.std(cv_scores_8))
    mean_cv_8_4, std_cv_8_4 = float(np.mean(cv_scores_8_4)), float(np.std(cv_scores_8_4))

    print(f"  • Model 1 [1 Hidden Layer (8)]:")
    print(f"    - Fold Scores : {[round(float(s), 4) for s in cv_scores_8]}")
    print(f"    - Mean CV Acc : {mean_cv_8*100:.2f}% (± {std_cv_8*100:.2f}%)")

    print(f"  • Model 2 [2 Hidden Layers (8, 4)]:")
    print(f"    - Fold Scores : {[round(float(s), 4) for s in cv_scores_8_4]}")
    print(f"    - Mean CV Acc : {mean_cv_8_4*100:.2f}% (± {std_cv_8_4*100:.2f}%)")

    # ---------------------------------------------------------
    # Step 5: Fit on Full Training Set and Measure Convergence
    # ---------------------------------------------------------
    print("\n[Step 5] Fitting Both Architectures on Full Training Split...")
    t0_8 = time.perf_counter()
    mlp_8_pipeline.fit(X_train, y_train)
    t_fit_8 = (time.perf_counter() - t0_8) * 1000

    t0_8_4 = time.perf_counter()
    mlp_8_4_pipeline.fit(X_train, y_train)
    t_fit_8_4 = (time.perf_counter() - t0_8_4) * 1000

    mlp8_model = mlp_8_pipeline.named_steps['mlp']
    mlp8_4_model = mlp_8_4_pipeline.named_steps['mlp']

    # Parameter counts:
    # Model 1 (8,): 4*8 + 8 (input->h1) + 8*3 + 3 (h1->out) = 40 + 27 = 67 params
    # Model 2 (8, 4): 4*8 + 8 (input->h1) + 8*4 + 4 (h1->h2) + 4*3 + 3 (h2->out) = 40 + 36 + 15 = 91 params
    params_8 = (4 * 8 + 8) + (8 * 3 + 3)
    params_8_4 = (4 * 8 + 8) + (8 * 4 + 4) + (4 * 3 + 3)

    # ---------------------------------------------------------
    # Step 6: Test Set Evaluation for Both Models
    # ---------------------------------------------------------
    print("\n[Step 6] Evaluating Test Performance on Held-Out Test Set...")
    y_pred_8 = mlp_8_pipeline.predict(X_test)
    y_pred_8_4 = mlp_8_4_pipeline.predict(X_test)

    test_acc_8 = float(accuracy_score(y_test, y_pred_8))
    test_acc_8_4 = float(accuracy_score(y_test, y_pred_8_4))

    print(f"  • Model 1 [1 Layer (8)]   -> Test Accuracy: {test_acc_8*100:.2f}%, Converged in {mlp8_model.n_iter_} epochs, Loss: {mlp8_model.loss_:.4f}")
    print(f"  • Model 2 [2 Layers (8,4)] -> Test Accuracy: {test_acc_8_4*100:.2f}%, Converged in {mlp8_4_model.n_iter_} epochs, Loss: {mlp8_4_model.loss_:.4f}")

    # Build Comparison DataFrame
    cv_comparison_df = pd.DataFrame([
        {
            'Model Architecture': 'MLP (1 Hidden Layer: 8 Neurons)',
            'Hidden Layer Structure': '(8,)',
            'Total Trainable Parameters': params_8,
            'Mean CV Accuracy (%)': round(mean_cv_8 * 100, 2),
            'CV Std Dev (%)': round(std_cv_8 * 100, 2),
            'Test Accuracy (%)': round(test_acc_8 * 100, 2),
            'Epochs to Converge': mlp8_model.n_iter_,
            'Final Loss': round(float(mlp8_model.loss_), 4),
            'Fit Time (ms)': round(t_fit_8, 2)
        },
        {
            'Model Architecture': 'MLP (2 Hidden Layers: 8, 4 Neurons)',
            'Hidden Layer Structure': '(8, 4)',
            'Total Trainable Parameters': params_8_4,
            'Mean CV Accuracy (%)': round(mean_cv_8_4 * 100, 2),
            'CV Std Dev (%)': round(std_cv_8_4 * 100, 2),
            'Test Accuracy (%)': round(test_acc_8_4 * 100, 2),
            'Epochs to Converge': mlp8_4_model.n_iter_,
            'Final Loss': round(float(mlp8_4_model.loss_), 4),
            'Fit Time (ms)': round(t_fit_8_4, 2)
        }
    ])

    cv_csv_path = os.path.join(OUTPUT_DIR, "cv_comparison_results.csv")
    cv_comparison_df.to_csv(cv_csv_path, index=False)
    print("\n  • Summary Comparison Table:")
    print(cv_comparison_df.to_string(index=False))

    # ---------------------------------------------------------
    # Step 7: Model Selection & Final Evaluation
    # ---------------------------------------------------------
    # Selection based strictly on cross-validation results
    if mean_cv_8 > mean_cv_8_4:
        selected_name = "MLP (1 Hidden Layer: 8 Neurons)"
        selected_short = "MLP-8"
        selected_pipeline = mlp_8_pipeline
        selected_pred = y_pred_8
        selected_acc = test_acc_8
        selected_cv_acc = mean_cv_8
        selected_structure = "(8,)"
        rationale = f"Higher Mean Cross-Validation Accuracy ({mean_cv_8*100:.2f}% vs {mean_cv_8_4*100:.2f}%)"
    elif mean_cv_8_4 > mean_cv_8:
        selected_name = "MLP (2 Hidden Layers: 8, 4 Neurons)"
        selected_short = "MLP-(8,4)"
        selected_pipeline = mlp_8_4_pipeline
        selected_pred = y_pred_8_4
        selected_acc = test_acc_8_4
        selected_cv_acc = mean_cv_8_4
        selected_structure = "(8, 4)"
        rationale = f"Higher Mean Cross-Validation Accuracy ({mean_cv_8_4*100:.2f}% vs {mean_cv_8*100:.2f}%)"
    else:
        # Tie: compare std dev or simplicity
        if std_cv_8 <= std_cv_8_4:
            selected_name = "MLP (1 Hidden Layer: 8 Neurons)"
            selected_short = "MLP-8"
            selected_pipeline = mlp_8_pipeline
            selected_pred = y_pred_8
            selected_acc = test_acc_8
            selected_cv_acc = mean_cv_8
            selected_structure = "(8,)"
            rationale = f"Equal CV accuracy ({mean_cv_8*100:.2f}%), selected MLP-8 due to equal/lower variance and parsimony (67 params vs 91 params)"
        else:
            selected_name = "MLP (2 Hidden Layers: 8, 4 Neurons)"
            selected_short = "MLP-(8,4)"
            selected_pipeline = mlp_8_4_pipeline
            selected_pred = y_pred_8_4
            selected_acc = test_acc_8_4
            selected_cv_acc = mean_cv_8_4
            selected_structure = "(8, 4)"
            rationale = f"Equal CV accuracy ({mean_cv_8_4*100:.2f}%), selected MLP-(8,4) due to lower variance across folds"

    print(f"\n[Step 7] Selected Better Model Based on Cross-Validation: {selected_name}")
    print(f"  • Selection Rationale: {rationale}")

    # Confusion Matrix for Selected Model
    cm = confusion_matrix(y_test, selected_pred)
    cm_df = pd.DataFrame(cm, index=[f"Actual {c}" for c in target_names], columns=[f"Pred {c}" for c in target_names])
    cm_csv_path = os.path.join(OUTPUT_DIR, "confusion_matrix_data.csv")
    cm_df.to_csv(cm_csv_path)

    print(f"\n  • Confusion Matrix ({selected_name}):")
    print(cm_df)

    # Classification Report
    clf_report_str = classification_report(y_test, selected_pred, target_names=target_names, digits=4)
    print(f"\n  • Classification Report ({selected_name}):\n{clf_report_str}")

    report_out_path = os.path.join(OUTPUT_DIR, "test_evaluation_report.txt")
    with open(report_out_path, "w", encoding="utf-8") as f:
        f.write(f"QUESTION 5 TEST EVALUATION REPORT\n")
        f.write(f"Selected Model       : {selected_name}\n")
        f.write(f"Selection Rationale  : {rationale}\n")
        f.write(f"Cross-Val Accuracy   : {selected_cv_acc*100:.2f}%\n")
        f.write(f"Test Set Accuracy    : {selected_acc*100:.2f}%\n\n")
        f.write(f"Confusion Matrix:\n{cm_df.to_string()}\n\n")
        f.write(f"Classification Report:\n{clf_report_str}\n")

    # ---------------------------------------------------------
    # Step 8: Visualizations
    # ---------------------------------------------------------
    print("\n[Step 8] Generating Visualizations...")

    # Plot 1: CV Accuracy Comparison with Error Bars
    fig, ax = plt.subplots(figsize=(7.5, 4.5))
    architectures = ['1 Hidden Layer (8)', '2 Hidden Layers (8, 4)']
    means = [mean_cv_8 * 100, mean_cv_8_4 * 100]
    stds = [std_cv_8 * 100, std_cv_8_4 * 100]
    colors = ['#1F4E79', '#2E74B5']

    bars = ax.bar(architectures, means, yerr=stds, capsize=8, color=colors, width=0.45, edgecolor='black', alpha=0.9)
    ax.set_title('Question 5: 5-Fold Stratified Cross-Validation Accuracy (Iris Dataset)', fontweight='bold', pad=12)
    ax.set_ylabel('Mean Cross-Validation Accuracy (%)', fontweight='bold')
    ax.set_ylim(80, 103)

    for bar, m, s in zip(bars, means, stds):
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + s + 0.8, f"{m:.2f}% (±{s:.2f}%)", ha='center', va='bottom', fontweight='bold', fontsize=10)

    plt.tight_layout()
    plot1_path = os.path.join(PLOTS_DIR, "01_cv_accuracy_comparison.png")
    plt.savefig(plot1_path, dpi=300)
    plt.close()
    print(f"  • Saved Plot: {plot1_path}")

    # Plot 2: Confusion Matrix Heatmap
    fig, ax = plt.subplots(figsize=(6, 5))
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=target_names)
    disp.plot(cmap='Blues', ax=ax, colorbar=False, values_format='d')
    ax.set_title(f'Question 5: Confusion Matrix — {selected_short}\nTest Accuracy = {selected_acc*100:.2f}%', fontweight='bold', pad=12)
    ax.set_xlabel('Predicted Species', fontweight='bold')
    ax.set_ylabel('Actual True Species', fontweight='bold')
    plt.tight_layout()
    plot2_path = os.path.join(PLOTS_DIR, "02_confusion_matrix_selected_model.png")
    plt.savefig(plot2_path, dpi=300)
    plt.close()
    print(f"  • Saved Plot: {plot2_path}")

    # Plot 3: Training Loss Trajectories
    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.plot(mlp8_model.loss_curve_, color='#1F4E79', linewidth=2, label=f'MLP (8) [{len(mlp8_model.loss_curve_)} epochs, loss: {mlp8_model.loss_:.4f}]')
    ax.plot(mlp8_4_model.loss_curve_, color='#C00000', linestyle='--', linewidth=2, label=f'MLP (8, 4) [{len(mlp8_4_model.loss_curve_)} epochs, loss: {mlp8_4_model.loss_:.4f}]')
    ax.set_title('Question 5: Training Loss Convergence Curve (Adam Optimizer)', fontweight='bold', pad=12)
    ax.set_xlabel('Iteration / Epoch Number', fontweight='bold')
    ax.set_ylabel('Cross-Entropy Loss', fontweight='bold')
    ax.legend(loc='upper right', frameon=True)
    plt.tight_layout()
    plot3_path = os.path.join(PLOTS_DIR, "03_loss_curves_mlp.png")
    plt.savefig(plot3_path, dpi=300)
    plt.close()
    print(f"  • Saved Plot: {plot3_path}")

    print("\n" + "=" * 80)
    print(" QUESTION 5 EXECUTION COMPLETED SUCCESSFULLY WITH 0 ERRORS ")
    print("=" * 80)

if __name__ == "__main__":
    main()
