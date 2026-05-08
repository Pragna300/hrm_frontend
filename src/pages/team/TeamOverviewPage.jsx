import { useEffect, useState } from 'react';
import { Users, Clock } from 'lucide-react';
import { api } from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/ui/DataTable';
import Alert from '../../components/ui/Alert';

function fmtMins(m) {
  if (!m && m !== 0) return '—';
  const h = Math.floor(m / 60);
  const r = Math.round(m - h * 60);
  return `${h}h ${r}m`;
}

const TeamOverviewPage = () => {
  const [team, setTeam] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/team/today')
      .then((res) => setTeam(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const presentCount = team.filter((m) => m.openSegment || (m.segments && m.segments.length > 0)).length;

  const columns = [
    {
      key: 'name',
      header: 'Member',
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-800">{r.firstName} {r.lastName}</div>
          <div className="text-xs text-slate-500">{r.employeeCode}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) =>
        r.openSegment ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Active</span>
        ) : r.segments?.length ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">On break</span>
        ) : (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">Not in</span>
        ),
    },
    { key: 'activeMinutes', header: 'Worked', render: (r) => fmtMins(r.activeMinutes) },
    { key: 'breakMinutes',  header: 'Break',  render: (r) => fmtMins(r.breakMinutes) },
  ];

  return (
    <div>
      <PageHeader title="My team — today" subtitle="Live attendance for the people in your company." />
      {error && <Alert type="error">{error}</Alert>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={<Users size={20} />} label="Members" value={team.length} color="blue" />
        <StatCard icon={<Clock size={20} />} label="Currently working" value={presentCount} color="green" />
      </div>
      <div className="mt-6">
        {loading
          ? <p className="text-sm text-slate-400">Loading…</p>
          : <DataTable columns={columns} rows={team} emptyText="No team members yet" />}
      </div>
    </div>
  );
};

export default TeamOverviewPage;
