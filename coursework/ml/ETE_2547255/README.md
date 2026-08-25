# 🎓 Machine Learning Practical Examination (ETE) — 2547255

**Student Name:** Vishwas Vashishtha  
**Register Number:** 2547255  
**Course:** MCA Machine Learning (MCA521) — Semester II  
**Examination Slot:** End Term Practical Examination  

---

## 📁 Repository Structure

```text
ETE_2547255/
│
├── Question_4_i_Diabetes_PCA_SVR/
│   ├── question_4_i.ipynb               # [Primary] Interactive Executed Jupyter Notebook
│   ├── question_4_i.py                  # Companion Python Script
│   ├── README.md                        # Question 4 Technical Documentation & Viva Notes
│   ├── plots/                           # High-Resolution (300 DPI) Visualizations
│   │   ├── 01_pca_explained_variance.png
│   │   ├── 02_actual_vs_predicted_svr.png
│   │   ├── 03_model_comparison_metrics.png
│   │   └── 04_pca_feature_loadings.png
│   └── outputs/                         # Exported CSV Results & Summary
│       ├── pca_variance_summary.csv
│       ├── q4_metrics_comparison.csv
│       └── q4_execution_summary.txt
│
├── Question_5_Iris_MLP/
│   ├── question_5.ipynb                 # [Primary] Interactive Executed Jupyter Notebook
│   ├── question_5.py                    # Companion Python Script
│   ├── README.md                        # Question 5 Technical Documentation & Viva Notes
│   ├── plots/                           # High-Resolution (300 DPI) Visualizations
│   │   ├── 01_cv_accuracy_comparison.png
│   │   ├── 02_confusion_matrix_selected_model.png
│   │   └── 03_loss_curves_mlp.png
│   └── outputs/                         # Exported CSV Results & Summary
│       ├── cv_comparison_results.csv
│       ├── confusion_matrix_data.csv
│       └── test_evaluation_report.txt
│
├── Lab_Questions_4_5_Report_Updated.docx # Master Academic Examination Word Document
├── generate_report.py                   # Automated Word Report Generator
└── README.md                            # Master Submission Overview
```

---

## 📊 Summary of Implemented Solutions

### 1. Question 4(i): Diabetes Disease Progression Prediction (PCA + SVR)
- **Objective:** Predict 1-year disease progression by combining Principal Component Analysis with Support Vector Regression on Scikit-learn's Diabetes dataset.
- **Pipeline:** `StandardScaler` $\rightarrow$ `PCA(n_components=6)` $\rightarrow$ `SVR(kernel='rbf')`.
- **Key Findings:** 6 components retain **89.61% of total variance** while reducing feature dimensions by 40% ($10 \rightarrow 6$). Inference latency reduced by ~45% (2.81 ms $\rightarrow$ 1.52 ms) with negligible change in goodness-of-fit ($R^2 = 0.4854 \rightarrow 0.4738$).

### 2. Question 5: Iris Multi-Layer Perceptron (MLP) Classifier Comparison
- **Objective:** Develop, train, and compare two MLP architectures (**1 Hidden Layer: 8 Neurons** vs. **2 Hidden Layers: 8 and 4 Neurons**) on Fisher's Iris dataset using 5-Fold Stratified Cross-Validation.
- **Trainable Parameters:**
  - Model 1 [1 Layer (8)]: $(4 \times 8 + 8) + (8 \times 3 + 3) = \mathbf{67\text{ parameters}}$.
  - Model 2 [2 Layers (8, 4)]: $(4 \times 8 + 8) + (8 \times 4 + 4) + (4 \times 3 + 3) = \mathbf{91\text{ parameters}}$.
- **Key Findings:** Model 1 achieved higher cross-validation accuracy (**95.83%** vs. 95.00%) and was selected as superior under Occam's razor (avoiding over-parameterization on small tabular datasets). Both models achieved **96.67% test accuracy** (29/30 correct).
