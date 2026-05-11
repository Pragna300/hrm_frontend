import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMe, persistSessionUser, authFetch } from '../../api/client';
import DashboardCards from '../../components/DashboardCards';
import { ArrowRight, Loader2 } from 'lucide-react';

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('shnoor_user') || '{"name": "Admin"}');
  } catch {
    return { name: 'Admin' };
  }
}

const AdminDashboard = () => {
  const [user, setUser] = useState(readStoredUser);
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    fetchMe()
      .then((u) => {
        persistSessionUser(u);
        setUser(u);
      })
      .catch(() => {});
    
    authFetch('/tasks/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.data);
      })
      .catch(console.error);

    authFetch('/tasks/admin')
      .then(res => res.json())
      .then(data => {
        if (data.success) setRecentTasks(data.data.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoadingTasks(false));
  }, []);

  return (
    <div className="v7-admin-dashboard">
      {/* Welcome Header */}
      <div className="v7-admin-header">
        <div className="header-top">
          <div>
            <h1>Welcome Back, {user.name}</h1>
            <p>Your administrative overview for {user.organizationName || 'SHNOOR International LLC'}.</p>
          </div>
        </div>
      </div>

      {/* Core Stats */}
      <DashboardCards stats={stats} role="admin" />

      {/* Tasks & Action Center */}
      <div className="v7-dashboard-grid">
        <div className="v7-card v7-tasks-card">
          <div className="v7-card-header flex justify-between items-center mb-6">
            <h3 className="m-0">Administrative Tasks</h3>
            <Link to="/admin/tasks" className="text-blue-600 text-xs font-black uppercase flex items-center gap-1 hover:underline">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="v7-task-list">
            {loadingTasks ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : recentTasks.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-4">No tasks assigned yet.</p>
            ) : (
              recentTasks.map(task => (
                <div key={task.id} className="v7-task-item">
                  <div className="task-info">
                    <span className={`task-tag ${task.priority.toLowerCase()}`}>{task.priority}</span>
                    <p>{task.taskName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400">{task.status}</span>
                    <Link to="/admin/tasks" className="task-btn">View</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="v7-card v7-welcome-card">
          <div className="v7-card-body">
            <h3>System Status</h3>
            <p>All departmental systems are running normally. No critical actions required at this time.</p>
            <div className="v7-status-tag">
              <span className="dot"></span> System Optimal
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .v7-admin-dashboard { display: flex; flex-direction: column; gap: 30px; font-family: 'Inter', sans-serif; }
        
        .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .v7-admin-header h1 { font-size: 28px; font-weight: 900; color: #1a365d; margin-bottom: 5px; }
        .v7-admin-header p { font-size: 15px; color: #718096; }
        
        .v7-dashboard-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }
        .v7-card { background: #fff; border: 1px solid #eef2f6; border-radius: 12px; padding: 30px; }
        .v7-card h3 { font-size: 18px; font-weight: 800; color: #1a365d; }
        
        .v7-task-list { display: flex; flex-direction: column; gap: 15px; }
        .v7-task-item { display: flex; align-items: center; justify-content: space-between; padding: 15px; background: #f8fafc; border-radius: 100px; border: 1px solid #edf2f7; padding-left: 25px; padding-right: 25px; }
        .task-info { display: flex; align-items: center; gap: 15px; }
        .task-info p { font-size: 14px; font-weight: 600; color: #2d3748; }
        .task-tag { font-size: 10px; font-weight: 900; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; }
        .task-tag.high { background: #fed7d7; color: #c53030; }
        .task-tag.medium { background: #feebc8; color: #975a16; }
        .task-tag.low { background: #e2e8f0; color: #4a5568; }
        .task-btn { background: white; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; color: #1a365d; cursor: pointer; }

        .v7-status-tag { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800; color: #28a745; background: #f0fff4; padding: 6px 14px; border-radius: 100px; border: 1px solid #c6f6d5; }
        .v7-status-tag .dot { width: 8px; height: 8px; background: #28a745; border-radius: 50%; }

        @media (max-width: 900px) { 
          .v7-dashboard-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
