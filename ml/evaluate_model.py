"""
StudentPulse - ML Model Evaluation Script
Evaluates trained model on held-out test data and prints complete performance metrics.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    mean_absolute_error,
    mean_squared_error
)
from sklearn.model_selection import train_test_split
from preprocess import engineer_features

def evaluate():
    base_dir = os.path.dirname(__file__)
    dataset_path = os.path.join(base_dir, 'data', 'studentpulse_demo_dataset.csv')
    model_path = os.path.join(base_dir, 'models', 'dropout_risk_model.pkl')
    scaler_path = os.path.join(base_dir, 'models', 'scaler.pkl')

    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        print("[EVAL ERROR] Model or scaler missing. Training model first...")
        from train_model import train_and_save_models
        train_and_save_models()

    df = pd.read_csv(dataset_path)
    model_package = joblib.load(model_path)
    scaler = joblib.load(scaler_path)

    X_df = engineer_features(df)
    X_scaled = scaler.transform(X_df)
    y_level = df['risk_level']
    y_score = df['risk_score']

    _, X_test, _, y_level_test, _, y_score_test = train_test_split(
        X_scaled, y_level, y_score, test_size=0.2, random_state=42, stratify=y_level
    )

    classifier = model_package['classifier']
    regressor = model_package['regressor']

    y_level_pred = classifier.predict(X_test)
    y_score_pred = regressor.predict(X_test)

    acc = accuracy_score(y_level_test, y_level_pred)
    report = classification_report(y_level_test, y_level_pred, output_dict=False)
    cm = confusion_matrix(y_level_test, y_level_pred, labels=['LOW', 'MEDIUM', 'HIGH'])
    mae = mean_absolute_error(y_score_test, y_score_pred)
    rmse = np.sqrt(mean_squared_error(y_score_test, y_score_pred))

    metrics = {
        'accuracy': float(acc),
        'mae': float(mae),
        'rmse': float(rmse),
        'confusion_matrix': cm.tolist(),
        'classes': ['LOW', 'MEDIUM', 'HIGH']
    }

    print("==================================================")
    print("STUDENTPULSE ML MODEL EVALUATION REPORT")
    print("==================================================")
    print(f"Model Version: {model_package.get('version', 'v1.0')}")
    print(f"Accuracy: {acc:.4f}")
    print(f"Score MAE: {mae:.2f} points")
    print(f"Score RMSE: {rmse:.2f} points")
    print("\nClassification Report:\n", report)
    print("\nConfusion Matrix (LOW, MEDIUM, HIGH):\n", cm)
    print("==================================================")

    return metrics

if __name__ == '__main__':
    evaluate()
