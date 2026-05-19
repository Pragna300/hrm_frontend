import { X, ExternalLink } from 'lucide-react';
import { API_BASE } from '../../api/client';

const DocumentPreviewModal = ({ document, onClose }) => {
  if (!document) return null;

  const getFullUrl = (url) => {
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      return url;
    }
    return `${API_BASE.replace('/api', '')}${url}`;
  };

  const fileUrl = getFullUrl(document.fileUrl);

  const getViewerUrl = () => {
    // If it's a PDF or Image, we just use the raw URL
    if (document.fileType === 'application/pdf' || document.fileType?.startsWith('image/')) {
      return fileUrl;
    }
    
    // For DOCX/PPTX/XLSX, use Google Docs Viewer (Note: this only works if the file is publicly accessible on the internet)
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6">
      <div className="flex h-full w-full max-w-5xl flex-col rounded-xl bg-white shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{document.title}</h2>
            <p className="text-sm text-slate-500">
              {document.category || 'General'} · {document.isOrganizationWide ? 'Org-Wide' : 'Personal'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
            >
              Open New Tab <ExternalLink size={16} />
            </a>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-900"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-100 p-4 sm:p-8 flex items-center justify-center relative">
          {document.fileType?.startsWith('image/') ? (
            <img 
              src={fileUrl} 
              alt={document.title} 
              className="max-h-full max-w-full object-contain shadow-sm rounded-lg"
            />
          ) : (
            <div className="relative h-full w-full rounded-lg shadow-sm overflow-hidden bg-white">
              {/* Fallback overlay for local dev with MS office docs */}
              {document.fileType && !document.fileType.includes('pdf') && !document.fileType.startsWith('image/') && (
                <div className="absolute top-0 left-0 w-full p-2 bg-yellow-100 text-yellow-800 text-xs text-center border-b border-yellow-200 z-10">
                  Note: DOCX/PPTX/XLSX preview requires the server to be publicly accessible (not localhost). If it fails to load, please download it.
                </div>
              )}
              <iframe
                src={getViewerUrl()}
                className="h-full w-full border-0"
                title={document.title}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
