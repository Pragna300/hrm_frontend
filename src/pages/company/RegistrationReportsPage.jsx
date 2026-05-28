import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  TrendingUp,
  CreditCard,
  Briefcase,
  Download,
  Search,
  RefreshCw,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Percent,
  Receipt,
  User,
  Users,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  fetchRegistrationOverview,
  fetchRegistrationCharts,
  fetchRegistrationTable,
  fetchRegistrationFinancials,
  exportRegistrationReport,
} from '../../api/registrationReportsApi';

const COLORS = {
  Admin: '#3b82f6', // Blue
  Employee: '#06b6d4', // Cyan
  Manager: '#8b5cf6', // Purple
  Accountant: '#10b981', // Green
  Revenue: '#f59e0b', // Orange
  Outstanding: '#ec4899', // Pink
};

const PIE_COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981'];

export default function RegistrationReportsPage() {
  const navigate = useNavigate();

  // Filters state
  const [granularity, setGranularity] = useState('monthly');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(0); // Start of current year
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Dynamic filter state for trigger
  const [appliedFilters, setAppliedFilters] = useState({
    granularity: 'monthly',
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Dashboard Data State
  const [overview, setOverview] = useState(null);
  const [charts, setCharts] = useState(null);
  const [table, setTable] = useState(null);
  const [financials, setFinancials] = useState(null);

  // Table options state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('period');
  const [sortOrder, setSortOrder] = useState('desc');

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  // Active chart tab
  const [activeChartTab, setActiveChartTab] = useState('bar');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load Overview, Charts, and Financials
  useEffect(() => {
    let active = true;
    async function loadData() {
      setIsLoading(true);
      setError('');
      try {
        const [overviewRes, chartsRes, financialsRes] = await Promise.all([
          fetchRegistrationOverview(appliedFilters),
          fetchRegistrationCharts(appliedFilters),
          fetchRegistrationFinancials(appliedFilters),
        ]);

        if (active) {
          setOverview(overviewRes);
          setCharts(chartsRes);
          setFinancials(financialsRes);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || 'Failed to load report data.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [appliedFilters]);

  // Load Table data dynamically on pagination/sorting/searching changes
  useEffect(() => {
    let active = true;
    async function loadTableData() {
      try {
        const res = await fetchRegistrationTable({
          ...appliedFilters,
          page,
          pageSize,
          search: debouncedSearch,
          sortBy,
          sortOrder,
        });
        if (active) {
          setTable(res);
        }
      } catch (err) {
        console.error('Failed to load table data:', err);
      }
    }
    loadTableData();
    return () => {
      active = false;
    };
  }, [appliedFilters, page, pageSize, debouncedSearch, sortBy, sortOrder]);

  const handleApplyFilters = () => {
    setPage(1);
    setAppliedFilters({ granularity, startDate, endDate });
  };

  const handleResetFilters = () => {
    const defaultStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const defaultEnd = new Date().toISOString().split('T')[0];
    setGranularity('monthly');
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    setSearch('');
    setPage(1);
    setAppliedFilters({
      granularity: 'monthly',
      startDate: defaultStart,
      endDate: defaultEnd,
    });
  };

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const { data } = await exportRegistrationReport(appliedFilters);
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registration-analytics-${appliedFilters.granularity}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSort = (field) => {
    const isAsc = sortBy === field && sortOrder === 'asc';
    setSortBy(field);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  const formatPeriod = (period) => {
    if (!period || period === 'N/A') return 'N/A';
    if (period.includes('-')) {
      const [year, month] = period.split('-');
      const date = new Date(Number(year), Number(month) - 1, 1);
      return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    }
    return period;
  };

  const formattedDateRange = useMemo(() => {
    const format = (d) => {
      if (!d) return '';
      const date = new Date(d);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    const cap = appliedFilters.granularity === 'monthly' ? 'Monthly Analytics' : 'Yearly Analytics';
    return `${cap} • ${format(appliedFilters.startDate)} – ${format(appliedFilters.endDate)}`;
  }, [appliedFilters]);

  // Dynamic values helper
  const roleDistribution = useMemo(() => {
    if (!charts?.pieChartData) return [];
    return charts.pieChartData;
  }, [charts]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Top Header Section */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/owner/overview')}
          className="group mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Platform Overview
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Registration Reports</h1>
            <p className="mt-1.5 text-sm font-medium text-slate-500 flex items-center gap-2">
              <Calendar size={14} className="text-indigo-500" />
              {formattedDateRange}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Granularity</label>
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-inner focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-inner focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-inner focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : null}
              Apply Filters
            </button>
            <button
              onClick={handleResetFilters}
              disabled={isLoading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium flex items-center gap-2">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Overview Analytics Cards */}
      <div className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
          <TrendingUp size={14} className="text-indigo-500" /> Registration Overview
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registrations</p>
            {isLoading ? (
              <div className="mt-3 h-8 w-24 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {overview?.totalRegistrations?.toLocaleString() || 0}
                </span>
                <span className="text-xs font-semibold text-slate-400">Registrations</span>
              </div>
            )}
            <div className="mt-2 text-xs font-medium text-slate-400">Total registered in date range</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Per Period</p>
            {isLoading ? (
              <div className="mt-3 h-8 w-24 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">{overview?.avgPerPeriod || 0}</span>
                <span className="text-xs font-semibold text-slate-400">
                  / {appliedFilters.granularity === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
            )}
            <div className="mt-2 text-xs font-medium text-slate-400">Average registrations index</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Peak Registration Period</p>
            {isLoading ? (
              <div className="mt-3 h-8 w-28 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="mt-2.5">
                <span className="text-base font-extrabold tracking-tight text-indigo-950 block truncate">
                  {overview?.peakPeriod && overview.peakPeriod.includes('—')
                    ? formatPeriod(overview.peakPeriod.split('—')[0].trim())
                    : 'N/A'}
                </span>
                <span className="text-xs font-bold text-indigo-600 block mt-0.5">
                  {overview?.peakPeriod && overview.peakPeriod.includes('—')
                    ? `${overview.peakPeriod.split('—')[1].trim()}`
                    : 'No peaks detected'}
                </span>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Period</p>
            {isLoading ? (
              <div className="mt-3 h-8 w-24 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {overview?.currentPeriod?.count || 0}
                </span>
                {overview?.currentPeriod && overview.currentPeriod.growth >= 0 ? (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
                    <TrendingUp size={12} />+{overview.currentPeriod.growth}%
                  </span>
                ) : overview?.currentPeriod ? (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600">
                    <TrendingDown size={12} />{overview.currentPeriod.growth}%
                  </span>
                ) : null}
              </div>
            )}
            <div className="mt-2 text-xs font-medium text-slate-400">
              Period: {formatPeriod(overview?.currentPeriod?.period)}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Financials Section */}
      <div className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
          <Receipt size={14} className="text-indigo-500" /> Invoice Financials
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Invoice Amount</p>
            {isLoading ? (
              <div className="mt-3 h-8 w-24 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="mt-2.5 text-3xl font-extrabold tracking-tight text-slate-900">
                ${financials?.totalInvoiceAmount?.toLocaleString() || 0}
              </div>
            )}
            <div className="mt-2 text-xs font-medium text-slate-400">Total generated invoices value</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Total Revenue
            </p>
            {isLoading ? (
              <div className="mt-3 h-8 w-24 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="mt-2.5 text-3xl font-extrabold tracking-tight text-emerald-600">
                ${financials?.totalRevenue?.toLocaleString() || 0}
              </div>
            )}
            <div className="mt-2 text-xs font-medium text-slate-400">Total collected / paid invoices</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Pending Revenue</p>
            {isLoading ? (
              <div className="mt-3 h-8 w-24 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="mt-2.5 text-3xl font-extrabold tracking-tight text-rose-600">
                ${financials?.pendingRevenue?.toLocaleString() || 0}
              </div>
            )}
            <div className="mt-2 text-xs font-medium text-slate-400">Outstanding issued invoices</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Paid Invoices</p>
            {isLoading ? (
              <div className="mt-3 h-8 w-24 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="mt-2.5 text-3xl font-extrabold tracking-tight text-indigo-600">
                {financials?.paidInvoicesCount || 0}
              </div>
            )}
            <div className="mt-2 text-xs font-medium text-slate-400">Paid invoice transactions count</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Registration Metrics & Trends</h3>
            <p className="text-xs font-medium text-slate-500">Visual breakdowns of user role demographics and registration cycles.</p>
          </div>
          <div className="inline-flex rounded-xl bg-slate-100/80 p-1 self-start">
            <button
              onClick={() => setActiveChartTab('bar')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${
                activeChartTab === 'bar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setActiveChartTab('pie')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${
                activeChartTab === 'pie' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Donut Chart
            </button>
            <button
              onClick={() => setActiveChartTab('line')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${
                activeChartTab === 'line' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Line Chart
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[320px] flex items-center justify-center text-slate-400">
            <RefreshCw size={24} className="animate-spin text-indigo-500 mr-2" />
            Analyzing chart metrics...
          </div>
        ) : (
          <div className="transition-all duration-300">
            {activeChartTab === 'bar' && (
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.barChartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="period" tickFormatter={formatPeriod} tick={{ fontSize: 11, fontWeight: 500, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip
                      labelFormatter={formatPeriod}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '15px' }} />
                    <Bar dataKey="admin" name="Admin" stackId="role" fill={COLORS.Admin} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="employee" name="Employee" stackId="role" fill={COLORS.Employee} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="manager" name="Manager" stackId="role" fill={COLORS.Manager} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="accountant" name="Accountant" stackId="role" fill={COLORS.Accountant} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeChartTab === 'pie' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-[340px]">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4 pr-0 md:pr-10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Role-wise Demographics</h4>
                  <div className="grid grid-cols-2 gap-3.5">
                    {roleDistribution.map((entry, idx) => (
                      <div key={entry.name} className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50 shadow-inner">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }}></span>
                        <div>
                          <p className="text-xs font-bold text-slate-700">{entry.name}</p>
                          <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                            {entry.value} <span className="text-xs font-semibold text-slate-400">({entry.percentage}%)</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-medium text-slate-500 text-center pt-2">
                    Total aggregated sample: <span className="font-extrabold text-slate-800">{overview?.totalRegistrations}</span> users
                  </p>
                </div>
              </div>
            )}

            {activeChartTab === 'line' && (
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts?.lineChartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="period" tickFormatter={formatPeriod} tick={{ fontSize: 11, fontWeight: 500, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip
                      labelFormatter={formatPeriod}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '15px' }} />
                    <Line type="monotone" dataKey="admin" name="Admin" stroke={COLORS.Admin} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="employee" name="Employee" stroke={COLORS.Employee} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="manager" name="Manager" stroke={COLORS.Manager} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="accountant" name="Accountant" stroke={COLORS.Accountant} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detailed Analytics Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 border-b border-slate-100 gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Detailed Registration Analytics</h3>
            <p className="text-xs font-medium text-slate-500">Exhaustive tabular index detailing periodic registration aggregates by user role.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3.5 self-start sm:self-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search period..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-700 shadow-inner focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
              />
              <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting || isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Download size={14} />
              {isExporting ? 'Exporting...' : 'Export Excel'}
            </button>
          </div>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-500 border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 uppercase font-bold tracking-wider text-[10px] sticky top-0 z-10 shadow-sm">
              <tr>
                <th
                  onClick={() => handleSort('period')}
                  className="py-3 px-5 cursor-pointer select-none hover:bg-slate-100/70 hover:text-slate-950 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Period
                    {sortBy === 'period' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                  </div>
                </th>
                <th className="py-3 px-5">Aggregated Timeframe</th>
                <th
                  onClick={() => handleSort('total')}
                  className="py-3 px-5 cursor-pointer select-none hover:bg-slate-100/70 hover:text-slate-950 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Total
                    {sortBy === 'total' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('admin')}
                  className="py-3 px-5 cursor-pointer select-none hover:bg-slate-100/70 hover:text-slate-950 transition-colors"
                >
                  <div className="flex items-center gap-1 text-blue-600">
                    Admin
                    {sortBy === 'admin' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('employee')}
                  className="py-3 px-5 cursor-pointer select-none hover:bg-slate-100/70 hover:text-slate-950 transition-colors"
                >
                  <div className="flex items-center gap-1 text-cyan-600">
                    Employee
                    {sortBy === 'employee' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('manager')}
                  className="py-3 px-5 cursor-pointer select-none hover:bg-slate-100/70 hover:text-slate-950 transition-colors"
                >
                  <div className="flex items-center gap-1 text-purple-600">
                    Manager
                    {sortBy === 'manager' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('accountant')}
                  className="py-3 px-5 cursor-pointer select-none hover:bg-slate-100/70 hover:text-slate-950 transition-colors"
                >
                  <div className="flex items-center gap-1 text-emerald-600">
                    Accountant
                    {sortBy === 'accountant' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="py-4 px-5"><div className="h-4 w-12 bg-slate-100 animate-pulse rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-28 bg-slate-100 animate-pulse rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-8 bg-slate-100 animate-pulse rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-8 bg-slate-100 animate-pulse rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-8 bg-slate-100 animate-pulse rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-8 bg-slate-100 animate-pulse rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-8 bg-slate-100 animate-pulse rounded" /></td>
                  </tr>
                ))
              ) : !table?.rows || table.rows.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={7} className="py-10 px-5 text-center text-sm font-semibold text-slate-400">
                    No registration analytics available.
                  </td>
                </tr>
              ) : (
                table.rows.map((row, idx) => (
                  <tr
                    key={row.period}
                    className={`hover:bg-indigo-50/20 active:bg-indigo-50/40 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'
                    }`}
                  >
                    <td className="py-3.5 px-5 font-extrabold text-slate-900">{row.period}</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-500">{formatPeriod(row.period)}</td>
                    <td className="py-3.5 px-5 font-bold text-slate-700">{row.total}</td>
                    <td className="py-3.5 px-5 font-bold text-blue-600">{row.admin}</td>
                    <td className="py-3.5 px-5 font-bold text-cyan-600">{row.employee}</td>
                    <td className="py-3.5 px-5 font-bold text-purple-600">{row.manager}</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-600">{row.accountant}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {!isLoading && table?.total > pageSize ? (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white">
            <div className="text-xs font-semibold text-slate-500">
              Showing page <span className="font-extrabold text-slate-800">{page}</span> of{' '}
              <span className="font-extrabold text-slate-800">{Math.ceil(table.total / pageSize)}</span> (
              <span className="font-bold">{table.total}</span> total periods)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(Math.ceil(table.total / pageSize), p + 1))}
                disabled={page === Math.ceil(table.total / pageSize)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
