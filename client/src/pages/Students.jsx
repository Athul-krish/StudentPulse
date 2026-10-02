import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Card } from '../components/common/Card';
import { RiskBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Search, UserPlus, Filter, Edit, Trash2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Students = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [semester, setSemester] = useState('ALL');
  const [riskLevel, setRiskLevel] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    department: 'Computer Science',
    semester: 'S4',
    program: 'MCA',
    batch: '2023-2025',
    phone: '',
    enrollmentYear: 2023
  });
  const [formError, setFormError] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await API.get('/students', {
        params: { search, department, semester, riskLevel }
      });
      setStudents(res.data.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, department, semester, riskLevel]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      studentId: '',
      name: '',
      email: '',
      department: 'Computer Science',
      semester: 'S4',
      program: 'MCA',
      batch: '2023-2025',
      phone: '',
      enrollmentYear: 2023
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (st) => {
    setEditingStudent(st);
    setFormData({
      studentId: st.studentId,
      name: st.name,
      email: st.email,
      department: st.department,
      semester: st.semester,
      program: st.program || 'MCA',
      batch: st.batch || '2023-2025',
      phone: st.phone || '',
      enrollmentYear: st.enrollmentYear || 2023
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingStudent) {
        await API.put(`/students/${editingStudent._id}`, formData);
      } else {
        await API.post('/students', formData);
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Operation failed. Please check inputs.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete student '${name}' and all associated records?`)) {
      try {
        await API.delete(`/students/${id}`);
        fetchStudents();
      } catch (err) {
        alert(err.response?.data?.error || 'Delete failed.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Student Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Manage institutional student profiles and risk categories</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Data Science">Data Science</option>
          </select>
        </div>

        <div>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Semesters</option>
            <option value="S1">Semester 1 (S1)</option>
            <option value="S2">Semester 2 (S2)</option>
            <option value="S3">Semester 3 (S3)</option>
            <option value="S4">Semester 4 (S4)</option>
            <option value="S5">Semester 5 (S5)</option>
            <option value="S6">Semester 6 (S6)</option>
          </select>
        </div>

        <div>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">HIGH Risk</option>
            <option value="MEDIUM">MEDIUM Risk</option>
            <option value="LOW">LOW Risk</option>
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <Card>
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading student records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-slate-400">
                      No student records found matching current search/filters.
                    </td>
                  </tr>
                ) : (
                  students.map((st) => (
                    <tr key={st._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{st.studentId}</td>
                      <td className="py-3 px-4">
                        <Link to={`/students/${st._id}`} className="font-bold text-indigo-600 hover:underline">
                          {st.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-medium">{st.department}</td>
                      <td className="py-3 px-4">{st.semester}</td>
                      <td className="py-3 px-4 text-slate-500">{st.email}</td>
                      <td className="py-3 px-4">
                        <RiskBadge level={st.latestRiskLevel} />
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{st.latestRiskScore} / 100</td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <Link
                          to={`/students/${st._id}`}
                          className="p-1.5 inline-block text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="View Profile"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user?.role === 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(st._id, st.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? `Edit Student: ${editingStudent.name}` : 'Add New Student'}
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student ID *</label>
              <input
                type="text"
                required
                disabled={!!editingStudent}
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="e.g. CS2024099"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Kumar"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="rahul@studentpulse.local"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Data Science">Data Science</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester *</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
                <option value="S4">S4</option>
                <option value="S5">S5</option>
                <option value="S6">S6</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batch</label>
              <input
                type="text"
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                placeholder="2023-2025"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md"
            >
              {editingStudent ? 'Save Changes' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
