import { useEffect, useState, useMemo, useRef } from 'react';
import { Bell, CheckCircle2, X, Clock3, ExternalLink } from 'lucide-react';
import { io } from 'socket.io-client';
import { getStoredToken, API_BASE, getStoredUser } from '../api/client';
import { notificationApi } from '../api/notificationApi';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'shnoor_notification_permission';

function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
}

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(() => (typeof window !== 'undefined' && 'Notification' in window) ? localStorage.getItem(STORAGE_KEY) || Notification.permission : 'unsupported');
  const [toast, setToast] = useState(null);
  const socketRef = useRef(null);
  const shellRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (shellRef.current && !shellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const apiBase = useMemo(() => API_BASE.replace(/\/api$/, ''), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedPermission = localStorage.getItem(STORAGE_KEY);
    const currentPermission = 'Notification' in window ? Notification.permission : 'unsupported';
    setPermissionStatus(storedPermission || currentPermission);

    loadNotifications();
    connectSocket();
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      const [listResponse, countResponse] = await Promise.all([
        notificationApi.list(1, 5),
        notificationApi.unreadCount(),
      ]);
      setNotifications(listResponse.data.data);
      setUnreadCount(countResponse.data.count);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load notifications');
    } finally {
      setLoading(false);
    }
  }

  function connectSocket() {
    const token = getStoredToken();
    if (!token) return;
    const socket = io(apiBase, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socketRef.current = socket;
    });

    socket.on('receive_notification', (notification) => {
      setNotifications((current) => [notification, ...current].slice(0, 5));
      setUnreadCount((count) => count + 1);
      displayBrowserNotification(notification);
    });

    socket.on('connect_error', (err) => {
      console.warn('Notification socket error', err.message || err);
    });
  }

  function displayBrowserNotification(notification) {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast(notification.title, notification.body || 'New activity');
      return;
    }

    if (permissionStatus === 'granted') {
      try {
        const n = new Notification(notification.title, {
          body: notification.body || 'New activity',
          icon: '/favicon.ico',
        });
        n.onclick = () => {
          window.focus();
          if (notification.link) {
            window.location.href = notification.link;
          }
        };
      } catch (err) {
        showToast(notification.title, notification.body || 'New activity');
      }
      return;
    }

    showToast(notification.title, notification.body || 'New activity');
  }

  function showToast(title, body) {
    setToast({ title, body });
    window.setTimeout(() => setToast(null), 5000);
  }



  async function markAsRead(notificationId) {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications((current) => current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      console.error(err);
      showToast('Unable to mark read', 'Something went wrong while updating the notification.');
    }
  }

  async function markAllRead() {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
      showToast('Unable to mark all read', 'Something went wrong while updating notifications.');
    }
  }

  return (
    <div className="hr-notification-shell" ref={shellRef}>
      <button type="button" className="hr-notification-button" onClick={() => setIsOpen((open) => !open)} aria-label="Notifications">
        <Bell size={18} />
        {unreadCount > 0 && <span className="hr-notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>



      {isOpen && (
        <div className="hr-notification-dropdown">
          <div className="hr-notification-header">
            <div>
              <span>Notifications</span>
              <small>{unreadCount} unread</small>
            </div>
            <button type="button" onClick={markAllRead}>Mark all read</button>
          </div>
          <div className="hr-notification-list">
            {loading && <div className="hr-notification-empty">Loading notifications...</div>}
            {error && <div className="hr-notification-empty hr-notification-error">{error}</div>}
            {!loading && !error && notifications.length === 0 && (
              <div className="hr-notification-empty">No notifications available.</div>
            )}
            {!loading && !error && notifications.map((item) => (
              <div 
                key={item.id} 
                className={`hr-notification-item ${item.isRead ? 'is-read' : 'is-unread'}`}
                onMouseEnter={() => {
                  if (!item.isRead) markAsRead(item.id);
                }}
              >
                <div className="hr-notification-copy">
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <div className="hr-notification-actions">
                  {!item.isRead && (
                    <button type="button" onClick={() => markAsRead(item.id)} title="Mark as read">
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                  {item.link && (
                    <Link to={item.link} className="hr-notification-link" onClick={() => setIsOpen(false)}>
                      <ExternalLink size={14} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="hr-notification-footer">
            <Link to="/notifications" onClick={() => setIsOpen(false)}>View all notifications</Link>
          </div>
        </div>
      )}

      {toast && (
        <div className="hr-notification-toast">
          <div className="hr-notification-toast-icon"><Clock3 size={16} /></div>
          <div>
            <strong>{toast.title}</strong>
            <p>{toast.body}</p>
          </div>
          <button type="button" onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      <style>{`
        .hr-notification-shell { position: relative; display: inline-flex; align-items: center; }
        .hr-notification-button { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.16); background: transparent; color: #fff; cursor: pointer; position: relative; }
        .hr-notification-badge { position: absolute; top: 4px; right: 4px; background: #ef4444; color: #030101ff; border-radius: 999px; padding: 2px 6px; font-size: 10px; font-weight: 700; }
        .hr-notification-dropdown { position: absolute; right: 0; top: 48px; width: 360px; max-height: 420px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 24px 40px rgba(15,23,42,.12); z-index: 30; overflow: hidden; display: flex; flex-direction: column; color: #1e293b; }
        .hr-notification-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #f3f4f6; }
        .hr-notification-header span { font-weight: 700; font-size: 13px; color: #1e293b; }
        .hr-notification-header small { display: block; color: #6b7280; font-size: 11px; margin-top: 2px; }
        .hr-notification-header button { border: none; background: transparent; color: #3b82f6; font-size: 12px; cursor: pointer; }
        .hr-notification-list { overflow-y: auto; max-height: 300px; }
        .hr-notification-item { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #f3f4f6; }
        .hr-notification-item.is-unread { background: #eef2ff; }
        .hr-notification-copy strong { display: block; color: #1e293b; font-size: 13px; margin-bottom: 4px; }
        .hr-notification-copy p { margin: 0; font-size: 12px; color: #475569; line-height: 1.4; }
        .hr-notification-copy span { display: block; margin-top: 8px; color: #94a3b8; font-size: 11px; }
        .hr-notification-actions { display: flex; gap: 8px; align-items: center; }
        .hr-notification-actions button { border: none; background: transparent; color: #64748b; cursor: pointer; padding: 4px; border-radius: 6px; }
        .hr-notification-link { color: #3b82f6; display: inline-flex; align-items: center; }
        .hr-notification-footer { border-top: 1px solid #f3f4f6; padding: 12px 16px; text-align: center; }
        .hr-notification-footer a { color: #2563eb; text-decoration: none; font-size: 13px; }
        .hr-notification-empty { padding: 24px 16px; text-align: center; color: #64748b; font-size: 13px; }
        .hr-notification-error { color: #b91c1c; }
        .hr-notification-toast { position: fixed; right: 18px; bottom: 18px; width: 310px; background: #111827; color: #f8fafc; border-radius: 14px; display: flex; align-items: center; gap: 12px; padding: 14px 16px; box-shadow: 0 20px 54px rgba(15,23,42,.2); z-index: 50; }
        .hr-notification-toast-icon { width: 32px; height: 32px; display: grid; place-items: center; background: #1f2937; border-radius: 12px; }
        .hr-notification-toast p { margin: 0; font-size: 12px; color: #d1d5db; }

      `}</style>
    </div>
  );
}

export default NotificationBell;
