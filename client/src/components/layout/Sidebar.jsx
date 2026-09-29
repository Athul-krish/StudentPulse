import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  AlertCircle,
  FileCheck2,
  BarChart3,
  UserCog,
  Settings,
  User
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Risk Assessment', path: '/risk-assessment', icon: AlertCircle },
    { name: 'Interventions', path: '/interventions', icon: FileCheck2 },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    ...(user?.role === 'ADMIN' ? [
      { name: 'User Management', path: '/users', icon: UserCog },
      { name: 'System Settings', path: '/settings', icon: Settings },
    ] : []),
    { name: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-57px)] flex flex-col justify-between p-4">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Main Menu</p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500">
        <p className="font-semibold text-slate-700 mb-1">Decision Support System</p>
        <p>Faculty remains responsible for final intervention & academic decisions.</p>
      </div>
    </aside>
  );
};
