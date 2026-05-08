import { useEffect, useState, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { fetchMe, getStoredToken, getStoredUser, persistSessionUser, clearSession, api } from '../api/client';
import {
  getSidebarNav,
  getStoredWorkspace,
  persistWorkspace,
  defaultWorkspaceForRole,
  selfHomePath,
} from '../config/navigation';

function safeUser() {
  return getStoredUser() || { name: 'User', role: 'employee' };
}

function needsWorkspaceTabs(role) {
  return role === 'manager' || role === 'hr' || role === 'team_lead';
}

function tabLabel(role, mode) {
  if (mode === 'self') return 'Self';
  if (mode === 'team') return 'Team';
  return role === 'hr' ? 'Company' : 'Manager';
}

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(safeUser);
  const [workspace, setWorkspace] = useState(() => getStoredWorkspace() || defaultWorkspaceForRole(safeUser().role));
  const [badges, setBadges] = useState({ documents: 0, tasksOverdue: 0 });

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchMe()
      .then((u) => {
        persistSessionUser(u);
        setUser(u);
        const stored = getStoredWorkspace();
        if (u.role === 'manager' || u.role === 'hr') {
          if (stored !== 'self' && stored !== 'company') {
            const def = defaultWorkspaceForRole(u.role);
            persistWorkspace(def);
            setWorkspace(def);
          } else {
            setWorkspace(stored);
          }
        } else if (u.role === 'team_lead') {
          if (stored !== 'self' && stored !== 'team') {
            const def = defaultWorkspaceForRole(u.role);
            persistWorkspace(def);
            setWorkspace(def);
          } else {
            setWorkspace(stored);
          }
        } else {
          persistWorkspace('self');
          setWorkspace('self');
        }
      })
      .catch((err) => {
        if (err?.status === 401) navigate('/login', { replace: true });
      });
  }, [navigate]);

  useEffect(() => {
    const role = user.role;
    const selfMode =
      role === 'employee' ||
      (role === 'manager' && workspace === 'self') ||
      (role === 'hr' && workspace === 'self') ||
      (role === 'team_lead' && workspace === 'self');
    if (!selfMode || !user.employeeId) {
      setBadges({ documents: 0, tasksOverdue: 0 });
      return;
    }
    api
      .get('/employee-portal/badges')
      .then((res) => {
        setBadges({
          documents: res.data?.documentsCount ?? 0,
          tasksOverdue: res.data?.overdueTaskCount ?? 0,
        });
      })
      .catch(() => setBadges({ documents: 0, tasksOverdue: 0 }));
  }, [user.role, user.employeeId, workspace, location.pathname]);

  const items = useMemo(
    () => getSidebarNav(user, workspace, badges),
    [user, workspace, badges]
  );

  const orgLabel = user.role === 'super_admin' ? 'Platform Admin' : (user.organizationName || 'HR Portal');

  const switchWorkspace = (mode) => {
    persistWorkspace(mode);
    setWorkspace(mode);
    if (mode === 'self') navigate(selfHomePath());
    else if (mode === 'team') navigate('/team/overview');
    else navigate('/company/overview');
  };

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const showTabs = needsWorkspaceTabs(user.role);

  return (
    <div className="hr-layout">
      <header className="hr-topbar">
        <div className="hr-topbar-left">
          <span className="hr-brand-dot" />
          <span className="hr-brand-name">HR Portal</span>
          <span className="hr-org-name">{orgLabel}</span>
        </div>
        <div className="hr-topbar-right">
          {showTabs && (
            <div className="hr-workspace-tabs" role="tablist">
              {user.role === 'team_lead' ? (
                <>
                  <button
                    type="button"
                    role="tab"
                    className={workspace === 'self' ? 'is-active' : ''}
                    onClick={() => switchWorkspace('self')}
                  >
                    Self
                  </button>
                  <button
                    type="button"
                    role="tab"
                    className={workspace === 'team' ? 'is-active' : ''}
                    onClick={() => switchWorkspace('team')}
                  >
                    {tabLabel(user.role, 'team')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    role="tab"
                    className={workspace === 'company' ? 'is-active' : ''}
                    onClick={() => switchWorkspace('company')}
                  >
                    {tabLabel(user.role, 'company')}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    className={workspace === 'self' ? 'is-active' : ''}
                    onClick={() => switchWorkspace('self')}
                  >
                    Self
                  </button>
                </>
              )}
            </div>
          )}
          <span className="hr-user-name">{user.name}</span>
          <div className="hr-avatar">{(user.name || 'U').charAt(0)}</div>
          <button type="button" onClick={handleLogout} className="hr-logout" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="hr-body">
        <aside className="hr-sidebar">
          <nav className="hr-nav">
            {items.map((item) => {
              const active =
                location.pathname === item.path ||
                (item.path !== '/employee/overview' &&
                  item.path !== '/company/overview' &&
                  item.path !== '/team/overview' &&
                  location.pathname.startsWith(item.path));
              return (
                <Link key={`${item.path}-${item.label}`} to={item.path} className={`hr-link ${active ? 'is-active' : ''}`}>
                  <span className="hr-icon">{item.icon}</span>
                  <span className="hr-label">{item.label}</span>
                  {item.badge > 0 ? (
                    <span
                      className={`hr-badge ${
                        item.badgeTone === 'info' ? 'hr-badge--info' : item.badgeTone === 'danger' ? 'hr-badge--danger' : ''
                      }`}
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="hr-main">
          <div className="hr-sub-header">
            <div className="hr-breadcrumb">
              <LayoutDashboard size={14} />
              <span>{getCrumb(location.pathname)}</span>
            </div>
            <div className="hr-sub-profile">
              <div className="hr-sub-avatar">{(user.name || 'U').charAt(0)}</div>
              <div className="hr-sub-text">
                <span className="hr-sub-name">{user.name}</span>
                <span className="hr-sub-link">{user.role.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
          <div className="hr-content">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        .hr-layout { display: flex; flex-direction: column; height: 100vh; background: #f4f6f9; font-family: 'Inter', sans-serif; overflow: hidden; }
        .hr-topbar { height: 52px; background: #000; color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 16px 0 12px; }
        .hr-topbar-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .hr-brand-dot { width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; flex-shrink: 0; }
        .hr-brand-name { font-weight: 800; font-size: 14px; letter-spacing: 0.3px; flex-shrink: 0; }
        .hr-org-name { color: #9ca3af; font-size: 13px; padding-left: 12px; border-left: 1px solid #27272a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hr-topbar-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .hr-workspace-tabs { display: flex; background: #18181b; border-radius: 8px; padding: 3px; margin-right: 8px; }
        .hr-workspace-tabs button { border: none; background: transparent; color: #a1a1aa; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
        .hr-workspace-tabs button.is-active { background: #3174ad; color: #fff; }
        .hr-user-name { font-size: 12px; color: #d4d4d8; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: none; }
        @media (min-width: 640px) { .hr-user-name { display: inline; } }
        .hr-avatar { width: 28px; height: 28px; border-radius: 50%; background: #3f3f46; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; }
        .hr-logout { background: transparent; color: #71717a; border: 1px solid #3f3f46; border-radius: 6px; padding: 5px 7px; cursor: pointer; }
        .hr-logout:hover { color: #fff; border-color: #52525b; }

        .hr-body { display: flex; flex: 1; overflow: hidden; }
        .hr-sidebar { width: 132px; background: #000; color: #d4d4d8; display: flex; flex-direction: column; padding: 8px 6px; flex-shrink: 0; }
        .hr-nav { display: flex; flex-direction: column; gap: 1px; flex: 1; overflow-y: auto; }
        .hr-link { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 10px 4px; border-radius: 6px; color: #a1a1aa; text-decoration: none; font-size: 10px; font-weight: 600; text-align: center; line-height: 1.15; transition: background 0.15s, color 0.15s; }
        .hr-link:hover { background: #18181b; color: #fff; }
        .hr-link.is-active { background: #3174ad; color: #fff; }
        .hr-icon { display: inline-flex; }
        .hr-label { max-width: 100%; word-break: break-word; }
        .hr-badge { position: absolute; top: 6px; right: 18px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 999px; background: #ef4444; color: #fff; font-size: 9px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
        .hr-badge--info { background: #2563eb; }
        .hr-badge--danger { background: #ea580c; }
        .hr-link.is-active .hr-badge { background: #fff; color: #b91c1c; }
        .hr-link.is-active .hr-badge--info { color: #1d4ed8; }
        .hr-link.is-active .hr-badge--danger { color: #c2410c; }

        .hr-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .hr-sub-header { height: 44px; background: #fff; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; }
        .hr-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #6b7280; font-weight: 600; }
        .hr-sub-profile { display: flex; align-items: center; gap: 8px; }
        .hr-sub-avatar { width: 28px; height: 28px; border-radius: 4px; background: #3174ad; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; }
        .hr-sub-text { display: flex; flex-direction: column; line-height: 1.1; text-align: left; }
        .hr-sub-name { font-size: 11px; font-weight: 700; color: #111827; }
        .hr-sub-link { font-size: 10px; color: #3174ad; text-transform: capitalize; }
        .hr-content { flex: 1; padding: 16px; overflow-y: auto; }
      `}</style>
    </div>
  );
};

function getCrumb(pathname) {
  const seg = pathname.split('/').filter(Boolean);
  const last = seg[seg.length - 1] || 'dashboard';
  return last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default DashboardLayout;
