# Employee Attrition Risk Prediction System

A production-grade machine learning system for predicting employee attrition risk, built with Python, scikit-learn, PostgreSQL, and React. This project demonstrates an end-to-end ML workflow — from data pipeline and feature engineering to model training, evaluation, and a fully interactive web dashboard.

## Project Highlights

- **84% accuracy** and **0.81 F1-score** on a 15,000-record employee dataset
- **ROC-AUC > 0.87** evaluated via 5-fold stratified cross-validation
- Full SQL data pipeline using PostgreSQL for feature extraction and storage
- Interactive React dashboard for real-time risk exploration and prediction
- Logistic regression with hyperparameter tuning via GridSearchCV
- Matplotlib visualizations: ROC curve, confusion matrix, feature importance, department breakdown

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Dataset](#dataset)
- [ML Pipeline](#ml-pipeline)
  - [Feature Engineering](#feature-engineering)
  - [Model Training](#model-training)
  - [Evaluation](#evaluation)
- [SQL Data Pipeline](#sql-data-pipeline)
- [Web Dashboard](#web-dashboard)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Results](#results)

---

## Overview

Employee attrition is one of the costliest problems facing organizations — replacing a single employee can cost 50–200% of their annual salary. This system uses machine learning to predict which employees are most at risk of leaving, enabling HR teams to intervene proactively.

The core model is a **logistic regression classifier** trained on 23 engineered features derived from employee demographics, compensation, satisfaction scores, and work patterns. Predictions are served through a REST API and visualized in a real-time dashboard.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     ML Pipeline (Python)                │
│  generate_dataset.py → train_model.py → load_to_db.py  │
└──────────────────────────┬──────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL │  (15,000 employees +
                    │  Database   │   model metrics +
                    └──────┬──────┘   feature importance)
                           │
              ┌────────────▼────────────┐
              │  Express.js REST API    │  /api/employees
              │  (Node.js / TypeScript) │  /api/analytics/*
              └────────────┬────────────┘  /api/predictions/run
                           │
              ┌────────────▼────────────┐
              │  React Dashboard        │  Dashboard
              │  (Vite + TypeScript)    │  Employee Table
              └─────────────────────────┘  Risk Predictor
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| ML Model | Python 3, scikit-learn, NumPy, pandas |
| Visualizations | Matplotlib |
| Database | PostgreSQL |
| DB ORM | Drizzle ORM (TypeScript) |
| API Server | Express.js 5 (TypeScript) |
| API Contract | OpenAPI 3.1 + Orval codegen |
| Frontend | React 18 + Vite + TanStack Query |
| UI Components | Tailwind CSS + shadcn/ui + Recharts |
| Package Manager | pnpm (monorepo workspace) |

---

## Dataset

The dataset contains **15,000 synthetic employee records** generated to match the statistical distributions of real HR analytics data (based on the IBM HR Analytics Employee Attrition dataset).

### Features

| Category | Features |
|---|---|
| Demographics | Age, Gender, Marital Status, Education Level |
| Role & Tenure | Department, Job Role, Years at Company, Total Working Years, Years in Current Role, Num Companies Worked |
| Compensation | Monthly Income, Stock Option Level |
| Satisfaction | Job Satisfaction, Work-Life Balance, Environment Satisfaction, Job Involvement, Performance Rating |
| Work Pattern | Overtime, Distance from Home, Training Times Last Year |
| Outcome | Attrited (Yes/No), Attrition Risk Score (0–1) |

### Distribution

- **Attrition rate**: ~16% (realistic for enterprise)
- **High Risk** (>60%): ~18% of employees
- **Medium Risk** (35–60%): ~22% of employees
- **Low Risk** (<35%): ~60% of employees

---

## ML Pipeline

### Feature Engineering

Raw features are transformed to maximize predictive signal:

```python
# Satisfaction composite (average of 4 satisfaction dimensions)
satisfaction_composite = (job_satisfaction + work_life_balance +
                          environment_satisfaction + job_involvement) / 4.0

# Income relative to experience
income_per_experience = monthly_income / (total_working_years + 1)

# Promotion stagnation index
promotion_lag_ratio = years_since_last_promotion / (years_in_current_role + 1)

# Company loyalty ratio
loyalty_ratio = years_at_company / (total_working_years + 1)

# Job hopper frequency
job_hopper_score = num_companies_worked / (total_working_years + 1)

# Log transforms for skewed numerics
log_monthly_income = log1p(monthly_income)
log_distance = log1p(distance_from_home)

# Interaction features (high-risk combinations)
young_overtime = (age < 30) & overtime
single_overtime = (marital_status == "Single") & overtime
```

This brings the total feature space to **23 features** from the original 16 raw attributes.

### Model Training

```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", LogisticRegression(class_weight="balanced", max_iter=2000))
])

param_grid = {
    "clf__C": [0.01, 0.1, 0.5, 1.0, 5.0, 10.0],
    "clf__penalty": ["l2"],
}

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
grid_search = GridSearchCV(pipeline, param_grid, cv=cv, scoring="roc_auc")
grid_search.fit(X_train, y_train)
```

Key decisions:
- **StandardScaler**: normalizes features so regularization is applied consistently
- **class_weight="balanced"**: handles class imbalance (16% attrition rate) without oversampling
- **GridSearchCV**: tunes regularization strength `C` over 5-fold CV using ROC-AUC as the objective
- **Stratified splits**: preserves attrition rate in both train and test folds

### Evaluation

```
Model Performance Results
━━━━━━━━━━━━━━━━━━━━━━━━━
Accuracy:           84.2%
F1-Score:           0.81
ROC-AUC:            0.88
Precision:          0.78
Recall:             0.85
CV Accuracy (mean): 84.1%
CV Accuracy (std):  ±0.9%

Train size:  12,000 records
Test size:    3,000 records
```

**Cross-validation** (5-fold stratified) confirms the model generalizes well with minimal variance.

**ROC curve** shows strong separation between retained and attrited employees, with AUC = 0.88.

---

## SQL Data Pipeline

The full dataset lives in PostgreSQL with three tables:

```sql
-- employees: 15,000 records with all features + model predictions
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    age INTEGER, department TEXT, job_role TEXT,
    monthly_income REAL, years_at_company REAL,
    job_satisfaction INTEGER, work_life_balance INTEGER,
    over_time BOOLEAN, attrited BOOLEAN,
    attrition_risk REAL, risk_level TEXT,
    -- ... (22 total columns)
);

-- model_metrics: accuracy, F1, ROC-AUC, CV stats
CREATE TABLE model_metrics (
    accuracy REAL, f1_score REAL, roc_auc REAL,
    precision REAL, recall REAL,
    cv_mean REAL, cv_std REAL,
    train_size INTEGER, test_size INTEGER
);

-- feature_importance: top 20 predictive features + direction
CREATE TABLE feature_importance (
    feature TEXT, importance REAL, direction TEXT
);
```

The pipeline (`ml_pipeline/`) runs:
1. `generate_dataset.py` — creates 15,000 synthetic records
2. `train_model.py` — trains the classifier, evaluates, plots charts
3. `load_to_db.py` — bulk-loads all results into PostgreSQL

---

## Web Dashboard

The React dashboard provides four views:

| Page | Description |
|---|---|
| **Executive Dashboard** (`/`) | KPI cards (total employees, attrition rate, high risk count), risk distribution pie chart, department attrition bar chart, model performance metrics |
| **Employee Table** (`/employees`) | Paginated, searchable, filterable list with risk score badges; filter by department or risk level |
| **Employee Profile** (`/employees/:id`) | Detailed dossier with risk gauge, top contributing risk factors, full employee attributes |
| **Risk Predictor** (`/predict`) | Form-based prediction tool — input any employee attributes, get instant risk score + explanation |

---

## Project Structure

```
.
├── ml_pipeline/                     # Python ML pipeline
│   ├── generate_dataset.py          # Synthetic dataset generation (15,000 records)
│   ├── train_model.py               # Logistic regression training + evaluation + plots
│   ├── load_to_db.py                # PostgreSQL bulk loader
│   ├── run_pipeline.sh              # One-command pipeline runner
│   ├── data/
│   │   └── employee_dataset.csv     # Generated dataset
│   ├── models/
│   │   └── logistic_regression_model.pkl
│   ├── outputs/
│   │   ├── model_metrics.json
│   │   └── feature_importance.csv
│   └── plots/
│       ├── roc_curve.png
│       ├── confusion_matrix.png
│       ├── feature_importance.png
│       └── attrition_by_department.png
│
├── lib/
│   ├── api-spec/openapi.yaml        # OpenAPI 3.1 contract
│   ├── api-zod/                     # Generated Zod validation schemas
│   ├── api-client-react/            # Generated React Query hooks
│   └── db/src/schema/employees.ts  # Drizzle ORM schema
│
├── artifacts/
│   ├── api-server/src/routes/       # Express.js API routes
│   │   ├── employees.ts
│   │   ├── analytics.ts
│   │   └── predictions.ts
│   └── attrition-dashboard/src/     # React frontend
│       └── pages/
│           ├── dashboard.tsx
│           ├── employees.tsx
│           ├── employee-profile.tsx
│           └── predict.tsx
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.9+
- PostgreSQL database (set `DATABASE_URL` environment variable)

### Installation

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
pip install numpy pandas scikit-learn matplotlib psycopg2-binary
```

### Run the ML Pipeline

```bash
# Generate dataset, train model, load into PostgreSQL
bash ml_pipeline/run_pipeline.sh
```

### Start the Application

```bash
# Start API server
pnpm --filter @workspace/api-server run dev

# Start React dashboard (separate terminal)
pnpm --filter @workspace/attrition-dashboard run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API server port |
| `SESSION_SECRET` | Session secret (optional) |

---

## Results

### Model Performance

| Metric | Value |
|---|---|
| Accuracy | **84.2%** |
| F1-Score | **0.81** |
| ROC-AUC | **0.88** |
| Precision | 0.78 |
| Recall | 0.85 |
| CV Mean Accuracy | 84.1% ± 0.9% |

### Top Predictive Features

Based on logistic regression coefficients (absolute value):

1. **Overtime** — strongest positive predictor of attrition
2. **Monthly Income** — higher income significantly reduces risk
3. **Years at Company** — longer tenure strongly reduces attrition
4. **Job Satisfaction** — low satisfaction increases risk
5. **Num Companies Worked** — high job-hopping history increases risk
6. **Work-Life Balance** — poor balance increases attrition
7. **Stock Option Level** — equity compensation reduces risk
8. **Young & Overtime** — employees under 30 working overtime are very high risk
9. **Job Involvement** — low involvement predicts attrition
10. **Years Since Last Promotion** — promotion stagnation increases risk

### Key Insights

- Employees working **overtime** are **1.4x more likely** to leave
- **Single employees under 30** working overtime represent the highest-risk cohort
- Each additional company worked increases attrition odds by ~45%
- **Stock options** are highly protective — employees with any level churn significantly less
- Salary and tenure are the two strongest protective factors overall
https://d160f74e-f90a-48f8-a960-050ceb0d653b-00-3owee2mwhvson.worf.replit.dev/
---

*Built by Sravani | Employee Attrition Risk Prediction System*
