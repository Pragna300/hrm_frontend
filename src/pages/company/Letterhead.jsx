import React, { useState } from 'react';
import LetterheadTemplate from '../../components/LetterheadTemplate';
import PDFPreviewModal from '../../components/PDFPreviewModal';
import { generateLetterhead } from '../../api/documentApi';

const templates = [
  { id: 'template1', name: 'Classic', preview: '/assets/letterhead1.png' },
  { id: 'template2', name: 'Modern', preview: '/assets/letterhead2.png' },
];

export default function Letterhead() {
  const [selected, setSelected] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleGenerate = async () => {
    if (!selected) {
      alert('Select a template first');
      return;
    }
    setLoading(true);
    try {
      const { url } = await generateLetterhead({ templateId: selected.id, data: {} });
      setPreviewUrl(url);
      setShowModal(true);
    } catch (e) {
      console.error(e);
      alert('Failed to generate document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-white">Letterhead Generator</h1>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {templates.map((t) => (
          <LetterheadTemplate
            key={t.id}
            template={t}
            selected={selected?.id === t.id}
            onSelect={() => setSelected(t)}
          />
        ))}
      </div>
      <button
        className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded disabled:opacity-50"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate PDF'}
      </button>
      {showModal && (
        <PDFPreviewModal url={previewUrl} onClose={() => setShowModal(false)} />
      )}
    </section>
  );
}
