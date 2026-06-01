import React from 'react';

export default function PDFPreviewModal({ url, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 h-5/6 p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
        <iframe src={url} title="PDF Preview" className="w-full h-full border-0" />
      </div>
    </div>
  );
}
