import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import FormField, { InputClass } from '../../components/ui/FormField';

const blank = { name: '', date: '', isOptional: false };

const CompanyHolidaysPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/company/holidays');
      setRows(res.data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function startCreate() { setEditing('new'); setForm(blank); }
  function startEdit(row) {
    setEditing(row.id);
    setForm({
      name: row.name,
      date: String(row.date).slice(0, 10),
      isOptional: !!row.isOptional,
    });
  }
  async function save() {
    try {
      if (editing === 'new') await api.post('/company/holidays', form);
      else await api.put(`/company/holidays/${editing}`, form);
      setEditing(null);
      await load();
    } catch (err) { setError(err.message); }
  }
  async function remove(id) {
    if (!confirm('Delete this holiday?')) return;
    try { await api.delete(`/company/holidays/${id}`); await load(); }
    catch (err) { setError(err.message); }
  }

  const columns = [
    { key: 'name', header: 'Holiday' },
    { key: 'date', header: 'Date', render: (r) => new Date(r.date).toLocaleDateString() },
    { key: 'isOptional', header: 'Type', render: (r) => (r.isOptional ? 'Optional' : 'Mandatory') },
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
  ];

  return (
    <div>
      <PageHeader
        title="Holidays"
        subtitle="Public, regional and optional holidays observed by your company."
        actions={<Button onClick={startCreate}>+ New holiday</Button>}
      />
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {loading ? <p className="text-sm text-slate-400">Loading…</p>
        : <DataTable columns={columns} rows={rows} emptyText="No holidays" />}

      <Modal
        open={editing !== null}
        title={editing === 'new' ? 'New holiday' : 'Edit holiday'}
        onClose={() => setEditing(null)}
        footer={<>
          <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </>}
      >
        <div className="grid gap-3">
          <FormField label="Name"><input className={InputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
          <FormField label="Date"><input type="date" className={InputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></FormField>
          <FormField label="Optional?">
            <select className={InputClass} value={String(form.isOptional)} onChange={(e) => setForm({ ...form, isOptional: e.target.value === 'true' })}>
              <option value="false">Mandatory</option>
              <option value="true">Optional</option>
            </select>
          </FormField>
        </div>
      </Modal>
    </div>
  );
};

export default CompanyHolidaysPage;
