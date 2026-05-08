import { useEffect, useState } from 'react';
import { Pin } from 'lucide-react';
import { api } from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import Alert from '../../components/ui/Alert';

const EmployeeAnnouncementsPage = () => {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/company/announcements')
      .then((res) => setRows(res.data || []))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <PageHeader title="Announcements" subtitle="What's new from your company." />
      {error && <Alert type="error">{error}</Alert>}
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">No announcements yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rows.map((a) => (
            <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  {a.isPinned && <Pin size={14} className="text-amber-500" />} {a.title}
                </h3>
                <span className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="whitespace-pre-line text-sm text-slate-600">{a.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeAnnouncementsPage;
