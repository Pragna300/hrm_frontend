import React from 'react';
import { Users, ClipboardList, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

const DashboardCards = ({ stats, role }) => {
  if (!stats) return null;

  const adminCards = [
    { label: 'Total Workforce', value: stats.totalEmployees, icon: <Users />, color: 'blue' },
    { label: 'Tasks Assigned', value: stats.totalTasks, icon: <ClipboardList />, color: 'indigo' },
    { label: 'Pending Tasks', value: stats.pendingTasks, icon: <Clock />, color: 'amber' },
    { label: 'Completed', value: stats.completedTasks, icon: <CheckCircle2 />, color: 'emerald' },
    { label: 'Overdue', value: stats.overdueTasks, icon: <AlertTriangle />, color: 'rose' },
  ];

  const employeeCards = [
    { label: 'My Total Tasks', value: stats.totalTasks, icon: <ClipboardList />, color: 'blue' },
    { label: 'Pending Tasks', value: stats.pendingTasks, icon: <Clock />, color: 'amber' },
    { label: 'Completed', value: stats.completedTasks, icon: <CheckCircle2 />, color: 'emerald' },
    { label: 'Upcoming Deadlines', value: stats.upcomingDeadlines, icon: <AlertTriangle />, color: 'rose' },
  ];

  const cards = role === 'admin' ? adminCards : employeeCards;

  const getColorClasses = (color) => {
    const maps = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      amber: 'bg-amber-50 text-amber-600 border-amber-100',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      rose: 'bg-rose-50 text-rose-600 border-rose-100',
    };
    return maps[color] || maps.blue;
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${role === 'admin' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-all">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getColorClasses(card.color)} group-hover:scale-110 transition-transform`}>
            {React.cloneElement(card.icon, { size: 22 })}
          </div>
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-black text-slate-800">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
