"""
Employee Attrition Dataset Generator
Generates a synthetic 15,000-record dataset simulating IBM HR Analytics dataset
with realistic distributions and correlations.
"""

import numpy as np
import pandas as pd
import random
import string
import os

np.random.seed(42)
random.seed(42)

N = 15000

DEPARTMENTS = ["Sales", "Research & Development", "Human Resources", "Finance", "Marketing", "IT", "Operations"]
DEPT_WEIGHTS = [0.30, 0.25, 0.10, 0.10, 0.10, 0.08, 0.07]

JOB_ROLES = {
    "Sales": ["Sales Executive", "Sales Representative", "Manager"],
    "Research & Development": ["Research Scientist", "Laboratory Technician", "Healthcare Representative", "Manager"],
    "Human Resources": ["Human Resources", "Manager"],
    "Finance": ["Finance Analyst", "Senior Finance Analyst", "Manager"],
    "Marketing": ["Marketing Analyst", "Marketing Manager"],
    "IT": ["Software Engineer", "IT Support", "Manager"],
    "Operations": ["Operations Analyst", "Operations Manager", "Manufacturing Director"],
}

MARITAL_STATUS = ["Single", "Married", "Divorced"]
GENDER = ["Male", "Female"]

FIRST_NAMES = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "William", "Barbara", "David", "Elizabeth", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Lisa", "Daniel", "Nancy",
    "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
    "Steven", "Dorothy", "Paul", "Kimberly", "Andrew", "Emily", "Kenneth", "Donna",
    "Joshua", "Michelle", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
    "Timothy", "Deborah", "Ronald", "Stephanie", "Edward", "Rebecca", "Jason", "Sharon",
    "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
    "Nicholas", "Angela", "Eric", "Shirley", "Jonathan", "Anna", "Stephen", "Brenda",
    "Larry", "Pamela", "Justin", "Emma", "Scott", "Nicole", "Brandon", "Helen",
    "Benjamin", "Samantha", "Samuel", "Katherine", "Raymond", "Christine", "Gregory", "Debra",
    "Frank", "Rachel", "Alexander", "Carolyn", "Patrick", "Janet", "Jack", "Catherine",
    "Dennis", "Maria", "Jerry", "Heather", "Tyler", "Diane", "Aaron", "Julie"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
    "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
    "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
    "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
    "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
    "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson"
]


def generate_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


def generate_employee_id(i):
    return f"EMP{i+1:05d}"


