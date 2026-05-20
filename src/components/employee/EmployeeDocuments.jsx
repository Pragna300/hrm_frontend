import React, { useState } from 'react';
import { FileText, Plus, Download, Eye, Upload, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import { api } from '../../api/client';
import DocumentPreviewModal from '../ui/DocumentPreviewModal';

const EmployeeDocuments = ({ employee, onRefresh }) => {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Upload form state
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Resume');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  if (!employee) return null;

  const docs = employee.documents || [];

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('visibilityScope', 'employee_only'); // Private to this employee
      formData.append('employeeId', employee.id);
      formData.append('file', file);

      await api.post('/documents/upload', formData, {
        headers: {}, // Do NOT set content-type, browser will automatically set it with boundary
      });

      setMessage('Document uploaded successfully');
      setTitle('');
      setDescription('');
      setFile(null);
      setShowUpload(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      setMessage('Document deleted');
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to delete document');
    }
  };

  const categories = ['Resume', 'Certificate', 'ID Proof', 'Offer Letter', 'General'];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <FileText className="text-[#3174ad]" size={20} />
          <h3 className="text-lg font-bold text-slate-800">Documents</h3>
        </div>
        <Button 
          size="sm" 
          variant={showUpload ? 'secondary' : 'primary'}
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-1 font-bold"
        >
          {showUpload ? 'Cancel' : <><Plus size={14} /> Upload New</>}
        </Button>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</div>}
      {message && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{message}</div>}

      {/* Upload Form Panel */}
      {showUpload && (
        <form onSubmit={handleUploadSubmit} className="mb-6 p-4 rounded-xl border border-slate-150 bg-slate-50/50 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Upload Employee Document</h4>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              Document Title *
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Offer Letter Signed"
                className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 bg-white outline-none focus:border-[#3174ad]"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              Category *
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 bg-white outline-none focus:border-[#3174ad]"
                required
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            Description / Notes
            <input 
              type="text" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Confirmed signed copy"
              className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 bg-white outline-none focus:border-[#3174ad]"
            />
          </div>

          <div className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            Choose File *
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                <Upload size={16} />
                Browse
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden" 
                  required
                />
              </label>
              <span className="text-xs font-medium text-slate-500 truncate max-w-xs">
                {file ? file.name : 'No file selected'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" disabled={uploading} className="font-bold flex items-center gap-1">
              {uploading ? 'Uploading...' : 'Submit'}
            </Button>
          </div>
        </form>
      )}

      {/* Documents Grid */}
      {docs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm font-bold text-slate-400">No documents uploaded for this employee yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => {
            return (
              <div key={doc.id} className="flex flex-col justify-between rounded-xl border border-slate-150 p-4 bg-white hover:border-[#3174ad]/40 hover:bg-slate-50/20 transition-all duration-200 group">
                <div>
                  <span className="rounded bg-sky-50 text-[#3174ad] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                    {doc.category || 'General'}
                  </span>
                  <h4 className="mt-2 text-sm font-bold text-slate-800 truncate">{doc.title}</h4>
                  {doc.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{doc.description}</p>}
                </div>
                
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      title="Preview"
                    >
                      <Eye size={14} />
                    </button>
                    <a
                      href={`${api.get.name === 'get' ? '/api/documents/download/' : '/api/documents/download/'}${doc.id}`}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center"
                      title="Download"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download size={14} />
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedDoc && (
        <DocumentPreviewModal 
          document={selectedDoc} 
          onClose={() => setSelectedDoc(null)} 
        />
      )}
    </div>
  );
};

export default EmployeeDocuments;
