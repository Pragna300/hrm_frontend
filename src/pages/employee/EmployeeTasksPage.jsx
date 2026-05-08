import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Users, User } from 'lucide-react';
import { api, getStoredUser } from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';

const VIEWS_BY_SCOPE = {
  my: [
    { id: 'my', label: 'My Tasks', countKey: 'my' },
    { id: 'overdue', label: 'Overdue', countKey: 'overdue' },
    { id: 'new', label: 'New', countKey: 'new' },
    { id: 'due_today', label: 'Due Today', countKey: 'dueToday' },
    { id: 'upcoming', label: 'Upcoming', countKey: 'upcoming' },
    { id: 'completed', label: 'Completed', countKey: 'completed' },
    { id: 'all', label: 'All Tasks', countKey: 'all' },
  ],
  team: [
    { id: 'my', label: 'Open', countKey: 'my' },
    { id: 'overdue', label: 'Overdue', countKey: 'overdue' },
    { id: 'new', label: 'New', countKey: 'new' },
    { id: 'due_today', label: 'Due Today', countKey: 'dueToday' },
    { id: 'upcoming', label: 'Upcoming', countKey: 'upcoming' },
    { id: 'completed', label: 'Completed', countKey: 'completed' },
    { id: 'all', label: 'All Tasks', countKey: 'all' },
  ],
};

function fmtDue(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
}

function nameOf(e) {
  if (!e) return '—';
  return `${e.firstName || ''} ${e.lastName || ''}`.trim() || '—';
}

function defaultScopeFor(role, hasAssignables) {
  if (role === 'hr' || role === 'manager' || role === 'team_lead') return 'team';
  if (hasAssignables) return 'team';
  return 'my';
}

