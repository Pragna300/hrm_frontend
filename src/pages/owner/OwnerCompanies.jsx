import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import FormField, { InputClass } from '../../components/ui/FormField';

const STATUS_BADGES = {
  active: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

const OwnerCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmSlug, setConfirmSlug] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/super-admin/companies');
      setCompanies(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(id, status) {
    try {
      await api.put(`/super-admin/companies/${id}/status`, { status });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const slug = confirmSlug.trim();
    if (!slug) {
      setError('Enter the company slug to confirm.');
      return;
    }
    setDeleting(true);
    setError('');
    try {
      const q = `?confirmSlug=${encodeURIComponent(slug)}`;
      await api.delete(`/super-admin/companies/${deleteTarget.id}${q}`);
      setDeleteTarget(null);
      setConfirmSlug('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Company',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.name}</div>
          <div className="text-xs text-slate-400">{row.slug}</div>
        </div>
      ),
    },
    { key: 'sector', header: 'Sector', render: (r) => r.sector || '—' },
    {
      key: 'createdAt',
      header: 'Registered',
      render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'),
    },
    { key: 'employees', header: 'Employees', render: (r) => r._count?.employees ?? 0 },
    { key: 'users', header: 'Users', render: (r) => r._count?.users ?? 0 },
    {
      key: 'plan',
      header: 'Plan',
      render: (r) => r.subscriptions?.[0]?.plan?.name || '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGES[r.status] || ''}`}>
          {r.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.status !== 'active' && (
            <Button size="sm" variant="success" onClick={() => changeStatus(r.id, 'active')}>
              Activate
            </Button>
          )}
          {r.status !== 'suspended' && (
            <Button size="sm" variant="secondary" onClick={() => changeStatus(r.id, 'suspended')}>
              Suspend
            </Button>
          )}
          {r.status !== 'cancelled' && (
            <Button size="sm" variant="ghost" onClick={() => changeStatus(r.id, 'cancelled')}>
              Cancel
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={() => { setDeleteTarget(r); setConfirmSlug(''); }}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle="Activate, suspend or cancel billing access. Delete removes the tenant and all HR data permanently (users are detached, not removed)."
      />
      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <DataTable columns={columns} rows={companies} emptyText="No companies yet" />
      )}

      <Modal
        open={!!deleteTarget}
        title="Delete company permanently?"
        onClose={() => !deleting && setDeleteTarget(null)}
        footer={
          <>
            <Button variant="secondary" disabled={deleting} onClick={() => setDeleteTarget(null)}>
              Close
            </Button>
            <Button variant="danger" disabled={deleting} onClick={confirmDelete}>
              {deleting ? 'Deleting…' : 'Delete forever'}
            </Button>
          </>
        }
      >
        {deleteTarget && (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              This will delete <strong>{deleteTarget.name}</strong> and all related employees, attendance, leaves,
              payroll, documents, tasks and news for that tenant. Invoices tied to the subscription are removed with
              the subscription.
            </p>
            <p className="text-amber-800">
              Portal accounts are kept (same email) but disconnected from the company and signed out everywhere.
            </p>
            <FormField label={`Type slug "${deleteTarget.slug}" to confirm`}>
              <input
                className={InputClass}
                value={confirmSlug}
                onChange={(e) => setConfirmSlug(e.target.value)}
                placeholder={deleteTarget.slug}
                autoComplete="off"
              />
            </FormField>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OwnerCompanies;
