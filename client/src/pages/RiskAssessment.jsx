import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Card } from '../components/common/Card';
import { RiskBadge } from '../components/common/Badge';
import { AlertTriangle, Play, CheckCircle2, ArrowRight, Info, Sparkles } from 'lucide-react';

export const RiskAssessment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedStudentId = searchParams.get('studentId') || '';

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(preselectedStudentId);

  const [formData, setFormData] = useState({
    attendancePercentage: 52,
    internalMarksPercentage: 48,
    assignmentSubmissionPercentage: 60,
    previousSemesterPercentage: 68,
    recentPerformancePercentage: 48,
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentList = async () => {
      try {
        const res = await API.get('/students');
        setStudents(res.data.data);
        if (!selectedStudentId && res.data.data.length > 0) {
          setSelectedStudentId(res.data.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      }
    };
    fetchStudentList();
  }, []);

  const handleRunAssessment = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    if (!selectedStudentId) {
      setError('Please select a student from the directory.');
      setLoading(false);
      return;
    }

    try {
      const res = await API.post('/risk/assess', {
        studentId: selectedStudentId,
        ...formData
      });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete risk assessment.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSample = (presetType) => {
    if (presetType === 'HIGH') {
      setFormData({
        attendancePercentage: 52,
        internalMarksPercentage: 48,
        assignmentSubmissionPercentage: 60,
        previousSemesterPercentage: 68,
        recentPerformancePercentage: 48,
        notes: 'High risk demo sample case (Rahul Kumar parameters)'
      });
    } else if (presetType === 'MEDIUM') {
      setFormData({
        attendancePercentage: 70,
        internalMarksPercentage: 62,
        assignmentSubmissionPercentage: 68,
        previousSemesterPercentage: 75,
        recentPerformancePercentage: 62,
        notes: 'Medium risk demo sample case'
      });
    } else {
      setFormData({
        attendancePercentage: 92,
        internalMarksPercentage: 85,
        assignmentSubmissionPercentage: 95,
        previousSemesterPercentage: 82,
        recentPerformancePercentage: 88,
        notes: 'Low risk consistent student profile'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">ML Risk Assessment Engine</h1>
        <p className="text-xs text-slate-500 mt-1">Submit student academic metrics for real-time model inference and explainability generation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Column */}
        <div className="lg:col-span-6 space-y-6">
          <Card title="Student Academic Indicators Form" subtitle="Enter validated percentage values (0 - 100%)">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Quick Demo Presets */}
            <div className="mb-6 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Quick Test Parameters:</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetSample('HIGH')}
                  className="py-1 px-2 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold border border-rose-200 transition-colors"
                >
                  High Risk (52/48)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSample('MEDIUM')}
                  className="py-1 px-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors"
                >
                  Med Risk (70/62)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSample('LOW')}
                  className="py-1 px-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors"
                >
                  Low Risk (92/85)
                </button>
              </div>
            </div>

            <form onSubmit={handleRunAssessment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Target Student *</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {students.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} ({st.studentId} &bull; {st.department} &bull; {st.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attendance % *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formData.attendancePercentage}
                    onChange={(e) => setFormData({ ...formData, attendancePercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Internal Marks % *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formData.internalMarksPercentage}
                    onChange={(e) => setFormData({ ...formData, internalMarksPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assignments %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formData.assignmentSubmissionPercentage}
                    onChange={(e) => setFormData({ ...formData, assignmentSubmissionPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prev Sem %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formData.previousSemesterPercentage}
                    onChange={(e) => setFormData({ ...formData, previousSemesterPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recent Test %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formData.recentPerformancePercentage}
                    onChange={(e) => setFormData({ ...formData, recentPerformancePercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assessment Observation Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional context or faculty comments..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Communicating with ML Model Service...</span>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Risk Assessment</span>
                  </>
                )}
              </button>
            </form>
          </Card>
        </div>

        {/* Live Output Column */}
        <div className="lg:col-span-6 space-y-6">
          <Card title="Model Inference Output" subtitle="Real-time risk classification & explainability">
            {!result ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-600">No Assessment Executed Yet</p>
                <p className="mt-1">Fill out the indicators form on the left and click 'Run Risk Assessment'.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Result Score Banner */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Estimated Risk Score</span>
                    <div className="text-3xl font-black mt-1">
                      {result.assessment.riskScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <RiskBadge level={result.assessment.riskLevel} />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Model: <code>{result.assessment.modelVersion}</code>
                    </p>
                  </div>
                </div>

                {/* Factors list */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Contributing Factors Breakdown</h4>
                  <div className="space-y-2">
                    {result.assessment.contributingFactors.map((fact, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-800">{fact.factor} &bull; {fact.value}</p>
                          <p className="text-slate-600 mt-0.5">{fact.explanation}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          fact.impact === 'High' ? 'bg-rose-100 text-rose-700' :
                          (fact.impact === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')
                        }`}>
                          {fact.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested Interventions */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Suggested Faculty Actions</h4>
                  <div className="space-y-2">
                    {result.assessment.suggestedInterventions.map((sug, idx) => (
                      <div key={idx} className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl text-xs font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => navigate(`/students/${result.student._id}`)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    <span>View Student Profile & Log Intervention</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
