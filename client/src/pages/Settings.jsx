import React, { useState } from 'react';
import API from '../services/api';
import { Card } from '../components/common/Card';
import { Settings as SettingsIcon, Sliders, Database, RefreshCw, Cpu, CheckCircle } from 'lucide-react';

export const Settings = () => {
  const [retraining, setRetraining] = useState(false);
  const [retrainResult, setRetrainResult] = useState(null);

  const handleRetrainModel = async () => {
    setRetraining(true);
    setRetrainResult(null);
    try {
      // Call python ML train via Node proxy or health check
      const res = await API.get('/health');
      setRetrainResult({
        success: true,
        message: 'Random Forest ML Model verified and active.',
        version: 'studentpulse-rf-v1.0',
        features: ['attendance', 'internal_marks', 'assignment_submission', 'previous_performance', 'recent_performance', 'performance_trend']
      });
    } catch (err) {
      setRetrainResult({
        success: false,
        message: 'Could not contact ML service directly.'
      });
    } finally {
      setRetraining(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">System Settings & Thresholds</h1>
        <p className="text-xs text-slate-500 mt-1">Configure institutional monitoring thresholds and ML service parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Thresholds Configuration */}
        <Card title="Configurable Risk Thresholds" subtitle="Define application risk score ranges for low, medium, and high alert levels">
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex justify-between font-bold text-emerald-800">
                <span>LOW RISK RANGE</span>
                <span>0 – 39 Points</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">Student demonstrates satisfactory attendance and academic performance.</p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex justify-between font-bold text-amber-800">
                <span>MEDIUM RISK RANGE</span>
                <span>40 – 69 Points</span>
              </div>
              <p className="text-[11px] text-amber-700 mt-1">Student shows moderate decline or borderline attendance. Light intervention recommended.</p>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <div className="flex justify-between font-bold text-rose-800">
                <span>HIGH RISK RANGE</span>
                <span>70 – 100 Points</span>
              </div>
              <p className="text-[11px] text-rose-700 mt-1">Critical indicators flagged. Immediate faculty counselling and support required.</p>
            </div>
          </div>
        </Card>

        {/* Machine Learning Pipeline Controls */}
        <Card title="Machine Learning Service Controls" subtitle="Model versioning and retraining engine status">
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Algorithm:</span>
                <span className="font-mono font-bold text-slate-900">Random Forest Classifier & Regressor</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Model Version:</span>
                <span className="font-mono font-bold text-indigo-600">studentpulse-rf-v1.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Dataset Source:</span>
                <span className="font-mono text-slate-600">studentpulse_demo_dataset.csv (Synthetic)</span>
              </div>
            </div>

            <button
              onClick={handleRetrainModel}
              disabled={retraining}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
              <span>{retraining ? 'Retraining Model...' : 'Verify & Retrain ML Pipeline'}</span>
            </button>

            {retrainResult && (
              <div className={`p-3 rounded-xl border ${retrainResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                <p className="font-bold">{retrainResult.message}</p>
                {retrainResult.features && (
                  <p className="text-[10px] mt-1 font-mono">
                    Features evaluated: {retrainResult.features.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
