import { useState, useEffect } from 'react';
import { Users, UserCheck, ShieldCheck, Plus, X, Mail, Lock, UserPlus } from 'lucide-react';
import { fetchMe, persistSessionUser, API_BASE } from '../../api/client';

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('shnoor_user') || '{"name": "Admin"}');
  } catch {
    return { name: 'Admin' };
  }
}

const AdminDashboard = () => {
  const [user, setUser] = useState(readStoredUser);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchMe()
      .then((u) => {
        persistSessionUser(u);
        setUser(u);
      })
      .catch(() => {
        /* keep cached user if /me fails */
      });
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('shnoor_token');
      const res = await fetch(`${API_BASE}/members/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `${formData.role === 'admin' ? 'Admin' : 'Employee'} added successfully! Credentials logged in server console.` });
        setFormData({ name: '', email: '', password: '', role: 'employee' });
        setTimeout(() => setIsModalOpen(false), 2000);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch {
      setMessage({ type: 'error', text: 'Server connection error' });
    } finally {
      setLoading(false);
    }
  };

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

      {/* Tasks & Action Center */}
      <div className="v7-dashboard-grid">
        <div className="v7-card v7-tasks-card">
          <div className="v7-card-header">
            <h3>Administrative Tasks</h3>
          </div>
          <div className="v7-task-list">
            <div className="v7-task-item primary-action" onClick={() => setIsModalOpen(true)}>
              <div className="task-info">
                <div className="action-icon"><UserPlus size={18} /></div>
                <div>
                  <p>Onboard New Employee</p>
                  <span>Add a new staff member to the organization</span>
                </div>
              </div>
              <Plus size={18} />
            </div>
            <div className="v7-task-item">
              <div className="task-info">
                <span className="task-tag high">High</span>
                <p>Complete monthly payroll audit</p>
              </div>
              <button className="task-btn">View</button>
            </div>
            <div className="v7-task-item">
              <div className="task-info">
                <span className="task-tag mid">Mid</span>
                <p>Review new employee onboarding docs</p>
              </div>
              <button className="task-btn">View</button>
            </div>
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

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="v7-modal-overlay">
          <div className="v7-modal">
            <div className="modal-header">
              <h2>Add New Employee</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            {message.text && (
              <div className={`modal-alert ${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleAddMember} className="modal-form">
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <UserPlus size={18} className="icon" />
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Work Email</label>
                <div className="input-with-icon">
                  <Mail size={18} className="icon" />
                  <input 
                    type="email" 
                    placeholder="john@company.com" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Temporary Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="icon" />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>


              <button className="submit-btn" disabled={loading}>
                {loading ? 'Processing...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .v7-admin-dashboard { display: flex; flex-direction: column; gap: 30px; font-family: 'Inter', sans-serif; }
        
        .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .v7-admin-header h1 { font-size: 28px; font-weight: 900; color: #1a365d; margin-bottom: 5px; }
        .v7-admin-header p { font-size: 15px; color: #718096; }
        
        .v7-btn-add { display: flex; align-items: center; gap: 8px; background: #1a365d; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .v7-btn-add:hover { background: #2d3748; transform: translateY(-1px); }

        .v7-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .v7-stat-card { padding: 30px; background: #fff; border: 1px solid #eef2f6; border-radius: 12px; }
        .v7-icon-box { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .v7-icon-box.blue { background: #ebf4ff; color: #3174ad; }
        .v7-icon-box.gold { background: #fffaf0; color: #f59e0b; }
        .v7-icon-box.navy { background: #e2e8f0; color: #1a365d; }
        
        .v7-stat-card .lbl { font-size: 14px; font-weight: 600; color: #718096; margin-bottom: 5px; display: block; }
        .v7-stat-card .val { font-size: 32px; font-weight: 900; color: #1a365d; }

        .v7-dashboard-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }
        .v7-card { background: #fff; border: 1px solid #eef2f6; border-radius: 12px; padding: 30px; }
        .v7-card h3 { font-size: 18px; font-weight: 800; color: #1a365d; margin-bottom: 20px; }
        
        .v7-task-list { display: flex; flex-direction: column; gap: 15px; }
        .v7-task-item { display: flex; align-items: center; justify-content: space-between; padding: 15px; background: #f8fafc; border-radius: 10px; border: 1px solid #edf2f7; }
        .task-info { display: flex; align-items: center; gap: 15px; }
        .task-info p { font-size: 14px; font-weight: 600; color: #2d3748; }
        .task-tag { font-size: 10px; font-weight: 900; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; }
        .task-tag.high { background: #fed7d7; color: #c53030; }
        .task-tag.mid { background: #feebc8; color: #975a16; }
        .task-tag.low { background: #e2e8f0; color: #4a5568; }
        .task-btn { background: white; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; color: #1a365d; cursor: pointer; }

        .v7-status-tag { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800; color: #28a745; background: #f0fff4; padding: 6px 14px; border-radius: 100px; border: 1px solid #c6f6d5; }
        .v7-status-tag .dot { width: 8px; height: 8px; background: #28a745; border-radius: 50%; }

        /* Modal Styles */
        .v7-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .v7-modal { background: white; width: 100%; max-width: 450px; border-radius: 20px; padding: 30px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        .modal-header h2 { font-size: 20px; font-weight: 900; color: #1a365d; }
        .close-btn { background: none; border: none; color: #a0aec0; cursor: pointer; }
        
        .modal-alert { padding: 12px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 20px; text-align: center; }
        .modal-alert.success { background: #f0fff4; color: #22543d; border: 1px solid #c6f6d5; }
        .modal-alert.error { background: #fff5f5; color: #742a2a; border: 1px solid #fed7d7; }

        .modal-form { display: flex; flex-direction: column; gap: 20px; }
        .input-group label { font-size: 12px; font-weight: 800; color: #4a5568; margin-bottom: 8px; display: block; }
        .input-with-icon { position: relative; }
        .input-with-icon .icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #cbd5e0; }
        .input-with-icon input { width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; }
        .input-with-icon input:focus { border-color: #1a365d; box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.05); }

        .v7-task-item.primary-action { background: #ebf4ff; border-color: #bee3f8; cursor: pointer; transition: 0.2s; }
        .v7-task-item.primary-action:hover { background: #bee3f8; transform: scale(1.02); }
        .v7-task-item.primary-action .action-icon { width: 36px; height: 36px; background: #3182ce; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .v7-task-item.primary-action p { margin: 0; color: #2c5282; }
        .v7-task-item.primary-action span { font-size: 11px; color: #4299e1; font-weight: 600; }

        .role-selector { display: flex; gap: 20px; padding: 5px 0; }
        .radio-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; font-weight: 600; color: #2d3748; }
        .radio-label input { width: 18px; height: 18px; cursor: pointer; }

        .modal-form .submit-btn { background: #1a365d; color: white; border: none; padding: 14px; border-radius: 10px; font-weight: 700; cursor: pointer; margin-top: 10px; }
        .modal-form .submit-btn:disabled { opacity: 0.7; }

        @media (max-width: 900px) { 
          .v7-stats-grid { grid-template-columns: 1fr; } 
          .v7-dashboard-grid { grid-template-columns: 1fr; }
        }
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
