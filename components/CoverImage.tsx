'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';

interface CoverImageProps {
  url: string | null;
  onUpdate: (url: string | null) => void;
  editable?: boolean;
}

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&auto=format&fit=crop&q=80',
];

export function CoverImage({ url, onUpdate, editable = true }: CoverImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!url) {
    if (!editable) return null;
    return (
      <div className="group relative w-full h-8 opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={() => onUpdate(PRESET_COVERS[0])}
          className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Add cover
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[220px] md:h-[260px] group overflow-hidden select-none bg-neutral-100 dark:bg-neutral-900">
      <img
        src={url}
        alt="Document Cover"
        className="w-full h-full object-cover object-center transition-all duration-300"
      />

      {editable && (
        <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-2 py-1 rounded-md shadow-sm border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hover:text-black dark:hover:text-white transition flex items-center gap-1"
          >
            <ImageIcon className="w-3 h-3" />
            Change cover
          </button>
          <div className="w-[1px] h-3 bg-neutral-300 dark:bg-neutral-700" />
          <button
            onClick={() => onUpdate(null)}
            className="hover:text-red-500 transition flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Remove
          </button>
        </div>
      )}

      {isOpen && (
        <div className="absolute right-4 bottom-14 z-20 bg-white dark:bg-neutral-900 p-3 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-800 w-72">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Select Preset Cover
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_COVERS.map((preset, index) => (
              <button
                key={index}
                onClick={() => {
                  onUpdate(preset);
                  setIsOpen(false);
                }}
                className="h-14 rounded overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:scale-105 transition transform"
              >
                <img
                  src={preset}
                  alt={`Preset ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
