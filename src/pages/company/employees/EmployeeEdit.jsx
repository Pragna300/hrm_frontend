import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import EmployeeForm from './EmployeeForm';
import { mapEmployeeToForm, buildPayload, emptyEmployeeForm } from './employeeFormConfig';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import Button from '../../../components/ui/Button';

const EmployeeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState(null);
  const [form, setForm] = useState(emptyEmployeeForm);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [empDetail, empList, dep, loc, shift] = await Promise.all([
        api.get(`/employees/${id}`),
        api.get('/employees'),
        api.get('/departments').catch((e) => { console.warn('Departments API failed:', e.message); return { data: [] }; }),
        api.get('/locations').catch((e)  => { console.warn('Locations API failed:',   e.message); return { data: [] }; }),
        api.get('/shifts').catch((e)     => { console.warn('Shifts API failed:',      e.message); return { data: [] }; }),
      ]);
      
      setEmployee(empDetail.data);
      setForm(mapEmployeeToForm(empDetail.data));
      setEmployees(empList.data || []);
      setDepartments(dep.data || []);
      setLocations(loc.data || []);
      setShifts(shift.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const lookups = useMemo(() => ({
    departments: departments.map((d) => ({ id: d.id, label: d.name })),
    locations:   locations.map((l) => ({ id: l.id, label: l.name })),
    shifts:      shifts.map((s) => ({ id: s.id, label: s.name })),
    employees:   employees
      .filter((e) => e.id !== Number(id)) // exclude self from reporting manager list
      .map((e) => ({ id: e.id, label: `${e.firstName} ${e.lastName}` })),
  }), [employees, departments, locations, shifts, id]);

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = buildPayload(form, true);
      const res = await api.put(`/employees/${id}`, payload);
      setMessage(res.message || 'Employee updated successfully');
      setTimeout(() => {
        navigate(`/employees/${id}/view`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save employee changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !employee) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3174ad] border-t-transparent"></div>
      </div>
    );
  }

  const fullName = employee ? `${employee.firstName} ${employee.lastName}` : 'Edit Employee';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Details: ${fullName}`}
        subtitle="Modify employee credentials, identity, contact, job details and bank details."
        actions={
          <Button variant="secondary" onClick={() => navigate(`/employees/${id}/view`)}>
            Back to profile
          </Button>
        }
      />

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {message && <Alert type="success" onClose={() => setMessage('')}>{message}</Alert>}

      {employee && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <EmployeeForm
            form={form}
            onChange={setForm}
            onSubmit={handleSubmit}
            saving={saving}
            isEdit={true}
            lookups={lookups}
            onCancel={() => navigate(`/employees/${id}/view`)}
          />
        </div>
      )}
    </div>
  );
};

export default EmployeeEdit;
