import { useEffect, useState } from 'react';
import { Eye, Download, Search, Filter } from 'lucide-react';
import { api, getStoredUser, API_BASE, getStoredToken } from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import Alert from '../../components/ui/Alert';
import DocumentPreviewModal from '../../components/ui/DocumentPreviewModal';

const EmployeeDocumentsPage = () => {
  const user = getStoredUser() || {};
  const [docs, setDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [error, setError] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  
  const [previewDoc, setPreviewDoc] = useState(null);

  const loadDocs = () => {
    if (!user.employeeId && user.role !== 'manager' && user.role !== 'hr') return;
    setError('');
    
    // We can just hit the same /documents endpoint which returns documents for the organization
    // Then we filter on the frontend for those that are org-wide OR belong to this specific employee.
    api.get('/documents')
      .then((res) => {
        const allDocs = Array.isArray(res.data) ? res.data : [];
        
        // Employees should only see Org-Wide docs AND docs assigned specifically to them.
        const viewableDocs = allDocs.filter(d => 
          d.isOrganizationWide || d.employeeId === user.employeeId
        );
        
        setDocs(viewableDocs);
        setFilteredDocs(viewableDocs);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(viewableDocs.map(d => d.category || 'General'))];
        setCategories(uniqueCategories);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadDocs();
  }, [user.employeeId, user.role]);

  useEffect(() => {
    let result = docs;
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.title.toLowerCase().includes(lowerQ) || 
        (d.description && d.description.toLowerCase().includes(lowerQ))
      );
    }
    if (categoryFilter) {
      result = result.filter(d => (d.category || 'General') === categoryFilter);
    }
    setFilteredDocs(result);
  }, [searchQuery, categoryFilter, docs]);

  const handleDownload = async (doc) => {
    try {
      const token = getStoredToken();
      const response = await fetch(`${API_BASE}/documents/${doc.id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const ext = doc.fileUrl.split('.').pop()?.split('?')[0] || '';
      let filename = doc.title;
      if (ext && ext.length < 5 && !filename.toLowerCase().endsWith(`.${ext.toLowerCase()}`)) {
        filename = `${filename}.${ext}`;
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Failed to download document.');
    }
  };

  if (!user.employeeId && !['manager', 'hr'].includes(user.role)) {
    return (
      <div>
        <PageHeader title="Documents" subtitle="Organization files and personal documents." />
        <Alert type="error">No employee profile is linked to this account.</Alert>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Documents Portal"
        subtitle="View and download organization-wide policies, guidelines, and your personal files."
      />
      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search documents by title or description..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="text-slate-400" size={18} />
            <select 
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm min-w-[150px]"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredDocs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3">
            <Search className="text-slate-400" size={24} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No documents found</h3>
          <p className="mt-1 text-sm text-slate-500">
            {docs.length === 0 ? "Your organization hasn't uploaded any documents yet." : "No documents match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((d) => (
            <div key={d.id} className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                    {d.category || 'General'}
                  </span>
                  {!d.isOrganizationWide && (
                    <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                      Personal
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1" title={d.title}>{d.title}</h3>
                {d.description && (
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{d.description}</p>
                )}
                <div className="text-xs text-slate-400 mt-auto pt-2 flex items-center justify-between border-t border-slate-100">
                  <span>Uploaded {new Date(d.createdAt).toLocaleDateString()}</span>
                  <span className="uppercase">{d.fileType?.split('/')[1]?.substring(0,4) || 'FILE'}</span>
                </div>
              </div>
              <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewDoc(d)}
                  className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Eye size={16} /> Preview
                </button>
                <button
                  onClick={() => handleDownload(d)}
                  className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 transition-colors"
                >
                  <Download size={16} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewDoc && (
        <DocumentPreviewModal 
          document={previewDoc} 
          onClose={() => setPreviewDoc(null)} 
        />
      )}
    </div>
  );
};

export default EmployeeDocumentsPage;
