import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Card } from '../components/common/Card';
import { RiskBadge } from '../components/common/Badge';
import {
  Users,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  ChevronRight,
  TrendingDown,
  Bell
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sumRes, alertRes] = await Promise.all([
          API.get('/dashboard/summary'),
          API.get('/dashboard/alerts')
        ]);
        setSummary(sumRes.data.data);
        setAlerts(alertRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const pieData = summary ? [
    { name: 'Low Risk', value: summary.lowRisk, color: '#10b981' },
    { name: 'Medium Risk', value: summary.mediumRisk, color: '#f59e0b' },
    { name: 'High Risk', value: summary.highRisk, color: '#ef4444' }
  ] : [];

  const filteredAttentionList = summary?.studentsRequiringAttention?.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          st.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          st.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || st.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Early Warning Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time academic dropout risk indicators and active support interventions</p>
        </div>
        <Link
          to="/risk-assessment"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Run New Assessment</span>
        </Link>
      </div>

      {/* Top Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</p>
            <h3 className="text-2xl font-bold text-slate-800">{summary?.totalStudents || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider">High Risk</p>
            <h3 className="text-2xl font-bold text-rose-600">{summary?.highRisk || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Medium Risk</p>
            <h3 className="text-2xl font-bold text-amber-600">{summary?.mediumRisk || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Low Risk</p>
            <h3 className="text-2xl font-bold text-emerald-600">{summary?.lowRisk || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Active Interventions</p>
            <h3 className="text-2xl font-bold text-indigo-600">{summary?.activeInterventions || 0}</h3>
          </div>
        </div>
      </div>

      {/* Middle Grid: Risk Distribution & System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <Card title="Risk Level Distribution" subtitle="Proportion of students across current risk categories" className="lg:col-span-1">
          <div className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs font-semibold">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span>Low</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span>Medium</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500"></span>High</div>
            </div>
          </div>
        </Card>

        {/* Operational System Alerts */}
        <Card title="System Operational Alerts" subtitle="Action items generated from student risk changes" className="lg:col-span-2">
          {alerts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No pending priority alerts. All high risk students have active intervention plans.
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${alert.severity === 'HIGH' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800">{alert.title}</p>
                      <span className="text-[10px] text-slate-400">{new Date(alert.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{alert.message}</p>
                    <Link to={`/students/${alert.studentId}`} className="text-indigo-600 hover:underline font-semibold mt-1 inline-block">
                      View Student Profile &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Table: Students Requiring Immediate Attention */}
      <Card
        title="Students Requiring Attention"
        subtitle="Students identified with elevated risk scores"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44"
              />
            </div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Risks</option>
              <option value="HIGH">HIGH Risk</option>
              <option value="MEDIUM">MEDIUM Risk</option>
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Top Contributing Factor</th>
                <th className="py-3 px-4">Last Assessment</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttentionList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400">
                    No students match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAttentionList.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{st.name}</div>
                      <div className="text-[10px] text-slate-400">{st.studentId}</div>
                    </td>
                    <td className="py-3 px-4 font-medium">{st.department}</td>
                    <td className="py-3 px-4">{st.semester}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{st.riskScore} / 100</td>
                    <td className="py-3 px-4">
                      <RiskBadge level={st.riskLevel} />
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{st.topFactor}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(st.lastAssessment).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/students/${st._id}`}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-xs py-1 px-2 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
