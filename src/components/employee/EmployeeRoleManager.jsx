import React, { useState } from 'react';
import { UserCheck, ShieldAlert, Clock, ArrowRight } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const EmployeeRoleManager = ({ employee, onUpdateRole, loading }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  if (!employee) return null;

  let fallbackRole = 'Intern';
  if (employee.user?.role === 'hr') fallbackRole = 'HR';
  else if (employee.user?.role === 'team_lead') fallbackRole = 'Team Lead';
  else if (employee.user?.role === 'manager') fallbackRole = 'Manager';

  const currentRole = employee.role || employee.designation || fallbackRole;

  const roles = [
    'Intern',
    'Junior Developer',
    'Software Engineer',
    'Senior Software Engineer',
    'Team Lead',
    'HR',
  ];

  const handleUpdateClick = (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (selectedRole === currentRole) return;
    setShowConfirm(true);
  };

  const handleConfirmUpdate = () => {
    setShowConfirm(false);
    onUpdateRole(selectedRole);
  };

  // Extract history
  let history = [];
  if (employee.roleHistory) {
    try {
      history = typeof employee.roleHistory === 'string'
        ? JSON.parse(employee.roleHistory)
        : JSON.parse(JSON.stringify(employee.roleHistory));
    } catch (e) {
      history = [];
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <UserCheck className="text-[#3174ad]" size={20} />
        <h3 className="text-lg font-bold text-slate-800">Role Management</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_340px]">
        {/* Role update form */}
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Current Designation / Role</p>
              <p className="text-lg font-bold text-[#3174ad]">{currentRole}</p>
            </div>
            {employee.promotionDate && (
              <div className="text-xs text-slate-400 font-medium">
                Last updated on {new Date(employee.promotionDate).toLocaleDateString()}
              </div>
            )}
          </div>

          <form onSubmit={handleUpdateClick} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Select New Designation / Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-[#3174ad] bg-white"
                required
              >
                <option value="">-- Choose Role --</option>
                {roles.map((r) => (
                  <option key={r} value={r} disabled={r === currentRole}>
                    {r} {r === currentRole ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              disabled={loading || !selectedRole || selectedRole === currentRole}
              className="sm:w-auto h-[38px] flex items-center justify-center font-bold"
            >
              Update Role
            </Button>
          </form>
        </div>

        {/* History / Audit Log */}
        <div className="border-t border-slate-100 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6">
          <h4 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
            <Clock size={14} /> Role History Timeline
          </h4>

          {history.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs font-semibold text-slate-400">No promotion history recorded yet.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 pl-4 space-y-5">
              {history.map((log, index) => (
                <div key={index} className="relative">
                  {/* Bullet */}
                  <span className="absolute -left-[21px] top-1.5 flex h-2 w-2 rounded-full bg-[#3174ad] ring-4 ring-white" />
                  
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <span>{log.from}</span>
                    <ArrowRight size={12} className="text-slate-400" />
                    <span className="text-[#3174ad]">{log.to}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    By {log.changedBy} on {new Date(log.changedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={showConfirm}
        title="Confirm Designation / Role Change"
        onClose={() => setShowConfirm(false)}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmUpdate} disabled={loading}>
              Confirm & Update
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-amber-100 p-2 text-amber-600">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Are you sure you want to change the designation of <strong>{employee.firstName} {employee.lastName}</strong>?
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs font-medium text-amber-800">
              <span>{currentRole}</span>
              <ArrowRight size={12} />
              <strong>{selectedRole}</strong>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              This action will update their official title and synchronize system roles/permissions (e.g. mapping to Admin/HR/Team Lead system access controls) as necessary.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeRoleManager;
