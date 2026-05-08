const FormField = ({ label, children, hint, required }) => (
  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
    <span>
      {label}
      {required && <span className="text-rose-500"> *</span>}
    </span>
    {children}
    {hint && <span className="font-normal text-[11px] text-slate-400">{hint}</span>}
  </label>
);

export const InputClass =
  'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-slate-500 focus:ring-2 focus:ring-slate-200';

export default FormField;
