import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import EmployeeHeader from '../../../components/employee/EmployeeHeader';
import EmployeeProfileCard from '../../../components/employee/EmployeeProfileCard';
import EmployeeDetailsSection from '../../../components/employee/EmployeeDetailsSection';
import EmployeeRoleManager from '../../../components/employee/EmployeeRoleManager';
import EmployeeDocuments from '../../../components/employee/EmployeeDocuments';
import Alert from '../../../components/ui/Alert';

const EmployeeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchEmployee = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/employees/${id}`);
      setEmployee(res.data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch employee details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const handleUpdateRole = async (newRole) => {
    setUpdatingRole(true);
    setError('');
    setMessage('');
    try {
      const res = await api.put(`/employees/${id}/role`, { role: newRole });
      setMessage(res.message || 'Designation updated successfully');
      // Reload employee details to reflect the updated designation & role history
      await fetchEmployee();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update designation');
    } finally {
      setUpdatingRole(false);
    }
  };

  if (loading && !employee) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3174ad] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EmployeeHeader 
        employee={employee} 
        onEditClick={() => navigate(`/employees/${id}/edit`)} 
      />

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {message && <Alert type="success" onClose={() => setMessage('')}>{message}</Alert>}

      {employee ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Panel */}
          <div className="lg:col-span-4">
            <EmployeeProfileCard employee={employee} />
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <EmployeeDetailsSection employee={employee} />
            <EmployeeRoleManager 
              employee={employee} 
              onUpdateRole={handleUpdateRole} 
              loading={updatingRole} 
            />
            <EmployeeDocuments 
              employee={employee} 
              onRefresh={fetchEmployee} 
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-500 font-medium">Employee not found or could not be loaded.</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeView;
