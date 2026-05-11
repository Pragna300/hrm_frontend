const COLORS = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  slate: 'bg-slate-100 text-slate-700',
  violet: 'bg-violet-50 text-violet-700',
};

const StatCard = ({ icon, label, value, sublabel, color = 'blue' }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${COLORS[color] || COLORS.blue}`}>
      {icon}
    </div>
    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
    <div className="mt-1 text-2xl font-extrabold text-slate-900">{value}</div>
    {sublabel && <div className="mt-1 text-xs text-slate-500">{sublabel}</div>}
  </div>
);

export default StatCard;
