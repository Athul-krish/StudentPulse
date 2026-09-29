import React from 'react';

export const RiskBadge = ({ level, score }) => {
  let bg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (level === 'HIGH') {
    bg = 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
  } else if (level === 'MEDIUM') {
    bg = 'bg-amber-100 text-amber-800 border-amber-300';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${level === 'HIGH' ? 'bg-rose-600' : (level === 'MEDIUM' ? 'bg-amber-600' : 'bg-emerald-600')}`}></span>
      {level} RISK {score !== undefined && `(${score}/100)`}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-300';
  if (status === 'Planned') style = 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'In Progress') style = 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'Completed') style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'Monitoring') style = 'bg-indigo-50 text-indigo-700 border-indigo-200';

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${style}`}>
      {status}
    </span>
  );
};
