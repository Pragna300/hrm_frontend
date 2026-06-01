import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { formatInr } from '../../lib/formatMoney';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import FormField, { InputClass } from '../../components/ui/FormField';

const blankPlan = {
  name: '',
  slug: '',
  description: '',
  monthlyPrice: 0,
  yearlyPrice: 0,
  currency: 'INR',
  seatLimit: 10,
  features: '',
  isActive: true,
  isDefault: false,
  sortOrder: 0,
};

const OwnerPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankPlan);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const res = await api.get('/super-admin/plans');
      setPlans(res.data || []);
    } catch (err) {
      setError(err.message);
    }
  }
  useEffect(() => { load(); }, []);

  function startCreate() {
    setEditing('new');
    setForm(blankPlan);
  }
  function startEdit(plan) {
    setEditing(plan.id);
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      monthlyPrice: Number(plan.monthlyPrice),
      yearlyPrice:  Number(plan.yearlyPrice),
      currency: plan.currency,
      seatLimit: plan.seatLimit,
      features: plan.features || '',
      isActive: plan.isActive,
      isDefault: plan.isDefault,
      sortOrder: plan.sortOrder,
    });
  }

  async function save() {
    setSaving(true);
    try {
      if (editing === 'new') {
        await api.post('/super-admin/plans', form);
      } else {
        await api.put(`/super-admin/plans/${editing}`, form);
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'name', header: 'Plan', render: (r) => <span className="font-semibold text-slate-800">{r.name}</span> },
    { key: 'slug', header: 'Slug' },
    { key: 'monthlyPrice', header: 'Monthly', render: (r) => formatInr(r.monthlyPrice) },
    { key: 'yearlyPrice',  header: 'Yearly',  render: (r) => formatInr(r.yearlyPrice) },
    { key: 'seatLimit', header: 'Seat Limit' },
    {
      key: 'flags',
      header: 'Flags',
      render: (r) => (
        <div className="flex gap-2 text-xs">
          {r.isDefault && <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700">Default</span>}
          {!r.isActive && <span className="rounded bg-slate-200 px-2 py-0.5 text-slate-700">Inactive</span>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <Button size="sm" variant="secondary" onClick={() => startEdit(r)}>Edit</Button>
      ),
    },
    {
      key: 'subscribe',
      header: 'Subscribe',
      render: (r) => (
        <Button size="sm" variant="primary" onClick={() => navigate(`/owner/subscription?priceId=${r.id}`)}>Subscribe</Button>
      ),
    },
  ];

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div>
      <PageHeader
        title="Plans"
        subtitle="Pricing tiers shown on the registration page and applied at sign-up."
        actions={<Button onClick={startCreate}>+ New plan</Button>}
      />
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      <DataTable columns={columns} rows={plans} emptyText="No plans defined" />

      <Modal
        open={editing !== null}
        title={editing === 'new' ? 'Create plan' : 'Edit plan'}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Name" required><input className={InputClass} value={form.name} onChange={(e) => update('name', e.target.value)} /></FormField>
          <FormField label="Slug" required><input className={InputClass} value={form.slug} onChange={(e) => update('slug', e.target.value)} /></FormField>
          <FormField label="Monthly Price"><input type="number" className={InputClass} value={form.monthlyPrice} onChange={(e) => update('monthlyPrice', e.target.value)} /></FormField>
          <FormField label="Yearly Price"><input type="number" className={InputClass} value={form.yearlyPrice} onChange={(e) => update('yearlyPrice', e.target.value)} /></FormField>
          <FormField label="Currency"><input className={InputClass} value={form.currency} onChange={(e) => update('currency', e.target.value)} /></FormField>
          <FormField label="Seat Limit"><input type="number" className={InputClass} value={form.seatLimit} onChange={(e) => update('seatLimit', e.target.value)} /></FormField>
          <FormField label="Sort Order"><input type="number" className={InputClass} value={form.sortOrder} onChange={(e) => update('sortOrder', e.target.value)} /></FormField>
          <FormField label="Default plan?">
            <select className={InputClass} value={String(form.isDefault)} onChange={(e) => update('isDefault', e.target.value === 'true')}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </FormField>
          <div className="col-span-2">
            <FormField label="Description">
              <textarea className={InputClass} rows={2} value={form.description} onChange={(e) => update('description', e.target.value)} />
            </FormField>
          </div>
          <div className="col-span-2">
            <FormField label="Features (comma separated, displayed publicly)">
              <textarea className={InputClass} rows={2} value={form.features} onChange={(e) => update('features', e.target.value)} />
            </FormField>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OwnerPlans;
