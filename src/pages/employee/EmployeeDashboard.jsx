import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Building2, 
  Calendar, 
  Mail, 
  Phone, 
  Smartphone,
  Pencil,
  FileSearch,
  Inbox,
  AlertCircle,
  TrendingUp,
  Award
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const EmployeeDashboard = () => {
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(new Date());
  const [user, setUser] = useState({ name: 'Employee', role: 'employee' });

  useEffect(() => {
    const savedUser = localStorage.getItem('shnoor_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const t = setInterval(() => setNow(new Date()), 1000);
    fetchToday();
    return () => clearInterval(t);
  }, []);

  async function fetchToday() {
    try {
      const res = await fetch(`${API}/attendance/today`);
      const data = await res.json();
      if (data.success) setTodayLog(data.data);
    } catch {
      setError('Cannot reach server');
    } finally {
      setLoading(false);
    }
  }

  async function handleTap(action) {
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/attendance/${action}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) await fetchToday();
      else setError(data.message);
    } catch {
      setError('Cannot reach server');
    } finally {
      setActionLoading(false);
    }
  }

  function formatTime(ts) {
    if (!ts) return '--:--';
    return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  const isClockedIn = todayLog?.checkIn && !todayLog?.checkOut;
  const isCompleted = todayLog?.checkIn && todayLog?.checkOut;

  return (
    <div className="v6-dashboard-grid">
      {/* Left Column - Premium Profile Card */}
      <div className="v6-profile-col">
        <div className="v6-card v6-profile-card">
          <div className="v6-profile-hero">
            <div className="v6-avatar-ring">
              <div className="v6-avatar-inner">{user.name.charAt(0)}</div>
            </div>
            <h3>{user.name}</h3>
            <p className="v6-rank">Strategic Operations Specialist</p>
            <div className="v6-gold-badges">
              <span className="v6-g-badge"><Award size={10}/> Gold Performer</span>
            </div>
          </div>

          <div className="v6-info-list">
            <InfoRowV6 label="Employee ID" value="SH-2026-001" />
            <InfoRowV6 label="Organization" value="SHNOOR International LLC" />
            <InfoRowV6 label="Location" value="Global Operations" />
            <InfoRowV6 label="Manager" value="Strategic Office" />
          </div>

          <hr className="v6-divider" />

          <div className="v6-info-list contact">
            <InfoRowV6 label="Official Mail" value={user.email} />
            <InfoRowV6 label="Phone" value="+91 22 4000 8000" />
          </div>
        </div>
      </div>

      {/* Right Column - Attendance & Metrics */}
      <div className="v6-content-col">
        {/* Modern Attendance Card */}
        <div className="v6-card v6-att-card">
          <div className="v6-att-top">
            <div className="v6-date-pill">
              {now.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' })}
            </div>
            <div className="v6-live-clock">
              {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>

          <div className="v6-att-body">
            <div className="v6-att-metrics">
              <div className="v6-metric">
                <span className="v6-m-val">{isCompleted ? `${Math.floor(todayLog.totalMinutes / 60)}h ${todayLog.totalMinutes % 60}m` : '0h 0m'}</span>
                <span className="v6-m-lbl">Effective Hours</span>
              </div>
              <div className="v6-m-divider"></div>
              <div className="v6-metric">
                <span className="v6-m-val gold">{formatTime(todayLog?.checkIn)}</span>
                <span className="v6-m-lbl">Entry Log</span>
              </div>
            </div>

            <div className="v6-att-action">
              {error && <div className="v6-error-tag"><AlertCircle size={12}/> {error}</div>}
              {!isClockedIn ? (
                <button 
                  className={`v6-btn-att tap-in ${isCompleted ? 'done' : ''}`}
                  onClick={() => handleTap('tap-in')}
                  disabled={isCompleted || actionLoading}
                >
                  {isCompleted ? 'Shift Complete' : actionLoading ? 'Processing...' : 'Tap In'}
                </button>
              ) : (
                <button className="v6-btn-att tap-out" onClick={() => handleTap('tap-out')} disabled={actionLoading}>
                  {actionLoading ? 'Processing...' : 'Tap Out'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Row */}
        <div className="v6-metric-row">
          <div className="v6-card v6-metric-card">
            <div className="v6-m-header">
              <TrendingUp size={16} className="v6-m-icon"/>
              <h4>Working Efficiency</h4>
            </div>
            <div className="v6-m-bar-bg"><div className="v6-m-bar-fill" style={{ width: '85%' }}></div></div>
            <span className="v6-m-footer">85% vs last month</span>
          </div>
          <div className="v6-card v6-metric-card">
            <div className="v6-m-header">
              <Calendar size={16} className="v6-m-icon"/>
              <h4>Leave Balance</h4>
            </div>
            <div className="v6-m-val-large">24 <span className="small">Days</span></div>
            <span className="v6-m-footer">Prorated for 2026</span>
          </div>
        </div>

        {/* Empty States Row */}
        <div className="v6-bottom-row">
          <div className="v6-card v6-empty-card">
            <h4>Pending Authorizations</h4>
            <div className="v6-empty-content">
              <Inbox size={48} />
              <p>All items cleared</p>
            </div>
          </div>
          <div className="v6-card v6-empty-card">
            <h4>Company Announcements</h4>
            <div className="v6-empty-content">
              <FileSearch size={48} />
              <p>No new updates</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .v6-dashboard-grid { display: grid; grid-template-columns: 320px 1fr; gap: 24px; font-family: 'Inter', sans-serif; }
        
        .v6-card { background: #fff; border: 1px solid #eef2f6; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        
        /* Profile Card */
        .v6-profile-card { padding: 35px 25px; text-align: center; }
        .v6-avatar-ring { 
          width: 90px; height: 90px; margin: 0 auto 20px; border-radius: 50%; 
          padding: 4px; background: linear-gradient(135deg, #3174ad, #f59e0b);
        }
        .v6-avatar-inner { 
          width: 100%; height: 100%; background: #1a365d; color: white; 
          border-radius: 50%; display: flex; align-items: center; justify-content: center; 
          font-size: 32px; font-weight: 900; 
        }
        .v6-profile-hero h3 { font-size: 20px; font-weight: 800; color: #1a365d; margin-bottom: 4px; }
        .v6-rank { font-size: 13px; color: #718096; margin-bottom: 12px; }
        .v6-gold-badges { display: flex; justify-content: center; margin-bottom: 25px; }
        .v6-g-badge { background: #fffaf0; color: #f59e0b; border: 1px solid #feebc8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; display: flex; align-items: center; gap: 6px; }
        
        .v6-info-list { text-align: left; display: flex; flex-direction: column; gap: 15px; }
        .v6-info-row { display: flex; flex-direction: column; }
        .v6-info-row .lbl { font-size: 11px; font-weight: 600; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.5px; }
        .v6-info-row .val { font-size: 14px; font-weight: 600; color: #2d3748; }
        .v6-divider { border: 0; border-top: 1px solid #f1f3f5; margin: 25px 0; }

        /* Attendance Card */
        .v6-att-card { padding: 0; overflow: hidden; }
        .v6-att-top { background: #f8fafc; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eef2f6; }
        .v6-date-pill { font-size: 12px; font-weight: 700; color: #3174ad; text-transform: uppercase; }
        .v6-live-clock { font-family: monospace; font-size: 14px; font-weight: 700; color: #1a365d; }
        
        .v6-att-body { padding: 35px 25px; display: flex; align-items: center; justify-content: space-between; }
        .v6-att-metrics { display: flex; gap: 40px; align-items: center; }
        .v6-m-divider { width: 1px; height: 40px; background: #eef2f6; }
        .v6-metric { display: flex; flex-direction: column; }
        .v6-m-val { font-size: 28px; font-weight: 900; color: #1a365d; }
        .v6-m-val.gold { color: #f59e0b; }
        .v6-m-lbl { font-size: 12px; font-weight: 600; color: #718096; }

        .v6-btn-att { 
          padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 800; 
          cursor: pointer; border: none; transition: 0.3s;
        }
        .v6-btn-att.tap-in { background: #3174ad; color: white; box-shadow: 0 4px 12px rgba(49, 116, 173, 0.2); }
        .v6-btn-att.tap-in:hover { background: #2b6cb0; transform: translateY(-2px); }
        .v6-btn-att.tap-out { background: #f45b5b; color: white; box-shadow: 0 4px 12px rgba(244, 91, 91, 0.2); }
        .v6-btn-att.done { background: #f8fafc; color: #a0aec0; cursor: not-allowed; box-shadow: none; border: 1px solid #eef2f6; }

        /* Metric Row */
        .v6-metric-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
        .v6-metric-card { padding: 25px; }
        .v6-m-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .v6-m-header h4 { font-size: 15px; font-weight: 800; color: #1a365d; }
        .v6-m-icon { color: #f59e0b; }
        .v6-m-bar-bg { height: 8px; background: #f1f3f5; border-radius: 4px; margin-bottom: 12px; }
        .v6-m-bar-fill { height: 100%; background: #3174ad; border-radius: 4px; }
        .v6-m-footer { font-size: 12px; color: #718096; }
        .v6-m-val-large { font-size: 32px; font-weight: 900; color: #1a365d; margin-bottom: 8px; }
        .v6-m-val-large .small { font-size: 14px; font-weight: 600; color: #a0aec0; }

        .v6-bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
        .v6-empty-card { padding: 25px; min-height: 250px; display: flex; flex-direction: column; }
        .v6-empty-card h4 { font-size: 15px; font-weight: 800; color: #1a365d; margin-bottom: 40px; }
        .v6-empty-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #e2e8f0; gap: 15px; }
        .v6-empty-content p { color: #a0aec0; font-size: 14px; font-weight: 600; }

        @media (max-width: 1024px) { .v6-dashboard-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

const InfoRowV6 = ({ label, value }) => (
  <div className="v6-info-row">
    <span className="lbl">{label}</span>
    <span className="val">{value}</span>
  </div>
);

export default EmployeeDashboard;
