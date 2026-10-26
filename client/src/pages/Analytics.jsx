import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Card } from '../components/common/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/risk/statistics');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load risk analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const { summary, semesterStats } = stats || {};

  const pieData = summary ? [
    { name: 'Low Risk', value: summary.lowRisk, color: '#10b981' },
    { name: 'Medium Risk', value: summary.mediumRisk, color: '#f59e0b' },
    { name: 'High Risk', value: summary.highRisk, color: '#ef4444' }
  ] : [];

  const semChartData = (semesterStats || []).map(ss => ({
    semester: ss._id,
    HighRisk: ss.highRisk,
    MediumRisk: ss.mediumRisk,
    LowRisk: ss.lowRisk,
    AvgRiskScore: Math.round(ss.avgScore)
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Risk Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">Risk pattern trends across semesters for students in your department</p>
      </div>

      {/* Semester Comparison & Overall Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Risk Scores Across Semesters" subtitle="Average risk score (0-100) per semester cohort">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={semChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="semester" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="AvgRiskScore" fill="#6366f1" radius={[6, 6, 0, 0]} name="Average Risk Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Overall Risk Distribution" subtitle="Student population risk breakdown">
          <div className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
