"""
Generate Professional Academic DOCX Report for Questions 4(i) and 5
Course: Machine Learning Practical (MCA521)
Author: Vishwas Vashishtha (Reg No: 2547255)
"""

import os
import pandas as pd
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
Q4_DIR = os.path.join(BASE_DIR, "Question_4_i_Diabetes_PCA_SVR")
Q5_DIR = os.path.join(BASE_DIR, "Question_5_Iris_MLP")
OUTPUT_DOCX = os.path.join(BASE_DIR, "Lab_Questions_4_5_Report.docx")

# Color Palette: Academic Executive Navy / Slate / Charcoal
COLOR_PRIMARY = RGBColor(0x1F, 0x38, 0x64)    # Deep Navy (#1F3864)
COLOR_SECONDARY = RGBColor(0x2E, 0x74, 0xB5)  # Slate Blue (#2E74B5)
COLOR_INK = RGBColor(0x14, 0x14, 0x14)        # Heading Dark (#141414)
COLOR_BODY = RGBColor(0x28, 0x28, 0x28)       # Charcoal Body Text (#282828)
COLOR_MUTED = RGBColor(0x55, 0x55, 0x55)      # Captions & Notes (#555555)
COLOR_MONO = RGBColor(0x1A, 0x3C, 0x1A)       # Code snippet (#1A3C1A)

HEX_HEADER_BG = "1F3864"
HEX_ROW_ALT = "F2F4F7"
HEX_BORDER = "CCCCCC"
HEX_CALLOUT_BG = "F7F9FB"
HEX_CALLOUT_BORDER = "2E74B5"

def set_cell_shading(cell, color_hex):
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shd)

def set_cell_borders(cell, top="single", bottom="single", left="none", right="none", color=HEX_BORDER):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>\n'
        f'  <w:top w:val="{top}" w:sz="4" w:space="0" w:color="{color}"/>\n'
        f'  <w:left w:val="{left}" w:sz="4" w:space="0" w:color="{color}"/>\n'
        f'  <w:bottom w:val="{bottom}" w:sz="4" w:space="0" w:color="{color}"/>\n'
        f'  <w:right w:val="{right}" w:sz="4" w:space="0" w:color="{color}"/>\n'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)

