import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader, Search, AlertCircle } from 'lucide-react';
import { fetchDepartmentEmployees } from '../../api/reportsApi';
import DepartmentEmployeesTable from '../../components/reports/DepartmentEmployeesTable';

export default function DepartmentEmployees() {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(1000);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEmployees() {
      setLoading(true);
      setError('');
      try {
          const response = await fetchDepartmentEmployees(departmentId, {
            page,
            pageSize,
            search: activeSearch,
          });
          // `fetchDepartmentEmployees` may return either the API envelope ({ success, data })
          // or directly the data object. Normalize to `payload`.
          const payload = response && response.data ? response.data : response;
          setDepartment(payload?.department ?? null);
          setEmployees(payload?.employees || []);
          setSummary(payload?.summary || { totalEmployees: 0, activeEmployees: 0, inactiveEmployees: 0 });
          setTotal(payload?.total || 0);
      } catch (err) {
        setDepartment(null);
        setEmployees([]);
        setSummary(null);
        setTotal(0);
        setError(err?.message || 'Unable to load department employees.');
      } finally {
        setLoading(false);
      }
    }

    if (departmentId) {
      loadEmployees();
    }
  }, [departmentId, page, pageSize, activeSearch]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/company/reports/departments')}
            className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <ArrowLeft size={16} /> Back to departments
          </button>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Department Employees</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
            {department?.name || 'Department Employees'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">
            Browse employee details for this department, with search and pagination.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total employees</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{summary?.totalEmployees ?? 0}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Active</p>
            <p className="mt-3 text-3xl font-bold text-emerald-600">{summary?.activeEmployees ?? 0}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Inactive</p>
            <p className="mt-3 text-3xl font-bold text-red-600">{summary?.inactiveEmployees ?? 0}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Search employees</label>
          <div className="mt-3 flex gap-2">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Name, email or code"
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="button"
              onClick={() => {
                setPage(1);
                setActiveSearch(searchTerm.trim());
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Search size={16} /> Search
            </button>
          </div>
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
      ) : employees.length === 0 ? (
        <div className="flex h-72 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm text-slate-500">
          <AlertCircle size={32} className="mb-3" />
          <p className="text-base font-medium">No employees found.</p>
          <p className="mt-2 text-sm text-slate-400">Try a different search query or adjust the page.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <DepartmentEmployeesTable employees={employees} />

          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-slate-700 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              Showing {employees.length} of {total} employee{total !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">Page {page} / {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
