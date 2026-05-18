import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

const CompanyLeavesPage = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const path = filter ? `/leaves?status=${filter}` : '/leaves';
      const res = await api.get(path);
      setRequests(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  async function decide(id, decision) {
    try {
      const res = await api.post(`/leaves/${id}/decide`, { decision });
      setMessage(res.message || 'Updated');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }



  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-800">{r.employee.firstName} {r.employee.lastName}</div>
          <div className="text-xs text-slate-500">{r.employee.employeeCode}</div>
        </div>
      ),
    },
    { key: 'type', header: 'Type', render: (r) => r.leaveType?.name || '—' },
    {
      key: 'period',
      header: 'Period',
      render: (r) =>
        `${new Date(r.startDate).toLocaleDateString()} → ${new Date(r.endDate).toLocaleDateString()}`,
    },
    { key: 'totalDays', header: 'Days', render: (r) => Number(r.totalDays).toFixed(1) },
    { key: 'reason',   header: 'Reason', render: (r) => r.reason || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <span className={badge(r.status)}>{r.status}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) =>
        r.status === 'pending' ? (
          <div className="flex gap-2">
            <Button size="sm" variant="success" onClick={() => decide(r.id, 'approve')}>Approve</Button>
            <Button size="sm" variant="danger"  onClick={() => decide(r.id, 'reject')}>Reject</Button>
          </div>
        ) : '—',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Leave requests"
        subtitle="Review, approve and reject employee leave requests."
        actions={
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Filter:</span>
            {STATUSES.concat(['']).map((s) => (
              <button
                key={s || 'all'}
                onClick={() => setFilter(s)}
                className={`rounded px-3 py-1 text-xs font-semibold capitalize ${
                  filter === s ? 'bg-slate-900 text-white' : 'bg-white border border-slate-300 text-slate-600'
                }`}
              >
                {s || 'all'}
              </button>
            ))}
          </div>
        }
      />
      {error   && <Alert type="error"   onClose={() => setError('')}>{error}</Alert>}
      {message && <Alert type="success" onClose={() => setMessage('')}>{message}</Alert>}
      {loading ? <p className="text-sm text-slate-400">Loading…</p> : (
        <DataTable columns={columns} rows={requests} emptyText="No requests" />
      )}
    </div>
  );
};

function badge(status) {
  const map = {
    approved: 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700',
    rejected: 'rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700',
    cancelled: 'rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700',
    pending: 'rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700',
  };
  return map[status] || map.pending;
}

export default CompanyLeavesPage;
