"""
StudentPulse ML Unit & Integration Tests
"""

import pytest
from preprocess import validate_features, engineer_features
from predict import predict_student_risk
from train_model import train_and_save_models

def test_validation():
    valid = {
        "attendance": 80,
        "internalMarks": 75,
        "assignmentSubmission": 90,
        "previousPerformance": 70,
        "recentPerformance": 75
    }
    assert validate_features(valid) is True

    invalid = valid.copy()
    invalid["attendance"] = 150
    with pytest.raises(ValueError):
        validate_features(invalid)

def test_engineer_features():
    sample = {
        "attendance": 80,
        "internal_marks": 75,
        "assignment_submission": 90,
        "previous_performance": 70,
        "recent_performance": 75
    }
    df = engineer_features(sample)
    assert 'performance_trend' in df.columns
    assert df['performance_trend'].iloc[0] == 5.0

def test_prediction():
    high_risk_sample = {
        "attendance": 45,
        "internalMarks": 40,
        "assignmentSubmission": 50,
        "previousPerformance": 65,
        "recentPerformance": 42
    }
    result = predict_student_risk(high_risk_sample)
    assert "riskLevel" in result
    assert "riskScore" in result
    assert 0 <= result["riskScore"] <= 100
    assert result["riskLevel"] in ["LOW", "MEDIUM", "HIGH"]
