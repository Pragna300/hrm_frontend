import { useEffect, useState } from 'react';
import { Pin, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import FormField, { InputClass } from '../../components/ui/FormField';

const blank = { title: '', body: '', isPinned: false };

const CompanyAnnouncementsPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/company/announcements');
      setRows(res.data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function startCreate() { setEditing('new'); setForm(blank); }
  function startEdit(row) {
    setEditing(row.id);
    setForm({ title: row.title, body: row.body, isPinned: !!row.isPinned });
  }
  async function save() {
    try {
      if (editing === 'new') await api.post('/company/announcements', form);
      else await api.put(`/company/announcements/${editing}`, form);
      setEditing(null);
      await load();
    } catch (err) { setError(err.message); }
  }
  async function remove(id) {
    if (!confirm('Delete this announcement?')) return;
    try { await api.delete(`/company/announcements/${id}`); await load(); }
    catch (err) { setError(err.message); }
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Broadcast updates to everyone in your company."
        actions={<Button onClick={startCreate}>+ New post</Button>}
      />
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {loading
        ? <p className="text-sm text-slate-400">Loading…</p>
        : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {rows.length === 0 && <p className="text-sm text-slate-400">No announcements yet.</p>}
            {rows.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    {r.isPinned && <Pin size={14} className="text-amber-500" />} {r.title}
                  </h3>
                  <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="whitespace-pre-line text-sm text-slate-600">{r.body}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => startEdit(r)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 size={14} /></Button>
                </div>
              </div>
            ))}
          </div>
        )}

      <Modal
        open={editing !== null}
        title={editing === 'new' ? 'New announcement' : 'Edit announcement'}
        onClose={() => setEditing(null)}
        footer={<>
          <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </>}
      >
        <div className="grid gap-3">
          <FormField label="Title"><input className={InputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Body"><textarea rows={5} className={InputClass} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></FormField>
          <FormField label="Pin to top?">
            <select className={InputClass} value={String(form.isPinned)} onChange={(e) => setForm({ ...form, isPinned: e.target.value === 'true' })}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </FormField>
        </div>
      </Modal>
    </div>
  );
};

export default CompanyAnnouncementsPage;
