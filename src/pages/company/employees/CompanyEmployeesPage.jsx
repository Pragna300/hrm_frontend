import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '../../../api/client';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import DataTable from '../../../components/ui/DataTable';
import EmployeeForm from './EmployeeForm';
import { emptyEmployeeForm, mapEmployeeToForm, buildPayload } from './employeeFormConfig';

const CompanyEmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState('list'); // list | create | edit
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyEmployeeForm);

  async function loadAll() {
    setLoading(true);
    try {
      const [emp, dep, loc, shift] = await Promise.all([
        api.get('/employees'),
        api.get('/departments').catch(() => ({ data: [] })),
        api.get('/locations').catch(() => ({ data: [] })),
        api.get('/shifts').catch(() => ({ data: [] })),
      ]);
      setEmployees(emp.data || []);
      setDepartments(dep.data || []);
      setLocations(loc.data || []);
      setShifts(shift.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { loadAll(); }, []);

  const lookups = useMemo(() => ({
    departments: departments.map((d) => ({ id: d.id, label: d.name })),
    locations:   locations.map((l) => ({ id: l.id, label: l.name })),
    shifts:      shifts.map((s) => ({ id: s.id, label: s.name })),
    employees:   employees.map((e) => ({ id: e.id, label: `${e.firstName} ${e.lastName}` })),
  }), [employees, departments, locations, shifts]);

  function startCreate() {
    setMode('create');
    setSelectedId(null);
    setForm(emptyEmployeeForm);
    setMessage(''); setError('');
  }
  function startEdit(employee) {
    setMode('edit');
    setSelectedId(employee.id);
    setForm(mapEmployeeToForm(employee));
    setMessage(''); setError('');
  }
  function backToList() {
    setMode('list');
    setSelectedId(null);
    setForm(emptyEmployeeForm);
  }

  async function save() {
    setSaving(true);
    setError(''); setMessage('');
    try {
      const isEdit = mode === 'edit';
      const payload = buildPayload(form, isEdit);
      const res = isEdit
        ? await api.put(`/employees/${selectedId}`, payload)
        : await api.post('/employees', payload);
      setMessage(res.message || 'Saved');
      await loadAll();
      if (!isEdit) backToList();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(id) {
    if (!confirm('Deactivate this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Employee',
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-800">{r.firstName} {r.lastName}</div>
          <div className="text-xs text-slate-500">{r.employeeCode} · {r.designation || '—'}</div>
        </div>
      ),
    },
    { key: 'email',     header: 'Email',      render: (r) => r.user?.email || r.workEmail || '—' },
    { key: 'role',      header: 'Role',       render: (r) => <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 capitalize">{(r.user?.role || 'employee').replace('_', ' ')}</span> },
    { key: 'department', header: 'Department', render: (r) => r.department?.name || '—' },
    { key: 'location',   header: 'Location',   render: (r) => r.location?.name || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (r) => {
        const cls = r.employmentStatus === 'active'
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-slate-200 text-slate-700';
        return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{r.employmentStatus}</span>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => startEdit(r)}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => deactivate(r.id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Hire, edit and assign roles to your workforce."
        actions={
          mode === 'list'
            ? <Button onClick={startCreate}>+ Add employee</Button>
            : <Button variant="secondary" onClick={backToList}>Back to list</Button>
        }
      />

      {error   && <Alert type="error"   onClose={() => setError('')}>{error}</Alert>}
      {message && <Alert type="success" onClose={() => setMessage('')}>{message}</Alert>}

      {mode === 'list' && (
        loading
          ? <p className="text-sm text-slate-400">Loading…</p>
          : <DataTable columns={columns} rows={employees} emptyText="No employees yet" />
      )}

      {mode !== 'list' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <EmployeeForm
            form={form}
            onChange={setForm}
            onSubmit={save}
            onCancel={backToList}
            saving={saving}
            isEdit={mode === 'edit'}
            lookups={lookups}
          />
        </div>
      )}
    </div>
  );
};

export default CompanyEmployeesPage;
