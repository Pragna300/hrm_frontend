const STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  warn: 'border-amber-200 bg-amber-50 text-amber-700',
};

const Alert = ({ type = 'info', children, onClose }) => (
  <div className={`mb-4 flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-sm ${STYLES[type]}`}>
    <div>{children}</div>
    {onClose && (
      <button onClick={onClose} className="text-current opacity-60 hover:opacity-100">
        ×
      </button>
    )}
  </div>
);

export default Alert;
