import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { formatInr } from '../../lib/formatMoney';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import FormField, { InputClass } from '../../components/ui/FormField';

const today = () => new Date().toISOString().slice(0, 10);

const CompanyPayrollPage = () => {
  const [runs, setRuns] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [period, setPeriod] = useState({ periodStart: today(), periodEnd: today() });
  const [active, setActive] = useState(null); // active run with items

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/payroll');
      setRuns(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function loadDetail(id) {
    try {
      const res = await api.get(`/payroll/${id}`);
      setActive(res.data);
    } catch (err) { setError(err.message); }
  }

  async function createRun() {
    try {
      const res = await api.post('/payroll', period);
      setMessage(res.message || 'Created');
      setCreating(false);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function finalize(id) {
    if (!confirm('Finalize this payroll run? Payslip emails will be sent.')) return;
    try {
      const res = await api.post(`/payroll/${id}/finalize`);
      setMessage(res.message || 'Finalized');
      await load();
      if (active?.id === id) await loadDetail(id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateItem(itemId, patch) {
    try {
      await api.put(`/payroll/items/${itemId}`, patch);
      if (active) await loadDetail(active.id);
    } catch (err) { setError(err.message); }
  }

  if (active) {
    return (
      <PayrollDetailView
        run={active}
        onBack={() => setActive(null)}
        onUpdate={updateItem}
        onFinalize={() => finalize(active.id)}
      />
    );
  }

  const columns = [
    {
      key: 'period',
      header: 'Period',
      render: (r) =>
        `${new Date(r.periodStart).toLocaleDateString()} → ${new Date(r.periodEnd).toLocaleDateString()}`,
    },
    { key: 'count', header: 'Employees', render: (r) => r._count.items },
    {
      key: 'totalAmount',
      header: 'Total',
      render: (r) => formatInr(r.totalAmount),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          r.status === 'finalized' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {r.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => loadDetail(r.id)}>Open</Button>
          {r.status !== 'finalized' && (
            <Button size="sm" variant="success" onClick={() => finalize(r.id)}>Finalize</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payroll"
        subtitle="Run monthly payroll, edit items and email payslips."
        actions={<Button onClick={() => setCreating(true)}>+ New run</Button>}
      />
      {error   && <Alert type="error"   onClose={() => setError('')}>{error}</Alert>}
      {message && <Alert type="success" onClose={() => setMessage('')}>{message}</Alert>}
      {loading ? <p className="text-sm text-slate-400">Loading…</p> : (
        <DataTable columns={columns} rows={runs} emptyText="No runs yet" />
      )}

      <Modal
        open={creating}
        title="New payroll run"
        onClose={() => setCreating(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={createRun}>Create</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Period start"><input type="date" className={InputClass} value={period.periodStart} onChange={(e) => setPeriod((p) => ({ ...p, periodStart: e.target.value }))} /></FormField>
          <FormField label="Period end"><input type="date" className={InputClass} value={period.periodEnd}   onChange={(e) => setPeriod((p) => ({ ...p, periodEnd:   e.target.value }))} /></FormField>
        </div>
        <p className="mt-3 text-xs text-slate-500">A draft item will be created for every active employee using their <code>monthlyCtc</code> as the base salary.</p>
      </Modal>
    </div>
  );
};

const PayrollDetailView = ({ run, onBack, onUpdate, onFinalize }) => (
  <div>
    <PageHeader
      title={`Payroll · ${new Date(run.periodStart).toLocaleDateString()} → ${new Date(run.periodEnd).toLocaleDateString()}`}
      subtitle={`Status: ${run.status} · Total ${formatInr(run.totalAmount)}`}
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onBack}>Back</Button>
          {run.status !== 'finalized' && <Button variant="success" onClick={onFinalize}>Finalize</Button>}
        </div>
      }
    />
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-4 py-3 text-left">Employee</th>
            <th className="px-4 py-3 text-right">Base</th>
            <th className="px-4 py-3 text-right">Allowances</th>
            <th className="px-4 py-3 text-right">Deductions</th>
            <th className="px-4 py-3 text-right">Net</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {run.items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3 align-top">
                <div className="font-semibold text-slate-800">{item.employee.firstName} {item.employee.lastName}</div>
                <div className="text-xs text-slate-500">{item.employee.employeeCode}</div>
              </td>
              {['baseSalary', 'allowances', 'deductions'].map((field) => (
                <td key={field} className="px-4 py-3 text-right">
                  <input
                    type="number"
                    defaultValue={Number(item[field])}
                    disabled={run.status === 'finalized'}
                    onBlur={(e) => onUpdate(item.id, { [field]: Number(e.target.value) })}
                    className="w-28 rounded border border-slate-300 px-2 py-1 text-right text-sm"
                  />
                </td>
              ))}
              <td className="px-4 py-3 text-right font-bold text-slate-900">{formatInr(item.netPay)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default CompanyPayrollPage;
