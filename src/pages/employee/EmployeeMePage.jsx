import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getStoredUser, persistSessionUser, fetchMe } from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { formatInr } from '../../lib/formatMoney';

const READ_FIELDS = [
  { key: 'employeeCode', label: 'Employee ID' },
  { key: 'designation', label: 'Designation' },
  { key: 'dateHired', label: 'Date hired' },
  { key: 'contractedHoursPerWeek', label: 'Contracted hours / week' },
  { key: 'workEmail', label: 'Work email' },
  { key: 'workPhone', label: 'Work phone' },
  { key: 'bloodGroup', label: 'Blood group' },
];

const EmployeeMePage = () => {
  const navigate = useNavigate();
  const session = getStoredUser() || {};
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session.employeeId) {
      setLoading(false);
      setError('No employee profile is linked to this account.');
      return;
    }
    setError('');
    api
      .get('/employee-portal/profile')
      .then((res) => {
        setProfile(res.data);
        setForm({
          personalEmail: res.data.personalEmail || '',
          personalPhone: res.data.personalPhone || '',
          emergencyName: res.data.emergencyName || '',
          emergencyPhone: res.data.emergencyPhone || '',
          addressLine1: res.data.addressLine1 || '',
          city: res.data.city || '',
          state: res.data.state || '',
          postalCode: res.data.postalCode || '',
          profilePhotoUrl: res.data.profilePhotoUrl || '',
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session.employeeId]);

  function displayValue(key, raw) {
    if (raw == null || raw === '') return '—';
    if (key === 'dateHired') return new Date(raw).toLocaleDateString();
    if (key === 'contractedHoursPerWeek') return String(raw);
    return String(raw);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved('');
    try {
      await api.patch('/employee-portal/profile', form);
      setSaved('Profile updated.');
      const u = await fetchMe();
      persistSessionUser(u);
      const res = await api.get('/employee-portal/profile');
      setProfile(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!session.employeeId) {
    return (
      <div>
        <PageHeader title="Me" subtitle="Your employee profile." />
        <Alert type="error">No employee profile is linked to this account. Ask your administrator to link your user.</Alert>
      </div>
    );
  }

  if (loading) return <p className="text-sm text-slate-400">Loading profile…</p>;

  return (
    <div>
      <PageHeader
        title="Me"
        subtitle="View your record and update the fields your company allows you to edit."
        actions={
          (session.role === 'manager' || session.role === 'hr') && session.employeeId ? (
            <Button type="button" variant="secondary" onClick={() => navigate(`/employees/${session.employeeId}/edit`)}>
              Edit full profile
            </Button>
          ) : null
        }
      />
      {error && <Alert type="error">{error}</Alert>}
      {saved && <Alert type="success">{saved}</Alert>}

      {profile && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Official details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Name</dt>
                <dd className="text-right font-semibold text-slate-900">
                  {profile.firstName} {profile.lastName}
                </dd>
              </div>
              {READ_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex justify-between gap-4">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-right font-medium text-slate-800">{displayValue(key, profile[key])}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Department</dt>
                <dd className="text-right font-medium text-slate-800">{profile.department?.name || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Reporting manager</dt>
                <dd className="text-right font-medium text-slate-800">
                  {profile.manager
                    ? `${profile.manager.firstName} ${profile.manager.lastName} (${profile.manager.employeeCode})`
                    : '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Monthly CTC (reference)</dt>
                <dd className="text-right font-medium text-slate-800">{formatInr(profile.monthlyCtc, { maximumFractionDigits: 0 })}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Editable (self-service)</h3>
            <form onSubmit={handleSave} className="space-y-3 text-sm">
              <label className="block">
                <span className="text-slate-600">Personal email</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={form.personalEmail}
                  onChange={(e) => setForm((f) => ({ ...f, personalEmail: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-slate-600">Personal mobile</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={form.personalPhone}
                  onChange={(e) => setForm((f) => ({ ...f, personalPhone: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-slate-600">Emergency contact name</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={form.emergencyName}
                  onChange={(e) => setForm((f) => ({ ...f, emergencyName: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-slate-600">Emergency mobile</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={form.emergencyPhone}
                  onChange={(e) => setForm((f) => ({ ...f, emergencyPhone: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-slate-600">Address line</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={form.addressLine1}
                  onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-slate-600">City</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-slate-600">State</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-slate-600">Postal code</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={form.postalCode}
                  onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-slate-600">Profile photo URL</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={form.profilePhotoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, profilePhotoUrl: e.target.value }))}
                />
              </label>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default EmployeeMePage;
