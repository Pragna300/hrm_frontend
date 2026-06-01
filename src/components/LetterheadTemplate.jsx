import React from 'react';

// Simple card to display a letterhead template thumbnail
export default function LetterheadTemplate({ template, onSelect, selected }) {
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer shadow-md transition-transform hover:scale-105 ${selected ? 'border-primary ring-2 ring-primary' : ''}`}
      onClick={() => onSelect(template)}
    >
      <img src={template.thumbnailUrl} alt={template.name} className="w-full h-32 object-cover mb-2 rounded" />
      <h3 className="text-lg font-medium text-white">{template.name}</h3>
    </div>
  );
}
