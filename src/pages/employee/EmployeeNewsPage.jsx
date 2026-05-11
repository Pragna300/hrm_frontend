import { useEffect, useState } from 'react';
import { api, getStoredUser } from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';

function canPostNews(role) {
  return role === 'manager' || role === 'hr';
}

const EmployeeNewsPage = () => {
  const user = getStoredUser() || {};
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setError('');
    api
      .get('/employee-portal/news')
      .then((res) => setPosts(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  async function handlePost(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    setError('');
    try {
      await api.post('/employee-portal/news', { title: title.trim(), body: body.trim() });
      setTitle('');
      setBody('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="News"
        subtitle="Add a new update, join the discussion, or see what is happening in your company."
      />
      {error && <Alert type="error">{error}</Alert>}

      {canPostNews(user.role) && (
        <form
          onSubmit={handlePost}
          className="mb-6 rounded-xl border border-slate-200 bg-sky-50/60 p-4 shadow-sm"
        >
          <h3 className="mb-3 text-sm font-bold text-slate-800">Post company news</h3>
          <input
            className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={4}
            placeholder="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button type="submit" disabled={saving}>
            {saving ? 'Publishing…' : 'Publish'}
          </Button>
        </form>
      )}

      {posts.length === 0 ? (
        <p className="text-sm text-slate-400">No news posts yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <article
              key={p.id}
              className="rounded-xl border border-sky-100 bg-sky-50/40 p-5 shadow-sm"
            >
              <div className="mb-3 flex gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                  {(p.author?.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                  <p className="text-xs text-slate-500">
                    {p.author?.email || 'Unknown'} ·{' '}
                    {new Date(p.createdAt).toLocaleString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{p.body}</p>
              <div className="mt-4 flex justify-end">
                <Button type="button" variant="secondary" size="sm" disabled>
                  Add comment
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeNewsPage;
