# Question 5: Iris Multi-Layer Perceptron (MLP) Classifier Comparison

## Objective
Develop, train, and compare two Multi-Layer Perceptron (MLP) neural network architectures (**1 Hidden Layer with 8 Neurons** vs. **2 Hidden Layers with 8 and 4 Neurons**) on the Iris dataset using 5-Fold Stratified Cross-Validation, select the superior model based on cross-validation performance, and assess its test performance using accuracy and a labeled confusion matrix.

---

## Execution Steps Flow (Viva Quick-Reference)
`Load Iris → Separate X & y → Train-Test Split → Feature Scaling → Model 1 (8) → Model 2 (8, 4) → Cross-Validation → Compare Accuracy → Select Better Model → Test Evaluation & Confusion Matrix`

| Execution Step | One-Line Explanation |
| :--- | :--- |
| **1. Load Dataset** | Loads Fisher's Iris dataset (`load_iris()`) with 150 instances, 4 morphological features, and 3 balanced flower classes. |
| **2. Separate X & y** | Separates the 4 input features (sepal/petal lengths and widths) from target species labels ($y \in \{0, 1, 2\}$). |
| **3. Stratified Split** | Stratified split into 80% train ($N=120$) and 20% test ($N=30$) preserving equal class ratios across sets. |
| **4. Feature Scaling** | Scales features using `StandardScaler` inside pipelines to optimize gradient descent weight updates. |
| **5. Model 1 (MLP-8)** | Constructs an MLP with 4 input nodes, 1 hidden layer of 8 ReLU neurons, and 3 softmax output nodes (67 parameters). |
| **6. Model 2 (MLP-8-4)** | Constructs an MLP with 4 input nodes, 2 hidden layers of 8 and 4 ReLU neurons, and 3 softmax output nodes (91 parameters). |
| **7. Cross-Validation** | Performs 5-Fold Stratified Cross-Validation on the training data to calculate mean generalization accuracy and variance. |
| **8. Compare Accuracy** | Contrasts mean CV accuracy, standard deviation, convergence epochs, and total trainable parameter count. |
| **9. Select Better Model** | Selects the 1-hidden-layer (8 neurons) model due to higher mean cross-validation accuracy ($95.83\%$ vs $95.00\%$) and architectural parsimony. |
| **10. Confusion Matrix** | Evaluates the selected model on the test split, computing test accuracy ($96.67\%$) and plotting a labeled confusion matrix. |

---

## Actual Experimental Results

### Architecture Comparison Table
| Architecture | Hidden Layer Structure | Total Trainable Parameters | Mean CV Accuracy | CV Std Dev | Test Accuracy | Epochs to Converge | Final Loss | Single Fit Time (ms) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **MLP (1 Layer: 8)** | **(8,)** | **67** | **95.83%** | **±2.64%** | **96.67%** | **291** | **0.0429** | **42.77 ms** |
| **MLP (2 Layers: 8, 4)** | (8, 4) | 91 | 95.00% | ±1.67% | 96.67% | 209 | 0.0366 | 38.18 ms |

### Test Confusion Matrix (Selected MLP-8 Model)
```text
                  Predicted    Predicted      Predicted
                   Setosa     Versicolor      Virginica     Recall
Actual Setosa        10            0              0         100.0%
Actual Versicolor     0            9              1          90.0%
Actual Virginica      0            0             10         100.0%
Precision          100.0%       100.0%          90.9%    Overall: 96.67%
```

---

## Analysis & Architectural Comparison
1. **Cross-Validation Performance & Model Selection:**
   - Model 1 (1 Hidden Layer: 8 Neurons) achieved a mean cross-validation accuracy of **95.83%** ($\sigma = \pm 2.64\%$).
   - Model 2 (2 Hidden Layers: 8, 4 Neurons) achieved a mean cross-validation accuracy of **95.00%** ($\sigma = \pm 1.67\%$).
   - **Selection:** Model 1 was selected as the superior classifier for this dataset based on higher cross-validation accuracy and Occam's Razor (architectural parsimony).
2. **Network Depth vs. Breadth Dynamics:**
   - **Shallow Network (8,):** Projects the 4-dimensional input space directly into an 8-dimensional non-linear feature space, which is sufficient for separating Iris classes.
   - **Deep Network (8, 4):** Introduces hierarchical feature extraction (4 $\rightarrow$ 8 $\rightarrow$ 4 $\rightarrow$ 3), converging faster in 209 epochs with a lower loss (0.0366), but slightly underperforming on CV generalization due to slight over-parameterization on a small dataset ($N=120$).
3. **Trainable Parameter Calculations:**
   - **Model 1:** $(4 \times 8 + 8) + (8 \times 3 + 3) = 40 + 27 = 67$ parameters.
   - **Model 2:** $(4 \times 8 + 8) + (8 \times 4 + 4) + (4 \times 3 + 3) = 40 + 36 + 15 = 91$ parameters.

---

## Self-Learning & Viva Concepts
- **Why MLP benefits from Feature Scaling:** Neural network backpropagation relies on gradient descent. Unscaled features create elongated, skewed error surfaces that lead to oscillating weight updates and slow convergence.
- **Why Stratified K-Fold CV is essential:** A single train/test split can be biased by random chance, especially with small sample sizes ($N=150$). Stratified K-Fold ensures balanced class representation in every fold, yielding a statistically reliable performance estimate.
- **Model Depth vs. Overfitting Risk:** Adding hidden layers increases model expressive capacity. While deeper architectures can model complex hierarchies, on small datasets with few features (like Iris), shallow networks often generalize better with fewer parameters.

---

## Generated Notebooks, Plots & Artifacts
- `question_5.ipynb`: Interactive, fully-executed Jupyter Notebook with inline visualizations and Markdown LaTeX theory.
- `question_5.py`: Companion pure Python script with CLI headless backend execution.
- `plots/01_cv_accuracy_comparison.png`: Bar chart comparing 5-fold CV accuracy with error bars.
- `plots/02_confusion_matrix_selected_model.png`: Heatmap confusion matrix for the selected model with labeled classes.
- `plots/03_loss_curves_mlp.png`: Epoch-by-epoch cross-entropy loss trajectories.
- `outputs/cv_comparison_results.csv`: Exported cross-validation results table.
- `outputs/confusion_matrix_data.csv`: Raw confusion matrix values.
- `outputs/test_evaluation_report.txt`: Complete text evaluation report with precision, recall, and F1-scores.