const EmployeeTasksPage = () => {
  const user = getStoredUser() || {};
  const [scope, setScope] = useState(null); // 'my' | 'team'
  const [view, setView] = useState('my');
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [assignables, setAssignables] = useState([]);
  const [reportingManagers, setReportingManagers] = useState([]);
  const [managerFilter, setManagerFilter] = useState('');
  const [error, setError] = useState('');
  const [hideCompleted, setHideCompleted] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    dueDate: '',
    category: 'Custom Task',
    assigneeEmployeeId: '',
    relatedToEmployeeId: '',
  });

  const canAssignToOthers = assignables.length > 0;
  const canSeeTeamScope =
    user.role === 'hr' || user.role === 'manager' || user.role === 'team_lead' || canAssignToOthers;
  const canFilterByManager = user.role === 'hr' || user.role === 'manager';

  // Decide initial scope once we know whether the user can assign to others.
  useEffect(() => {
    if (scope !== null) return;
    setScope(defaultScopeFor(user.role, canAssignToOthers));
  }, [scope, user.role, canAssignToOthers]);

  function buildQuery() {
    const params = new URLSearchParams();
    params.set('scope', scope || 'my');
    if (scope === 'team' && canFilterByManager && managerFilter) {
      params.set('managerId', managerFilter);
    }
    return params.toString();
  }

  const loadSummary = () => {
    if (!user.employeeId || !scope) return;
    const params = new URLSearchParams();
    params.set('scope', scope);
    if (scope === 'team' && canFilterByManager && managerFilter) {
      params.set('managerId', managerFilter);
    }
    api
      .get(`/employee-portal/tasks/summary?${params.toString()}`)
      .then((res) => setSummary(res.data || null))
      .catch(() => setSummary(null));
  };

  const loadTasks = () => {
    if (!user.employeeId || !scope) return;
    setError('');
    const q = buildQuery();
    api
      .get(`/employee-portal/tasks?${q}&view=${encodeURIComponent(view)}`)
      .then((res) => setTasks(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    if (!user.employeeId) return;
    loadSummary();
  }, [user.employeeId, scope, managerFilter]);

  useEffect(() => {
    if (!user.employeeId) return;
    loadTasks();
  }, [user.employeeId, scope, view, managerFilter]);

  useEffect(() => {
    if (!user.employeeId) return;
    api
      .get('/employee-portal/tasks/assignable-employees')
      .then((res) => setAssignables(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAssignables([]));
  }, [user.employeeId]);

  useEffect(() => {
    if (!canFilterByManager) return;
    api
      .get('/employee-portal/tasks/reporting-managers')
      .then((res) => setReportingManagers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setReportingManagers([]));
  }, [canFilterByManager]);

  const categories = useMemo(() => {
    const s = new Set(['Custom Task', 'Onboarding', 'Training']);
    tasks.forEach((t) => t.category && s.add(t.category));
    return Array.from(s);
  }, [tasks]);

  const filtered = useMemo(() => {
    let rows = tasks;
    if (view === 'all' && hideCompleted) {
      rows = rows.filter((t) => t.status !== 'completed');
    }
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((t) => {
        const hay = [
          t.title,
          nameOf(t.assignee),
          t.assignee?.employeeCode,
          nameOf(t.relatedTo),
          nameOf(t.addedBy),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });
    }
    if (category) rows = rows.filter((t) => t.category === category);
    if (dateFrom) {
      const from = new Date(dateFrom);
      rows = rows.filter((t) => new Date(t.dueDate) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      rows = rows.filter((t) => new Date(t.dueDate) <= to);
    }
    return rows;
  }, [tasks, view, hideCompleted, search, category, dateFrom, dateTo]);

  async function submitTask(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.dueDate) return;
    if (!form.assigneeEmployeeId) {
      setError('Choose the employee this task is assigned to.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        dueDate: form.dueDate,
        category: form.category || 'Custom Task',
        assigneeEmployeeId: Number(form.assigneeEmployeeId),
      };
      if (form.relatedToEmployeeId) {
        payload.relatedToEmployeeId = Number(form.relatedToEmployeeId);
      }
      await api.post('/employee-portal/tasks', payload);
      setShowAdd(false);
      setForm({
        title: '',
        dueDate: '',
        category: 'Custom Task',
        assigneeEmployeeId: '',
        relatedToEmployeeId: '',
      });
      loadSummary();
      loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function markComplete(id) {
    try {
      await api.patch(`/employee-portal/tasks/${id}`, { status: 'completed' });
      loadSummary();
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeTask(id) {
    if (!canAssignToOthers) return;
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/employee-portal/tasks/${id}`);
      loadSummary();
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!user.employeeId) {
    return (
      <div>
        <PageHeader title="Tasks" subtitle="Work assigned to you." />
        <Alert type="error">No employee profile is linked to this account.</Alert>
      </div>
    );
  }

  const subtitle =
    scope === 'team'
      ? user.role === 'hr' || user.role === 'manager'
        ? 'All tasks across the company. Filter by reporting manager to focus on a specific team.'
        : 'Tasks assigned to your direct reports.'
      : 'Tasks assigned to you by your reporting manager or HR.';

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle={subtitle}
        actions={
          canAssignToOthers ? (
            <Button type="button" size="sm" onClick={() => setShowAdd((v) => !v)}>
              <Plus size={16} /> Add
            </Button>
          ) : null
        }
      />
      {error && <Alert type="error">{error}</Alert>}

      {canSeeTeamScope && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => { setScope('my'); setManagerFilter(''); }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold ${
                scope === 'my' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User size={14} /> Mine
            </button>
            <button
              type="button"
              onClick={() => setScope('team')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold ${
                scope === 'team' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users size={14} /> Team
            </button>
          </div>

          {scope === 'team' && canFilterByManager && (
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="font-semibold uppercase tracking-wide text-slate-500 text-xs">
                Reporting manager
              </span>
              <select
                className="rounded border border-slate-200 bg-white px-2 py-1.5"
                value={managerFilter}
                onChange={(e) => setManagerFilter(e.target.value)}
              >
                <option value="">All teams</option>
                {reportingManagers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} ({m.employeeCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          {scope === 'team' && summary && (
            <div className="ml-auto flex items-center gap-2 text-xs">
              <Pill tone="amber" label="Overdue" value={summary.overdue} />
              <Pill tone="emerald" label="New" value={summary.new} />
              <Pill tone="slate" label="Due today" value={summary.dueToday} />
              <Pill tone="sky" label="Completed" value={summary.completed} />
            </div>
          )}
        </div>
      )}

      {showAdd && canAssignToOthers && (
        <form
          onSubmit={submitTask}
          className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="text-slate-600">Title</span>
              <input
                required
                className="mt-1 w-full rounded border px-2 py-1.5"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </label>
            <label className="text-sm">
              <span className="text-slate-600">Due date</span>
              <input
                required
                type="date"
                className="mt-1 w-full rounded border px-2 py-1.5"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </label>
            <label className="text-sm">
              <span className="text-slate-600">Category</span>
              <select
                className="mt-1 w-full rounded border px-2 py-1.5"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="text-slate-600">Assignee</span>
              <select
                required
                className="mt-1 w-full rounded border px-2 py-1.5"
                value={form.assigneeEmployeeId}
                onChange={(e) => setForm((f) => ({ ...f, assigneeEmployeeId: e.target.value }))}
              >
                <option value="">
                  {user.role === 'hr' || user.role === 'manager'
                    ? 'Select any employee…'
                    : 'Select a direct report…'}
                </option>
                {assignables.map((em) => (
                  <option key={em.id} value={em.id}>
                    {em.firstName} {em.lastName} ({em.employeeCode})
                    {em.manager ? ` — reports to ${em.manager.firstName} ${em.manager.lastName}` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="text-slate-600">In relation to (optional)</span>
              <select
                className="mt-1 w-full rounded border px-2 py-1.5"
                value={form.relatedToEmployeeId}
                onChange={(e) => setForm((f) => ({ ...f, relatedToEmployeeId: e.target.value }))}
              >
                <option value="">—</option>
                {assignables.map((em) => (
                  <option key={em.id} value={em.id}>
                    {em.firstName} {em.lastName} ({em.employeeCode})
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-3 flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Create task'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-4 lg:flex-row">
        <nav className="w-full flex-shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-2 lg:w-48">
          {(VIEWS_BY_SCOPE[scope] || VIEWS_BY_SCOPE.my).map((v) => {
            const count = summary && v.countKey ? summary[v.countKey] ?? 0 : null;
            const active = view === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold ${
                  active ? 'bg-sky-600 text-white' : 'text-slate-700 hover:bg-white'
                }`}
              >
                <span>{v.label}</span>
                {count != null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      active
                        ? 'bg-white/20 text-white'
                        : v.id === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={(e) => setHideCompleted(e.target.checked)}
                disabled={view !== 'all'}
              />
              Hide completed
            </label>
            <div className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2">
              <Search size={14} className="text-slate-400" />
              <input
                className="border-0 py-1 text-sm outline-none"
                placeholder={scope === 'team' ? 'Search task or employee…' : 'Search…'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="rounded border border-slate-200 bg-white px-2 py-1 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="rounded border border-slate-200 px-2 py-1 text-sm"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <input
              type="date"
              className="rounded border border-slate-200 px-2 py-1 text-sm"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">{scope === 'team' ? 'Assignee' : 'In relation to'}</th>
                  <th className="px-3 py-2">Employee ID</th>
                  <th className="px-3 py-2">Task</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Due</th>
                  <th className="px-3 py-2">Reporting manager</th>
                  <th className="px-3 py-2">Added by</th>
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2"> </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const primary = scope === 'team' ? t.assignee : t.relatedTo || t.assignee;
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const due = new Date(t.dueDate);
                  due.setHours(0, 0, 0, 0);
                  const overdue = t.status !== 'completed' && due < today;
                  const reportsTo = t.assignee?.manager;
                  return (
                    <tr key={t.id} className="border-b border-slate-50">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-slate-200 text-center text-xs leading-8">
                            {primary?.profilePhotoUrl ? (
                              <img
                                src={primary.profilePhotoUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              nameOf(primary).charAt(0)
                            )}
                          </div>
                          <span className="font-medium text-slate-800">{nameOf(primary)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{primary?.employeeCode || '—'}</td>
                      <td className="max-w-xs px-3 py-2 text-slate-800">
                        <div>{t.title}</div>
                        {t.status === 'completed' && (
                          <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800">
                          {t.category}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            overdue
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {fmtDue(t.dueDate)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {reportsTo
                          ? `${nameOf(reportsTo)} (${reportsTo.employeeCode || ''})`
                          : '—'}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {t.addedBy ? `${nameOf(t.addedBy)} (${t.addedBy.employeeCode || ''})` : '—'}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {t.assignee?.department?.name || '—'}
                      </td>
                      <td className="space-x-1 px-3 py-2 text-right">
                        {scope === 'my' && t.status !== 'completed' && (
                          <button
                            type="button"
                            className="text-xs font-semibold text-emerald-700 hover:underline"
                            onClick={() => markComplete(t.id)}
                          >
                            Complete
                          </button>
                        )}
                        {canAssignToOthers && (
                          <button
                            type="button"
                            className="text-xs font-semibold text-red-600 hover:underline"
                            onClick={() => removeTask(t.id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-slate-400">No tasks in this view.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TONES = {
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  slate: 'bg-slate-100 text-slate-800 border-slate-200',
  sky: 'bg-sky-50 text-sky-800 border-sky-200',
};

const Pill = ({ tone, label, value }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${TONES[tone] || TONES.slate}`}
  >
    {label}
    <span className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums">
      {value ?? 0}
    </span>
  </span>
);

export default EmployeeTasksPage;
