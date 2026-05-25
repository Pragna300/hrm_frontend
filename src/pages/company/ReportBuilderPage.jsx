import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmployees, generateAttendanceReport, exportAttendanceReport } from '../../api/reportsApi';
import {
  Download, Printer, ChevronLeft, Search, RotateCcw,
  Users, UserCheck, UserX, Clock, TrendingUp,
  Loader, AlertCircle, SlidersHorizontal, FileSpreadsheet,
} from 'lucide-react';

/* ──────────── helpers ──────────── */
function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function nDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function hireDateKey(employee) {
  if (!employee?.dateHired) return null;
  return String(employee.dateHired).slice(0, 10);
}
function fmtJoinDate(ymd) {
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function earliestJoinAmong(employees, ids) {
  const keys = employees
    .filter((e) => ids.has(e.id))
    .map(hireDateKey)
    .filter(Boolean)
    .sort();
  return keys[0] || null;
}

function statusStyle(s) {
  if (s === 'Present') return 'bg-emerald-100 text-emerald-700';
  if (s === 'Late')    return 'bg-amber-100 text-amber-700';
  if (s === 'Absent')  return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-500';
}

/* ──────────── Stat Card ──────────── */
function BuilderStatCard({ label, value, icon, gradient }) {
  return (
    <div className={`${gradient} rounded-2xl p-4 text-white shadow-sm`}>
      <div className="flex items-center gap-2 mb-1 opacity-80">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-3xl font-extrabold">{value}</p>
    </div>
  );
}

/* ──────────── CSV download helper ──────────── */
function downloadCSV(rows) {
  const headers = [
    'Employee ID', 'Employee Name', 'Department', 'Date', 'Day',
    'Sessions', 'First Tap In', 'Last Tap Out',
    'Total Hrs', 'Active Hrs', 'Overtime', 'Status',
  ];
  const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csvRows = [
    headers.join(','),
    ...rows.map(r => [
      r.employeeCode,
      r.employeeName,
      r.department || '',
      r.date,
      r.day,
      r.sessionCount,
      r.firstTapIn  ? new Date(r.firstTapIn).toLocaleTimeString()  : '',
      r.lastTapOut  ? new Date(r.lastTapOut).toLocaleTimeString()  : '',
      (r.totalWorkingHours  || 0).toFixed(2),
      (r.activeWorkingHours || 0).toFixed(2),
      (r.overtimeHours      || 0).toFixed(2),
      r.attendanceStatus,
    ].map(escape).join(',')),
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ──────────── Main Page ──────────── */
export default function ReportBuilderPage() {
  const navigate = useNavigate();

  // Employees
  const [employees, setEmployees]   = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts]         = useState([]);
  const [empSearch, setEmpSearch]   = useState('');
  const [selectedEmpIds, setSelectedEmpIds] = useState(new Set());

  // Filters
  const [fromDate, setFromDate]     = useState(nDaysAgo(6));
  const [toDate, setToDate]         = useState(getToday());
  const [dept, setDept]             = useState('');
  const [shift, setShift]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Results
  const [rows, setRows]             = useState([]);
  const [summary, setSummary]       = useState(null);
  const [generating, setGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError]           = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load employees + metadata
  useEffect(() => {
    fetchEmployees({ pageSize: 1000 }).then(res => {
      const list = res.rows || [];
      setEmployees(list);
      const deptSet  = new Set();
      const shiftSet = new Set();
      list.forEach(e => {
        if (e.department?.name) deptSet.add(e.department.name);
        if (e.shift?.name)      shiftSet.add(e.shift.name);
      });
      setDepartments(Array.from(deptSet).sort());
      setShifts(Array.from(shiftSet).sort());
    }).catch(() => {});
  }, []);

  const selectedJoinFrom = useMemo(
    () => earliestJoinAmong(employees, selectedEmpIds),
    [employees, selectedEmpIds]
  );

  useEffect(() => {
    if (!selectedJoinFrom) return;
    if (!fromDate || fromDate < selectedJoinFrom) {
      setFromDate(selectedJoinFrom);
    }
  }, [selectedJoinFrom]);

  const filteredEmployees = useMemo(() => {
    let list = employees;
    const q = empSearch.toLowerCase();
    if (q) {
      list = list.filter(e =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        (e.employeeCode || '').toLowerCase().includes(q) ||
        (e.department?.name || '').toLowerCase().includes(q)
      );
    }
    
    return [...list].sort((a, b) => {
      const roleA = a.user?.role || '';
      const roleB = b.user?.role || '';
      const isFirstA = roleA === 'team_lead' || roleA === 'hr';
      const isFirstB = roleB === 'team_lead' || roleB === 'hr';
      
      if (isFirstA && !isFirstB) return -1;
      if (!isFirstA && isFirstB) return 1;
      return (a.firstName || '').localeCompare(b.firstName || '');
    });
  }, [employees, empSearch]);

  function toggleEmp(id) {
    const s = new Set(selectedEmpIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedEmpIds(s);
  }
  function toggleAll() {
    setSelectedEmpIds(selectedEmpIds.size === employees.length
      ? new Set()
      : new Set(employees.map(e => e.id))
    );
  }
  function handleReset() {
    setFromDate(nDaysAgo(6));
    setToDate(getToday());
    setDept('');
    setShift('');
    setStatusFilter('');
    setSelectedEmpIds(new Set());
    setEmpSearch('');
    setRows([]);
    setSummary(null);
    setHasGenerated(false);
  }

  async function handleGenerate() {
    if (!fromDate || !toDate) { setError('Please select a date range.'); return; }
    setError('');
    setGenerating(true);
    try {
      const payload = {
        fromDate,
        toDate,
        employeeIds: selectedEmpIds.size > 0 ? Array.from(selectedEmpIds) : [],
        department:  dept || '',
        shift:       shift || '',
        status:      statusFilter ? [statusFilter] : [],
        pageSize:    5000,
      };
      const r = await generateAttendanceReport(payload);
      setRows(r.rows || []);
      setSummary(r.summary || null);
      setHasGenerated(true);
    } catch (e) {
      console.error(e);
      setError('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  /* ─── Render ─── */
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50">

      {/* ════════ SIDEBAR ════════ */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-white border-r border-slate-200 flex flex-col overflow-hidden shrink-0`}>
        <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-indigo-600" />
            <h2 className="font-bold text-slate-800 text-sm">Report Filters</h2>
          </div>
          <button onClick={handleReset} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition">
            <RotateCcw size={12} /> Reset
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Date Range */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date Range *</p>
            {selectedJoinFrom && (
              <p className="text-xs text-indigo-600 mb-2 bg-indigo-50 rounded-lg px-2 py-1.5">
                Selected employee(s): report starts from join date ({fmtJoinDate(selectedJoinFrom)}).
              </p>
            )}
            <div className="space-y-2">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">From</label>
                <input
                  type="date"
                  value={fromDate}
                  min={selectedJoinFrom || undefined}
                  max={toDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">To</label>
                <input type="date" value={toDate} min={fromDate} max={getToday()}
                  onChange={e => setToDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
          </div>

          {/* Department */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</p>
            <select value={dept} onChange={e => setDept(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">All</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Shift */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Shift</p>
            <select value={shift} onChange={e => setShift(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">All</option>
              {shifts.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</p>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">All</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          {/* Employees */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Employees
              {selectedEmpIds.size > 0 && (
                <span className="ml-1.5 text-indigo-600">({selectedEmpIds.size} selected)</span>
              )}
            </p>
            <div className="relative mb-2">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search..."
                value={empSearch}
                onChange={e => setEmpSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-lg bg-slate-50 divide-y divide-slate-100">
              <label className="flex items-center gap-2 px-3 py-2 hover:bg-white cursor-pointer">
                <input type="checkbox"
                  checked={selectedEmpIds.size === employees.length && employees.length > 0}
                  onChange={toggleAll}
                  className="accent-indigo-600"
                />
                <span className="text-xs font-semibold text-slate-600">Select All</span>
              </label>
              {filteredEmployees.map(e => (
                <label key={e.id} className="flex items-center gap-2 px-3 py-2 hover:bg-white cursor-pointer">
                  <input type="checkbox"
                    checked={selectedEmpIds.has(e.id)}
                    onChange={() => toggleEmp(e.id)}
                    className="accent-indigo-600"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{e.firstName} {e.lastName}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {e.employeeCode} · {e.department?.name || '—'}
                      {hireDateKey(e) ? ` · Joined ${fmtJoinDate(hireDateKey(e))}` : ''}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Generate button */}
        <div className="px-5 py-4 border-t border-slate-100">
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {generating ? <><Loader size={15} className="animate-spin" /> Generating…</> : 'Generate Report'}
          </button>
        </div>
      </aside>

      {/* ════════ MAIN PANEL ════════ */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/company/reports')}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet size={20} className="text-indigo-600" />
                Report Builder
              </h1>
              <p className="text-xs text-slate-400">Configure filters and generate a downloadable report</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition"
            >
              <SlidersHorizontal size={15} />
              {sidebarOpen ? 'Hide Filters' : 'Show Filters'}
            </button>
            {hasGenerated && rows.length > 0 && (
              <>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition"
                >
                  <Printer size={15} /> Print
                </button>
                <button
                  onClick={() => downloadCSV(rows)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition"
                >
                  <Download size={15} /> Download CSV
                </button>
              </>
            )}
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* ── Not generated yet ── */}
          {!hasGenerated && !generating && (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
              <FileSpreadsheet size={52} className="mb-4 opacity-30" />
              <p className="text-xl font-semibold mb-1">Configure & Generate</p>
              <p className="text-sm">Set your filters in the left panel, then click <strong>Generate Report</strong></p>
            </div>
          )}

          {/* ── Generating spinner ── */}
          {generating && (
            <div className="flex items-center justify-center py-32">
              <Loader size={40} className="animate-spin text-indigo-500" />
            </div>
          )}

          {/* ── Results ── */}
          {hasGenerated && !generating && (
            <>
              {/* Summary cards */}
              {summary && (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  <BuilderStatCard label="Total Employees" value={summary.totalEmployees}     icon={<Users size={16} />}     gradient="bg-gradient-to-br from-indigo-500 to-indigo-600" />
                  <BuilderStatCard label="Present"         value={summary.presentCount}       icon={<UserCheck size={16} />} gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" />
                  <BuilderStatCard label="Absent"          value={summary.absentCount}        icon={<UserX size={16} />}     gradient="bg-gradient-to-br from-red-500 to-red-600" />
                  <BuilderStatCard label="Late Arrivals"   value={summary.lateArrivals}       icon={<Clock size={16} />}     gradient="bg-gradient-to-br from-amber-500 to-amber-600" />
                  <BuilderStatCard label="Overtime Days"   value={summary.totalOvertime != null ? summary.totalOvertime.toFixed(1) : '—'} icon={<TrendingUp size={16} />} gradient="bg-gradient-to-br from-violet-500 to-violet-600" />
                </div>
              )}

              {/* Data table */}
              {rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <AlertCircle size={36} className="mb-2 opacity-40" />
                  <p>No records found for the selected filters</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">
                      {rows.length} records
                      {fromDate && toDate && (
                        <span className="text-slate-400 font-normal ml-1">
                          · {new Date(fromDate).toLocaleDateString('en-IN', { day:'numeric',month:'short' })} – {new Date(toDate).toLocaleDateString('en-IN', { day:'numeric',month:'short',year:'numeric' })}
                        </span>
                      )}
                    </p>
                    <button
                      onClick={() => downloadCSV(rows)}
                      className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition"
                    >
                      <Download size={13} /> Export CSV
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          {['Emp ID','Name','Department','Date','Day','Sessions','First In','Last Out','Total Hrs','Active Hrs','Overtime','Status'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rows.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.employeeCode}</td>
                            <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{row.employeeName}</td>
                            <td className="px-4 py-3 text-slate-600">{row.department || '—'}</td>
                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.date}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{row.day}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{row.sessionCount}</td>
                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmt(row.firstTapIn)}</td>
                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmt(row.lastTapOut)}</td>
                            <td className="px-4 py-3 text-slate-700 font-medium">{(row.totalWorkingHours||0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-slate-600">{(row.activeWorkingHours||0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-violet-600 font-medium">{(row.overtimeHours||0).toFixed(2)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyle(row.attendanceStatus)}`}>
                                {row.attendanceStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
