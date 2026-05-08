import { useEffect, useMemo, useState } from 'react';
import { authFetch } from '../../api/client';

const initialForm = {
  email: '',
  password: '',
  employeeCode: '',
  firstName: '',
  lastName: '',
  profilePhotoUrl: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  designation: '',
  workEmail: '',
  workPhone: '',
  personalEmail: '',
  personalPhone: '',
  emergencyName: '',
  emergencyPhone: '',
  departmentId: '',
  locationId: '',
  shiftId: '',
  managerId: '',
  employmentType: 'full_time',
  employmentStatus: 'active',
  dateHired: '',
  contractedHoursPerWeek: '40',
  fte: '1',
  bankName: '',
  bankIfsc: '',
  addressLine1: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

function mapEmployeeToForm(employee) {
  return {
    ...initialForm,
    email: employee.user?.email || '',
    employeeCode: employee.employeeCode || '',
    firstName: employee.firstName || '',
    lastName: employee.lastName || '',
    profilePhotoUrl: employee.profilePhotoUrl || '',
    dateOfBirth: employee.dateOfBirth ? String(employee.dateOfBirth).slice(0, 10) : '',
    gender: employee.gender || '',
    bloodGroup: employee.bloodGroup || '',
    designation: employee.designation || '',
    workEmail: employee.workEmail || '',
    workPhone: employee.workPhone || '',
    personalEmail: employee.personalEmail || '',
    personalPhone: employee.personalPhone || '',
    emergencyName: employee.emergencyName || '',
    emergencyPhone: employee.emergencyPhone || '',
    departmentId: employee.departmentId?.toString() || '',
    locationId: employee.locationId?.toString() || '',
    shiftId: employee.shiftId?.toString() || '',
    managerId: employee.managerId?.toString() || '',
    employmentType: employee.employmentType || 'full_time',
    employmentStatus: employee.employmentStatus || 'active',
    dateHired: employee.dateHired ? String(employee.dateHired).slice(0, 10) : '',
    contractedHoursPerWeek: employee.contractedHoursPerWeek?.toString() || '40',
    fte: employee.fte?.toString() || '1',
    bankName: employee.bankName || '',
    bankIfsc: employee.bankIfsc || '',
    addressLine1: employee.addressLine1 || '',
    city: employee.city || '',
    state: employee.state || '',
    postalCode: employee.postalCode || '',
    country: employee.country || 'India',
  };
}

function buildCreatePayload(formData) {
  const payload = {
    email: formData.email.trim(),
    password: formData.password,
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
  };

  for (const [key, value] of Object.entries(formData)) {
    if (['email', 'password', 'firstName', 'lastName'].includes(key)) continue;
    if (value === '' || value == null) continue;
    payload[key] = value;
  }

  return payload;
}

function buildUpdatePayload(formData) {
  const payload = { ...formData };
  payload.email = String(payload.email || '').trim();
  payload.firstName = String(payload.firstName || '').trim();
  payload.lastName = String(payload.lastName || '').trim();
  if (!payload.password) delete payload.password;
  return payload;
}

const AdminEmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  async function loadEmployees() {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch('/admin/employees');
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Unable to load employees');
      setEmployees(data.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load employees');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timerId = setTimeout(() => {
      loadEmployees();
    }, 0);
    return () => clearTimeout(timerId);
  }, []);

  const selectedEmployee = useMemo(
    () => employees.find((item) => item.id === selectedId) || null,
    [employees, selectedId]
  );

  function startCreate() {
    setSelectedId(null);
    setMessage('');
    setFormData(initialForm);
  }

  function startEdit(employee) {
    setSelectedId(employee.id);
    setMessage('');
    setFormData(mapEmployeeToForm(employee));
  }

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const path = selectedId ? `/admin/employees/${selectedId}` : '/admin/employees';
      const method = selectedId ? 'PUT' : 'POST';
      const payload = selectedId ? buildUpdatePayload(formData) : buildCreatePayload(formData);
      const res = await authFetch(path, {
        method,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Save failed');
      setMessage(data.message || 'Saved successfully');
      await loadEmployees();
      if (selectedId) {
        const refreshed = data.data;
        setFormData(mapEmployeeToForm(refreshed));
      } else {
        startCreate();
      }
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Employees</h2>
          <button type="button" onClick={startCreate} className="rounded bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white">
            + New
          </button>
        </div>
        {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
        <div className="space-y-2">
          {employees.map((employee) => (
            <button
              key={employee.id}
              type="button"
              onClick={() => startEdit(employee)}
              className={`w-full rounded border px-3 py-2 text-left ${
                selectedId === employee.id ? 'border-[#3174ad] bg-blue-50' : 'border-slate-200 bg-white'
              }`}
            >
              <p className="text-sm font-semibold text-slate-800">
                {employee.firstName} {employee.lastName}
              </p>
              <p className="text-xs text-slate-500">{employee.user?.email || employee.workEmail || 'No email'}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-800">{selectedEmployee ? 'Edit Employee' : 'Create Employee'}</h2>
        {error ? <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        {message ? <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div> : null}

        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
          {Object.entries({
            email: 'Login Email',
            password: selectedEmployee ? 'New Password (optional)' : 'Password',
            employeeCode: 'Employee Code',
            firstName: 'First Name',
            lastName: 'Last Name',
            profilePhotoUrl: 'Profile Photo URL',
            dateOfBirth: 'Date of Birth',
            gender: 'Gender',
            bloodGroup: 'Blood Group',
            designation: 'Designation',
            workEmail: 'Work Email',
            workPhone: 'Work Phone',
            personalEmail: 'Personal Email',
            personalPhone: 'Personal Phone',
            emergencyName: 'Emergency Contact Name',
            emergencyPhone: 'Emergency Contact Phone',
            departmentId: 'Department Id',
            locationId: 'Location Id',
            shiftId: 'Shift Id',
            managerId: 'Manager Employee Id',
            employmentType: 'Employment Type',
            employmentStatus: 'Employment Status',
            dateHired: 'Date Hired',
            contractedHoursPerWeek: 'Hours/Week',
            fte: 'FTE',
            bankName: 'Bank Name',
            bankIfsc: 'Bank IFSC',
            addressLine1: 'Address',
            city: 'City',
            state: 'State',
            postalCode: 'Postal Code',
            country: 'Country',
          }).map(([field, label]) => (
            <label key={field} className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              {label}
              <input
                type={
                  field === 'password'
                    ? 'password'
                    : field === 'dateHired' || field === 'dateOfBirth'
                      ? 'date'
                      : 'text'
                }
                value={formData[field]}
                onChange={(e) => updateField(field, e.target.value)}
                required={
                  !selectedEmployee && ['email', 'password', 'firstName', 'lastName'].includes(field)
                }
                className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-[#3174ad]"
              />
            </label>
          ))}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-[#3174ad] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : selectedEmployee ? 'Update Employee' : 'Create Employee'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default AdminEmployeesPage;