def set_cell_margins(cell, top=80, bottom=80, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>\n'
        f'  <w:top w:w="{top}" w:type="dxa"/>\n'
        f'  <w:left w:w="{left}" w:type="dxa"/>\n'
        f'  <w:bottom w:w="{bottom}" w:type="dxa"/>\n'
        f'  <w:right w:w="{right}" w:type="dxa"/>\n'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def build_report():
    doc = Document()

    # 1-inch margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # -------------------------------------------------------------
    # Formatting Helpers
    # -------------------------------------------------------------
    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = COLOR_SECONDARY
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(11.5)
        run.font.bold = True
        run.font.color.rgb = COLOR_INK
        return p

    def add_p(text, bold_prefix=None, space_after=5):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.name = 'Calibri'
            r_pre.font.size = Pt(10.5)
            r_pre.font.bold = True
            r_pre.font.color.rgb = COLOR_INK
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(10.5)
        run.font.color.rgb = COLOR_BODY
        return p

    def add_bullet(prefix, text):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if prefix:
            r_pre = p.add_run(prefix)
            r_pre.font.name = 'Calibri'
            r_pre.font.size = Pt(10.5)
            r_pre.font.bold = True
            r_pre.font.color.rgb = COLOR_INK
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(10.5)
        run.font.color.rgb = COLOR_BODY
        return p

    def add_callout(title, text):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.5)
        set_cell_shading(cell, HEX_CALLOUT_BG)
        set_cell_borders(cell, top="none", bottom="none", left="single", right="none", color=HEX_CALLOUT_BORDER)
        set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        r_title = p.add_run(f"KEY VIVA TAKEAWAY: {title}\n")
        r_title.font.name = 'Calibri'
        r_title.font.size = Pt(10.5)
        r_title.font.bold = True
        r_title.font.color.rgb = COLOR_PRIMARY
        r_body = p.add_run(text)
        r_body.font.name = 'Calibri'
        r_body.font.size = Pt(10)
        r_body.font.color.rgb = COLOR_BODY
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    def add_code_block(code_text):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.5)
        set_cell_shading(cell, "F4F5F7")
        set_cell_borders(cell, top="single", bottom="single", left="single", right="single", color="D0D5DD")
        set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(code_text.strip())
        run.font.name = 'Consolas'
        run.font.size = Pt(8.5)
        run.font.color.rgb = COLOR_MONO
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    def add_image_evidence(img_path, caption_text, width=Inches(5.8)):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        if os.path.exists(img_path):
            p.add_run().add_picture(img_path, width=width)
        else:
            r = p.add_run(f"[ Image: {os.path.basename(img_path)} ]")
            r.font.color.rgb = COLOR_MUTED
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(2)
        p_cap.paragraph_format.space_after = Pt(8)
        r_cap = p_cap.add_run(caption_text)
        r_cap.font.name = 'Calibri'
        r_cap.font.size = Pt(9.5)
        r_cap.font.italic = True
        r_cap.font.color.rgb = COLOR_MUTED

    def add_styled_table(headers, rows, col_widths=None, align_right_cols=None):
        table = doc.add_table(rows=len(rows) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False

        hdr_cells = table.rows[0].cells
        for idx, h_text in enumerate(headers):
            cell = hdr_cells[idx]
            if col_widths and idx < len(col_widths):
                cell.width = col_widths[idx]
            set_cell_shading(cell, HEX_HEADER_BG)
            set_cell_borders(cell)
            set_cell_margins(cell, top=60, bottom=60, left=100, right=100)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.RIGHT if (align_right_cols and idx in align_right_cols) else WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(h_text)
            run.font.name = 'Calibri'
            run.font.size = Pt(9.5)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

        for row_idx, r_data in enumerate(rows):
            row_cells = table.rows[row_idx + 1].cells
            bg_color = HEX_ROW_ALT if row_idx % 2 == 1 else "FFFFFF"
            for col_idx, val in enumerate(r_data):
                cell = row_cells[col_idx]
                if col_widths and col_idx < len(col_widths):
                    cell.width = col_widths[col_idx]
                set_cell_shading(cell, bg_color)
                set_cell_borders(cell)
                set_cell_margins(cell, top=50, bottom=50, left=100, right=100)
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.RIGHT if (align_right_cols and col_idx in align_right_cols) else WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                run = p.add_run(str(val))
                run.font.name = 'Calibri'
                run.font.size = Pt(9)
                run.font.color.rgb = COLOR_BODY

        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # -------------------------------------------------------------
    # COVER / HEADER
    # -------------------------------------------------------------
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(24)
    p_inst.paragraph_format.space_after = Pt(2)
    r_inst = p_inst.add_run("CHRIST (DEEMED TO BE UNIVERSITY)")
    r_inst.font.name = 'Calibri'
    r_inst.font.size = Pt(16)
    r_inst.font.bold = True
    r_inst.font.color.rgb = COLOR_PRIMARY

    p_dept = doc.add_paragraph()
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_before = Pt(0)
    p_dept.paragraph_format.space_after = Pt(18)
    r_dept = p_dept.add_run("Department of Computer Science | School of Sciences\nMaster of Computer Applications (MCA) — Machine Learning Practical (MCA521)\nPractical Examination & Laboratory Submission")
    r_dept.font.name = 'Calibri'
    r_dept.font.size = Pt(11)
    r_dept.font.color.rgb = COLOR_SECONDARY

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(10)
    p_title.paragraph_format.space_after = Pt(6)
    r_title = p_title.add_run("MACHINE LEARNING PRACTICAL REPORT")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(14)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_MUTED

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(20)
    r_sub = p_sub.add_run("Part B Practical Implementation:\nQuestion 4(i) (Diabetes PCA + SVR) & Question 5 (Iris MLP Architecture Comparison)")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(15)
    r_sub.font.bold = True
    r_sub.font.color.rgb = COLOR_PRIMARY

    # Metadata Block
    tbl_meta = doc.add_table(rows=4, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_info = [
        ("Student Name:", "Vishwas Vashishtha"),
        ("Register Number:", "2547255"),
        ("Course / Program:", "MCA (Semester II) — Machine Learning (MCA521)"),
        ("Date of Execution:", "August 2026")
    ]
    for idx, (label, val) in enumerate(meta_info):
        c0, c1 = tbl_meta.rows[idx].cells
        c0.width = Inches(2.2)
        c1.width = Inches(4.3)
        set_cell_shading(c0, "F2F4F7")
        set_cell_shading(c1, "FFFFFF")
        set_cell_borders(c0)
        set_cell_borders(c1)
        set_cell_margins(c0, 40, 40, 80, 80)
        set_cell_margins(c1, 40, 40, 80, 80)
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(0)
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(label)
        r0.font.bold = True
        r0.font.size = Pt(10)
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(val)
        r1.font.size = Pt(10)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # ═════════════════════════════════════════════════════════════
    # PART 1: QUESTION 4(i)
    # ═════════════════════════════════════════════════════════════
    add_h1("PART 1: QUESTION 4(i) — DIABETES DISEASE PROGRESSION PREDICTION")
    
    add_h2("1.1 Aim")
    add_p(
        "To develop and evaluate a machine-learning pipeline for predicting diabetes disease progression by combining Principal Component Analysis (PCA) dimensionality reduction with Support Vector Regression (SVR), and to rigorously analyze the effects of dimensionality reduction on model accuracy, computational cost, and clinical interpretability."
    )

    add_h2("1.2 Dataset Description")
    add_p(
        "The standard scikit-learn Diabetes dataset (load_diabetes()) consists of 442 patient records with 10 baseline clinical predictors: age, sex, body mass index (bmi), average blood pressure (bp), and six blood serum measurements (s1: total cholesterol, s2: LDL, s3: HDL, s4: total cholesterol/HDL, s5: serum triglycerides log, s6: blood glucose). The target variable is a continuous quantitative measure of diabetes disease progression recorded one year after baseline (range: 25.0 to 346.0, mean: 152.13, std: 77.09)."
    )

    add_h2("1.3 Execution Steps Flow & Viva Quick-Reference")
    add_p(
        "Execution Flow: Load → Separate → Split → Scale → Baseline → PCA → Train → Predict → Evaluate → Compare",
        bold_prefix="Practical Pipeline: "
    )
    
    q4_steps_data = [
        ["1. Load Dataset", "Loads the 442-sample, 10-feature diabetes dataset via sklearn.datasets.load_diabetes()."],
        ["2. Separate X & y", "Isolates the 10 clinical predictor columns into matrix X and disease progression target into vector y."],
        ["3. Train-Test Split", "Splits data into 80% training (N=353) and 20% testing (N=89) with fixed random_state=42 for reproducibility."],
        ["4. Feature Scaling", "Standardizes features to zero mean and unit variance (StandardScaler) fitted strictly on training data."],
        ["5. Baseline SVR", "Trains an SVR on all 10 scaled features with 5-fold cross-validation hyperparameter tuning (C, epsilon, gamma)."],
        ["6. PCA Reduction", "Computes eigenvalues; selects k=6 principal components retaining 89.61% of total dataset variance."],
        ["7. Reduced Model", "Trains an integrated Scaler -> PCA(6) -> SVR pipeline on the compressed 6-dimensional subspace."],
        ["8. Predict & Evaluate", "Evaluates predictions on the held-out test set using MAE, MSE, RMSE, and R2 goodness-of-fit metrics."],
        ["9. Benchmark Time", "Records single-fit training time and per-sample test inference time using time.perf_counter()."],
        ["10. Comprehensive Compare", "Analyzes the trade-offs between predictive accuracy, computational runtime, and physical interpretability."]
    ]
    add_styled_table(["Execution Step", "One-Line Technical Explanation"], q4_steps_data, [Inches(2.0), Inches(4.5)])

    add_h2("1.4 Dimensionality Reduction Analysis (PCA)")
    add_p(
        "PCA reduces the input dimensionality by projecting correlated features onto orthogonal axes that maximize variance. Prior to fitting SVR, PCA was fitted on the standardized training data to determine the explained variance profile."
    )
    
    pca_df = pd.read_csv(os.path.join(Q4_DIR, "outputs", "pca_variance_summary.csv"))
    pca_rows = []
    for _, row in pca_df.iterrows():
        pca_rows.append([
            row['Principal Component'],
            f"{row['Eigenvalue']:.4f}",
            f"{row['Explained Variance Ratio']*100:.2f}%",
            f"{row['Cumulative Variance Ratio']*100:.2f}%"
        ])
    add_styled_table(
        ["Principal Component", "Eigenvalue", "Individual Variance", "Cumulative Variance"],
        pca_rows,
        [Inches(1.8), Inches(1.4), Inches(1.6), Inches(1.7)],
        align_right_cols=[1, 2, 3]
    )

    add_p(
        "Dimensionality Selection Decision: A cutoff of n_components = 6 was selected. As shown in the table above, the first 6 principal components capture 89.61% of the total cumulative variance while reducing the input feature space by 40% (from 10 features down to 6).",
        bold_prefix="Dimensionality Cutoff Justification: "
    )

    add_image_evidence(
        os.path.join(Q4_DIR, "plots", "01_pca_explained_variance.png"),
        "Figure 1: PCA Scree Plot and Cumulative Explained Variance Curve on Diabetes Dataset (n_components=6 Cutoff)"
    )

    add_h2("1.5 Complete Python Implementation")
    q4_code_snippet = """# Question 4(i): Diabetes Disease Progression Pipeline (PCA + SVR)
import time, numpy as np, pandas as pd
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split, GridSearchCV, KFold
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.svm import SVR
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# 1. Load Dataset & Train-Test Split
X, y = load_diabetes(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 2. Hyperparameter Tuning Grids (5-Fold CV on Training Set Only)
cv = KFold(n_splits=5, shuffle=True, random_state=42)
param_grid = {
    'svr__C': [1.0, 10.0, 50.0, 100.0, 200.0],
    'svr__gamma': ['scale', 'auto', 0.01, 0.05, 0.1],
    'svr__epsilon': [1.0, 5.0, 10.0, 15.0, 20.0],
    'svr__kernel': ['rbf', 'linear']
}

# 3. Model A: Baseline SVR (10 Features)
pipe_base = Pipeline([('scaler', StandardScaler()), ('svr', SVR())])
grid_base = GridSearchCV(pipe_base, param_grid, cv=cv, scoring='neg_root_mean_squared_error', n_jobs=1)
grid_base.fit(X_train, y_train)
y_pred_base = grid_base.best_estimator_.predict(X_test)

# 4. Model B: Reduced Model (PCA[6] + SVR)
pipe_red = Pipeline([('scaler', StandardScaler()), ('pca', PCA(n_components=6, random_state=42)), ('svr', SVR())])
grid_red = GridSearchCV(pipe_red, param_grid, cv=cv, scoring='neg_root_mean_squared_error', n_jobs=1)
grid_red.fit(X_train, y_train)
y_pred_red = grid_red.best_estimator_.predict(X_test)

# 5. Evaluate Metrics
print("Baseline SVR R2:", r2_score(y_test, y_pred_base), "RMSE:", np.sqrt(mean_squared_error(y_test, y_pred_base)))
print("PCA+SVR R2     :", r2_score(y_test, y_pred_red),  "RMSE:", np.sqrt(mean_squared_error(y_test, y_pred_red)))"""
    add_code_block(q4_code_snippet)

    add_h2("1.6 Actual Experimental Results & Comparison Table")
    add_p(
        "Both pipelines were tuned and evaluated on the identical 80/20 train/test split. All reported values represent authentic execution results."
    )
    
    q4_metrics_df = pd.read_csv(os.path.join(Q4_DIR, "outputs", "q4_metrics_comparison.csv"))
    q4_res_rows = []
    for _, row in q4_metrics_df.iterrows():
        q4_res_rows.append([
            str(row['Model Pipeline']),
            str(row['Input Dimension']),
            f"{row['MAE']:.3f}",
            f"{row['MSE']:.2f}",
            f"{row['RMSE']:.3f}",
            f"{row['R² Score']:.4f}",
            f"{row['Single Fit Time (ms)']:.2f} ms",
            f"{row['Inference Time (ms)']:.3f} ms"
        ])
    add_styled_table(
        ["Model Pipeline", "Feature Dimension", "MAE", "MSE", "RMSE", "R² Score", "Single Fit", "Inference"],
        q4_res_rows,
        [Inches(1.8), Inches(1.4), Inches(0.7), Inches(0.8), Inches(0.7), Inches(0.8), Inches(0.9), Inches(0.9)],
        align_right_cols=[2, 3, 4, 5, 6, 7]
    )

    add_image_evidence(
        os.path.join(Q4_DIR, "plots", "02_actual_vs_predicted_svr.png"),
        "Figure 2: Actual vs. Predicted Disease Progression Scatter Plots on Held-Out Test Set"
    )

    add_image_evidence(
        os.path.join(Q4_DIR, "plots", "03_model_comparison_metrics.png"),
        "Figure 3: Goodness-of-Fit (R²) and Error Metric (MAE, RMSE) Comparison between Baseline and PCA+SVR"
    )

    add_h2("1.7 In-Depth Analysis: Accuracy vs. Computational Cost vs. Interpretability")
    
    add_h3("A. Model Accuracy & Predictive Performance")
    add_p(
        "The baseline SVR model achieved an R² score of 0.4854 and an RMSE of 52.213 on the held-out test data. The PCA-reduced SVR pipeline achieved an R² score of 0.4738 and an RMSE of 52.802. Discarding 40% of the input dimensions resulted in only a minor 0.0116 drop in R² (a 2.4% relative change), demonstrating that the principal components retained the essential linear subspace containing disease progression variance."
    )

    add_h3("B. Computational Cost & Runtime Efficiency")
    add_p(
        "In Support Vector Regression, kernel evaluation computational complexity scales with the input dimensionality: O(N_sv * D) per sample, where N_sv is the number of support vectors and D is the feature dimension. By compressing the feature space from 10 to 6 dimensions, the per-sample test inference time dropped from 2.807 ms to 1.560 ms (an inference speedup of approximately 44%), making the reduced pipeline more efficient for high-throughput deployment."
    )

    add_h3("C. Clinical & Domain Interpretability")
    add_p(
        "In the baseline model, each feature corresponds to a specific biological parameter (such as BMI or serum cholesterol). Clinicians can inspect feature weights to understand individual physiological risk factors. Conversely, PCA transforms the original variables into orthogonal linear combinations (principal components), where each component is a weighted sum of multiple original features (as shown in Figure 4). Consequently, PCA reduces direct physical interpretability in exchange for dimensionality compression."
    )

    add_image_evidence(
        os.path.join(Q4_DIR, "plots", "04_pca_feature_loadings.png"),
        "Figure 4: PCA Component Loadings Heatmap Showing Original Feature Contributions to Principal Components"
    )

    add_h2("1.8 Meaningful Self-Learning & Key Concepts")
    add_bullet("1. Scale Sensitivity of PCA: ", "PCA computes eigenvectors of the covariance matrix. Unscaled features with large numerical ranges would artificially dominate the principal components regardless of their true variance or relevance.")
    add_bullet("2. Data Leakage Prevention: ", "StandardScaler and PCA must be fitted strictly on the training set and applied to the test set using a unified Pipeline. Fitting PCA across the entire dataset before splitting leaks test distribution information.")
    add_bullet("3. Role of SVR Hyperparameters: ", "C regulates the penalty for errors beyond the tolerance margin; epsilon controls the width of the insensitive loss tube; gamma determines the reach of individual support vectors in the RBF kernel.")
    add_bullet("4. Trade-off in Dimensionality Reduction: ", "Dimensionality reduction eliminates multicollinearity and speeds up matrix vector operations, but trades away direct feature interpretability.")

    add_callout(
        "DIMENSIONALITY REDUCTION IN REGRESSION",
        "PCA reduces input dimensions by projecting correlated features onto orthogonal axes of maximum variance. When features exhibit multicollinearity (such as the serum cholesterol lipid panel s1–s4 in the diabetes dataset), PCA compresses the feature space with minimal loss in predictive power while reducing computational overhead."
    )

    add_h2("1.9 Conclusion (Question 4(i))")
    add_p(
        "The experimental results confirm that Support Vector Regression performs effectively on the Diabetes dataset. The baseline SVR using all 10 features achieved the highest predictive fit (R² = 0.4854, RMSE = 52.213). Applying PCA to reduce the feature space to 6 principal components retained 89.61% of total variance and preserved near-identical accuracy (R² = 0.4738, RMSE = 52.802) while decreasing test inference latency by ~44%. While baseline features provide direct physiological interpretability, the PCA-reduced pipeline offers an optimal balance of compact representation, reduced computational cost, and robust regression performance."
    )

    # ═════════════════════════════════════════════════════════════
    # PART 2: QUESTION 5
    # ═════════════════════════════════════════════════════════════
    add_h1("PART 2: QUESTION 5 — IRIS MLP CLASSIFIER ARCHITECTURE COMPARISON")

    add_h2("2.1 Aim")
    add_p(
        "To develop, train, and compare two Multi-Layer Perceptron (MLP) neural network classifiers for the Iris dataset using one hidden layer with 8 neurons versus two hidden layers with 8 and 4 neurons, evaluate both architectures using 5-Fold Stratified Cross-Validation, select the superior model based on cross-validation performance, and assess its test performance using accuracy and a labeled confusion matrix."
    )

    add_h2("2.2 Dataset Description")
    add_p(
        "Fisher's Iris dataset (load_iris()) contains 150 instances of iris flowers distributed equally across 3 balanced classes (50 Setosa, 50 Versicolor, 50 Virginica). Each instance has 4 continuous morphological features: sepal length (cm), sepal width (cm), petal length (cm), and petal width (cm)."
    )

    add_h2("2.3 Execution Steps Flow & Viva Quick-Reference")
    add_p(
        "Execution Flow: Load → Split → Scale → Model 1 (8) → Model 2 (8, 4) → Cross-Validate → Compare → Select → Confusion Matrix",
        bold_prefix="Practical Pipeline: "
    )

    q5_steps_data = [
        ["1. Load Dataset", "Loads the 150-sample Iris dataset via sklearn.datasets.load_iris()."],
        ["2. Separate X & y", "Extracts 4 morphological feature columns into X and integer species labels (0, 1, 2) into y."],
        ["3. Stratified Split", "Partitions dataset into 80% train (N=120) and 20% test (N=30) preserving balanced class ratios."],
        ["4. Feature Scaling", "Applies StandardScaler within pipeline to ensure zero mean and unit variance for stable backpropagation."],
        ["5. Model 1 (MLP-8)", "Constructs an MLP with 4 input nodes, 1 hidden layer of 8 ReLU neurons, and 3 softmax output nodes (67 params)."],
        ["6. Model 2 (MLP-8-4)", "Constructs an MLP with 4 input nodes, 2 hidden layers of 8 and 4 ReLU neurons, and 3 softmax output nodes (91 params)."],
        ["7. Cross-Validation", "Executes 5-Fold Stratified K-Fold CV on training split to measure generalization accuracy and fold variance."],
        ["8. Architecture Compare", "Compares mean CV accuracy, standard deviation, convergence epochs, and total parameter counts."],
        ["9. Select Better Model", "Selects the 1-hidden-layer (8 neurons) model based on higher mean cross-validation accuracy (95.83% vs 95.00%) and parsimony."],
        ["10. Test Evaluation", "Evaluates selected model on test split, generating test accuracy (96.67%) and a labeled confusion matrix."]
    ]
    add_styled_table(["Execution Step", "One-Line Technical Explanation"], q5_steps_data, [Inches(2.0), Inches(4.5)])

    add_h2("2.4 Neural Network Architectures & Mathematical Complexity")
    add_p(
        "Both architectures utilize the ReLU activation function in the hidden layers and the Softmax cross-entropy objective with the Adam optimizer (learning_rate_init = 0.01):"
    )
    add_bullet("Model 1 [1 Hidden Layer (8)]: ", "Input Layer (4 nodes) → Hidden Layer 1 (8 ReLU neurons) → Output Layer (3 nodes). Total trainable parameters = (4 × 8 + 8) + (8 × 3 + 3) = 40 + 27 = 67 weights & biases.")
    add_bullet("Model 2 [2 Hidden Layers (8, 4)]: ", "Input Layer (4 nodes) → Hidden Layer 1 (8 ReLU neurons) → Hidden Layer 2 (4 ReLU neurons) → Output Layer (3 nodes). Total trainable parameters = (4 × 8 + 8) + (8 × 4 + 4) + (4 × 3 + 3) = 40 + 36 + 15 = 91 weights & biases.")

    add_h2("2.5 Complete Python Implementation")
    q5_code_snippet = """# Question 5: Multi-Layer Perceptron (MLP) Classifier Comparison (8 vs 8,4 Neurons)
import numpy as np, pandas as pd
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# 1. Load Dataset & Stratified Split
X, y = load_iris(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 2. Define Pipelines: 1 Hidden Layer (8) vs 2 Hidden Layers (8, 4)
pipe_8 = Pipeline([('scaler', StandardScaler()), ('mlp', MLPClassifier(hidden_layer_sizes=(8,), activation='relu', learning_rate_init=0.01, max_iter=1000, random_state=42))])
pipe_8_4 = Pipeline([('scaler', StandardScaler()), ('mlp', MLPClassifier(hidden_layer_sizes=(8, 4), activation='relu', learning_rate_init=0.01, max_iter=1000, random_state=42))])

# 3. 5-Fold Stratified Cross-Validation
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores_8 = cross_val_score(pipe_8, X_train, y_train, cv=cv, scoring='accuracy')
scores_8_4 = cross_val_score(pipe_8_4, X_train, y_train, cv=cv, scoring='accuracy')

print(f"MLP (8) Mean CV   : {scores_8.mean()*100:.2f}% (±{scores_8.std()*100:.2f}%)")
print(f"MLP (8,4) Mean CV : {scores_8_4.mean()*100:.2f}% (±{scores_8_4.std()*100:.2f}%)")

# 4. Train Selected Model (MLP-8) on Full Train Split & Evaluate Test Set
pipe_8.fit(X_train, y_train)
y_pred_8 = pipe_8.predict(X_test)
print("Test Accuracy:", accuracy_score(y_test, y_pred_8))
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred_8))
print("Classification Report:\n", classification_report(y_test, y_pred_8, target_names=load_iris().target_names))"""
    add_code_block(q5_code_snippet)

    add_h2("2.6 5-Fold Stratified Cross-Validation & Architecture Comparison")
    add_p(
        "5-Fold Stratified Cross-Validation was conducted on the 120 training samples. The results of the cross-validation and subsequent test set evaluation are summarized below:"
    )

    cv_df = pd.read_csv(os.path.join(Q5_DIR, "outputs", "cv_comparison_results.csv"))
    cv_rows = []
    for _, row in cv_df.iterrows():
        cv_rows.append([
            str(row['Model Architecture']),
            str(row['Hidden Layer Structure']),
            str(row['Total Trainable Parameters']),
            f"{row['Mean CV Accuracy (%)']:.2f}%",
            f"±{row['CV Std Dev (%)']:.2f}%",
            f"{row['Test Accuracy (%)']:.2f}%",
            str(row['Epochs to Converge']),
            f"{row['Final Loss']:.4f}",
            f"{row['Fit Time (ms)']:.2f} ms"
        ])
    add_styled_table(
        ["Architecture", "Structure", "Params", "Mean CV", "CV Std Dev", "Test Acc", "Epochs", "Final Loss", "Fit Time"],
        cv_rows,
        [Inches(1.8), Inches(0.7), Inches(0.6), Inches(0.8), Inches(0.8), Inches(0.7), Inches(0.6), Inches(0.7), Inches(0.8)],
        align_right_cols=[1, 2, 3, 4, 5, 6, 7, 8]
    )

    add_p(
        "Selected Better Model: MLP (1 Hidden Layer: 8 Neurons). Rationale: The 1-hidden-layer model achieved a higher mean cross-validation accuracy of 95.83% (compared to 95.00% for the 2-hidden-layer architecture). Furthermore, adhering to Occam's razor, the 1-layer architecture requires fewer trainable parameters (67 vs. 91) and exhibits lower risk of overfitting on this compact dataset.",
        bold_prefix="Model Selection Decision & Rationale: "
    )

    add_image_evidence(
        os.path.join(Q5_DIR, "plots", "01_cv_accuracy_comparison.png"),
        "Figure 5: 5-Fold Stratified Cross-Validation Accuracy Comparison with Standard Deviation Error Bars"
    )

    add_h2("2.7 Final Test Evaluation & Confusion Matrix")
    add_p(
        "The selected MLP-8 model was evaluated on the held-out test set (30 samples: 10 Setosa, 10 Versicolor, 10 Virginica), achieving an overall Test Accuracy of 96.67% (29 out of 30 correct predictions)."
    )

    cm_df = pd.read_csv(os.path.join(Q5_DIR, "outputs", "confusion_matrix_data.csv"), index_col=0)
    cm_rows = [
        ["Actual Setosa", "10", "0", "0", "100.0%"],
        ["Actual Versicolor", "0", "9", "1", "90.0%"],
        ["Actual Virginica", "0", "0", "10", "100.0%"],
        ["Class Precision", "100.0%", "100.0%", "90.9%", "Overall: 96.67%"]
    ]
    add_styled_table(
        ["Actual Class", "Pred Setosa", "Pred Versicolor", "Pred Virginica", "Class Recall"],
        cm_rows,
        [Inches(1.8), Inches(1.1), Inches(1.2), Inches(1.2), Inches(1.2)],
        align_right_cols=[1, 2, 3, 4]
    )

    add_image_evidence(
        os.path.join(Q5_DIR, "plots", "02_confusion_matrix_selected_model.png"),
        "Figure 6: Confusion Matrix Heatmap for Selected MLP-8 Classifier on Iris Test Set (Accuracy = 96.67%)"
    )

    add_image_evidence(
        os.path.join(Q5_DIR, "plots", "03_loss_curves_mlp.png"),
        "Figure 7: Training Loss Trajectories Comparing MLP (8) and MLP (8, 4) Convergence under Adam Optimization"
    )

    add_h2("2.8 Comparative Architectural Discussion")
    add_p(
        "1. Network Depth vs. Breadth Dynamics: The 1-hidden-layer architecture (8 neurons) maps the 4 inputs directly to an 8-dimensional intermediate feature space before classification. The 2-hidden-layer architecture (8, 4) performs hierarchical abstraction (4 → 8 → 4 → 3), creating a bottleneck layer before the output."
    )
    add_p(
        "2. Training Dynamics & Convergence: The 2-layer model converged in fewer epochs (209 iterations, final loss 0.0366) compared to the 1-layer model (291 iterations, final loss 0.0429), indicating efficient optimization. However, on cross-validation generalization across diverse folds, the simpler 1-layer model achieved slightly higher average accuracy (95.83% vs 95.00%)."
    )
    add_p(
        "3. Model Parsimony on Compact Datasets: Because Fisher's Iris dataset contains only 150 samples across 4 features, adding a second hidden layer increases trainable parameters from 67 to 91 (a 35.8% increase) without providing additional generalization benefit on the test set."
    )

    add_h2("2.9 Meaningful Self-Learning & Key Concepts")
    add_bullet("1. Necessity of Feature Standardization in MLPs: ", "Backpropagation calculates gradients with respect to weights. Unscaled inputs cause irregular gradient scales across dimensions, leading to oscillating weight updates and slow convergence.")
    add_bullet("2. Role of Stratified K-Fold Cross-Validation: ", "On small datasets, a single random split can produce misleading metrics due to sampling variance. Stratified K-Fold guarantees balanced class proportions across every fold, providing an unbiased estimate of generalization.")
    add_bullet("3. Deep vs. Shallow Trade-offs: ", "While deeper networks are essential for high-dimensional hierarchical data (images, text), shallow networks are often less prone to overfitting on low-dimensional tabular datasets.")
    add_bullet("4. Adam Optimizer Dynamics: ", "Adam combines adaptive learning rates with momentum (first and second gradient moments), enabling rapid descent through narrow valleys in the loss surface.")

    add_callout(
        "NEURAL NETWORK ARCHITECTURE SELECTION",
        "Selecting the optimal neural network architecture requires balancing representational capacity with generalization ability. Cross-validation variance and convergence speed serve as objective criteria for model selection when raw accuracy metrics are tied."
    )

    add_h2("2.10 Conclusion (Question 5)")
    add_p(
        "The comparative evaluation demonstrated that both MLP architectures perform effectively on the Iris dataset, achieving 96.67% test accuracy. The 1-hidden-layer (8 neurons) model was selected as the superior architecture due to its higher mean cross-validation accuracy (95.83% vs 95.00%) and lower parameter complexity (67 vs. 91 weights/biases). The confusion matrix confirmed near-perfect classification, with 100% precision and recall on Setosa and Virginica, and only one misclassification between Versicolor and Virginica."
    )

    # Save document
    try:
        doc.save(OUTPUT_DOCX)
        print(f"\n[+] Successfully generated Word Report: {OUTPUT_DOCX}")
        print(f"[+] File Size: {os.path.getsize(OUTPUT_DOCX) / 1024:.1f} KB")
    except PermissionError:
        fallback_docx = os.path.join(BASE_DIR, "Lab_Questions_4_5_Report_Updated.docx")
        doc.save(fallback_docx)
        print(f"\n[!] Notice: '{OUTPUT_DOCX}' is currently locked (likely open in Microsoft Word).")
        print(f"[+] Successfully saved updated Word Report to: {fallback_docx}")
        print(f"[+] File Size: {os.path.getsize(fallback_docx) / 1024:.1f} KB")

if __name__ == "__main__":
    build_report()
