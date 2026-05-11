import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authFetch } from '../../api/client';
import TaskStatusBadge from '../../components/TaskStatusBadge';
import { Plus, Search, Filter, Loader2, Calendar, User, MoreVertical } from 'lucide-react';

const AdminTaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await authFetch('/tasks/admin');
        const data = await res.json();
        if (data.success) setTasks(data.data);
      } catch (err) {
        console.error('Failed to fetch tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.taskName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Task Management</h1>
          <p className="text-slate-500 text-sm">Monitor and manage all tasks assigned to your employees.</p>
        </div>
        <Link 
          to="/admin/tasks/create" 
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} />
          <span>New Task</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by task name or subject..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none transition-all appearance-none pr-10 relative"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Task Info</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Assigned To</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Timeline</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Priority</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    No tasks found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-blue-600 uppercase tracking-tighter mb-0.5">{task.subject}</span>
                        <span className="text-sm font-bold text-slate-800">{task.taskName}</span>
                        {task.description && <span className="text-xs text-slate-500 mt-1 line-clamp-1">{task.description}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                          {task.employeeName?.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{task.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-400" />
                          <span>Assign: {new Date(task.dateAssigned).toLocaleDateString()}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'text-rose-500' : ''}`}>
                          <Calendar size={12} />
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-xs font-black uppercase ${
                        task.priority === 'High' ? 'text-rose-600' : 
                        task.priority === 'Medium' ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <TaskStatusBadge status={task.status} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTaskList;
