import { useEffect, useState } from 'react';
import { FileStack, Upload, Trash2, Eye, Download } from 'lucide-react';
import { api, getStoredUser, API_BASE, getStoredToken } from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import DocumentPreviewModal from '../../components/ui/DocumentPreviewModal';

const CompanyDocumentsPage = () => {
  const user = getStoredUser() || {};
  const [docs, setDocs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Upload State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [visibilityScope, setVisibilityScope] = useState('org_wide');
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [previewDoc, setPreviewDoc] = useState(null);

  const loadDocs = () => {
    setError('');
    api.get('/documents')
      .then((res) => setDocs(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadDocs();
    api.get('/employees')
      .then((res) => setEmployees(Array.isArray(res.data) ? res.data : []))
      .catch(() => setEmployees([]));
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit.');
        e.target.value = '';
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim() || !file) return;
    if (visibilityScope === 'employee' && !targetEmployeeId) {
      setError('Please select an employee for personal document.');
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category.trim());
    formData.append('visibilityScope', visibilityScope);
    formData.append('file', file);
    
    if (visibilityScope === 'employee') {
      formData.append('employeeId', targetEmployeeId);
    }
    
    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitle('');
      setDescription('');
      setCategory('');
      setFile(null);
      setTargetEmployeeId('');
      setVisibilityScope('org_wide');
      setSuccess('Document uploaded successfully.');
      document.getElementById('fileUploadInput').value = '';
      loadDocs();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      setSuccess('Document deleted.');
      loadDocs();
    } catch (err) {
      setError(err.message);
    }
  };

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

  return (
    <div>
      <PageHeader
        title="Company Documents"
        subtitle="Manage organization-wide documents and employee files."
      />
      {error && <Alert type="error" className="mb-4">{error}</Alert>}
      {success && <Alert type="success" className="mb-4">{success}</Alert>}

      <form onSubmit={handleUpload} className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
          <Upload size={18} className="text-sky-600" />
          Upload New Document
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          
          <label className="block text-sm lg:col-span-2">
            <span className="text-slate-700 font-medium">Document Title *</span>
            <input
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          
          <label className="block text-sm">
            <span className="text-slate-700 font-medium">Category</span>
            <input
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="e.g. HR, Policy, Engineering..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </label>
          
          <label className="block text-sm lg:col-span-3">
            <span className="text-slate-700 font-medium">Description</span>
            <input
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="text-slate-700 font-medium">Visibility Scope *</span>
            <select
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={visibilityScope}
              onChange={(e) => {
                setVisibilityScope(e.target.value);
                if(e.target.value === 'org_wide') setTargetEmployeeId('');
              }}
            >
              <option value="org_wide">Entire Organization</option>
              <option value="employee">Specific Employee Only</option>
            </select>
          </label>

          {visibilityScope === 'employee' && (
            <label className="block text-sm lg:col-span-2">
              <span className="text-slate-700 font-medium">Select Employee *</span>
              <select
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                value={targetEmployeeId}
                onChange={(e) => setTargetEmployeeId(e.target.value)}
                required
              >
                <option value="">Select…</option>
                {employees.map((em) => (
                  <option key={em.id} value={em.id}>
                    {em.firstName} {em.lastName} ({em.employeeCode})
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block text-sm lg:col-span-3">
            <span className="text-slate-700 font-medium">File (PDF, DOCX, XLSX, PPTX, Images max 10MB) *</span>
            <input
              id="fileUploadInput"
              type="file"
              accept=".pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg"
              className="mt-1.5 block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100"
              onChange={handleFileChange}
              required
            />
          </label>

        </div>
        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={saving || !file}>
            {saving ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <h3 className="text-base font-bold text-slate-800">Uploaded Documents</h3>
        </div>
        
        {docs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No documents found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Title</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Visibility</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docs.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{d.title}</div>
                      {d.description && <div className="text-xs text-slate-500 mt-0.5">{d.description}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {d.category || 'General'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {d.isOrganizationWide ? (
                        <span className="text-sky-700 font-medium">Org-Wide</span>
                      ) : (
                        <span className="text-slate-600">
                          {d.employee?.firstName} {d.employee?.lastName}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setPreviewDoc(d)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-900"
                          title="Preview"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownload(d)}
                          className="rounded p-1.5 text-slate-400 hover:bg-sky-100 hover:text-sky-700"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {previewDoc && (
        <DocumentPreviewModal 
          document={previewDoc} 
          onClose={() => setPreviewDoc(null)} 
        />
      )}
    </div>
  );
};

export default CompanyDocumentsPage;
