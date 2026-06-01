import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { formatInr } from '../../lib/formatMoney';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/ui/DataTable';
import Alert from '../../components/ui/Alert';
import { CreditCard, FileText, Calendar } from 'lucide-react';

const CompanyBillingPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/company/billing')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <Alert type="error">{error}</Alert>;
  if (!data)  return <p className="text-sm text-slate-400">Loading…</p>;

  const sub = data.subscriptions[0];
  const plan = sub?.plan;

  return (
    <div>
      <PageHeader
        title="Billing"
        subtitle="Your subscription, invoices and payment history."
        actions={
          <button
            onClick={() => window.location.href = '/company/subscription'}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Manage Subscription
          </button>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<CreditCard size={20} />}
          label="Current plan"
          value={plan?.name || '—'}
          sublabel={plan ? `${formatInr(sub.unitAmount)} / ${sub.billingCycle}` : '—'}
          color="blue"
        />
        <StatCard
          icon={<Calendar size={20} />}
          label="Renews on"
          value={sub ? new Date(sub.currentEnd).toLocaleDateString() : '—'}
          sublabel={sub?.status}
          color="amber"
        />
        <StatCard
          icon={<FileText size={20} />}
          label="Invoices"
          value={data.invoices.length}
          color="slate"
        />
      </div>

      <h3 className="mt-6 mb-3 text-base font-bold text-slate-900">Invoice history</h3>
      <DataTable
        columns={[
          { key: 'number', header: 'Invoice #', render: (r) => <span className="font-mono text-xs">{r.number}</span> },
          { key: 'amount', header: 'Amount', render: (r) => formatInr(r.amount) },
          { key: 'status', header: 'Status', render: (r) => r.status },
          { key: 'period', header: 'Period', render: (r) => `${new Date(r.periodStart).toLocaleDateString()} → ${new Date(r.periodEnd).toLocaleDateString()}` },
          { key: 'issuedAt', header: 'Issued', render: (r) => new Date(r.issuedAt).toLocaleDateString() },
        ]}
        rows={data.invoices}
        emptyText="No invoices yet"
      />
    </div>
  );
};

export default CompanyBillingPage;
