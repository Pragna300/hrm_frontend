import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchMe, getStoredToken, persistSessionUser } from '../api/client';
import { 
  LayoutDashboard, 
  Newspaper, 
  User, 
  FileText, 
  Heart, 
  Calendar, 
  CheckSquare, 
  ShieldCheck, 
  BarChart2, 
  Bell, 
  Network,
  Users,
  Settings,
  CreditCard,
  LogOut
} from 'lucide-react';

function readStoredUser() {
  try {
    const raw = localStorage.getItem('shnoor_user');
    if (!raw) return { name: 'User', role: 'employee' };
    return JSON.parse(raw);
  } catch {
    return { name: 'User', role: 'employee' };
  }
}

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(readStoredUser);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    fetchMe()
      .then((user) => {
        persistSessionUser(user);
        setUserData(user);
      })
      .catch((err) => {
        if (err?.status === 401) {
          localStorage.removeItem('shnoor_token');
          localStorage.removeItem('shnoor_user');
          navigate('/login', { replace: true });
        }
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('shnoor_token');
    localStorage.removeItem('shnoor_user');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: userData.role === 'admin' ? '/admin/overview' : '/employee/overview' },
    { name: 'News', icon: <Newspaper size={18} />, path: '/news' },
    { name: 'Me', icon: <User size={18} />, path: '/me' },
    { name: 'Documents', icon: <FileText size={18} />, path: '/docs' },
    { name: 'Thanks', icon: <Heart size={18} />, path: '/thanks' },
    { name: 'Planner', icon: <Calendar size={18} />, path: '/planner' },
    { name: 'Tasks', icon: <CheckSquare size={18} />, path: '/tasks' },
    { name: 'Authorizations', icon: <ShieldCheck size={18} />, path: '/auths' },
    { name: 'Reports', icon: <BarChart2 size={18} />, path: '/reports' },
    { name: 'Notifications', icon: <Bell size={18} />, path: '/notifications' },
    { name: 'Org Chart', icon: <Network size={18} />, path: '/org-chart' },
  ];

  const adminItems = [
    { name: 'Employees', icon: <Users size={18} />, path: '/admin/employees' },
    { name: 'Leave Settings', icon: <Calendar size={18} />, path: '/admin/leave-settings' },
    { name: 'Payroll', icon: <CreditCard size={18} />, path: '/admin/payroll' },
    { name: 'Settings', icon: <Settings size={18} />, path: '/admin/settings' },
  ];

  return (
    <div className="shnoor-v3-layout">
      {/* Top Black Bar */}
      <header className="shnoor-v3-topbar">
        <div className="topbar-left">
          <img src="/logo.png" alt="SHNOOR Logo" style={{ height: '35px', display: 'block' }} />
          <span className="v3-company-name">SHNOOR International LLC</span>
        </div>
        <div className="topbar-right">
          <div className="v3-user-pill">
            <span className="v3-user-name">{userData.name}</span>
            <div className="v3-user-avatar">{userData.name.charAt(0)}</div>
          </div>
        </div>
      </header>

      <div className="shnoor-v3-body">
        {/* Sidebar */}
        <aside className="shnoor-v3-sidebar">
          <nav className="v3-nav">
            <div className="v3-nav-group">
              {menuItems.map((item) => (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  className={`v3-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="v3-icon">{item.icon}</span>
                  <span className="v3-label">{item.name}</span>
                  {item.badge && <span className="v3-badge">{item.badge}</span>}
                </Link>
              ))}
            </div>

            {userData.role === 'admin' && (
              <div className="v3-nav-group admin">
                <span className="v3-group-label">ADMIN</span>
                {adminItems.map((item) => (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    className={`v3-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <span className="v3-icon">{item.icon}</span>
                    <span className="v3-label">{item.name}</span>
                  </Link>
                ))}
              </div>
            )}

            <div className="v3-nav-group bottom">
              <button onClick={handleLogout} className="v3-link logout-btn">
                <span className="v3-icon"><LogOut size={18} /></span>
                <span className="v3-label">Logout</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="shnoor-v3-main">
          {/* Sub Header Bar */}
          <div className="v3-sub-header">
            <div className="v3-breadcrumb">
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </div>
            <div className="v3-sub-profile">
              <div className="v3-sub-avatar">{userData.name.charAt(0)}</div>
              <div className="v3-sub-text">
                <span className="v3-sub-name">{userData.name}</span>
                <span className="v3-sub-link">My Dashboard</span>
              </div>
            </div>
          </div>

          <div className="v3-content">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        .shnoor-v3-layout { display: flex; flex-direction: column; height: 100vh; background: #f4f6f9; font-family: 'Inter', sans-serif; overflow: hidden; }
        .shnoor-v3-topbar { height: 50px; background: #000; color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; z-index: 1000; }
        .v3-company-name { font-size: 15px; font-weight: 500; margin-left: 15px; color: #eee; }
        .v3-user-pill { display: flex; align-items: center; gap: 10px; color: #ccc; font-size: 13px; }
        .v3-user-avatar { width: 26px; height: 26px; border-radius: 50%; background: #444; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 11px; }
        .shnoor-v3-body { display: flex; flex: 1; overflow: hidden; }
        .shnoor-v3-sidebar { width: 130px; background: #000; color: #fff; display: flex; flex-direction: column; }
        .v3-nav { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
        .v3-nav-group { padding: 10px 0; }
        .v3-group-label { font-size: 10px; font-weight: 800; color: #444; letter-spacing: 1px; padding: 10px 15px; display: block; }
        .v3-link { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px 5px; color: #999; text-decoration: none; font-size: 11px; gap: 4px; text-align: center; position: relative; transition: all 0.2s; border: none; background: none; width: 100%; cursor: pointer; }
        .v3-link:hover { color: #fff; background: #1a1a1a; }
        .v3-link.active { background: #3174ad; color: #fff; }
        .v3-badge { position: absolute; top: 10px; right: 25px; background: #3174ad; color: white; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900; }
        .shnoor-v3-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .v3-sub-header { height: 45px; background: #fff; border-bottom: 1px solid #ddd; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; }
        .v3-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #555; }
        .v3-sub-profile { display: flex; align-items: center; gap: 10px; }
        .v3-sub-avatar { width: 30px; height: 30px; border-radius: 4px; background: #666; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; }
        .v3-sub-text { display: flex; flex-direction: column; line-height: 1.1; text-align: left; }
        .v3-sub-name { font-size: 12px; font-weight: 700; color: #333; }
        .v3-sub-link { font-size: 11px; color: #3174ad; }
        .v3-content { flex: 1; padding: 20px; overflow-y: auto; }
        .logout-btn:hover { color: #f45b5b; }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
