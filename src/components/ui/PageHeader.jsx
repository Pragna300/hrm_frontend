const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between mb-6">
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
