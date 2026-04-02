"""
Load ML pipeline results (dataset + model metrics + feature importance) into PostgreSQL.
Runs after generate_dataset.py and train_model.py.
"""

import os
import json
import psycopg2
from psycopg2.extras import execute_batch
import pandas as pd
import numpy as np

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")


def get_connection():
    return psycopg2.connect(DATABASE_URL)


def load_employees(conn, csv_path="ml_pipeline/data/employee_dataset.csv"):
    """Bulk-load employees from CSV into PostgreSQL."""
    df = pd.read_csv(csv_path)

    print(f"Loading {len(df)} employees into PostgreSQL...")

    with conn.cursor() as cur:
        cur.execute("DELETE FROM employees")
        conn.commit()

        records = []
        for _, row in df.iterrows():
            records.append((
                str(row["employee_id"]),
                str(row["name"]),
                int(row["age"]),
                str(row["department"]),
                str(row["job_role"]),
                str(row["gender"]),
                str(row["marital_status"]),
                int(row["education"]),
                float(row["years_at_company"]),
                float(row["total_working_years"]),
                float(row["years_in_current_role"]),
                float(row["years_since_last_promotion"]),
                int(row["num_companies_worked"]),
                float(row["monthly_income"]),
                int(row["stock_option_level"]),
                int(row["training_times_last_year"]),
                int(row["distance_from_home"]),
                int(row["job_satisfaction"]),
                int(row["work_life_balance"]),
                int(row["environment_satisfaction"]),
                int(row["job_involvement"]),
                int(row["performance_rating"]),
                bool(row["over_time"]),
                bool(row["attrited"]),
                float(row["attrition_risk"]),
                str(row["risk_level"]),
            ))

        execute_batch(
            cur,
            """
            INSERT INTO employees (
                employee_id, name, age, department, job_role, gender, marital_status,
                education, years_at_company, total_working_years, years_in_current_role,
                years_since_last_promotion, num_companies_worked, monthly_income,
                stock_option_level, training_times_last_year, distance_from_home,
                job_satisfaction, work_life_balance, environment_satisfaction,
                job_involvement, performance_rating, over_time, attrited,
                attrition_risk, risk_level
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            """,
            records,
            page_size=500,
        )
        conn.commit()

    print(f"Loaded {len(df)} employees successfully")


def load_model_metrics(conn, metrics_path="ml_pipeline/outputs/model_metrics.json"):
    """Load model performance metrics into PostgreSQL."""
    with open(metrics_path) as f:
        metrics = json.load(f)

    with conn.cursor() as cur:
        cur.execute("DELETE FROM model_metrics")
        cur.execute(
            """
            INSERT INTO model_metrics (
                accuracy, f1_score, roc_auc, precision, recall, cv_mean, cv_std, train_size, test_size
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                metrics["accuracy"],
                metrics["f1_score"],
                metrics["roc_auc"],
                metrics["precision"],
                metrics["recall"],
                metrics["cv_mean"],
                metrics["cv_std"],
                metrics["train_size"],
                metrics["test_size"],
            )
        )
        conn.commit()

    print(f"Loaded model metrics: accuracy={metrics['accuracy']:.4f}, f1={metrics['f1_score']:.4f}")


def load_feature_importance(conn, fi_path="ml_pipeline/outputs/feature_importance.csv"):
    """Load feature importance into PostgreSQL."""
    df = pd.read_csv(fi_path)

    # Clean up feature names for display
    feature_display_map = {
        "over_time": "Overtime",
        "log_monthly_income": "Monthly Income",
        "young_overtime": "Young & Overtime",
        "single_overtime": "Single & Overtime",
        "satisfaction_composite": "Satisfaction Composite",
        "income_per_experience": "Income Per Experience",
        "promotion_lag_ratio": "Promotion Lag Ratio",
        "loyalty_ratio": "Loyalty Ratio",
        "job_hopper_score": "Job Hopper Score",
        "log_distance": "Distance from Home",
        "years_at_company": "Years at Company",
        "total_working_years": "Total Working Years",
        "years_in_current_role": "Years in Current Role",
        "years_since_last_promotion": "Years Since Last Promotion",
        "num_companies_worked": "Num Companies Worked",
        "monthly_income": "Monthly Income (raw)",
        "stock_option_level": "Stock Option Level",
        "job_satisfaction": "Job Satisfaction",
        "work_life_balance": "Work-Life Balance",
        "environment_satisfaction": "Environment Satisfaction",
        "job_involvement": "Job Involvement",
        "training_times_last_year": "Training Times Last Year",
        "distance_from_home": "Distance from Home (raw)",
        "age": "Age",
        "education": "Education Level",
        "performance_rating": "Performance Rating",
    }

    top_features = df.head(20)

    with conn.cursor() as cur:
        cur.execute("DELETE FROM feature_importance")
        for _, row in top_features.iterrows():
            raw_feature = row["feature"]
            display_name = feature_display_map.get(
                raw_feature,
                raw_feature.replace("_", " ").title()
            )
            cur.execute(
                """
                INSERT INTO feature_importance (feature, importance, direction)
                VALUES (%s, %s, %s)
                """,
                (display_name, float(row["importance"]), str(row["direction"]))
            )
        conn.commit()

    print(f"Loaded {len(top_features)} feature importance records")


def main():
    print("Connecting to PostgreSQL...")
    conn = get_connection()

    try:
        load_employees(conn)
        load_model_metrics(conn)
        load_feature_importance(conn)
        print("\nAll data loaded successfully into PostgreSQL!")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
