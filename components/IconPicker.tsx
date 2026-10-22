'use client';

import React, { useState } from 'react';
import { Smile, X } from 'lucide-react';

interface IconPickerProps {
  icon: string | null;
  onUpdate: (icon: string | null) => void;
  editable?: boolean;
}

const COMMON_EMOJIS = [
  '📄', '📝', '💡', '🚀', '🎯', '🔥', '✨', '⚡', '💻', '📚',
  '🎨', '💼', '📌', '🗓️', '🏆', '⭐', '❤️', '🧠', '🛠️', '🌿',
  '📊', '📈', '🔒', '🔑', '🏷️', '📦', '🌍', '☕', '🎉', '🤖'
];

export function IconPicker({ icon, onUpdate, editable = true }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!icon) {
    if (!editable) return null;
    return (
      <div className="relative inline-block mb-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <Smile className="w-3.5 h-3.5" />
          Add icon
        </button>

        {isOpen && (
          <div className="absolute left-0 top-8 z-30 bg-white dark:bg-neutral-900 p-3 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-800 w-64">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                Pick an emoji
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-6 gap-1 text-2xl">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onUpdate(emoji);
                    setIsOpen(false);
                  }}
                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center justify-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block mb-3 group">
      <button
        onClick={() => editable && setIsOpen(!isOpen)}
        className="text-5xl md:text-6xl select-none hover:opacity-85 transition leading-none"
      >
        {icon}
      </button>

      {editable && isOpen && (
        <div className="absolute left-0 top-16 z-30 bg-white dark:bg-neutral-900 p-3 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-800 w-64">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Pick an emoji
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onUpdate(null);
                  setIsOpen(false);
                }}
                className="text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-1 text-2xl">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onUpdate(emoji);
                  setIsOpen(false);
                }}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
