import { useEffect, useState } from 'react';
import { Users, UserCheck, Building2, MapPin, ClipboardList, CreditCard, Megaphone } from 'lucide-react';
import { api } from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Alert from '../../components/ui/Alert';

const CompanyOverview = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/company/overview')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <PageHeader
        title="Company dashboard"
        subtitle="Operational snapshot of your organization."
      />
      {error && <Alert type="error">{error}</Alert>}
      {!data ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<Users size={20} />}      label="Employees"      value={`${data.activeEmployees}/${data.totalEmployees}`} sublabel="active / total" color="blue" />
            <StatCard icon={<UserCheck size={20} />}  label="Present today"  value={data.presentToday} sublabel="tap-ins so far" color="green" />
            <StatCard icon={<ClipboardList size={20} />} label="Pending leaves" value={data.pendingLeaves} sublabel="awaiting approval" color="amber" />
            <StatCard icon={<CreditCard size={20} />} label="Payroll runs"   value={data.payrollRunsCount} sublabel="lifetime" color="rose" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <StatCard icon={<Building2 size={20} />} label="Departments" value={data.departments} color="slate" />
            <StatCard icon={<MapPin size={20} />}    label="Locations"   value={data.locations}   color="slate" />
            <StatCard icon={<Megaphone size={20} />} label="Announcements" value={data.announcements.length} color="slate" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-base font-bold text-slate-900">Recent leave requests</h3>
              {data.recentLeaves.length === 0 ? (
                <p className="text-sm text-slate-400">No requests yet.</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {data.recentLeaves.map((r) => (
                    <li key={r.id} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                      <div>
                        <div className="font-semibold text-slate-800">
                          {r.employee.firstName} {r.employee.lastName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {r.leaveType.name} · {new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeForStatus(r.status)}`}>
                        {r.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-base font-bold text-slate-900">Latest announcements</h3>
              {data.announcements.length === 0 ? (
                <p className="text-sm text-slate-400">No announcements yet.</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {data.announcements.map((a) => (
                    <li key={a.id}>
                      <div className="font-semibold text-slate-800">{a.title}</div>
                      <p className="text-xs text-slate-500 line-clamp-2">{a.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

function badgeForStatus(status) {
  switch (status) {
    case 'approved':  return 'bg-emerald-100 text-emerald-700';
    case 'rejected':  return 'bg-rose-100 text-rose-700';
    case 'cancelled': return 'bg-slate-200 text-slate-700';
    default:          return 'bg-amber-100 text-amber-700';
  }
}

export default CompanyOverview;
