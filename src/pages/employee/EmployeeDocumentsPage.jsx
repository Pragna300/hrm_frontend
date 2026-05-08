import { useEffect, useState } from 'react';
import { ExternalLink, FileStack } from 'lucide-react';
import { api, getStoredUser } from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';

function canManageDocs(role) {
  return role === 'manager' || role === 'hr';
}

const EmployeeDocumentsPage = () => {
  const user = getStoredUser() || {};
  const [docs, setDocs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [category, setCategory] = useState('');
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [saving, setSaving] = useState(false);

  const loadDocs = () => {
    if (!user.employeeId) return;
    setError('');
    api
      .get('/employee-portal/documents')
      .then((res) => setDocs(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    if (!user.employeeId) return;
    loadDocs();
  }, [user.employeeId]);

  useEffect(() => {
    if (!canManageDocs(user.role)) return;
    api
      .get('/employees')
      .then((res) => setEmployees(Array.isArray(res.data) ? res.data : []))
      .catch(() => setEmployees([]));
  }, [user.role]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim() || !targetEmployeeId) return;
    setSaving(true);
    setError('');
    try {
      await api.post('/employee-portal/documents', {
        employeeId: Number(targetEmployeeId),
        title: title.trim(),
        fileUrl: fileUrl.trim(),
        category: category.trim() || undefined,
      });
      setTitle('');
      setFileUrl('');
      setCategory('');
      loadDocs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!user.employeeId) {
    return (
      <div>
        <PageHeader title="Documents" subtitle="Files shared with you by HR or your manager." />
        <Alert type="error">No employee profile is linked to this account.</Alert>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle="Download files your company has uploaded for your employee record."
      />
      {error && <Alert type="error">{error}</Alert>}

      {canManageDocs(user.role) && (
        <form
          onSubmit={handleUpload}
          className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
            <FileStack size={18} className="text-sky-600" />
            Upload for an employee
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block text-sm">
              <span className="text-slate-600">Employee</span>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={targetEmployeeId}
                onChange={(e) => setTargetEmployeeId(e.target.value)}
                required
              >
                <option value="">Select…</option>
                {employees.map((em) => (
                  <option key={em.id} value={em.id}>
                    {em.firstName} {em.lastName} ({em.employeeCode})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Title</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="text-slate-600">File URL (hosted file link)</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder="https://…"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Category (optional)</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </label>
          </div>
          <div className="mt-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Add document'}
            </Button>
          </div>
        </form>
      )}

      {docs.length === 0 ? (
        <p className="text-sm text-slate-400">No documents yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
          {docs.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold text-slate-900">{d.title}</p>
                <p className="text-xs text-slate-500">
                  {d.category || 'General'} · {new Date(d.createdAt).toLocaleString()}
                  {d.uploadedBy?.email && ` · Uploaded by ${d.uploadedBy.email}`}
                </p>
              </div>
              <a
                href={d.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100"
              >
                Open <ExternalLink size={12} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmployeeDocumentsPage;
