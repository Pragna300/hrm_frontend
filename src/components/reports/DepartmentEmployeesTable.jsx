export default function DepartmentEmployeesTable({ employees }) {
  function buildForest(emps) {
    const roleLevel = (role) => {
      if (role === 'manager' || role === 'super_admin') return 4;
      if (role === 'hr') return 3;
      if (role === 'team_lead') return 2;
      return 1;
    };
    const sortByRole = (a, b) => {
      const levelA = roleLevel(a.role);
      const levelB = roleLevel(b.role);
      if (levelA !== levelB) return levelB - levelA;
      return (a.name || '').localeCompare(b.name || '');
    };

    const byId = new Map(emps.map((e) => [e.id, { ...e, children: [] }]));
    const roots = [];
    for (const e of emps) {
      const node = byId.get(e.id);
      if (e.managerId && byId.has(e.managerId)) {
        byId.get(e.managerId).children.push(node);
      } else {
        roots.push(node);
      }
    }
    
    // Sort children
    for (const node of byId.values()) {
      node.children.sort(sortByRole);
    }
    roots.sort(sortByRole);

    if (roots.length === 0 && emps.length) {
      const flat = emps.map((e) => ({ ...e, children: [] }));
      flat.sort(sortByRole);
      return flat;
    }
    return roots;
  }

  function flattenForest(forest, depth = 0) {
    let result = [];
    for (const node of forest) {
      result.push({ ...node, depth });
      if (node.children && node.children.length > 0) {
        result.push(...flattenForest(node.children, depth + 1));
      }
    }
    return result;
  }

  const flattenedEmployees = flattenForest(buildForest(employees));

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide text-xs font-semibold">
          <tr>
            <th className="px-4 py-3">Employee ID</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Position</th>
            <th className="px-4 py-3">Employment Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {flattenedEmployees.map((employee) => (
            <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4 text-slate-700">{employee.employeeCode || employee.id}</td>
              <td className="py-4 pr-4 text-slate-900" style={{ paddingLeft: `${1 + employee.depth * 1.5}rem` }}>
                <div className="flex items-center gap-2">
                  {employee.depth > 0 && <span className="text-slate-300">↳</span>}
                  {employee.name}
                </div>
              </td>
              <td className="px-4 py-4 text-slate-600 break-all">{employee.email || '—'}</td>
              <td className="px-4 py-4 text-slate-600">{employee.position || '—'}</td>
              <td className="px-4 py-4">
                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  {employee.employmentStatus || 'Unknown'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
