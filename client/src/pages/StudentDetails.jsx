import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { Card } from '../components/common/Card';
import { RiskBadge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  User,
  AlertTriangle,
  FileCheck2,
  TrendingDown,
  TrendingUp,
  History,
  PlusCircle,
  Clock,
  CheckCircle2,
  BookOpen,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const StudentDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Intervention Modal state
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [interventionData, setInterventionData] = useState({
    interventionType: 'Academic Counselling',
    description: '',
    followUpDate: '',
    facultyNotes: ''
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const fetchDetails = async () => {
    try {
      const res = await API.get(`/students/${id}`);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load student details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleCreateIntervention = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    try {
      await API.post('/interventions', {
        studentId: id,
        riskAssessmentId: data.latestAssessment?._id,
        ...interventionData
      });
      setIsInterventionModalOpen(false);
      setInterventionData({
        interventionType: 'Academic Counselling',
        description: '',
        followUpDate: '',
        facultyNotes: ''
      });
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record intervention.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleStatusChange = async (interventionId, newStatus) => {
    try {
      await API.put(`/interventions/${interventionId}`, { status: newStatus });
      fetchDetails();
    } catch (err) {
      alert('Failed to update intervention status.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data || !data.student) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-700">Student Record Not Found</h2>
        <Link to="/students" className="mt-4 inline-block text-indigo-600 text-xs font-semibold hover:underline">
          &larr; Back to Student Directory
        </Link>
      </div>
    );
  }

  const { student, academicRecords, latestAssessment, riskHistory, interventions } = data;

  // Prepare chart data for performance trends
  const trendChartData = (academicRecords || []).map(rec => ({
    semester: rec.semester,
    Attendance: rec.attendancePercentage,
    InternalMarks: rec.internalMarksPercentage,
    Assignments: rec.assignmentSubmissionPercentage,
    RecentPerformance: rec.recentPerformancePercentage
  })).reverse();

  const riskHistoryChartData = (riskHistory || []).map((rh, idx) => ({
    assessment: `Assessment #${idx + 1}`,
    date: new Date(rh.assessmentDate).toLocaleDateString(),
    RiskScore: rh.riskScore
  }));

  return (
    <div className="space-y-6">
      {/* Student Profile Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-2xl border border-indigo-200">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{student.name}</h1>
              <RiskBadge level={student.latestRiskLevel} score={student.latestRiskScore} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ID: <span className="font-mono font-semibold text-slate-700">{student.studentId}</span> &bull; {student.department} &bull; Semester {student.semester} ({student.program}) &bull; Batch {student.batch}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsInterventionModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Intervention</span>
          </button>
          <Link
            to={`/risk-assessment?studentId=${student._id}`}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-4 rounded-xl border border-slate-200 transition-all"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Reassess Student</span>
          </Link>
        </div>
      </div>

      {/* Grid: Current Risk & Why Flagged */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Summary Panel */}
        <Card title="Current Risk Assessment" subtitle="ML Estimated dropout risk score" className="lg:col-span-1">
          <div className="text-center py-4">
            <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full border-4 ${
              student.latestRiskLevel === 'HIGH' ? 'border-rose-500 bg-rose-50 text-rose-600' :
              (student.latestRiskLevel === 'MEDIUM' ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-emerald-500 bg-emerald-50 text-emerald-600')
            }`}>
              <div>
                <span className="text-3xl font-extrabold">{student.latestRiskScore}</span>
                <span className="text-xs block text-slate-400 font-medium">/ 100</span>
              </div>
            </div>
            <div className="mt-4">
              <RiskBadge level={student.latestRiskLevel} />
              <p className="text-[11px] text-slate-400 mt-2">
                Model: <code>{latestAssessment?.modelVersion || 'studentpulse-rf-v1.0'}</code>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Assessed: {latestAssessment ? new Date(latestAssessment.assessmentDate).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        {/* Why Flagged / Contributing Factors */}
        <Card title="Why Was This Student Flagged?" subtitle="Transparent evidence breakdown derived from current indicators" className="lg:col-span-2">
          {!latestAssessment || !latestAssessment.contributingFactors || latestAssessment.contributingFactors.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No risk factor evaluation data available for this student.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {latestAssessment.contributingFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border ${
                    factor.impact === 'High' ? 'bg-rose-50/60 border-rose-200' :
                    (factor.impact === 'Medium' ? 'bg-amber-50/60 border-amber-200' : 'bg-emerald-50/60 border-emerald-200')
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">{factor.factor}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      factor.impact === 'High' ? 'bg-rose-200 text-rose-800' :
                      (factor.impact === 'Medium' ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800')
                    }`}>
                      {factor.impact} Impact
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 mt-1">{factor.value}</div>
                  <p className="text-xs text-slate-600 mt-1">{factor.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Suggested Interventions */}
      <Card title="Recommended Support Interventions" subtitle="Actionable decision-support recommendations generated for faculty review">
        {!latestAssessment?.suggestedInterventions || latestAssessment.suggestedInterventions.length === 0 ? (
          <p className="text-xs text-slate-400">Regular academic performance monitoring recommended.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {latestAssessment.suggestedInterventions.map((sug, idx) => (
              <div key={idx} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-slate-700">{sug}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Performance & Risk Trend Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Academic Indicators Trend" subtitle="Attendance & Marks evolution across semesters">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="semester" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="Attendance" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="InternalMarks" stroke="#6366f1" strokeWidth={2} />
                <Line type="monotone" dataKey="Assignments" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Risk Score Monitoring History" subtitle="Risk score trajectory over time">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskHistoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="RiskScore" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Intervention History */}
      <Card
        title="Faculty Intervention & Action History"
        subtitle="Recorded support activities and follow-ups for this student"
        action={
          <button
            onClick={() => setIsInterventionModalOpen(true)}
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            + New Intervention
          </button>
        }
      >
        {interventions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No interventions logged yet for this student. Click 'Log Intervention' to record an action.
          </div>
        ) : (
          <div className="space-y-3">
            {interventions.map((item) => (
              <div key={item._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{item.interventionType}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-slate-600">{item.description}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span>Assigned: <strong>{item.assignedFacultyName || 'Faculty'}</strong></span>
                    <span>Started: {new Date(item.startDate).toLocaleDateString()}</span>
                    {item.followUpDate && <span>Follow-up: {new Date(item.followUpDate).toLocaleDateString()}</span>}
                  </div>
                  {item.facultyNotes && (
                    <p className="text-xs bg-white p-2 rounded-lg border border-slate-200 text-slate-700 italic mt-1">
                      "{item.facultyNotes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    className="text-xs py-1 px-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Monitoring">Monitoring</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Intervention Modal Dialog */}
      <Modal
        isOpen={isInterventionModalOpen}
        onClose={() => setIsInterventionModalOpen(false)}
        title={`Log Intervention for ${student.name}`}
      >
        <form onSubmit={handleCreateIntervention} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Intervention Type *</label>
            <select
              value={interventionData.interventionType}
              onChange={(e) => setInterventionData({ ...interventionData, interventionType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Contact Student">Contact Student</option>
              <option value="Academic Counselling">Academic Counselling</option>
              <option value="Remedial Classes">Remedial Classes</option>
              <option value="Faculty Mentoring">Faculty Mentoring</option>
              <option value="Assignment Support">Assignment Support</option>
              <option value="Attendance Follow-up">Attendance Follow-up</option>
              <option value="Performance Monitoring">Performance Monitoring</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description / Plan *</label>
            <textarea
              required
              rows={3}
              value={interventionData.description}
              onChange={(e) => setInterventionData({ ...interventionData, description: e.target.value })}
              placeholder="Detail the support plan or actions discussed with student..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Follow-up Date</label>
            <input
              type="date"
              value={interventionData.followUpDate}
              onChange={(e) => setInterventionData({ ...interventionData, followUpDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Faculty Notes (Optional)</label>
            <textarea
              rows={2}
              value={interventionData.facultyNotes}
              onChange={(e) => setInterventionData({ ...interventionData, facultyNotes: e.target.value })}
              placeholder="Initial observations or student comments..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsInterventionModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md"
            >
              {modalSubmitting ? 'Saving...' : 'Save Intervention Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
