import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import FormField, { InputClass } from '../../components/ui/FormField';

const blank = { leaveTypeId: '', startDate: '', endDate: '', reason: '' };

const EmployeeLeavesPage = () => {
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState([]);
  const [types, setTypes] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [reqs, bals, ts] = await Promise.all([
        api.get('/leaves/me'),
        api.get('/leaves/me/balances'),
        api.get('/leaves/types'),
      ]);
      setRequests(reqs.data || []);
      setBalances(bals.data || []);
      setTypes(ts.data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function submit() {
    try {
      const res = await api.post('/leaves/me', form);
      setMessage(res.message || 'Submitted');
      setCreating(false); setForm(blank);
      await load();
    } catch (err) { setError(err.message); }
  }
  async function cancel(id) {
    if (!confirm('Cancel this request?')) return;
    try { await api.post(`/leaves/me/${id}/cancel`); await load(); }
    catch (err) { setError(err.message); }
  }

  const columns = useMemo(() => ([
    { key: 'type', header: 'Type', render: (r) => r.leaveType?.name || '—' },
    {
      key: 'period',
      header: 'Period',
      render: (r) => `${new Date(r.startDate).toLocaleDateString()} → ${new Date(r.endDate).toLocaleDateString()}`,
    },
    { key: 'totalDays', header: 'Days', render: (r) => Number(r.totalDays).toFixed(1) },
    { key: 'reason', header: 'Reason', render: (r) => r.reason || '—' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: '',
      render: (r) =>
        r.status === 'pending'
          ? <Button size="sm" variant="ghost" onClick={() => cancel(r.id)}>Cancel</Button>
          : '—',
    },
  ]), []);

  return (
    <div>
      <PageHeader
        title="My leaves"
        subtitle="Request time off and track your balances."
        actions={<Button onClick={() => setCreating(true)}>+ Request leave</Button>}
      />
      {error   && <Alert type="error"   onClose={() => setError('')}>{error}</Alert>}
      {message && <Alert type="success" onClose={() => setMessage('')}>{message}</Alert>}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {balances.map((b) => (
          <div key={b.leaveTypeId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{b.leaveTypeName}</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">{b.remaining}</span>
              <span className="text-sm text-slate-500">/ {b.allocated}</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{ width: `${b.allocated ? (b.used / b.allocated) * 100 : 0}%`, background: b.colorHex || '#3174ad' }}
              />
            </div>
          </div>
        ))}
      </div>

      {loading ? <p className="text-sm text-slate-400">Loading…</p>
        : <DataTable columns={columns} rows={requests} emptyText="No requests" />}

      <Modal
        open={creating}
        title="Request leave"
        onClose={() => setCreating(false)}
        footer={<>
          <Button variant="secondary" onClick={() => setCreating(false)}>Cancel</Button>
          <Button onClick={submit}>Submit</Button>
        </>}
      >
        <div className="grid gap-3">
          <FormField label="Leave type">
            <select className={InputClass} value={form.leaveTypeId} onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}>
              <option value="">— Select —</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start date"><input type="date" className={InputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></FormField>
            <FormField label="End date"><input type="date" className={InputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></FormField>
          </div>
          <FormField label="Reason"><textarea rows={3} className={InputClass} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></FormField>
        </div>
      </Modal>
    </div>
  );
};

function StatusBadge({ status }) {
  const map = {
    approved:  ['Approved',  'bg-emerald-100 text-emerald-700'],
    rejected:  ['Rejected',  'bg-rose-100 text-rose-700'],
    cancelled: ['Cancelled', 'bg-slate-200 text-slate-700'],
    pending:   ['Pending',   'bg-amber-100 text-amber-700'],
  };
  const [label, cls] = map[status] || map.pending;
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}

export default EmployeeLeavesPage;
