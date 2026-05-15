import { useState, useEffect } from 'react';
import { Inbox } from 'lucide-react';
import { authFetch, fetchMe, persistSessionUser } from '../../api/client';
import EmployeeAttendancePanel from './EmployeeAttendancePanel';
import DashboardCards from '../../components/DashboardCards';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';

const EmployeeDashboard = () => {
  const [todayLog, setTodayLog] = useState(null);
  const [stats, setStats] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [now, setNow] = useState(new Date());
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('shnoor_user');
      return s ? JSON.parse(s) : { name: 'Employee', role: 'employee' };
    } catch {
      return { name: 'Employee', role: 'employee' };
    }
  });

  async function fetchToday() {
    try {
      const res = await authFetch('/attendance/today');
      const data = await res.json();
      if (data.success) setTodayLog(data.data);
    } catch {
      // ignore — dashboard still renders
    }
  }

  const [recentTasks, setRecentTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  async function fetchStats() {
    try {
      const res = await authFetch('/tasks/stats');
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchRecentTasks() {
    try {
      const res = await authFetch('/tasks/my-tasks');
      const data = await res.json();
      if (data.success) setRecentTasks(data.data.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTasks(false);
    }
  }

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);

    // Parallel fetching for faster load
    Promise.all([
      fetchMe().then(u => {
        setUser(u);
        persistSessionUser(u);
      }),
      fetchToday(),
      fetchStats(),
      fetchRecentTasks()
    ]).catch(() => {});

    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  async function handleTap(action) {
    setActionLoading(true);
    try {
      const res = await authFetch(`/attendance/${action}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) await fetchToday();
    } catch {
      // ignore
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="v7-dashboard-container">
      <div className="v7-grid">
        {/* Left Profile Column */}
        <aside className="v7-profile-sidebar">
          <div className="v7-card v7-profile-card">
            <div className="v7-profile-header">
              <div className="v7-avatar-container">
                <div className="v7-avatar-glow"></div>
                <div className="v7-avatar-circle">
                  {user.profilePhotoUrl ? (
                    <img src={user.profilePhotoUrl} alt={user.name} />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
              </div>
              <h2 className="v7-user-name">{user.name}</h2>
              <p className="v7-user-title">{user.designation || 'Employee'}</p>
              <div className="v7-user-tags">
                <span className="v7-tag">{user.employmentType ? user.employmentType.replace('_', ' ') : 'Full Time'}</span>
                {user.organizationSector && <span className="v7-tag">{user.organizationSector}</span>}
              </div>
            </div>

            <div className="v7-profile-details">
              <DetailRow label="Employee ID" value={user.employeeCode || '—'} />
              <DetailRow label="Company" value={user.organizationName || '—'} />
              <DetailRow label="Date Hired" value={user.dateHired ? new Date(user.dateHired).toLocaleDateString('en-GB') : '—'} />
              <DetailRow label="Contracted Hours" value={user.contractedHoursPerWeek ? `${user.contractedHoursPerWeek} (FTE: ${user.fte || '1.00'})` : '—'} />
              
              <div className="v7-detail-divider"></div>

              <DetailRow label="Official Email" value={user.workEmail || user.email || '—'} isEmail />
              <DetailRow label="Work Phone" value={user.workPhone || '—'} />
              <DetailRow label="Personal Email" value={user.personalEmail || '—'} isEmail isEditable />
              <DetailRow label="Personal Mobile" value={user.personalPhone || '—'} isEditable />
            </div>

            <Link to="/employee/tasks" className="mt-6 flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-all">
               <ClipboardList size={18} />
               <span>View My Tasks</span>
            </Link>
          </div>
        </aside>

        {/* Right Content Column */}
        <main className="v7-content-main">
          <EmployeeAttendancePanel
            now={now}
            todayLog={todayLog}
            actionLoading={actionLoading}
            onTap={handleTap}
          />

          <DashboardCards stats={stats} role="employee" />

          <div className="v7-widget-grid">
            <div className="v7-card v7-widget-card md:col-span-2">
              <div className="v7-widget-header flex justify-between items-center mb-4">
                <h3 className="m-0">Recent Assignments</h3>
                <Link to="/employee/tasks" className="text-xs font-black uppercase text-blue-600 hover:underline">View All</Link>
              </div>
              <div className="v7-widget-body">
                {loadingTasks ? (
                   <p className="text-xs text-slate-400">Loading tasks...</p>
                ) : recentTasks.length === 0 ? (
                   <p className="text-xs text-slate-400 italic">No tasks assigned recently.</p>
                ) : (
                   <div className="space-y-3">
                     {recentTasks.map(t => (
                       <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                         <div>
                            <p className="text-xs font-black text-blue-600 uppercase tracking-tighter">{t.subject}</p>
                            <p className="text-sm font-bold text-slate-800">{t.taskName}</p>
                         </div>
                         <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                           t.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                         }`}>
                           {t.status}
                         </span>
                       </div>
                     ))}
                   </div>
                )}
              </div>
            </div>

            <div className="v7-card v7-widget-card">
              <div className="v7-widget-header">
                <h3>Average Daily Working Hours</h3>
              </div>
              <div className="v7-widget-body">
                <div className="v7-progress-container">
                  <div className="v7-progress-label">
                    <span>{user.name} - {user.designation || 'Employee'}</span>
                  </div>
                  <div className="v7-progress-bar">
                    <div className="v7-progress-fill blue" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="v7-card v7-widget-card">
              <div className="v7-widget-header">
                <h3>On-time Arrival</h3>
              </div>
              <div className="v7-widget-body">
                <div className="v7-progress-container">
                  <div className="v7-progress-label">
                    <span>{user.name} - {user.designation || 'Employee'}</span>
                  </div>
                  <div className="v7-progress-bar">
                    <div className="v7-progress-fill green" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="v7-card v7-widget-card v7-empty-widget">
              <div className="v7-widget-header">
                <h3>Team Members On Leave</h3>
              </div>
              <div className="v7-widget-body centered">
                <div className="v7-empty-state">
                  <Inbox size={48} strokeWidth={1} />
                  <p>Sorry! No Record Found</p>
                </div>
              </div>
            </div>

            <div className="v7-card v7-widget-card v7-empty-widget">
              <div className="v7-widget-header">
                <h3>Leave Approval Pending</h3>
              </div>
              <div className="v7-widget-body centered">
                <div className="v7-empty-state">
                  <Inbox size={48} strokeWidth={1} />
                  <p>Sorry! No Record Found</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .v7-dashboard-container { padding: 0; min-height: 100%; font-family: 'Inter', sans-serif; }
        .v7-grid { display: grid; grid-template-columns: 340px 1fr; gap: 20px; }
        
        .v7-card { background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        
        .v7-profile-card { padding: 30px 20px; }
        .v7-profile-header { text-align: center; margin-bottom: 30px; }
        
        .v7-avatar-container { position: relative; width: 120px; height: 120px; margin: 0 auto 15px; }
        .v7-avatar-circle { 
          width: 100%; height: 100%; border-radius: 50%; background: #2c3e50; color: #fff;
          display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 700;
          overflow: hidden; border: 4px solid #fff; position: relative; z-index: 2;
        }
        .v7-avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
        .v7-avatar-glow {
          position: absolute; top: -5px; left: -5px; right: -5px; bottom: -5px;
          border-radius: 50%; background: linear-gradient(135deg, #3174ad, #f59e0b);
          opacity: 0.15; filter: blur(8px);
        }
        
        .v7-user-name { font-size: 20px; font-weight: 700; color: #1a202c; margin-bottom: 4px; }
        .v7-user-title { font-size: 14px; color: #718096; margin-bottom: 12px; }
        .v7-user-tags { display: flex; justify-content: center; gap: 8px; }
        .v7-tag { font-size: 11px; font-weight: 600; color: #718096; background: #f7fafc; border: 1px solid #edf2f7; padding: 2px 8px; border-radius: 4px; }
        
        .v7-profile-details { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
        .v7-detail-row { display: flex; flex-direction: column; gap: 2px; }
        .v7-detail-label { font-size: 11px; color: #a0aec0; font-weight: 500; }
        .v7-detail-value { font-size: 13px; color: #2d3748; font-weight: 600; display: flex; align-items: center; justify-content: space-between; }
        .v7-detail-value.email { color: #3174ad; }
        .v7-edit-icon { color: #cbd5e0; cursor: pointer; transition: color 0.2s; }
        .v7-edit-icon:hover { color: #3174ad; }
        
        .v7-detail-divider { height: 1px; background: #f1f5f9; margin: 8px 0; }
        
        .v7-content-main { display: flex; flex-direction: column; gap: 20px; }
        
        .v7-widget-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .v7-widget-card { padding: 20px; }
        .v7-widget-header h3 { font-size: 15px; font-weight: 700; color: #2d3748; margin-bottom: 20px; }
        
        .v7-progress-container { width: 100%; }
        .v7-progress-label { font-size: 12px; color: #4a5568; font-weight: 600; margin-bottom: 8px; display: block; }
        .v7-progress-bar { height: 10px; background: #edf2f7; border-radius: 10px; overflow: hidden; }
        .v7-progress-fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; }
        .v7-progress-fill.blue { background: #3174ad; }
        .v7-progress-fill.green { background: #10b981; }
        
        .v7-empty-widget { min-height: 220px; display: flex; flex-direction: column; }
        .v7-widget-body.centered { flex: 1; display: flex; align-items: center; justify-content: center; }
        .v7-empty-state { text-align: center; color: #cbd5e0; }
        .v7-empty-state p { margin-top: 12px; font-size: 14px; font-weight: 600; color: #a0aec0; }
        
        @media (max-width: 1200px) { .v7-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

const DetailRow = ({ label, value, isEmail, isEditable }) => (
  <div className="v7-detail-row">
    <span className="v7-detail-label">{label}</span>
    <div className={`v7-detail-value ${isEmail ? 'email' : ''}`}>
      {value}
      {isEditable && <Inbox size={14} className="v7-edit-icon" />}
    </div>
  </div>
);
export default EmployeeDashboard;
