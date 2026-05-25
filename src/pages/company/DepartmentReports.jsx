import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, AlertCircle } from 'lucide-react';
import { fetchDepartmentsReport } from '../../api/reportsApi';
import DepartmentTable from '../../components/reports/DepartmentTable';

export default function DepartmentReports() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDepartments() {
      setLoading(true);
      setError('');
      try {
        const response = await fetchDepartmentsReport();
        const list = Array.isArray(response) ? response : (response && response.data) ? response.data : [];
        setDepartments(list);
      } catch (err) {
        setError(err?.message || 'Unable to load department report.');
      } finally {
        setLoading(false);
      }
    }
    loadDepartments();
  }, []);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/company/reports')}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <ArrowLeft size={16} /> Reports dashboard
        </button>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Department Reports</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Departments</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">
            View every department, headcount, and drill into employee details.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-72 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
          <Loader size={36} className="animate-spin text-indigo-500" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : departments.length === 0 ? (
        <div className="flex h-72 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm text-slate-500">
          <AlertCircle size={32} className="mb-3" />
          <p className="text-base font-medium">No departments found.</p>
          <p className="mt-2 text-sm text-slate-400">Add departments from the structure page to start reporting.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm text-slate-500">Total departments</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{departments.length}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/company/reports')}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back to reports
            </button>
          </div>

          <DepartmentTable departments={departments} onView={(department) => navigate(`/company/reports/departments/${department.id}`)} />
        </div>
      )}
    </div>
  );
}
