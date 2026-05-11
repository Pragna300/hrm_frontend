import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  IndianRupee,
  Receipt,
  TrendingUp,
  FileWarning,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../../api/client';
import { formatInr } from '../../lib/formatMoney';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Alert from '../../components/ui/Alert';

const PIE_COLORS = ['#15803d', '#b45309', '#b91c1c', '#1e3a5f', '#7c3aed', '#64748b'];

const OwnerOverview = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/super-admin/overview')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.message));
  }, []);

  const planChart = stats
    ? Object.entries(stats.subscriptionsByPlan || {}).map(([name, value]) => ({ name, value }))
    : [];

  const companyStatusChart = stats
    ? [
        { name: 'Active', value: stats.activeOrgs },
        { name: 'Suspended', value: stats.suspendedOrgs },
        { name: 'Cancelled', value: stats.cancelledOrgs },
      ].filter((d) => d.value > 0)
    : [];

  const subStatusRows = stats
    ? Object.entries(stats.subscriptionsByStatus || {}).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div>
      <PageHeader
        title="Platform Overview"
        subtitle="Aggregate health, billing exposure and tenant mix across all customer companies."
      />
      {error && <Alert type="error">{error}</Alert>}
      {!stats ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              icon={<Building2 size={20} />}
              label="Companies"
              value={stats.orgCount}
              sublabel={`${stats.activeOrgs} active · ${stats.suspendedOrgs} suspended · ${stats.cancelledOrgs} cancelled`}
              color="blue"
            />
            <StatCard
              icon={<Users size={20} />}
              label="Tenant portal users"
              value={stats.userCount}
              sublabel="Users linked to a company (excludes platform admin)"
              color="green"
            />
            <StatCard
              icon={<TrendingUp size={20} />}
              label="MRR (normalized)"
              value={formatInr(stats.mrr, { maximumFractionDigits: 0 })}
              sublabel={`${stats.activeSubscriptions} active / trialing subscriptions`}
              color="amber"
            />
            <StatCard
              icon={<IndianRupee size={20} />}
              label="Collected revenue"
              value={formatInr(stats.paidRevenue, { maximumFractionDigits: 0 })}
              sublabel={`${stats.paidInvoices} paid invoices`}
              color="rose"
            />
            <StatCard
              icon={<FileWarning size={20} />}
              label="Outstanding invoices"
              value={formatInr(stats.outstandingRevenue || 0, { maximumFractionDigits: 0 })}
              sublabel={`${stats.outstandingInvoices || 0} issued · awaiting payment`}
              color="violet"
            />
            <StatCard
              icon={<Receipt size={20} />}
              label="Employees (all tenants)"
              value={stats.employeeCount}
              sublabel="Across every organization on the platform"
              color="slate"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <h3 className="mb-4 text-base font-bold text-slate-900">Subscriptions by plan</h3>
              {planChart.length === 0 ? (
                <p className="text-sm text-slate-400">No active subscriptions yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={planChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1e3a5f" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-slate-900">
                <PieChartIcon size={18} className="text-slate-500" />
                Companies by status
              </h3>
              {companyStatusChart.length === 0 ? (
                <p className="text-sm text-slate-400">No companies yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={companyStatusChart}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={78}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {companyStatusChart.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <p className="mt-2 text-xs text-slate-500">
                Use <Link className="font-semibold text-sky-700 underline" to="/owner/companies">Companies</Link> to
                activate, suspend or delete tenants.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-base font-bold text-slate-900">Subscription records by status</h3>
              {subStatusRows.length === 0 ? (
                <p className="text-sm text-slate-400">No subscription rows.</p>
              ) : (
                <ul className="divide-y divide-slate-100 text-sm">
                  {subStatusRows.map(([status, count]) => (
                    <li key={status} className="flex justify-between py-2">
                      <span className="font-medium capitalize text-slate-700">{status.replace(/_/g, ' ')}</span>
                      <span className="tabular-nums text-slate-900">{count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-base font-bold text-slate-900">Recently registered companies</h3>
              {!stats.recentCompanies?.length ? (
                <p className="text-sm text-slate-400">No companies yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {stats.recentCompanies.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-2 last:border-0">
                      <div>
                        <div className="font-semibold text-slate-800">{c.name}</div>
                        <div className="text-xs text-slate-500">
                          {c.slug} · {c._count?.employees ?? 0} employees
                          {c.sector ? ` · ${c.sector}` : ''}
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-700">
                        {c.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-base font-bold text-slate-900">Quick links</h3>
            <ul className="grid gap-3 text-sm sm:grid-cols-2">
              <li>
                <Link to="/owner/companies" className="flex items-center gap-2 font-medium text-sky-800 hover:underline">
                  <Building2 size={16} /> Manage companies (status & delete)
                </Link>
              </li>
              <li>
                <Link to="/owner/invoices" className="flex items-center gap-2 font-medium text-sky-800 hover:underline">
                  <Receipt size={16} /> Invoices & collections
                </Link>
              </li>
              <li>
                <Link to="/owner/plans" className="flex items-center gap-2 font-medium text-sky-800 hover:underline">
                  <TrendingUp size={16} /> Plans & pricing
                </Link>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerOverview;
