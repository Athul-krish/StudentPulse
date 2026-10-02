# StudentPulse - Machine Learning Pipeline Documentation

## Overview
The ML engine predicts student academic dropout risk based on 5 primary academic indicators and 1 engineered trend feature:
1. `attendance`: Attendance percentage (0 - 100%)
2. `internal_marks`: Internal test score percentage (0 - 100%)
3. `assignment_submission`: Assignment submission completion rate (0 - 100%)
4. `previous_performance`: Previous semester percentage (0 - 100%)
5. `recent_performance`: Recent assessment percentage (0 - 100%)
6. `performance_trend`: Engineered feature (`recent_performance - previous_performance`)

## Model Selection & Training
- **Classifier**: `RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)`
- **Regressor**: `RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)`
- **Preprocessing**: `StandardScaler` for normalization.
- **Evaluation Split**: Stratified 80% train / 20% test split.

## Dataset
- **File**: `ml/data/studentpulse_demo_dataset.csv`
- **Type**: Synthetic/Demo dataset generated for academic prototype testing.
- **Target Variables**:
  - `risk_level`: Multiclass label (`LOW`, `MEDIUM`, `HIGH`)
  - `risk_score`: Continuous risk indicator (0 - 100)

## Performance Metrics
- **Classification Accuracy**: ~94%
- **Mean Absolute Error (MAE)**: ~3.47 points
- **Root Mean Squared Error (RMSE)**: ~5.19 points
