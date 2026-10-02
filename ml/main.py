"""
StudentPulse - Python ML Service (FastAPI)
Provides RESTful HTTP APIs for student dropout risk prediction, retraining, and health checks.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
import os
import joblib

from predict import predict_student_risk
from train_model import train_and_save_models
from evaluate_model import evaluate

app = FastAPI(
    title="StudentPulse ML Risk Assessment API",
    description="Early Dropout Risk Prediction Engine for StudentPulse MCA Project",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StudentMetricsInput(BaseModel):
    attendance: float = Field(..., ge=0, le=100, description="Attendance percentage (0-100)")
    internalMarks: float = Field(..., ge=0, le=100, description="Internal marks percentage (0-100)")
    assignmentSubmission: float = Field(..., ge=0, le=100, description="Assignment submission rate percentage (0-100)")
    previousPerformance: float = Field(..., ge=0, le=100, description="Previous semester percentage (0-100)")
    recentPerformance: float = Field(..., ge=0, le=100, description="Recent academic performance percentage (0-100)")

    class Config:
        json_schema_extra = {
            "example": {
                "attendance": 52.0,
                "internalMarks": 48.0,
                "assignmentSubmission": 60.0,
                "previousPerformance": 68.0,
                "recentPerformance": 48.0
            }
        }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "StudentPulse-ML-Engine",
        "version": "1.0.0"
    }

@app.get("/model-info")
def get_model_info():
    base_dir = os.path.dirname(__file__)
    model_path = os.path.join(base_dir, 'models', 'dropout_risk_model.pkl')
    if not os.path.exists(model_path):
        train_and_save_models()

    model_pkg = joblib.load(model_path)
    return {
        "modelVersion": model_pkg.get("version", "studentpulse-rf-v1.0"),
        "algorithm": "Random Forest Classifier & Regressor",
        "featureNames": model_pkg.get("feature_names", []),
        "classes": model_pkg.get("classes", []),
        "datasetType": "SYNTHETIC/DEMO (studentpulse_demo_dataset.csv)",
        "note": "Prototype academic decision support system."
    }

@app.post("/predict")
def predict_risk(data: StudentMetricsInput):
    try:
        result = predict_student_risk(data.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/train")
def trigger_retraining():
    try:
        train_and_save_models()
        metrics = evaluate()
        return {
            "message": "Model retrained and evaluated successfully.",
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
