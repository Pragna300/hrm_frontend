const VARIANTS = {
  primary:   'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:opacity-60',
  danger:    'bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60',
  success:   'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60',
  ghost:     'bg-transparent text-slate-700 hover:bg-slate-100',
};
const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

const Button = ({ variant = 'primary', size = 'md', children, ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${props.className || ''}`}
  >
    {children}
  </button>
);

export default Button;