def generate_dataset():
    departments = np.random.choice(DEPARTMENTS, size=N, p=DEPT_WEIGHTS)
    gender = np.random.choice(GENDER, size=N)
    marital_status = np.random.choice(MARITAL_STATUS, size=N, p=[0.35, 0.45, 0.20])

    age = np.clip(np.random.normal(37, 9, N).astype(int), 18, 60)
    education = np.random.choice([1, 2, 3, 4, 5], size=N, p=[0.10, 0.19, 0.41, 0.22, 0.08])
    total_working_years = np.clip(np.random.exponential(10, N), 0, 40).astype(int)
    years_at_company = np.clip(
        np.random.exponential(7, N), 0,
        np.minimum(total_working_years, age - 18)
    ).astype(int)

    years_in_current_role = np.clip(
        np.random.exponential(4, N), 0, years_at_company
    ).astype(int)

    years_since_last_promotion = np.clip(
        np.random.exponential(2, N), 0, years_in_current_role
    ).astype(int)

    num_companies_worked = np.clip(
        np.random.poisson(2.5, N), 0, 9
    )

    base_income = {
        "Sales": 5500, "Research & Development": 6800, "Human Resources": 5000,
        "Finance": 7500, "Marketing": 6500, "IT": 7200, "Operations": 5800
    }

    monthly_income = np.array([
        np.clip(
            base_income[dept] + education[i] * 500 + total_working_years[i] * 200 +
            np.random.normal(0, 1500),
            1009, 20000
        )
        for i, dept in enumerate(departments)
    ])

    stock_option_level = np.random.choice([0, 1, 2, 3], size=N, p=[0.47, 0.36, 0.12, 0.05])
    training_times_last_year = np.random.choice(range(7), size=N, p=[0.06, 0.10, 0.29, 0.28, 0.16, 0.07, 0.04])
    distance_from_home = np.clip(np.random.exponential(9, N).astype(int) + 1, 1, 29)
    job_satisfaction = np.random.choice([1, 2, 3, 4], size=N, p=[0.18, 0.20, 0.33, 0.29])
    work_life_balance = np.random.choice([1, 2, 3, 4], size=N, p=[0.05, 0.23, 0.61, 0.11])
    environment_satisfaction = np.random.choice([1, 2, 3, 4], size=N, p=[0.16, 0.25, 0.29, 0.30])
    job_involvement = np.random.choice([1, 2, 3, 4], size=N, p=[0.06, 0.18, 0.59, 0.17])
    performance_rating = np.random.choice([1, 2, 3, 4], size=N, p=[0.00, 0.00, 0.85, 0.15])
    over_time = np.random.choice([True, False], size=N, p=[0.28, 0.72])

    # Compute attrition probability using logistic function with realistic feature weights
    log_odds = (
        -4.0
        + (over_time.astype(float) * 1.4)
        + (np.where(marital_status == "Single", 0.8, 0))
        + ((5 - job_satisfaction) * 0.4)
        + ((5 - work_life_balance) * 0.35)
        + ((5 - environment_satisfaction) * 0.25)
        + (np.log1p(num_companies_worked) * 0.45)
        + (np.log1p(distance_from_home) * 0.25)
        - (np.log1p(monthly_income / 1000) * 0.5)
        - (np.log1p(years_at_company) * 0.55)
        - (np.log1p(stock_option_level) * 0.5)
        + (np.where(age < 30, 0.6, np.where(age > 50, -0.3, 0)))
        - (np.log1p(total_working_years) * 0.15)
        + ((5 - job_involvement) * 0.3)
        + (np.log1p(years_since_last_promotion) * 0.3)
        + (np.random.normal(0, 0.15, N))  # noise
    )

    attrition_prob = 1 / (1 + np.exp(-log_odds))
    attrition_prob = np.clip(attrition_prob, 0.01, 0.99)

    # Sample actual attrition
    attrited = np.random.binomial(1, attrition_prob, N).astype(bool)

    # Risk levels
    risk_level = np.where(attrition_prob >= 0.6, "High",
                 np.where(attrition_prob >= 0.35, "Medium", "Low"))

    job_roles = [random.choice(JOB_ROLES[dept]) for dept in departments]
    names = [generate_name() for _ in range(N)]
    employee_ids = [generate_employee_id(i) for i in range(N)]

    df = pd.DataFrame({
        "employee_id": employee_ids,
        "name": names,
        "age": age,
        "gender": gender,
        "marital_status": marital_status,
        "department": departments,
        "job_role": job_roles,
        "education": education,
        "years_at_company": years_at_company.astype(float),
        "total_working_years": total_working_years.astype(float),
        "years_in_current_role": years_in_current_role.astype(float),
        "years_since_last_promotion": years_since_last_promotion.astype(float),
        "num_companies_worked": num_companies_worked.astype(int),
        "monthly_income": monthly_income.round(2),
        "stock_option_level": stock_option_level.astype(int),
        "training_times_last_year": training_times_last_year.astype(int),
        "distance_from_home": distance_from_home.astype(int),
        "job_satisfaction": job_satisfaction.astype(int),
        "work_life_balance": work_life_balance.astype(int),
        "environment_satisfaction": environment_satisfaction.astype(int),
        "job_involvement": job_involvement.astype(int),
        "performance_rating": performance_rating.astype(int),
        "over_time": over_time,
        "attrited": attrited,
        "attrition_risk": attrition_prob.round(4),
        "risk_level": risk_level,
    })

    os.makedirs("ml_pipeline/data", exist_ok=True)
    df.to_csv("ml_pipeline/data/employee_dataset.csv", index=False)
    print(f"Generated {len(df)} employee records")
    print(f"Attrition rate: {df['attrited'].mean():.1%}")
    print(f"High risk: {(df['risk_level']=='High').sum()}")
    print(f"Medium risk: {(df['risk_level']=='Medium').sum()}")
    print(f"Low risk: {(df['risk_level']=='Low').sum()}")
    return df


if __name__ == "__main__":
    df = generate_dataset()
    print(df.head())
    print(df.dtypes)
