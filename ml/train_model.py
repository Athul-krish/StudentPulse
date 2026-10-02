"""
StudentPulse - ML Model Training Script
Trains a Random Forest Classifier & Regressor on the synthetic dataset, evaluates performance, and exports model artifacts.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from preprocess import prepare_features_for_training, FEATURE_COLUMNS

def train_and_save_models():
    base_dir = os.path.dirname(__file__)
    dataset_path = os.path.join(base_dir, 'data', 'studentpulse_demo_dataset.csv')
    models_dir = os.path.join(base_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)

    if not os.path.exists(dataset_path):
        print(f"[TRAIN ERROR] Dataset not found at {dataset_path}. Generating dataset first...")
        from generate_dataset import generate_synthetic_dataset
        df = generate_synthetic_dataset()
        df.to_csv(dataset_path, index=False)
    else:
        df = pd.read_csv(dataset_path)

    print(f"[TRAIN INFO] Loaded dataset with {len(df)} samples.")

    # Prepare features and scaler
    X_scaled, scaler, feature_names = prepare_features_for_training(df)
    y_level = df['risk_level']
    y_score = df['risk_score']

    # Train/Test Split (80% train, 20% test)
    X_train, X_test, y_level_train, y_level_test, y_score_train, y_score_test = train_test_split(
        X_scaled, y_level, y_score, test_size=0.2, random_state=42, stratify=y_level
    )

    # 1. Train Random Forest Classifier for Risk Level (LOW, MEDIUM, HIGH)
    classifier = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    classifier.fit(X_train, y_level_train)

    # 2. Train Random Forest Regressor for continuous Risk Score (0-100)
    regressor = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    regressor.fit(X_train, y_score_train)

    model_package = {
        'version': 'studentpulse-rf-v1.0',
        'classifier': classifier,
        'regressor': regressor,
        'classes': list(classifier.classes_),
        'feature_names': feature_names
    }

    model_save_path = os.path.join(models_dir, 'dropout_risk_model.pkl')
    scaler_save_path = os.path.join(models_dir, 'scaler.pkl')

    joblib.dump(model_package, model_save_path)
    joblib.dump(scaler, scaler_save_path)

    print(f"[TRAIN SUCCESS] Model package saved to: {model_save_path}")
    print(f"[TRAIN SUCCESS] Scaler saved to: {scaler_save_path}")

    return X_test, y_level_test, y_score_test, model_package

if __name__ == '__main__':
    train_and_save_models()
