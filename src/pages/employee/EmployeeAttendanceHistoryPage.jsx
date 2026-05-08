import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import Alert from '../../components/ui/Alert';
import DataTable from '../../components/ui/DataTable';

function fmt(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function group(rows) {
  const buckets = new Map();
  for (const r of rows) {
    const key = String(r.date).slice(0, 10);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(r);
  }
  return [...buckets.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, items]) => {
      const totalMinutes = items.reduce((sum, seg) => {
        if (!seg.checkOut) return sum;
        return sum + (new Date(seg.checkOut) - new Date(seg.checkIn)) / 60000;
      }, 0);
      return {
        id: date,
        date,
        segments: items,
        totalMinutes,
        firstIn: items[0]?.checkIn,
        lastOut: items[items.length - 1]?.checkOut,
      };
    });
}

const EmployeeAttendanceHistoryPage = () => {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);

  useEffect(() => {
    api.get(`/attendance/me/history?days=${days}`)
      .then((res) => setRows(res.data || []))
      .catch((err) => setError(err.message));
  }, [days]);

  const days_ = useMemo(() => group(rows), [rows]);

  const columns = [
    { key: 'date',    header: 'Date',     render: (r) => new Date(r.date).toLocaleDateString() },
    { key: 'firstIn', header: 'First In', render: (r) => fmt(r.firstIn) },
    { key: 'lastOut', header: 'Last Out', render: (r) => fmt(r.lastOut) },
    { key: 'segments', header: 'Sessions', render: (r) => r.segments.length },
    {
      key: 'total',
      header: 'Worked',
      render: (r) => `${Math.floor(r.totalMinutes / 60)}h ${Math.round(r.totalMinutes % 60)}m`,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Attendance history"
        subtitle="Recent days with all your tap-in / tap-out events."
        actions={
          <select
            className="rounded border border-slate-300 px-2 py-1 text-sm"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
          </select>
        }
      />
      {error && <Alert type="error">{error}</Alert>}
      <DataTable columns={columns} rows={days_} emptyText="No attendance records" />
    </div>
  );
};

export default EmployeeAttendanceHistoryPage;
