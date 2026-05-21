import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDayWiseSummary, fetchEmployees, fetchOrganizationAttendance } from '../../api/reportsApi';
import {
  Users, UserCheck, UserX, Clock, TrendingUp,
  Eye, Loader, AlertCircle, X, ChevronRight,
  CalendarDays, FileText,
} from 'lucide-react';

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function fmtHrs(h) {
  return h ? Number(h).toFixed(2) : '0.00';
}

function statusColor(s) {
  if (s === 'Present') return 'bg-emerald-100 text-emerald-700';
  if (s === 'Late') return 'bg-amber-100 text-amber-700';
  if (s === 'Absent') return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-500';
}

function getToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function nDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fmtDateLabel(ymd) {
  if (!ymd) return '—';
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function isDateInRange(ymd, from, to) {
  if (!ymd || !from || !to) return true;
  return ymd >= from && ymd <= to;
}

function normalizeRange(from, to) {
  if (!from || !to) return { from, to };
  return from <= to ? { from, to } : { from: to, to: from };
}

function applyDepartmentToDay(day, dept) {
  if (!dept) return day;
  const rows = (day.rows || []).filter((r) => r.department === dept);
  return {
    ...day,
    rows,
    present: rows.filter((r) => r.attendanceStatus === 'Present').length,
    late: rows.filter((r) => r.attendanceStatus === 'Late').length,
    absent: rows.filter((r) => r.attendanceStatus === 'Absent').length,
    overtime: rows.filter((r) => (r.overtimeHours || 0) > 0).length,
    totalEmployees: rows.length,
  };
}

function summaryFromDays(days, fallbackTotal = 0) {
  const totals = days.reduce(
    (acc, d) => {
      acc.present += d.present || 0;
      acc.absent += d.absent || 0;
      acc.late += d.late || 0;
      acc.overtime += d.overtime || 0;
      return acc;
    },
    { present: 0, absent: 0, late: 0, overtime: 0 }
  );
  const totalEmployees = days[0]?.totalEmployees ?? fallbackTotal;
  return {
    totalEmployees,
    presentCount: totals.present + totals.late,
    absentCount: totals.absent,
    lateArrivals: totals.late,
    totalWorkingHours: days.reduce(
      (sum, d) => sum + (d.rows || []).reduce((s, r) => s + (r.totalWorkingHours || 0), 0),
      0
    ),
    totalOvertime: days.reduce(
      (sum, d) => sum + (d.rows || []).reduce((s, r) => s + (r.overtimeHours || 0), 0),
      0
    ),
  };
}

/* ───────────────── Day Detail Drawer ───────────────── */
function DayDrawer({ day, onClose }) {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Present', 'Late', 'Absent'];
  const rows = day?.rows || [];
  const filtered = tab === 'All' ? rows : rows.filter((r) => r.attendanceStatus === tab);

  if (!day) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-3xl bg-white shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-violet-600">
          <div>
            <p className="text-indigo-100 text-xs font-medium uppercase tracking-widest mb-0.5">Attendance Detail</p>
            <h2 className="text-white text-xl font-bold">
              {fmtDateLabel(day.date)} · {day.dayLabel}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200">
          {[
            { label: 'Present', val: day.present, cls: 'bg-emerald-100 text-emerald-700' },
            { label: 'Late', val: day.late, cls: 'bg-amber-100 text-amber-700' },
            { label: 'Absent', val: day.absent, cls: 'bg-red-100 text-red-700' },
            { label: 'Overtime', val: day.overtime, cls: 'bg-violet-100 text-violet-700' },
          ].map((p) => (
            <span key={p.label} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${p.cls}`}>
              {p.val} {p.label}
            </span>
          ))}
        </div>

        <div className="flex border-b border-slate-200 px-6">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t}
              <span className="ml-1.5 text-xs bg-slate-100 text-slate-600 rounded-full px-1.5 py-0.5">
                {t === 'All' ? rows.length : rows.filter((r) => r.attendanceStatus === t).length}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <AlertCircle size={32} className="mb-2 opacity-40" />
              <p>No records for this tab</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  {['Employee', 'Department', 'First In', 'Last Out', 'Hrs', 'OT', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{row.employeeName}</div>
                      <div className="text-xs text-slate-400">{row.employeeCode}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.department || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{fmt(row.firstTapIn)}</td>
                    <td className="px-4 py-3 text-slate-600">{fmt(row.lastTapOut)}</td>
                    <td className="px-4 py-3 text-slate-600">{fmtHrs(row.totalWorkingHours)}</td>
                    <td className="px-4 py-3 text-violet-600 font-medium">{fmtHrs(row.overtimeHours)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(row.attendanceStatus)}`}>
                        {row.attendanceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.28s cubic-bezier(.22,1,.36,1); }
      `}</style>
    </div>
  );
}

/* ───────────────── Day-wise summary table ───────────────── */
function DaySummaryTable({ days, onView }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800">Day-wise attendance</h2>
        <span className="text-xs text-slate-500">{days.length} day{days.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {['Date', 'Day', 'Employees', 'Present', 'Absent', 'Late', 'Overtime', 'Attendance %', ''].map((h) => (
                <th
                  key={h || 'action'}
                  className={`px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap ${
                    h === '' ? 'text-right' : 'text-left'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {days.map((day) => {
              const rate = day.totalEmployees
                ? Math.round(((day.present + day.late) / day.totalEmployees) * 100)
                : 0;
              const isWeekend = day.dayLabel === 'Saturday' || day.dayLabel === 'Sunday';
              return (
                <tr
                  key={day.date}
                  className={`hover:bg-slate-50/80 transition-colors ${isWeekend ? 'bg-slate-50/50' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                    {fmtDateLabel(day.date)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{day.dayLabel}</td>
                  <td className="px-4 py-3 text-slate-600 text-center">{day.totalEmployees}</td>
                  <td className="px-4 py-3 text-emerald-700 font-semibold text-center">{day.present}</td>
                  <td className="px-4 py-3 text-red-600 font-semibold text-center">{day.absent}</td>
                  <td className="px-4 py-3 text-amber-700 font-semibold text-center">{day.late}</td>
                  <td className="px-4 py-3 text-violet-700 font-semibold text-center">{day.overtime}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-indigo-500"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600 w-8">{rate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onView(day)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 rounded-lg px-3 py-1.5 transition hover:bg-indigo-50"
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryBar({ periodSummary }) {
  const cards = [
    { label: 'Total Employees', val: periodSummary?.totalEmployees ?? 0, icon: <Users size={18} />, cls: 'from-indigo-500 to-indigo-600' },
    { label: 'Total Present', val: periodSummary?.presentCount ?? 0, icon: <UserCheck size={18} />, cls: 'from-emerald-500 to-emerald-600' },
    { label: 'Total Absent', val: periodSummary?.absentCount ?? 0, icon: <UserX size={18} />, cls: 'from-red-500 to-red-600' },
    { label: 'Total Late', val: periodSummary?.lateArrivals ?? 0, icon: <Clock size={18} />, cls: 'from-amber-500 to-amber-600' },
    {
      label: 'Working Hours',
      val: periodSummary?.totalWorkingHours != null ? Number(periodSummary.totalWorkingHours).toFixed(1) : '0',
      icon: <TrendingUp size={18} />,
      cls: 'from-violet-500 to-violet-600',
    },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <div key={c.label} className={`bg-gradient-to-br ${c.cls} rounded-2xl p-4 text-white shadow-sm`}>
          <div className="flex items-center gap-2 mb-2 opacity-80">
            {c.icon}
            <span className="text-xs font-semibold uppercase tracking-wide">{c.label}</span>
          </div>
          <p className="text-3xl font-extrabold">{c.val}</p>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const [days, setDays] = useState([]);
  const [periodSummary, setPeriodSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initDone, setInitDone] = useState(false);
  const [drawerDay, setDrawerDay] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(getToday());
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState(getToday());
  const [departments, setDepartments] = useState([]);
  const [dept, setDept] = useState('');
  const [loadError, setLoadError] = useState('');

  const processDays = useCallback((rawDays, rangeFrom, rangeTo, department) => {
    const { from, to } = normalizeRange(rangeFrom, rangeTo);
    const inRange = (rawDays || [])
      .filter((d) => isDateInRange(d.date, from, to))
      .map((d) => applyDepartmentToDay(d, department))
      .sort((a, b) => b.date.localeCompare(a.date));
    return { from, to, inRange };
  }, []);

  const loadReport = useCallback(async (rangeFrom, rangeTo, department = '') => {
    const { from, to } = normalizeRange(rangeFrom, rangeTo);
    if (!from || !to) return;

    setLoading(true);
    setLoadError('');
    try {
      const res = await fetchDayWiseSummary({ fromDate: from, toDate: to });
      const { inRange } = processDays(res.days, from, to, department);
      setDays(inRange);
      setPeriodSummary(summaryFromDays(inRange, res.summary?.totalEmployees));
      setAppliedFrom(from);
      setAppliedTo(to);
    } catch (e) {
      console.error(e);
      setDays([]);
      setLoadError(e?.message || 'Could not load attendance report.');
    } finally {
      setLoading(false);
    }
  }, [processDays]);

  useEffect(() => {
    (async () => {
      try {
        const overview = await fetchOrganizationAttendance();
        const orgDate = overview?.orgRegistrationDate || nDaysAgo(29);
        const today = getToday();
        setFromDate(orgDate);
        setToDate(today);

        const empRes = await fetchEmployees({ pageSize: 1000 });
        const deptSet = new Set();
        (empRes.rows || []).forEach((e) => {
          if (e.department?.name) deptSet.add(e.department.name);
        });
        setDepartments(Array.from(deptSet).sort());

        await loadReport(orgDate, today, '');
      } catch (e) {
        console.error(e);
        setLoadError(e?.message || 'Could not load attendance report. Restart the backend and try again.');
      } finally {
        setLoading(false);
        setInitDone(true);
      }
    })();
  }, [loadReport]);

  const handleApply = () => {
    if (!fromDate || !toDate) {
      setLoadError('Please select both From and To dates.');
      return;
    }
    loadReport(fromDate, toDate, dept);
  };

  const filteredDays = useMemo(() => {
    const { inRange } = processDays(days, appliedFrom, appliedTo, dept);
    return inRange;
  }, [days, appliedFrom, appliedTo, dept, processDays]);

  const displaySummary = useMemo(
    () => summaryFromDays(filteredDays, periodSummary?.totalEmployees),
    [filteredDays, periodSummary?.totalEmployees]
  );

  const rangeLabel =
    appliedFrom && appliedTo
      ? `${fmtDateLabel(appliedFrom)} – ${fmtDateLabel(appliedTo)}`
      : 'Select a date range';

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl">
            <CalendarDays size={22} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Attendance Reports</h1>
            <p className="text-sm text-slate-500">
              Day-wise breakdown · <span className="font-medium text-slate-700">{rangeLabel}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/company/reports/build')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md hover:opacity-90 transition"
        >
          <FileText size={16} /> Create Report
          <ChevronRight size={14} />
        </button>
      </div>

      {loading && !initDone ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {['from-indigo-400 to-indigo-500', 'from-emerald-400 to-emerald-500', 'from-red-400 to-red-500', 'from-amber-400 to-amber-500', 'from-violet-400 to-violet-500'].map((g, i) => (
            <div key={i} className={`bg-gradient-to-br ${g} rounded-2xl p-4 text-white shadow-sm animate-pulse`}>
              <div className="h-3 w-20 bg-white/30 rounded mb-3" />
              <div className="h-8 w-10 bg-white/40 rounded" />
            </div>
          ))}
        </div>
      ) : filteredDays.length > 0 ? (
        <SummaryBar periodSummary={displaySummary} />
      ) : null}

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex flex-wrap gap-4 items-end shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            max={toDate || getToday()}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            max={getToday()}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {loading ? 'Loading…' : 'Apply'}
        </button>
      </div>

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {loading && initDone ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={36} className="animate-spin text-indigo-500" />
        </div>
      ) : filteredDays.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <AlertCircle size={40} className="mb-3 opacity-40" />
          <p className="text-lg font-medium">No data for selected range</p>
          <p className="text-sm mt-2 text-center max-w-md">
            {rangeLabel}. Add employees and tap-in records, or widen the date range.
          </p>
        </div>
      ) : (
        <DaySummaryTable days={filteredDays} onView={setDrawerDay} />
      )}

      {drawerDay && <DayDrawer day={drawerDay} onClose={() => setDrawerDay(null)} />}
    </div>
  );
}
