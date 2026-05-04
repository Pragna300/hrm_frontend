import React from 'react';
import { Calendar, AlertCircle, Award } from 'lucide-react';

function formatClock(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDurationMinutes(total) {
  if (total == null || Number.isNaN(total)) return '0h 0m';
  const m = Math.max(0, Math.round(total));
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

/** Active (work) minutes from segment list + clock for open segment. */
function computeActiveMinutesLive(data, nowDate) {
  if (!data?.segments?.length) return 0;
  let sum = 0;
  for (const s of data.segments) {
    if (s.checkOut) {
      sum += s.durationMinutes ?? 0;
    } else {
      sum += Math.max(
        0,
        Math.round((nowDate.getTime() - new Date(s.checkIn).getTime()) / 60000)
      );
    }
  }
  return sum;
}

const EmployeeAttendancePanel = ({
  now,
  todayLog,
  loading,
  error,
  actionLoading,
  canUseAttendance,
  onTap,
}) => {
  const openSegment = todayLog?.openSegment;
  const breakMinutes = todayLog?.breakMinutes ?? 0;
  const activeLive = computeActiveMinutesLive(todayLog, now);
  const segments = todayLog?.segments ?? [];

  return (
    <>
      <div className="v6-card v6-att-card">
        <div className="v6-att-top">
          <div className="v6-date-pill">
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' })}
          </div>
          <div className="v6-live-clock">
            {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>

        <div className="v6-att-body v6-att-body-stack">
          <div className="v6-att-metrics v6-att-metrics-wrap">
            <div className="v6-metric">
              <span className="v6-m-val">{formatDurationMinutes(activeLive)}</span>
              <span className="v6-m-lbl">Active time</span>
            </div>
            <div className="v6-m-divider" />
            <div className="v6-metric">
              <span className="v6-m-val gold">{formatDurationMinutes(breakMinutes)}</span>
              <span className="v6-m-lbl">Break time</span>
            </div>
            <div className="v6-m-divider" />
            <div className="v6-metric">
              <span className="v6-m-val">{segments.length}</span>
              <span className="v6-m-lbl">Sessions today</span>
            </div>
          </div>

          <div className="v6-att-action v6-att-action-col">
            {error && (
              <div className="v6-error-tag">
                <AlertCircle size={12} /> {error}
              </div>
            )}
            {!canUseAttendance ? (
              <p className="v6-att-unavailable">Attendance is not available for this account.</p>
            ) : (
              <div className="v6-att-btn-row">
                <button
                  type="button"
                  className="v6-btn-att tap-in"
                  onClick={() => onTap('tap-in')}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing…' : 'Tap In'}
                </button>
                <button
                  type="button"
                  className="v6-btn-att tap-out"
                  onClick={() => onTap('tap-out')}
                  disabled={actionLoading || !openSegment}
                  title={!openSegment ? 'Tap in first to start a session' : 'End current session'}
                >
                  {actionLoading ? 'Processing…' : 'Tap Out'}
                </button>
              </div>
            )}
            {openSegment && (
              <p className="v6-att-status">Current session since {formatClock(openSegment.checkIn)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="v6-card v6-segment-log">
        <h4 className="v6-seg-title">Tap log (today)</h4>
        {loading ? (
          <p className="v6-seg-empty">Loading…</p>
        ) : segments.length === 0 ? (
          <p className="v6-seg-empty">No taps yet today.</p>
        ) : (
          <div className="v6-seg-table-wrap">
            <table className="v6-seg-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tap in</th>
                  <th>Tap out</th>
                  <th>Active</th>
                  <th>Break after</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((s, idx) => (
                  <tr key={s.id}>
                    <td>{idx + 1}</td>
                    <td>{formatClock(s.checkIn)}</td>
                    <td>{s.checkOut ? formatClock(s.checkOut) : <em>In progress</em>}</td>
                    <td>
                      {s.durationMinutes != null
                        ? formatDurationMinutes(s.durationMinutes)
                        : formatDurationMinutes(
                            Math.max(
                              0,
                              Math.round((now - new Date(s.checkIn)) / 60000)
                            )
                          )}
                    </td>
                    <td>
                      {s.gapBeforeNextMinutes != null
                        ? formatDurationMinutes(s.gapBeforeNextMinutes)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="v6-metric-row">
        <div className="v6-card v6-metric-card">
          <div className="v6-m-header">
            <Award size={16} className="v6-m-icon" />
            <h4>Active vs break</h4>
          </div>
          <p className="v6-m-footer">
            Active is summed work blocks; break is time between tap out and the next tap in.
          </p>
        </div>
        <div className="v6-card v6-metric-card">
          <div className="v6-m-header">
            <Calendar size={16} className="v6-m-icon" />
            <h4>Leave balance</h4>
          </div>
          <div className="v6-m-val-large">
            24 <span className="small">Days</span>
          </div>
          <span className="v6-m-footer">Prorated for 2026</span>
        </div>
      </div>

      <style>{`
        .v6-att-body-stack { flex-direction: column; align-items: stretch; gap: 24px; }
        .v6-att-metrics-wrap { flex-wrap: wrap; justify-content: flex-start; gap: 24px 32px; }
        .v6-att-action-col { align-items: flex-end; text-align: right; }
        .v6-att-btn-row { display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end; }
        .v6-att-status { margin: 8px 0 0; font-size: 12px; color: #718096; font-weight: 600; }
        .v6-btn-att:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
        .v6-segment-log { padding: 0; overflow: hidden; margin-top: 24px; }
        .v6-seg-title { margin: 0; padding: 16px 20px; font-size: 15px; font-weight: 800; color: #1a365d; border-bottom: 1px solid #eef2f6; }
        .v6-seg-empty { padding: 24px 20px; color: #a0aec0; font-size: 14px; font-weight: 600; margin: 0; }
        .v6-seg-table-wrap { overflow-x: auto; }
        .v6-seg-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .v6-seg-table th, .v6-seg-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #f1f3f5; }
        .v6-seg-table th { background: #f8fafc; color: #718096; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; }
        .v6-seg-table td { color: #2d3748; font-weight: 600; }
        .v6-seg-table em { color: #3174ad; font-style: normal; font-weight: 700; }
      `}</style>
    </>
  );
};

export default EmployeeAttendancePanel;
