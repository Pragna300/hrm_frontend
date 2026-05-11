import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import Alert from '../../components/ui/Alert';

function buildForest(employees) {
  const byId = new Map(employees.map((e) => [e.id, { ...e, children: [] }]));
  const roots = [];
  for (const e of employees) {
    const node = byId.get(e.id);
    if (e.managerId && byId.has(e.managerId)) {
      byId.get(e.managerId).children.push(node);
    } else {
      roots.push(node);
    }
  }
  if (roots.length === 0 && employees.length) {
    return employees.map((e) => ({ ...e, children: [] }));
  }
  return roots;
}

function OrgNode({ node, depth }) {
  const initials = `${(node.firstName || '?').charAt(0)}${(node.lastName || '').charAt(0)}`.toUpperCase();
  return (
    <div className="mb-1" style={{ paddingLeft: Math.min(depth, 10) * 14 }}>
      <div className="mb-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
            {node.profilePhotoUrl ? (
              <img src={node.profilePhotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {node.firstName} {node.lastName}
            </p>
            <p className="text-xs text-slate-500">
              {node.employeeCode}
              {node.designation ? ` · ${node.designation}` : ''}
            </p>
          </div>
        </div>
      </div>
      {node.children?.length > 0 &&
        node.children.map((ch) => <OrgNode key={ch.id} node={ch} depth={depth + 1} />)}
    </div>
  );
}

const EmployeeOrgChartPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/employee-portal/org-chart')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
  }, []);

  const forest = data?.employees ? buildForest(data.employees) : [];

  return (
    <div>
      <PageHeader
        title="Org chart"
        subtitle="Reporting lines and departments in your organization."
      />
      {error && <Alert type="error">{error}</Alert>}
      {!data ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Hierarchy</h3>
            {forest.length === 0 ? (
              <p className="text-sm text-slate-400">No active employees to display.</p>
            ) : (
              <div className="space-y-2">
                {forest.map((root) => (
                  <OrgNode key={root.id} node={root} depth={0} />
                ))}
              </div>
            )}
          </section>
          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Departments</h3>
            <ul className="rounded-xl border border-slate-200 bg-white text-sm shadow-sm">
              {(data.departments || []).map((d) => (
                <li key={d.id} className="border-b border-slate-100 px-3 py-2 last:border-0">
                  <span className="font-semibold text-slate-800">{d.name}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};

export default EmployeeOrgChartPage;
