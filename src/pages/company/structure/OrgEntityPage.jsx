import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import DataTable from '../../../components/ui/DataTable';
import Modal from '../../../components/ui/Modal';
import FormField, { InputClass } from '../../../components/ui/FormField';

/**
 * Generic CRUD page for the simple org-structure entities (department, location, shift).
 * Pass:
 *   resource: '/departments' | '/locations' | '/shifts'
 *   title, subtitle, fields: [{ key, label, type? }]
 */
const OrgEntityPage = ({ resource, title, subtitle, fields, defaultRow = {}, actions = null }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | id
  const [form, setForm] = useState(defaultRow);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(resource);
      setRows(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [resource]);

  function startCreate() { setEditing('new'); setForm(defaultRow); }
  function startEdit(row) {
    setEditing(row.id);
    const next = { ...defaultRow };
    for (const f of fields) {
      next[f.key] = row[f.key] ?? '';
      if (f.type === 'time' && row[f.key]) {
        next[f.key] = String(row[f.key]).slice(11, 16);
      }
    }
    setForm(next);
  }
  async function save() {
    try {
      if (editing === 'new') await api.post(resource, form);
      else await api.put(`${resource}/${editing}`, form);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }
  async function remove(id) {
    if (!confirm('Deactivate this record?')) return;
    try {
      await api.delete(`${resource}/${id}`);
      await load();
    } catch (err) { setError(err.message); }
  }

  const columns = fields.map((f) => ({
    key: f.key,
    header: f.label,
    render: (r) => (f.type === 'time' && r[f.key] ? String(r[f.key]).slice(11, 16) : r[f.key] ?? '—'),
  })).concat([
    {
      key: 'isActive',
      header: 'Active',
      render: (r) => (r.isActive ? 'Yes' : 'No'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => startEdit(r)}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>Delete</Button>
        </div>
      ),
    },
  ]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={(
          <div className="flex items-center gap-2">
            {actions}
            <Button onClick={startCreate}>+ New</Button>
          </div>
        )}
      />
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {loading
        ? <p className="text-sm text-slate-400">Loading…</p>
        : <DataTable columns={columns} rows={rows} emptyText={`No ${title.toLowerCase()} yet`} />}

      <Modal
        open={editing !== null}
        title={editing === 'new' ? `Create ${title.slice(0, -1)}` : `Edit ${title.slice(0, -1)}`}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3">
          {fields.map((f) => (
            <FormField key={f.key} label={f.label}>
              <input
                type={f.type || 'text'}
                className={InputClass}
                value={form[f.key] ?? ''}
                onChange={(e) => update(f.key, e.target.value)}
              />
            </FormField>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default OrgEntityPage;
