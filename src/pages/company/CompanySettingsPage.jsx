import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import FormField, { InputClass } from '../../components/ui/FormField';

const FIELDS = [
  { key: 'name',         label: 'Company name' },
  { key: 'sector',       label: 'Sector / Industry' },
  { key: 'contactEmail', label: 'Contact Email' },
  { key: 'contactPhone', label: 'Contact Phone' },
  { key: 'address',      label: 'Address' },
  { key: 'timezone',     label: 'Timezone' },
  { key: 'currency',     label: 'Currency' },
  { key: 'logoUrl',      label: 'Logo URL' },
];

const CompanySettingsPage = () => {
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/company/settings')
      .then((res) => {
        const o = res.data || {};
        const initial = {};
        for (const f of FIELDS) initial[f.key] = o[f.key] ?? '';
        setForm(initial);
      })
      .catch((err) => setError(err.message));
  }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      const res = await api.put('/company/settings', form);
      setMessage(res.message || 'Saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Company settings" subtitle="Edit details that show up across the portal." />
      {error   && <Alert type="error"   onClose={() => setError('')}>{error}</Alert>}
      {message && <Alert type="success" onClose={() => setMessage('')}>{message}</Alert>}

      <form onSubmit={save} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {FIELDS.map((f) => (
          <FormField key={f.key} label={f.label}>
            <input
              className={InputClass}
              value={form[f.key] ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
            />
          </FormField>
        ))}
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
        </div>
      </form>
    </div>
  );
};

export default CompanySettingsPage;
