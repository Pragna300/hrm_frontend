import React from 'react';
import { Mail, Phone, Calendar, Briefcase, MapPin, Shield, Clock } from 'lucide-react';

const EmployeeProfileCard = ({ employee }) => {
  if (!employee) return null;

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const statusColor = employee.employmentStatus === 'active' 
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
    : 'bg-slate-100 text-slate-700 border-slate-200';

  let fallbackRole = 'Intern';
  if (employee.user?.role === 'hr') fallbackRole = 'HR';
  else if (employee.user?.role === 'team_lead') fallbackRole = 'Team Lead';
  else if (employee.user?.role === 'manager') fallbackRole = 'Manager';

  const displayRole = employee.designation || employee.role || fallbackRole;

  return (
    <div className="sticky top-6 flex flex-col gap-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        {employee.profilePhotoUrl ? (
          <img 
            src={employee.profilePhotoUrl} 
            alt={fullName} 
            className="h-28 w-28 rounded-full border-4 border-slate-50 object-cover shadow-sm ring-1 ring-slate-100 transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr from-[#3174ad] to-sky-400 text-3xl font-bold text-white shadow-inner">
            {employee.firstName?.[0]}{employee.lastName?.[0]}
          </div>
        )}
        
        <h3 className="mt-4 text-xl font-bold text-slate-800">{fullName}</h3>
        <p className="text-sm font-medium text-slate-500">{displayRole}</p>
        
        <span className={`mt-3 inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wider ${statusColor}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${employee.employmentStatus === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
          {employee.employmentStatus}
        </span>
      </div>

      <hr className="border-slate-100" />

      {/* Info List */}
      <div className="flex flex-col gap-4 text-sm">
        <div className="flex items-center gap-3 text-slate-600">
          <Briefcase size={16} className="text-[#3174ad]" />
          <div>
            <p className="text-xs text-slate-400 font-medium">Employee ID</p>
            <p className="font-semibold text-slate-700">{employee.employeeCode}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-600">
          <Mail size={16} className="text-[#3174ad]" />
          <div>
            <p className="text-xs text-slate-400 font-medium">Email Address</p>
            <p className="font-semibold text-slate-700 break-all">{employee.workEmail || employee.user?.email || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-600">
          <Phone size={16} className="text-[#3174ad]" />
          <div>
            <p className="text-xs text-slate-400 font-medium">Phone Number</p>
            <p className="font-semibold text-slate-700">{employee.workPhone || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-600">
          <Clock size={16} className="text-[#3174ad]" />
          <div>
            <p className="text-xs text-slate-400 font-medium">Joining Date</p>
            <p className="font-semibold text-slate-700">
              {employee.dateHired ? new Date(employee.dateHired).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
            </p>
          </div>
        </div>

        {employee.departments?.[0]?.department?.name && (
          <div className="flex items-center gap-3 text-slate-600">
            <Shield size={16} className="text-[#3174ad]" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Department</p>
              <p className="font-semibold text-slate-700">{employee.departments?.[0]?.department?.name}</p>
            </div>
          </div>
        )}

        {employee.location?.name && (
          <div className="flex items-center gap-3 text-slate-600">
            <MapPin size={16} className="text-[#3174ad]" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Location</p>
              <p className="font-semibold text-slate-700">{employee.location?.name}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfileCard;
