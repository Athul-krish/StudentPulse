import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { User, Shield, Building, Mail, Calendar } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">User Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Institutional account credentials and system privileges</p>
      </div>

      <Card>
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-indigo-200">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-200">
              {user.role} &bull; {user.department}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Email Address</span>
            <div className="flex items-center gap-2 font-medium text-slate-800 text-sm">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user.email}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Assigned Role</span>
            <div className="flex items-center gap-2 font-medium text-slate-800 text-sm">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>{user.role}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Department</span>
            <div className="flex items-center gap-2 font-medium text-slate-800 text-sm">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{user.department}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Account ID</span>
            <div className="font-mono text-slate-600 text-xs">
              {user.id || user._id}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
