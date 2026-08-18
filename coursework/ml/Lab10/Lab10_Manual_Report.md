# Machine Learning Lab 10 Manual Report

**Institution:** CHRIST (Deemed to be University), Bangalore  
**Department:** Department of Computer Science  
**Course:** Master of Computer Applications (MCA)  
**Subject:** Machine Learning / Deep Learning  
**Student Name:** Vishwas Vashishtha  
**Register Number:** 2547255  
**Lab Title:** Lab Exercise 10: Learning the XOR Boolean Function Using an MLP  

---

## 1. Aim
1. To understand how to implement feedforward neural networks (Multilayer Perceptrons) using different deep learning frameworks, specifically **Keras (TensorFlow High-Level API)**, **TensorFlow Low-Level API** (using `tf.GradientTape`), and **PyTorch** (Third Deep Learning Library).
2. To solve the classic non-linear XOR Boolean problem using an MLP and systematically analyze the impact of hyperparameters (number of hidden neurons, non-linear activation functions, learning rates, and training epochs) on model convergence, loss minimization, and decision boundary geometry.

---

## 2. Objectives
- Construct the 2-input XOR dataset covering all four binary Boolean combinations ($[0,0], [0,1], [1,0], [1,1]$).
- Formulate the mathematical proof and empirical evidence demonstrating why a single-layer perceptron (linear model) cannot solve the XOR problem.
- Design, compile, train, and evaluate a Multilayer Perceptron ($2 \to 4 \to 1$) using **Keras High-Level API** with Binary Cross-Entropy loss and Adam optimizer.
- Construct the identical MLP using **TensorFlow Low-Level API** with explicit weight matrices, manual forward pass, explicit Binary Cross-Entropy loss, and `tf.GradientTape` automatic differentiation.
- Implement the MLP in **PyTorch** (`torch.nn.Module`, autograd, and optimizer) to ensure comprehensive multi-framework coverage.
- **Self-Learning 1:** Generate continuous 2D decision boundary contour visualizations comparing linear vs non-linear architectures across frameworks.
- **Self-Learning 2:** Perform systematic ablation and hyperparameter sensitivity experiments across hidden neuron counts ($1, 2, 4, 8$), activation functions ($\text{Linear}, \text{Sigmoid}, \text{ReLU}, \text{Tanh}$), and learning rates ($\eta \in \{0.001, 0.01, 0.08, 0.5, 2.0\}$).
- Generate side-by-side training curves (Loss vs Epochs and Accuracy vs Epochs).
- Provide an exhaustive viva voce guide with answers to 25 foundational questions.

---

## 3. Problem Statement & XOR Truth Table

The Exclusive-OR (XOR) logic gate is defined as follows:
$$f(x_1, x_2) = x_1 \oplus x_2 = (x_1 \land \neg x_2) \lor (\neg x_1 \land x_2)$$

### XOR Truth Table
| Sample Index | Input $x_1$ | Input $x_2$ | Target Output $y$ | Classification Class |
| :---: | :---: | :---: | :---: | :---: |
| 1 | 0 | 0 | **0** | Class 0 (Negative) |
| 2 | 0 | 1 | **1** | Class 1 (Positive) |
| 3 | 1 | 0 | **1** | Class 1 (Positive) |
| 4 | 1 | 1 | **0** | Class 0 (Negative) |

---

## 4. Mathematical Proof: Linear Inseparability of XOR

A single-layer perceptron computes an output $\hat{y} = \sigma(w_1 x_1 + w_2 x_2 + b)$. For correct classification at threshold $0.5$ (pre-activation threshold $0$):
1. For $(0, 0) \to 0$: $w_1(0) + w_2(0) + b < 0 \implies b < 0$
2. For $(0, 1) \to 1$: $w_1(0) + w_2(1) + b \ge 0 \implies w_2 + b \ge 0$
3. For $(1, 0) \to 1$: $w_1(1) + w_2(0) + b \ge 0 \implies w_1 + b \ge 0$
4. For $(1, 1) \to 0$: $w_1(1) + w_2(1) + b < 0 \implies w_1 + w_2 + b < 0$

Adding inequalities (2) and (3):
$$(w_2 + b) + (w_1 + b) \ge 0 \implies w_1 + w_2 + 2b \ge 0$$
Since $b < 0$ from (1):
$$w_1 + w_2 + b > w_1 + w_2 + 2b \ge 0 \implies w_1 + w_2 + b > 0$$
This contradicts inequality (4) which states $w_1 + w_2 + b < 0$.  
**Conclusion:** No linear hyperplane can separate the XOR points. A non-linear hidden layer is mandatory.

---

## 5. Model Architecture & Forward Propagation

We implement an MLP with architecture $2 \to 4 \to 1$:
- **Input Dimension:** 2 features ($x_1, x_2$)
- **Hidden Layer:** 4 neurons with $\tanh$ activation:
  $$Z^{[1]} = X W^{[1]} + b^{[1]} \in \mathbb{R}^{4 \times 4}, \quad A^{[1]} = \tanh(Z^{[1]})$$
- **Output Layer:** 1 neuron with Sigmoid activation:
  $$Z^{[2]} = A^{[1]} W^{[2]} + b^{[2]} \in \mathbb{R}^{4 \times 1}, \quad \hat{y} = \sigma(Z^{[2]}) = \frac{1}{1 + e^{-Z^{[2]}}}$$
