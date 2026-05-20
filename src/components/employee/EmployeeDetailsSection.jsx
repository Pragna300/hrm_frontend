import React, { useState } from 'react';
import { User, Shield, Briefcase, FileText, Heart } from 'lucide-react';

const EmployeeDetailsSection = ({ employee }) => {
  const [activeTab, setActiveTab] = useState('personal');

  if (!employee) return null;

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional Info', icon: Briefcase },
    { id: 'account', label: 'Account Info', icon: Shield },
  ];

  const infoRow = (label, value) => (
    <div className="flex flex-col gap-1 border-b border-slate-50 py-3 sm:flex-row sm:justify-between sm:align-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-700">{value || '—'}</span>
    </div>
  );

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      {/* Tabs */}
      <div className="flex border-b border-slate-100 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all duration-200 ${
                isActive 
                  ? 'border-[#3174ad] text-[#3174ad]' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-1">
        {activeTab === 'personal' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                <User size={16} className="text-[#3174ad]" /> Basic Information
              </h4>
              {infoRow('First Name', employee.firstName)}
              {infoRow('Last Name', employee.lastName)}
              {infoRow('Gender', employee.gender)}
              {infoRow('Date of Birth', employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString(undefined, { dateStyle: 'long' }) : null)}
              {infoRow('Blood Group', employee.bloodGroup)}
            </div>
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                <Heart size={16} className="text-rose-500" /> Emergency & Contact
              </h4>
              {infoRow('Personal Email', employee.personalEmail)}
              {infoRow('Personal Phone', employee.personalPhone)}
              {infoRow('Emergency Contact Name', employee.emergencyName)}
              {infoRow('Emergency Contact Phone', employee.emergencyPhone)}
              {infoRow('Address', employee.addressLine1 ? `${employee.addressLine1}, ${employee.city || ''}, ${employee.state || ''} ${employee.postalCode || ''}, ${employee.country || ''}` : null)}
            </div>
          </div>
        )}

        {activeTab === 'professional' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                <Briefcase size={16} className="text-[#3174ad]" /> Employment Details
              </h4>
              {infoRow('Employee Code', employee.employeeCode)}
              {infoRow('Department', employee.department?.name)}
              {infoRow('Designation / Role', employee.designation || employee.role)}
              {infoRow('Employment Type', employee.employmentType ? employee.employmentType.replace('_', ' ').toUpperCase() : null)}
              {infoRow('Employment Status', employee.employmentStatus ? employee.employmentStatus.toUpperCase() : null)}
              {infoRow('Date Hired', employee.dateHired ? new Date(employee.dateHired).toLocaleDateString(undefined, { dateStyle: 'long' }) : null)}
            </div>
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                <FileText size={16} className="text-[#3174ad]" /> Reporting & Shift
              </h4>
              {infoRow('Reporting Manager', employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : 'No Manager')}
              {infoRow('Shift Schedule', employee.shift?.name)}
              {infoRow('FTE (Full-time Equivalent)', employee.fte ? employee.fte.toString() : null)}
              {infoRow('Contracted Hours / Week', employee.contractedHoursPerWeek ? employee.contractedHoursPerWeek.toString() : null)}
              {infoRow('Monthly CTC', employee.monthlyCtc ? `${employee.monthlyCtc.toLocaleString()} INR` : null)}
              {infoRow('Bank details', employee.bankName ? `${employee.bankName} - IFSC: ${employee.bankIfsc || ''}` : null)}
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="max-w-xl">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
              <Shield size={16} className="text-[#3174ad]" /> System Account & Access
            </h4>
            {infoRow('Official Email', employee.workEmail || employee.user?.email)}
            {infoRow('Username / Login Email', employee.user?.email)}
            {infoRow('System Access Status', employee.user?.isActive ? 'ACTIVE' : 'INACTIVE')}
            {infoRow('System Role', employee.user?.role ? employee.user.role.toUpperCase() : 'EMPLOYEE')}
            {infoRow('Access Permissions', employee.user?.role === 'manager' 
              ? 'Administrator Access (Full Platform Settings, Leaves, Directory)' 
              : employee.user?.role === 'hr'
              ? 'HR Access (Leaves, Workforce Management, Documents)'
              : employee.user?.role === 'team_lead'
              ? 'Team Lead Access (Team overview, Leaves approval)'
              : 'Standard Employee Portal (Self service only)'
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetailsSection;
