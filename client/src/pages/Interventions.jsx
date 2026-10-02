import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Card } from '../components/common/Card';
import { RiskBadge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { FileCheck2, PlusCircle, Filter, Calendar, CheckSquare, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Interventions = () => {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Edit Modal State
  const [editingIntervention, setEditingIntervention] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: 'Planned',
    outcome: '',
    facultyNotes: '',
    followUpDate: ''
  });

  const fetchInterventions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/interventions', {
        params: { status: statusFilter, type: typeFilter }
      });
      setInterventions(res.data.data);
    } catch (err) {
      console.error('Failed to load interventions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, [statusFilter, typeFilter]);

  const handleOpenEdit = (item) => {
    setEditingIntervention(item);
    setEditFormData({
      status: item.status,
      outcome: item.outcome || '',
      facultyNotes: item.facultyNotes || '',
      followUpDate: item.followUpDate ? new Date(item.followUpDate).toISOString().split('T')[0] : ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/interventions/${editingIntervention._id}`, editFormData);
      setIsEditModalOpen(false);
      fetchInterventions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update intervention.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this intervention record?')) {
      try {
        await API.delete(`/interventions/${id}`);
        fetchInterventions();
      } catch (err) {
        alert('Failed to delete intervention.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Intervention Support Board</h1>
          <p className="text-xs text-slate-500 mt-1">Track faculty support plans, academic progress reviews, and outcome monitoring</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Filter Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Monitoring">Monitoring</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Filter Intervention Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Intervention Types</option>
            <option value="Contact Student">Contact Student</option>
            <option value="Academic Counselling">Academic Counselling</option>
            <option value="Remedial Classes">Remedial Classes</option>
            <option value="Faculty Mentoring">Faculty Mentoring</option>
            <option value="Assignment Support">Assignment Support</option>
            <option value="Attendance Follow-up">Attendance Follow-up</option>
            <option value="Performance Monitoring">Performance Monitoring</option>
          </select>
        </div>
      </div>

      {/* Intervention Board Table */}
      <Card>
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading intervention logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Intervention Type</th>
                  <th className="py-3 px-4">Assigned Faculty</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Follow-up Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {interventions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-slate-400">
                      No intervention records found.
                    </td>
                  </tr>
                ) : (
                  interventions.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        {item.studentId ? (
                          <Link to={`/students/${item.studentId._id}`} className="font-bold text-indigo-600 hover:underline">
                            {item.studentId.name} ({item.studentId.studentId})
                          </Link>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {item.studentId && <RiskBadge level={item.studentId.latestRiskLevel} />}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{item.interventionType}</td>
                      <td className="py-3 px-4">{item.assignedFacultyName || 'Faculty'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {item.followUpDate ? new Date(item.followUpDate).toLocaleDateString() : 'None set'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                        >
                          Update Status / Outcome
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg inline-block"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Status & Outcome Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Intervention Progress"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Intervention Status *</label>
            <select
              value={editFormData.status}
              onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Monitoring">Monitoring</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Follow-up Date</label>
            <input
              type="date"
              value={editFormData.followUpDate}
              onChange={(e) => setEditFormData({ ...editFormData, followUpDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Intervention Outcome</label>
            <textarea
              rows={2}
              value={editFormData.outcome}
              onChange={(e) => setEditFormData({ ...editFormData, outcome: e.target.value })}
              placeholder="Record final or progress outcome (e.g. Student improved attendance by 15%)..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Faculty Progress Notes</label>
            <textarea
              rows={2}
              value={editFormData.facultyNotes}
              onChange={(e) => setEditFormData({ ...editFormData, facultyNotes: e.target.value })}
              placeholder="Ongoing notes..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md"
            >
              Update Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
