import { useEffect, useState } from 'react';
import { notificationApi } from '../api/notificationApi';
import { CheckCircle2, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    notificationApi.list(1, 50)
      .then((res) => setNotifications(res.data.data))
      .catch((err) => {
        console.error(err);
        setError('Unable to load notifications.');
      })
      .finally(() => setLoading(false));
  }, []);

  async function markAsRead(id) {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((current) => current.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
    } catch (err) {
      console.error(err);
    }
  }

  async function removeNotification(id) {
    try {
      await notificationApi.delete(id);
      setNotifications((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="notification-page">
      <div className="notification-heading">
        <Link to="/employee/overview" className="notification-back"><ArrowLeft size={16} /> Back</Link>
        <div>
          <h1>Notifications</h1>
          <p>All messages, alerts and activity updates in one place.</p>
        </div>
      </div>
      <div className="notification-list">
        {loading && <div className="notification-empty">Loading notifications…</div>}
        {error && <div className="notification-empty notification-error">{error}</div>}
        {!loading && !error && notifications.length === 0 && (
          <div className="notification-empty">No notifications available.</div>
        )}
        {!loading && !error && notifications.map((item) => (
          <article key={item.id} className={`notification-card ${item.isRead ? 'read' : 'unread'}`}>
            <header>
              <div>
                <h2>{item.title}</h2>
                <span>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <div className="notification-actions">
                {!item.isRead && (
                  <button type="button" onClick={() => markAsRead(item.id)} title="Mark as read"><CheckCircle2 size={18} /></button>
                )}
                <button type="button" onClick={() => removeNotification(item.id)} title="Delete"><Trash2 size={18} /></button>
              </div>
            </header>
            <p>{item.body}</p>
            {item.link && (
              <a href={item.link} className="notification-link">Open related page</a>
            )}
          </article>
        ))}
      </div>
      <style>{`
        .notification-page { padding: 24px; max-width: 980px; margin: 0 auto; }
        .notification-heading { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .notification-back { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: #2563eb; text-decoration: none; }
        .notification-page h1 { margin: 0; font-size: 28px; }
        .notification-page p { margin: 4px 0 0; color: #475569; }
        .notification-list { display: grid; gap: 16px; }
        .notification-card { border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px; background: #fff; transition: box-shadow 0.2s ease; }
        .notification-card.unread { background: #eff6ff; border-color: #bfdbfe; }
        .notification-card:hover { box-shadow: 0 12px 24px rgba(15,23,42,.08); }
        .notification-card header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
        .notification-card h2 { margin: 0; font-size: 16px; }
        .notification-card span { display: block; margin-top: 8px; color: #64748b; font-size: 12px; }
        .notification-actions { display: flex; gap: 8px; }
        .notification-actions button { border: none; background: transparent; color: #475569; cursor: pointer; padding: 6px; border-radius: 10px; }
        .notification-actions button:hover { background: #f3f4f6; }
        .notification-card p { margin: 0 0 12px; color: #334155; line-height: 1.55; }
        .notification-link { font-size: 13px; color: #2563eb; text-decoration: none; }
        .notification-empty { padding: 24px; text-align: center; color: #64748b; border: 1px dashed #cbd5e1; background: #f8fafc; border-radius: 14px; }
        .notification-error { color: #b91c1c; border-color: #fecaca; background: #ffefef; }
      `}</style>
    </div>
  );
}

export default NotificationsPage;
