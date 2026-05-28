import { useNavigate } from 'react-router-dom';
import { Building2, CalendarDays } from 'lucide-react';
import ReportCard from '../../components/reports/ReportCard';

export default function ReportsDashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Department Reports',
      description: 'View departments and employees within the organization.',
      icon: <Building2 size={24} />,
      onClick: () => navigate('/company/reports/departments'),
    },
    {
      title: 'Attendance Reports',
      description: 'View employee attendance reports and analytics.',
      icon: <CalendarDays size={24} />,
      onClick: () => navigate('/company/reports/attendance'),
    },
  ];


  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Reports</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Reports Dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">
            Explore department performance, attendance analytics, and registration reports from a single reporting hub.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {cards.map((card) => (
          <ReportCard key={card.title} title={card.title} description={card.description} icon={card.icon} onClick={card.onClick} />
        ))}
      </div>
    </div>
  );
}

