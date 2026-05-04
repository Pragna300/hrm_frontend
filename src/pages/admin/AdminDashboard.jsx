import React, { useState } from 'react';
import { 
  Users, 
  UserCheck,
  Clock,
  Calendar,
  ShieldCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const [user] = useState(JSON.parse(localStorage.getItem('shnoor_user') || '{"name": "Admin"}'));

  return (
    <div className="v7-admin-dashboard">
      {/* Welcome Header */}
      <div className="v7-admin-header">
        <h1>Welcome Back, {user.name}</h1>
        <p>Your administrative overview for SHNOOR International LLC.</p>
      </div>

      {/* Core Stats Only */}
      <div className="v7-stats-grid">
        <StatCardV7 
          icon={<Users size={24}/>} 
          label="Total Workforce" 
          value="124" 
          color="blue"
        />
        <StatCardV7 
          icon={<UserCheck size={24}/>} 
          label="Today's Attendance" 
          value="118" 
          color="gold"
        />
        <StatCardV7 
          icon={<ShieldCheck size={24}/>} 
          label="Pending Approvals" 
          value="5" 
          color="navy"
        />
      </div>

      {/* Simplified Action Center */}
      <div className="v7-card v7-welcome-card">
        <div className="v7-card-body">
          <h3>Administrative Action Center</h3>
          <p>All departmental systems are running normally. No critical actions required at this time.</p>
          <div className="v7-status-tag">
            <span className="dot"></span> System Optimal
          </div>
        </div>
      </div>

      <style>{`
        .v7-admin-dashboard { display: flex; flex-direction: column; gap: 30px; font-family: 'Inter', sans-serif; }
        
        .v7-admin-header h1 { font-size: 28px; font-weight: 900; color: #1a365d; margin-bottom: 5px; }
        .v7-admin-header p { font-size: 15px; color: #718096; }

        .v7-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .v7-stat-card { padding: 30px; background: #fff; border: 1px solid #eef2f6; border-radius: 12px; }
        .v7-icon-box { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .v7-icon-box.blue { background: #ebf4ff; color: #3174ad; }
        .v7-icon-box.gold { background: #fffaf0; color: #f59e0b; }
        .v7-icon-box.navy { background: #e2e8f0; color: #1a365d; }
        
        .v7-stat-card .lbl { font-size: 14px; font-weight: 600; color: #718096; margin-bottom: 5px; display: block; }
        .v7-stat-card .val { font-size: 32px; font-weight: 900; color: #1a365d; }

        .v7-card { background: #fff; border: 1px solid #eef2f6; border-radius: 12px; padding: 40px; }
        .v7-card h3 { font-size: 18px; font-weight: 800; color: #1a365d; margin-bottom: 10px; }
        .v7-card p { font-size: 15px; color: #718096; margin-bottom: 25px; max-width: 500px; }
        
        .v7-status-tag { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800; color: #28a745; background: #f0fff4; padding: 6px 14px; border-radius: 100px; border: 1px solid #c6f6d5; }
        .v7-status-tag .dot { width: 8px; height: 8px; background: #28a745; border-radius: 50%; }

        @media (max-width: 900px) { .v7-stats-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

const StatCardV7 = ({ icon, label, value, color }) => (
  <div className="v7-stat-card">
    <div className={`v7-icon-box ${color}`}>{icon}</div>
    <span className="lbl">{label}</span>
    <span className="val">{value}</span>
  </div>
);

export default AdminDashboard;
