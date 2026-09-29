"""
StudentPulse - Synthetic Dataset Generator
Generates a realistic synthetic dataset of student academic indicators and dropout risk levels.
NOTE: This dataset is synthetic and used strictly for academic demonstration and testing.
"""

import os
import numpy as np
import pandas as pd

def generate_synthetic_dataset(num_samples=500, seed=42):
    np.random.seed(seed)

    # 1. Attendance percentage (30 - 100)
    # Bimodal distribution: most students attend well (>75%), some struggle (<60%)
    attendance = np.where(
        np.random.rand(num_samples) < 0.8,
        np.random.normal(82, 10, num_samples),
        np.random.normal(52, 12, num_samples)
    )
    attendance = np.clip(attendance, 30.0, 100.0)

    # 2. Internal Marks percentage (30 - 100), correlated with attendance
    internal_marks = attendance * 0.5 + np.random.normal(35, 12, num_samples)
    internal_marks = np.clip(internal_marks, 30.0, 100.0)

    # 3. Assignment Submission percentage (30 - 100), correlated with attendance & internal marks
    assignment_submission = attendance * 0.4 + internal_marks * 0.4 + np.random.normal(15, 10, num_samples)
    assignment_submission = np.clip(assignment_submission, 30.0, 100.0)

    # 4. Previous Performance percentage (35 - 95)
    previous_performance = np.random.normal(68, 12, num_samples)
    previous_performance = np.clip(previous_performance, 35.0, 95.0)

    # 5. Recent Performance percentage (30 - 95)
    # Some students experience academic drop (stress, difficulty, attendance loss)
    trend_noise = np.random.normal(-3, 10, num_samples)
    recent_performance = previous_performance * 0.7 + internal_marks * 0.3 + trend_noise
    recent_performance = np.clip(recent_performance, 30.0, 95.0)

    # Calculate synthetic ground-truth Risk Score (0 - 100) using multi-factor weighted formula
    # Higher weights on attendance & recent performance drops
    att_risk = np.maximum(0, (75.0 - attendance) * 1.2)
    marks_risk = np.maximum(0, (65.0 - internal_marks) * 1.0)
    assign_risk = np.maximum(0, (70.0 - assignment_submission) * 0.6)
    drop_trend = np.maximum(0, (previous_performance - recent_performance) * 1.1)

    raw_risk = att_risk + marks_risk + assign_risk + drop_trend + np.random.normal(0, 4, num_samples)
    
    # Scale raw risk to 0-100 score
    risk_score = np.clip(raw_risk * 1.2, 5, 98)

    # Categorize into risk levels: LOW (0-39), MEDIUM (40-69), HIGH (70-100)
    def assign_risk_level(score):
        if score < 40:
            return 'LOW'
        elif score < 70:
            return 'MEDIUM'
        else:
            return 'HIGH'

    risk_level = [assign_risk_level(s) for s in risk_score]

    # Create DataFrame
    df = pd.DataFrame({
        'attendance': np.round(attendance, 1),
        'internal_marks': np.round(internal_marks, 1),
        'assignment_submission': np.round(assignment_submission, 1),
        'previous_performance': np.round(previous_performance, 1),
        'recent_performance': np.round(recent_performance, 1),
        'risk_score': np.round(risk_score, 1),
        'risk_level': risk_level
    })

    return df

if __name__ == '__main__':
    output_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(output_dir, exist_ok=True)
    file_path = os.path.join(output_dir, 'studentpulse_demo_dataset.csv')
    
    df = generate_synthetic_dataset(num_samples=600, seed=42)
    df.to_csv(file_path, index=False)
    print(f"[DATASET GENERATION SUCCESS] Demo dataset created at: {file_path}")
    print(f"Dataset summary:\n{df['risk_level'].value_counts()}")
