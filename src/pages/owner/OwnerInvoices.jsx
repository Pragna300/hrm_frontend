import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { formatInr } from '../../lib/formatMoney';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Alert from '../../components/ui/Alert';

const OwnerInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/super-admin/invoices')
      .then((res) => setInvoices(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'number',       header: 'Invoice #', render: (r) => <span className="font-mono text-xs text-slate-700">{r.number}</span> },
    { key: 'organization', header: 'Company',    render: (r) => r.organization?.name || '—' },
    {
      key: 'amount',
      header: 'Amount',
      render: (r) => formatInr(r.amount),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => {
        const cls = r.status === 'paid'
          ? 'bg-emerald-100 text-emerald-700'
          : r.status === 'void'
            ? 'bg-slate-200 text-slate-700'
            : 'bg-amber-100 text-amber-700';
        return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{r.status}</span>;
      },
    },
    {
      key: 'period',
      header: 'Period',
      render: (r) =>
        `${new Date(r.periodStart).toLocaleDateString()} → ${new Date(r.periodEnd).toLocaleDateString()}`,
    },
    {
      key: 'issuedAt',
      header: 'Issued',
      render: (r) => new Date(r.issuedAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <PageHeader title="Invoices" subtitle="Issued invoices across all customers." />
      {error && <Alert type="error">{error}</Alert>}
      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <DataTable columns={columns} rows={invoices} emptyText="No invoices yet" />
      )}
    </div>
  );
};

export default OwnerInvoices;
