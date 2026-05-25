import { Eye } from 'lucide-react';

export default function DepartmentTable({ departments, onView }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide text-xs font-semibold">
          <tr>
            <th className="px-4 py-3">Department Name</th>
            <th className="px-4 py-3">Total Employees</th>
            <th className="px-4 py-3">Manager</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {departments.map((department) => (
            <tr key={department.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4 font-medium text-slate-900">{department.name}</td>
              <td className="px-4 py-4 text-slate-600">{department.totalEmployees}</td>
              <td className="px-4 py-4 text-slate-600">{department.managerName || 'Unassigned'}</td>
              <td className="px-4 py-4">
                <button
                  type="button"
                  onClick={() => onView(department)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <Eye size={14} /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
