import React from 'react';

const TaskStatusBadge = ({ status }) => {
  const getColors = (s) => {
    switch (s) {
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Overdue':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getColors(status)}`}>
      {status}
    </span>
  );
};

export default TaskStatusBadge;
