import { useMemo } from 'react';
import { Clock } from 'lucide-react';

function formatClock(ts) {
  if (!ts) return '--:--';
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDurationDetailed(total) {
  if (total == null || Number.isNaN(total)) return '0 Hrs 0 Mins';
  const totalRounded = Math.floor(total);
  const m = Math.max(0, totalRounded);
  return `${Math.floor(m / 60)} Hrs ${m % 60} Mins`;
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
        (nowDate.getTime() - new Date(s.checkIn).getTime()) / 60000
      );
    }
  }
  return sum;
}

/** Break minutes: gaps between segments + time since last checkout (if no open segment). */
function computeBreakMinutesLive(data, nowDate) {
  if (!data?.segments?.length) return 0;
  const segments = data.segments;
  let sum = 0;

  // 1. Gaps between completed segments
  for (let i = 0; i < segments.length - 1; i++) {
    const currentOut = segments[i].checkOut;
    const nextIn = segments[i + 1].checkIn;
    if (currentOut && nextIn) {
      sum += Math.max(0, (new Date(nextIn).getTime() - new Date(currentOut).getTime()) / 60000);
    }
  }

  // 2. Live gap if the last segment is closed
  const last = segments[segments.length - 1];
  if (last.checkOut) {
    sum += Math.max(0, (nowDate.getTime() - new Date(last.checkOut).getTime()) / 60000);
  }

  return sum;
}

const EmployeeAttendancePanel = ({
  now,
  todayLog,
  actionLoading,
  onTap,
}) => {
  const openSegment = todayLog?.openSegment;
  
  const activeLive = useMemo(() => computeActiveMinutesLive(todayLog, now), [todayLog, now]);
  const breakLive = useMemo(() => computeBreakMinutesLive(todayLog, now), [todayLog, now]);
  
  const segments = todayLog?.segments ?? [];

  // Create an interleaved list of events for "Today's Entries"
  const entries = [];
  segments.forEach((s) => {
    entries.push({ type: 'in', time: s.checkIn });
    if (s.checkOut) {
      entries.push({ type: 'out', time: s.checkOut });
    }
  });

  const lastIn = segments.length > 0 ? formatClock(segments[0].checkIn) : '--:--';
  const lastOut = (segments.length > 0 && segments[segments.length - 1].checkOut) 
    ? formatClock(segments[segments.length - 1].checkOut) 
    : '--:--';

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col">
        <div className="flex items-start gap-5 border-b border-slate-100 pb-6 mb-5">
          <div className="w-[60px] h-[60px] bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-600">
            <Clock size={32} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <div className="text-[13px] text-slate-500 font-medium mb-2">
              {now.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/')}
            </div>
            <div className="flex gap-10">
              <div className="flex flex-col">
                <span className="text-[22px] font-bold text-slate-800">{formatDurationDetailed(activeLive)}</span>
                <span className="text-[12px] text-slate-400 font-semibold mt-0.5">Total Work Time</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[22px] font-bold text-[#3174ad]">{formatDurationDetailed(breakLive)}</span>
                <span className="text-[12px] text-slate-400 font-semibold mt-0.5">Total Break Time</span>
              </div>
            </div>
          </div>
          <div className="min-w-[270px]">
            <div className="flex justify-end items-start gap-5">
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-start">
                  <span className="!text-[24px] !leading-none !font-semibold !text-[#2f4ed8]">{lastIn}</span>
                  <span className="mt-1 text-[20px] leading-none font-semibold text-slate-300">{lastOut}</span>
                </div>
                <div className="flex flex-col items-start gap-[9px] pt-[2px]">
                  <span className="text-[26px] leading-none font-semibold text-slate-700">Time In</span>
                  <span className="text-[26px] leading-none font-semibold text-slate-700">Time Out</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className={`!h-10 !min-w-[88px] rounded-md !px-4 !text-[13px] !font-semibold !transition-colors disabled:cursor-not-allowed ${
                    openSegment 
                      ? "!border !border-slate-200 !bg-slate-100 !text-slate-300"
                      : "!border !border-slate-300 !bg-white !text-slate-500 hover:!border-slate-400 hover:!text-slate-600"
                  }`}
                  onClick={() => onTap('tap-in')}
                  disabled={actionLoading || !!openSegment}
                >
                  Tap In
                </button>
                <button
                  type="button"
                  className={`!h-10 !min-w-[88px] rounded-md !px-4 !text-[13px] !font-semibold !transition-colors disabled:cursor-not-allowed ${
                    !openSegment
                      ? "!bg-slate-100 !text-slate-400"
                      : "!bg-[#ff5a66] !text-white shadow-sm hover:!bg-[#f14e5b]"
                  }`}
                  onClick={() => onTap('tap-out')}
                  disabled={actionLoading || !openSegment}
                >
                  Tap Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-[12px] text-slate-400 font-semibold mb-4">Today's Entries</h4>
          <div className="flex gap-6 flex-wrap">
            {entries.length === 0 ? (
              <span className="text-[12px] text-slate-300 italic">No entries for today</span>
            ) : (
              entries.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-md border border-slate-100">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    entry.type === 'in' 
                      ? "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]" 
                      : "bg-[#f45b5b] shadow-[0_0_0_4px_rgba(244,91,91,0.1)]"
                  }`}></div>
                  <span className="text-[13px] font-bold text-slate-600">{formatClock(entry.time)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendancePanel;
