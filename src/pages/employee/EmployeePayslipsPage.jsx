import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { formatInr } from '../../lib/formatMoney';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Alert from '../../components/ui/Alert';

const EmployeePayslipsPage = () => {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payroll/me')
      .then((res) => setRows(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: 'period',
      header: 'Period',
      render: (r) => {
        const run = r.payrollRun;
        return `${new Date(run.periodStart).toLocaleDateString()} → ${new Date(run.periodEnd).toLocaleDateString()}`;
      },
    },
    { key: 'baseSalary', header: 'Base',       render: (r) => formatInr(r.baseSalary) },
    { key: 'allowances', header: 'Allowances', render: (r) => formatInr(r.allowances) },
    { key: 'deductions', header: 'Deductions', render: (r) => formatInr(r.deductions) },
    { key: 'netPay',     header: 'Net Pay',    render: (r) => <span className="font-bold text-slate-900">{formatInr(r.netPay)}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          r.payrollRun.status === 'finalized' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {r.payrollRun.status}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="My payslips" subtitle="All your payslips, oldest at the bottom." />
      {error && <Alert type="error">{error}</Alert>}
      {loading
        ? <p className="text-sm text-slate-400">Loading…</p>
        : <DataTable columns={columns} rows={rows} emptyText="No payslips yet" />}
    </div>
  );
};

export default EmployeePayslipsPage;
