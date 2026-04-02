#!/usr/bin/env bash
# Full ML pipeline runner: generate -> train -> load to DB

set -e

echo "=================================================="
echo " Employee Attrition Risk Prediction Pipeline"
echo "=================================================="

# Install Python dependencies if needed
pip install numpy pandas scikit-learn matplotlib psycopg2-binary --quiet

echo ""
echo "[Step 1] Generating 15,000-record employee dataset..."
python ml_pipeline/generate_dataset.py

echo ""
echo "[Step 2] Training logistic regression model..."
python ml_pipeline/train_model.py

echo ""
echo "[Step 3] Loading results into PostgreSQL..."
python ml_pipeline/load_to_db.py

echo ""
echo "=================================================="
echo " Pipeline complete! Data is in PostgreSQL."
echo "=================================================="
