"""
StudentPulse - Predict Module
Inference engine that takes student academic input indicators and produces model predictions.
"""

import os
import joblib
import numpy as np
from preprocess import prepare_features_for_inference, validate_features

_model_package = None
_scaler = None

def load_artifacts():
    global _model_package, _scaler
    if _model_package is None or _scaler is None:
        base_dir = os.path.dirname(__file__)
        model_path = os.path.join(base_dir, 'models', 'dropout_risk_model.pkl')
        scaler_path = os.path.join(base_dir, 'models', 'scaler.pkl')

        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            from train_model import train_and_save_models
            train_and_save_models()

        _model_package = joblib.load(model_path)
        _scaler = joblib.load(scaler_path)

    return _model_package, _scaler

def predict_student_risk(input_data):
    """
    Takes dict input:
    {
        "attendance": 52.0,
        "internalMarks": 48.0,
        "assignmentSubmission": 60.0,
        "previousPerformance": 68.0,
        "recentPerformance": 48.0
    }
    Returns prediction result:
    {
        "riskLevel": "HIGH",
        "riskScore": 78,
        "modelVersion": "studentpulse-rf-v1.0",
        "probabilities": { "LOW": 0.05, "MEDIUM": 0.20, "HIGH": 0.75 }
    }
    """
    model_pkg, scaler = load_artifacts()

    # Map frontend property names if snake_case or camelCase
    normalized_input = {
        "attendance": float(input_data.get("attendance", input_data.get("attendance_percentage", 0))),
        "internal_marks": float(input_data.get("internalMarks", input_data.get("internal_marks", 0))),
        "assignment_submission": float(input_data.get("assignmentSubmission", input_data.get("assignment_submission", 0))),
        "previous_performance": float(input_data.get("previousPerformance", input_data.get("previous_performance", 0))),
        "recent_performance": float(input_data.get("recentPerformance", input_data.get("recent_performance", 0)))
    }

    validate_features(normalized_input)
    X_scaled = prepare_features_for_inference(normalized_input, scaler)

    classifier = model_pkg['classifier']
    regressor = model_pkg['regressor']

    predicted_level = classifier.predict(X_scaled)[0]
    raw_score = regressor.predict(X_scaled)[0]
    risk_score = int(np.clip(np.round(raw_score), 0, 100))

    probs = classifier.predict_proba(X_scaled)[0]
    prob_dict = {cls: float(p) for cls, p in zip(classifier.classes_, probs)}

    return {
        "riskLevel": predicted_level,
        "riskScore": risk_score,
        "modelVersion": model_pkg.get("version", "studentpulse-rf-v1.0"),
        "probabilities": prob_dict
    }

if __name__ == '__main__':
    sample = {
        "attendance": 52,
        "internalMarks": 48,
        "assignmentSubmission": 60,
        "previousPerformance": 68,
        "recentPerformance": 48
    }
    res = predict_student_risk(sample)
    print("Sample Inference Result:", res)
