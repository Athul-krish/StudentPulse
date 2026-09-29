"""
StudentPulse - ML Preprocessing Module
Handles feature transformation, scaling, and validation for model training and inference.
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

FEATURE_COLUMNS = [
    'attendance',
    'internal_marks',
    'assignment_submission',
    'previous_performance',
    'recent_performance',
    'performance_trend'  # engineered feature: recent - previous
]

def normalize_keys(data_dict):
    """Normalizes camelCase and snake_case dict keys."""
    return {
        "attendance": float(data_dict.get("attendance", data_dict.get("attendance_percentage", 0))),
        "internal_marks": float(data_dict.get("internalMarks", data_dict.get("internal_marks", 0))),
        "assignment_submission": float(data_dict.get("assignmentSubmission", data_dict.get("assignment_submission", 0))),
        "previous_performance": float(data_dict.get("previousPerformance", data_dict.get("previous_performance", 0))),
        "recent_performance": float(data_dict.get("recentPerformance", data_dict.get("recent_performance", 0)))
    }

def engineer_features(df_or_dict):
    """
    Computes derived features like performance_trend.
    Accepts pandas DataFrame or dict/single sample input.
    """
    if isinstance(df_or_dict, dict):
        data = normalize_keys(df_or_dict)
        data['performance_trend'] = data['recent_performance'] - data['previous_performance']
        return pd.DataFrame([data])[FEATURE_COLUMNS]
    else:
        df = df_or_dict.copy()
        if 'performance_trend' not in df.columns:
            df['performance_trend'] = df['recent_performance'] - df['previous_performance']
        return df[FEATURE_COLUMNS]

def validate_features(data_dict):
    """
    Validates feature bounds (0 - 100) before preprocessing.
    """
    norm = normalize_keys(data_dict)
    required = ['attendance', 'internal_marks', 'assignment_submission', 'previous_performance', 'recent_performance']
    for col in required:
        val = norm[col]
        if val < 0 or val > 100:
            raise ValueError(f"Feature '{col}' value {val} must be between 0 and 100.")
    return True

def prepare_features_for_training(df):
    """
    Prepares X feature matrix and fits StandardScaler.
    Returns X_processed, scaler.
    """
    X_raw = engineer_features(df)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_raw)
    return X_scaled, scaler, FEATURE_COLUMNS

def prepare_features_for_inference(data_dict, scaler):
    """
    Prepares a single input dict for prediction using saved scaler.
    """
    validate_features(data_dict)
    X_raw = engineer_features(data_dict)
    X_scaled = scaler.transform(X_raw)
    return X_scaled
