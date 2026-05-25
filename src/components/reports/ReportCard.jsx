import { ChevronRight } from 'lucide-react';

export default function ReportCard({ title, description, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
          {icon}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-indigo-600 transition group-hover:text-indigo-800">
        <span>Open report</span>
        <ChevronRight size={18} />
      </div>
    </button>
  );
}
