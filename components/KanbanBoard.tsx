'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';

export type Priority = 'low' | 'medium' | 'high';
export type ColumnId = 'todo' | 'in_progress' | 'review' | 'done';

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  columnId: ColumnId;
  createdAt: string;
}

interface KanbanBoardProps {
  documentTitle: string;
  documentContent: string;
  cards: KanbanCard[];
  onUpdateCards: (newCards: KanbanCard[]) => void;
}

const COLUMNS: { id: ColumnId; title: string; color: string; badgeColor: string }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-neutral-500', badgeColor: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500', badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' },
  { id: 'review', title: 'Review', color: 'bg-amber-500', badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
  { id: 'done', title: 'Done', color: 'bg-emerald-500', badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
];

export function KanbanBoard({
  documentTitle,
  documentContent,
  cards,
  onUpdateCards,
}: KanbanBoardProps) {
  const [newCardTitles, setNewCardTitles] = useState<Record<ColumnId, string>>({
    todo: '',
    in_progress: '',
    review: '',
    done: '',
  });
  const [activeInputColumn, setActiveInputColumn] = useState<ColumnId | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  // Add a new card to a specific column
  const handleAddCard = (colId: ColumnId) => {
    const text = (newCardTitles[colId] || '').trim();
    if (!text) return;

    const newCard: KanbanCard = {
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: text,
      priority: 'medium',
      columnId: colId,
      createdAt: new Date().toISOString(),
    };

    onUpdateCards([...cards, newCard]);
    setNewCardTitles((prev) => ({ ...prev, [colId]: '' }));
    setActiveInputColumn(null);
  };

  // Delete a card
  const handleDeleteCard = (cardId: string) => {
    onUpdateCards(cards.filter((c) => c.id !== cardId));
  };

  // Move card left or right
  const handleMoveCard = (cardId: string, direction: 'prev' | 'next') => {
    const order: ColumnId[] = ['todo', 'in_progress', 'review', 'done'];
    onUpdateCards(
      cards.map((card) => {
        if (card.id !== cardId) return card;
        const currentIndex = order.indexOf(card.columnId);
        const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex >= 0 && nextIndex < order.length) {
          return { ...card, columnId: order[nextIndex] };
        }
        return card;
      })
    );
  };

  // Cycle card priority (Low -> Medium -> High -> Low)
  const handleCyclePriority = (cardId: string) => {
    const nextPriority: Record<Priority, Priority> = {
      low: 'medium',
      medium: 'high',
      high: 'low',
    };
    onUpdateCards(
      cards.map((card) =>
        card.id === cardId ? { ...card, priority: nextPriority[card.priority] } : card
      )
    );
  };

  // AI Task Generator: Reads page and creates tasks automatically
  const handleAIGenerateTasks = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'action_items',
          context: `Title: ${documentTitle}\n\nContent:\n${documentContent}`,
          prompt: 'Generate 4-6 prioritized project tasks based on this document.',
        }),
      });

      if (!res.ok) throw new Error('AI task extraction failed');
      const text = await res.text();

      // Parse lines like "- [ ] Task name" or "1. Task name" or "- Task name"
      const lines = text.split('\n');
      const extractedTitles: string[] = [];

      for (const line of lines) {
        const cleaned = line
          .replace(/^[-*]\s*(\[[ xX]\])?\s*/, '')
          .replace(/^\d+[\.\)]\s*/, '')
          .trim();
        if (cleaned && cleaned.length > 3 && !cleaned.toLowerCase().includes('action items')) {
          extractedTitles.push(cleaned);
        }
      }

      if (extractedTitles.length > 0) {
        const newCards: KanbanCard[] = extractedTitles.slice(0, 6).map((title, i) => ({
          id: `ai_${Date.now()}_${i}`,
          title,
          priority: i === 0 ? 'high' : i === 1 ? 'high' : 'medium',
          columnId: 'todo',
          createdAt: new Date().toISOString(),
        }));

        onUpdateCards([...cards, ...newCards]);
      }
    } catch (err) {
      console.error('Error auto-generating tasks:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (cardId: string) => {
    setDraggedCardId(cardId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (colId: ColumnId) => {
    if (!draggedCardId) return;
    onUpdateCards(
      cards.map((card) =>
        card.id === draggedCardId ? { ...card, columnId: colId } : card
      )
    );
    setDraggedCardId(null);
  };

  const priorityStyles: Record<Priority, { label: string; class: string }> = {
    high: {
      label: 'High',
      class: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/60',
    },
    medium: {
      label: 'Med',
      class: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/60',
    },
    low: {
      label: 'Low',
      class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/60',
    },
  };

  return (
    <div className="w-full pb-16 animate-in fade-in duration-200">
      {/* Board Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span>Project Tasks & Kanban</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-normal">
              {cards.length} {cards.length === 1 ? 'task' : 'tasks'}
            </span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage deliverables, assign priorities, and track progress across phases.
          </p>
        </div>

        {/* AI Task Generator */}
        <button
          onClick={handleAIGenerateTasks}
          disabled={isGeneratingAI}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm disabled:opacity-50 transition"
        >
          {isGeneratingAI ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>{isGeneratingAI ? 'Extracting Action Items...' : '✨ AI Generate Tasks'}</span>
        </button>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const columnCards = cards.filter((c) => c.columnId === col.id);
          const isInputActive = activeInputColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.id)}
              className="flex flex-col bg-neutral-100/70 dark:bg-[#1a1a1a]/80 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 p-3 min-h-[420px] transition"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.color}`} />
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {col.title}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${col.badgeColor}`}>
                    {columnCards.length}
                  </span>
                </div>

                <button
                  onClick={() => setActiveInputColumn(isInputActive ? null : col.id)}
                  className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
                  title="Add card"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add Card Input Form */}
              {isInputActive && (
                <div className="mb-3 p-2 bg-white dark:bg-[#222222] rounded-xl border border-purple-300 dark:border-purple-800 shadow-sm animate-in fade-in duration-100">
                  <textarea
                    autoFocus
                    rows={2}
                    placeholder="Enter card title..."
                    value={newCardTitles[col.id] || ''}
                    onChange={(e) =>
                      setNewCardTitles((prev) => ({ ...prev, [col.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddCard(col.id);
                      }
                      if (e.key === 'Escape') {
                        setActiveInputColumn(null);
                      }
                    }}
                    className="w-full bg-transparent text-xs text-neutral-800 dark:text-neutral-200 resize-none outline-none placeholder:text-neutral-400"
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-1">
                    <button
                      onClick={() => setActiveInputColumn(null)}
                      className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAddCard(col.id)}
                      disabled={!newCardTitles[col.id]?.trim()}
                      className="px-2.5 py-1 rounded-md bg-purple-600 text-white text-[11px] font-semibold hover:bg-purple-700 disabled:opacity-40 transition"
                    >
                      Add Card
                    </button>
                  </div>
                </div>
              )}

              {/* Column Cards */}
              <div className="flex-1 space-y-2 overflow-y-auto">
                {columnCards.length === 0 && !isInputActive && (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-neutral-400 text-xs border border-dashed border-neutral-200 dark:border-neutral-800/80 rounded-xl">
                    <span>No cards yet</span>
                    <button
                      onClick={() => setActiveInputColumn(col.id)}
                      className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 hover:underline font-medium"
                    >
                      + Add a card
                    </button>
                  </div>
                )}

                {columnCards.map((card) => {
                  const pConfig = priorityStyles[card.priority];
                  const colIdx = COLUMNS.findIndex((c) => c.id === card.columnId);

                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card.id)}
                      className="group bg-white dark:bg-[#222222] p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none"
                    >
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <button
                          onClick={() => handleCyclePriority(card.id)}
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border transition ${pConfig.class}`}
                          title="Click to cycle priority (Low -> Med -> High)"
                        >
                          {pConfig.label}
                        </button>

                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition">
                          {colIdx > 0 && (
                            <button
                              onClick={() => handleMoveCard(card.id, 'prev')}
                              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                              title="Move left"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                          )}
                          {colIdx < COLUMNS.length - 1 && (
                            <button
                              onClick={() => handleMoveCard(card.id, 'next')}
                              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                              title="Move right"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                            title="Delete card"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200 leading-snug">
                        {card.title}
                      </div>

                      {card.description && (
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                          {card.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Add */}
              {!isInputActive && (
                <button
                  onClick={() => setActiveInputColumn(col.id)}
                  className="mt-2 w-full py-1.5 px-2 rounded-xl text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 flex items-center justify-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add card</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
