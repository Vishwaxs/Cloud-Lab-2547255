# Lab 3 Viva Notes

## What is Regression?

Regression is a statistical method used to model the relationship between a dependent variable (target) and one or more independent variables (predictors). It helps us understand how changes in predictors affect the target and allows us to make predictions. Simple linear regression models this relationship using a straight line (y = mx + b).

## What is Simple Linear Regression?

Simple Linear Regression is a statistical method to model the relationship between a single independent variable (predictor) and a dependent variable (response) using a linear equation y = mx + b. Used when we want to predict or understand how changes in one variable affect another.

## What is OLS?

OLS (Ordinary Least Squares) is a method for estimating the parameters of a linear regression model. It works by minimizing the sum of squared vertical distances (residuals) between the observed data points and the predicted values from the regression line. "Squared" errors are used because they penalize larger errors more heavily and are mathematically convenient (differentiable for optimization).

## Why Squared Errors?

Squaring errors serves three purposes:
1. It makes all errors positive (no cancellation)
2. It penalizes larger errors more heavily (quadratic penalty)
3. It's mathematically convenient (differentiable, allowing gradient-based optimization)

## Difference Between Correlation and Regression

Correlation measures the strength and direction of a linear relationship (single number between -1 and 1). Regression provides a predictive model with an equation, allowing us to estimate values and understand the relationship's structure. Correlation tells us "if" variables are related; regression tells us "how" they are related and allows prediction.

## What is R²?

R² (R-squared) is the coefficient of determination. It represents the proportion of variance in the dependent variable that is predictable from the independent variable. An R² of 0.30 means 30% of the variance in GPA can be explained by CIA. R² ranges from 0 to 1, with higher values indicating better model fit. However, R² alone doesn't indicate if the model is appropriate—residual analysis and domain knowledge are also important.

## Why Train-Test Split?

Train-test split is essential because:
- Evaluating on training data gives optimistic, biased performance estimates
- We need to measure generalization to unseen data
- It simulates real-world deployment scenarios
- Helps detect overfitting (model memorizing training data)
- Provides unbiased estimate of model performance

## Why Residual Analysis?

Residual Analysis examines residuals (actual - predicted) to help validate regression assumptions. Randomly distributed residuals suggest good model fit; patterns indicate violated assumptions or missing variables.

## Why Save Parameters?

Model persistence is critical for production deployment:
- Models are trained offline (computationally expensive)
- Saved parameters allow instant loading for real-time predictions
- Enables version control and A/B testing
- Facilitates deployment across multiple servers
- Required for regulatory compliance and model auditing

## Why CIA Performs Better Than Attendance?

CIA (Continuous Internal Assessment) reflects active learning, assignment completion, and cognitive engagement throughout the semester. Attendance merely measures physical presence, not mental engagement. Students can attend class without actively participating, but high CIA requires consistent effort and understanding. This explains why CIA had a higher R² and better predictive power for GPA.

## Common Faculty Questions

### What does the slope mean in this context?

In our CIA → GPA model, the slope represents the change in GPA for a 1% increase in CIA. For example, if slope = 0.02, then every 1% increase in CIA predicts a 0.02 increase in GPA. This quantifies the strength and direction of the relationship between CIA and academic performance.

### What does the intercept mean?

The intercept is the predicted GPA when the predictor is zero. In our context, it would be the predicted GPA if CIA were 0%. However, this is a theoretical value with no practical meaning (CIA cannot be 0% in reality). The intercept is mathematically necessary for the regression equation but may not have real-world interpretation.

### What are the regression assumptions?

Linear regression requires four key assumptions:
1. **Linearity**: The relationship between variables is linear
2. **Independence**: Observations are independent of each other
3. **Homoscedasticity**: Constant variance of residuals
4. **Normality**: Residuals are normally distributed

Violations of these assumptions can affect model validity.

### What is the difference between correlation and causation?

Correlation does not imply causation. Two variables may be correlated due to a third confounding variable. Regression models association, not causation. Controlled experiments are needed to establish causality.

### What is the bias-variance tradeoff?

Simple models have high bias (underfit) but low variance. Complex models have low bias but high variance (overfit). Linear regression sits in the middle—simple enough to avoid overfitting but flexible enough to capture linear relationships.