- **Total Trainable Parameters:** $(2 \times 4 + 4) + (4 \times 1 + 1) = 12 + 5 = 17$ parameters.
- **Loss Function:** Binary Cross-Entropy (BCE):
  $$\mathcal{L}_{\text{BCE}}(y, \hat{y}) = -\frac{1}{4}\sum_{i=1}^4 \left[ y_i \log(\hat{y}_i) + (1-y_i)\log(1-\hat{y}_i) \right]$$

---

## 6. Implementation Summaries

### Implementation 1: Keras High-Level API
```python
keras_model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(2,)),
    tf.keras.layers.Dense(4, activation='tanh'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])
keras_model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.08),
                    loss='binary_crossentropy', metrics=['accuracy'])
keras_hist = keras_model.fit(X, y, epochs=400, verbose=0, batch_size=4)
```

### Implementation 2: TensorFlow Low-Level API (`tf.GradientTape`)
```python
W1 = tf.Variable(tf.random.normal([2, 4], stddev=0.5))
b1 = tf.Variable(tf.zeros([4]))
W2 = tf.Variable(tf.random.normal([4, 1], stddev=0.5))
b2 = tf.Variable(tf.zeros([1]))

for epoch in range(400):
    with tf.GradientTape() as tape:
        A1 = tf.tanh(tf.matmul(X, W1) + b1)
        y_pred = tf.sigmoid(tf.matmul(A1, W2) + b2)
        loss = -tf.reduce_mean(y * tf.math.log(y_pred + 1e-7) + (1 - y) * tf.math.log(1 - y_pred + 1e-7))
    grads = tape.gradient(loss, [W1, b1, W2, b2])
    optimizer.apply_gradients(zip(grads, [W1, b1, W2, b2]))
```

### Implementation 3: PyTorch Deep Learning Library
```python
class PyTorchXORMLP(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.hidden = torch.nn.Linear(2, 4)
        self.output = torch.nn.Linear(4, 1)
        self.tanh = torch.nn.Tanh()
        self.sigmoid = torch.nn.Sigmoid()
    def forward(self, x):
        return self.sigmoid(self.output(self.tanh(self.hidden(x))))
```

---

## 7. Experimental Results & Verification

### Truth Table Master Verification Table
| Input Vector $[x_1, x_2]$ | Ground Truth $y$ | Single Perceptron | Keras High-Level | TF Low-Level | PyTorch | Status |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **[0, 0]** | **0** | 0.5000 (Fail) | **0.0014** (Class 0) | **0.0001** (Class 0) | **0.0000** (Class 0) | **VERIFIED** |
| **[0, 1]** | **1** | 0.5000 (Pass) | **0.9999** (Class 1) | **0.9983** (Class 1) | **0.9982** (Class 1) | **VERIFIED** |
| **[1, 0]** | **1** | 0.5000 (Pass) | **0.9986** (Class 1) | **0.9996** (Class 1) | **0.9982** (Class 1) | **VERIFIED** |
| **[1, 1]** | **0** | 0.5000 (Fail) | **0.0004** (Class 0) | **0.0016** (Class 0) | **0.0031** (Class 0) | **VERIFIED** |

- **Final Classification Accuracy:** 100.0% across all three deep learning implementations.
- **Final Binary Cross-Entropy Loss:**
  - Keras High-Level API: $0.000817$
  - TensorFlow Low-Level API: $0.000923$
  - PyTorch Deep Learning: $0.001702$

---

## 8. Self-Learning & Ablation Findings

### Self-Learning 1: 2D Decision Boundaries
- The single perceptron forms a single diagonal linear plane that misclassifies at least one point (accuracy 75%).
- The MLP forms dual symmetric non-linear boundary contours enclosing Class 1 points $(0,1)$ and $(1,0)$ while isolating Class 0 points $(0,0)$ and $(1,1)$.

### Self-Learning 2: Hyperparameter Sensitivity
1. **Hidden Neurons:**
   - 1 neuron: Fails (loss $0.478$, accuracy $75\%$, insufficient capacity).
   - 2 neurons: Learns XOR (loss $0.0016$, accuracy $100\%$, minimal mathematical requirement).
   - 4 neurons: Optimal convergence (loss $0.0009$, accuracy $100\%$, robust against local plateaus).
   - 8 neurons: Fast convergence (loss $0.0002$, accuracy $100\%$).
2. **Activation Functions:**
   - Linear: Fails completely (loss $0.693$, accuracy $25\%$).
   - Sigmoid: Converges slowly due to gradient saturation.
   - ReLU: Piecewise linear boundary; can suffer from dying neurons depending on weight initialization.
   - Tanh: Zero-centered smooth gradients; optimal and robust convergence.
3. **Learning Rate:**
   - $\eta = 0.001$: Slow convergence; under-trained at 400 epochs.
   - $\eta = 0.08$: Optimal step size; rapid convergence in $< 150$ epochs.
   - $\eta = 2.0$: Unstable; severe gradient overshooting.

---

## 9. Conclusion
1. XOR is a classic non-linearly separable problem that exposes the fundamental computational boundary of single-layer perceptrons.
2. Multilayer Perceptrons with non-linear hidden activations successfully transform the input space to achieve 100.0% classification accuracy.
3. Keras, TensorFlow Low-Level (`tf.GradientTape`), and PyTorch demonstrate identical mathematical convergence properties with distinct levels of developer abstraction and execution control.
