# Lab Exercise 10: Learning the XOR Boolean Function Using an MLP

**Student:** Vishwas Vashishtha  
**Register No:** 2547255  
**Course:** Master of Computer Applications (MCA)  
**Subject:** Machine Learning / Deep Learning  
**Institution:** CHRIST (Deemed to be University), Bangalore  

---

## Overview
This repository contains the complete implementation, experimental evaluation, decision boundary visualizations, hyperparameter ablation studies, and academic report for **Lab Exercise 10: Learning the XOR Boolean Function Using an MLP**.

---

## Key Highlights & Implementations
1. **Mathematical Proof of Linear Inseparability:** Analytical derivation showing why single-layer perceptrons fail on the XOR truth table.
2. **Keras High-Level API:** $2 \to 4 \to 1$ MLP using `tf.keras.Sequential`, `Dense`, $\tanh$ hidden activation, $\text{sigmoid}$ output, and Adam optimization (100.0% accuracy, Loss: $0.000817$).
3. **TensorFlow Low-Level API:** Full manual implementation using explicit `tf.Variable` weight matrices, manual forward pass, explicit Binary Cross-Entropy loss, and `tf.GradientTape` automatic differentiation (100.0% accuracy, Loss: $0.000923$).
4. **PyTorch Implementation (Third Library):** Object-oriented `torch.nn.Module` with autograd backpropagation and Adam optimizer (100.0% accuracy, Loss: $0.001702$).
5. **Self-Learning Concept 1:** 4-panel 2D decision boundary contour visualization across architectures.
6. **Self-Learning Concept 2:** Systematic hyperparameter ablation across hidden neuron count ($1, 2, 4, 8$), activations ($\text{Linear}, \text{Sigmoid}, \text{ReLU}, \text{Tanh}$), and learning rates ($0.001 \to 2.0$).
7. **Comprehensive Viva Voce Guide:** Detailed answers to 25 foundational neural network questions.

---

## Directory Structure
```
Lab10/
├── Lab10_XOR_MLP_Keras_TensorFlow.ipynb  # Fully executed Jupyter Notebook with all outputs & plots
├── Lab10_Manual_Report.md                 # Academic lab manual report in Markdown
├── Lab10_Manual_Report.docx               # Academic lab manual report in Word DOCX format
├── run_lab10_experiments.py               # Standalone Python execution & verification script
├── build_lab10_notebook.py                # Notebook builder & headless execution script
├── README.md                              # Lab documentation
└── plots/
    ├── xor_decision_boundaries.png        # 2D decision boundary comparison plot
    ├── hyperparameter_ablation.png        # 3-panel hyperparameter sensitivity plot
    └── xor_training_curves.png            # Cross-framework loss and accuracy curves
```

---

## Master Results Summary
| Input $[x_1, x_2]$ | Ground Truth $y$ | Single Perceptron | Keras High-Level | TF Low-Level | PyTorch | Status |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **[0, 0]** | **0** | 0.5000 (Fail) | **0.0014** (Class 0) | **0.0001** (Class 0) | **0.0000** (Class 0) | **VERIFIED** |
| **[0, 1]** | **1** | 0.5000 (Pass) | **0.9999** (Class 1) | **0.9983** (Class 1) | **0.9982** (Class 1) | **VERIFIED** |
| **[1, 0]** | **1** | 0.5000 (Pass) | **0.9986** (Class 1) | **0.9996** (Class 1) | **0.9982** (Class 1) | **VERIFIED** |
| **[1, 1]** | **0** | 0.5000 (Fail) | **0.0004** (Class 0) | **0.0016** (Class 0) | **0.0031** (Class 0) | **VERIFIED** |

---

## Execution Instructions
To re-run the entire experiment pipeline and regenerate all figures:
```bash
python run_lab10_experiments.py
```
To rebuild and execute the Jupyter notebook:
```bash
python build_lab10_notebook.py
```
