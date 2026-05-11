import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../api/client';
import { Calendar, User, Type, AlertCircle, Loader2 } from 'lucide-react';

const AdminTaskCreate = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    subject: '',
    task_name: '',
    description: '',
    assigned_to: '',
    due_date: '',
    priority: 'Medium'
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await authFetch('/admin/employees');
        const data = await res.json();
        if (data.success) {
          setEmployees(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch employees', err);
      } finally {
        setFetching(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authFetch('/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        navigate('/admin/tasks');
      } else {
        setError(data.message || 'Failed to create task');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-8 py-6">
          <h1 className="text-2xl font-black text-slate-800">Assign New Task</h1>
          <p className="text-slate-500 text-sm mt-1">Fill in the details to assign a task to your team member.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertCircle size={18} />
              <span className="text-sm font-semibold">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">Subject / Category</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Development"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">Task Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Signup Page"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={formData.task_name}
                  onChange={e => setFormData({...formData, task_name: e.target.value})}
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">Task Description</label>
              <textarea
                rows="3"
                placeholder="Detailed instructions for the employee..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">Assign To Employee</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                  value={formData.assigned_to}
                  onChange={e => setFormData({...formData, assigned_to: e.target.value})}
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.user.id} value={emp.user.id}>
                      {emp.firstName} {emp.lastName} ({emp.user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={formData.due_date}
                  onChange={e => setFormData({...formData, due_date: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">Priority</label>
              <div className="flex gap-4 pt-1">
                {['Low', 'Medium', 'High'].map(p => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="priority"
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      checked={formData.priority === p}
                      onChange={() => setFormData({...formData, priority: p})}
                    />
                    <span className={`text-sm font-bold ${formData.priority === p ? 'text-blue-600' : 'text-slate-500'}`}>
                      {p}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/tasks')}
              className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-70 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTaskCreate;
