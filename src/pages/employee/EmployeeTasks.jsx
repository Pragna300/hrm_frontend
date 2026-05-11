import React, { useState, useEffect } from 'react';
import { authFetch } from '../../api/client';
import TaskStatusBadge from '../../components/TaskStatusBadge';
import { Calendar, CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react';

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await authFetch('/tasks/my-tasks');
      const data = await res.json();
      if (data.success) setTasks(data.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleComplete = async (taskId) => {
    setActionLoading(taskId);
    try {
      const res = await authFetch(`/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' })
      });
      if (res.ok) await fetchTasks();
    } catch (err) {
      console.error('Failed to update task', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">My Tasks</h1>
        <p className="text-slate-500 text-sm">Review and manage tasks assigned to you by your manager.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Task Details</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Timeline</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Priority</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    No tasks assigned to you yet.
                  </td>
                </tr>
              ) : (
                tasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-blue-600 uppercase tracking-tighter mb-0.5">{task.subject}</span>
                        <span className="text-sm font-bold text-slate-800">{task.taskName}</span>
                        {task.description && <p className="text-xs text-slate-500 mt-1 max-w-md">{task.description}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-50">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar size={14} className="text-slate-400" />
                          <span>Assigned: {new Date(task.dateAssigned).toLocaleDateString()}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'text-rose-500' : 'text-slate-500'}`}>
                          <Clock size={14} />
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
                    <td className="px-6 py-5">
                      {task.status !== 'Completed' ? (
                        <button 
                          onClick={() => handleComplete(task.id)}
                          disabled={actionLoading === task.id}
                          className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-black hover:bg-emerald-100 transition-all disabled:opacity-50"
                        >
                          {actionLoading === task.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                          <span>Mark Completed</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs px-4 py-2">
                          <CheckCircle size={14} />
                          <span>Finished on {new Date(task.completedAt).toLocaleDateString()}</span>
                        </div>
                      )}
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

export default EmployeeTasks;
