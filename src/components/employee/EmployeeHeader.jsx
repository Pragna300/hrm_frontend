import React from 'react';
import { ChevronLeft, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

const EmployeeHeader = ({ employee, onEditClick }) => {
  const navigate = useNavigate();

  const fullName = employee ? `${employee.firstName} ${employee.lastName}` : 'Employee Detail';

  return (
    <div className="flex flex-col gap-4 border-b border-slate-150 pb-5 md:flex-row md:items-center md:justify-between">
      {/* Breadcrumbs and Title */}
      <div>
        <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
          <button 
            onClick={() => navigate('/company/employees')} 
            className="hover:text-slate-600 transition-colors"
          >
            Employees
          </button>
          <span>/</span>
          <span className="text-slate-500">{fullName}</span>
        </div>
        
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/company/employees')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{fullName}</h1>
        </div>
      </div>

      {/* Action Buttons */}
      {employee && (
        <div className="flex gap-2">
          <Button
            onClick={onEditClick}
            className="flex items-center gap-1.5 font-bold"
          >
            <Edit size={14} />
            Edit Employee
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmployeeHeader;
