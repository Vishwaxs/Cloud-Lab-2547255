# Question 4(i): Diabetes Disease Progression Pipeline (PCA + SVR)

## Objective
Develop and evaluate a machine learning pipeline for predicting diabetes disease progression by combining Principal Component Analysis (PCA) dimensionality reduction with Support Vector Regression (SVR), analyzing model accuracy, computational cost, and interpretability.

---

## Execution Steps Flow (Viva Quick-Reference)
`Load Dataset → Understand Data → Separate X & y → Train-Test Split → Feature Scaling → Baseline SVR → PCA Reduction → Reduced SVR → Predict & Evaluate → Compare Models`

| Execution Step | One-Line Explanation |
| :--- | :--- |
| **1. Load Dataset** | Imports the standard scikit-learn Diabetes dataset (`load_diabetes()`) containing 442 patients and 10 baseline physiological attributes. |
| **2. Understand Data** | Inspects input feature matrix ($442 \times 10$), continuous target progression values (range 25 to 346), and checks for missing values. |
| **3. Separate X & y** | Isolates the 10 physiological predictors into matrix $X$ and the target progression metric into vector $y$. |
| **4. Train-Test Split** | Partitions data into 80% training ($N=353$) and 20% test ($N=89$) using a fixed `random_state=42` to guarantee reproducibility. |
| **5. Feature Scaling** | Standardizes features to zero mean and unit variance ($\mu=0, \sigma=1$) using `StandardScaler` fitted strictly on training data. |
| **6. Baseline Model** | Fits an SVR on all 10 scaled features with 5-fold cross-validated hyperparameter tuning ($C, \epsilon, \gamma$). |
| **7. PCA Reduction** | Computes eigenvalues and explained variance ratios; selects $k=6$ principal components capturing $89.61\%$ total variance. |
| **8. Reduced Model** | Trains an integrated `Pipeline([Scaler, PCA(6), SVR])` on the compressed 6-dimensional subspace. |
| **9. Predict & Evaluate** | Evaluates both models on held-out test data computing MAE, MSE, RMSE, and $R^2$ goodness-of-fit metrics. |
| **10. Comprehensive Compare** | Compares predictive accuracy, training/inference runtimes, and physiological interpretability trade-offs. |

---

## Actual Experimental Results

### Summary Comparison Table
| Model Pipeline | Feature Space | MAE | MSE | RMSE | $R^2$ Score | Single Fit Time (ms) | Inference Time (ms) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Model A (Baseline SVR)** | 10 Original Features | **41.583** | **2726.217** | **52.213** | **0.4854** | 3.59 ms | 2.807 ms |
| **Model B (PCA + SVR)** | 6 Principal Components | 42.315 | 2788.023 | 52.802 | 0.4738 | 4.25 ms | **1.560 ms** |

---

## Analysis: Accuracy, Computational Cost & Interpretability

1. **Model Accuracy:**
   - Baseline SVR achieved an $R^2$ of **0.4854** and RMSE of **52.213**.
   - PCA-reduced SVR achieved an $R^2$ of **0.4738** and RMSE of **52.802**.
   - Reducing dimensionality from 10 to 6 components resulted in only a marginal $2.4\%$ reduction in $R^2$, proving that PCA captured the dominant disease progression variance.

2. **Computational Cost:**
   - SVR kernel computations scale quadratically with sample count and linearly with input dimensionality: $\mathcal{O}(N^2 \cdot D)$.
   - Per-sample test inference time dropped from **2.807 ms** (Baseline) to **1.560 ms** (PCA-reduced), representing an inference speedup of **~44%**.

3. **Interpretability:**
   - **Baseline:** Each feature directly represents a clinical measurement (`bmi` = Body Mass Index, `bp` = Blood Pressure, `s1`–`s6` = Serum Lipids & Glucose). Clinicians can interpret the individual weights directly.
   - **PCA-Reduced:** Features are transformed into orthogonal linear combinations ($PC_j = \sum w_i X_i$). While component loadings explain mathematical contribution, direct physical domain interpretability is obscured.

---

## Self-Learning & Viva Concepts
- **Why PCA requires Feature Scaling:** PCA is sensitive to variance scales. Without standardization, high-variance features dominate the principal components regardless of information content.
- **Data Leakage Prevention:** `StandardScaler` and `PCA` must be fitted **only on the training split** and transformed on the test split.
- **SVR Hyperparameters:**
  - $C$: Regularization parameter balancing margin violation penalty against model flatness.
  - $\epsilon$: Defines the $\epsilon$-tube within which prediction errors incur zero loss.
  - $\gamma$: Defines the influence radius of individual support vectors in the RBF kernel.

---

## Generated Notebooks, Plots & Artifacts
- `question_4_i.ipynb`: Interactive, fully-executed Jupyter Notebook with inline visualizations and Markdown LaTeX theory.
- `question_4_i.py`: Companion pure Python script with CLI headless backend execution.
- `plots/01_pca_explained_variance.png`: Scree and cumulative explained variance curve.
- `plots/02_actual_vs_predicted_svr.png`: Actual vs. Predicted scatter plot with ideal fit line.
- `plots/03_model_comparison_metrics.png`: Bar charts comparing $R^2$, MAE, and RMSE.
- `plots/04_pca_feature_loadings.png`: Heatmap displaying original feature contributions to principal components.
- `outputs/q4_metrics_comparison.csv`: Exported metrics table.
- `outputs/pca_variance_summary.csv`: Individual & cumulative variance ratios.
