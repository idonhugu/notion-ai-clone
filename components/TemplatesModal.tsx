'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  CheckSquare,
  Users,
  Target,
  BookOpen,
  Calendar,
  ArrowRight,
  LayoutTemplate,
} from 'lucide-react';

export interface Template {
  id: string;
  title: string;
  icon: string;
  category: string;
  description: string;
  blocks: any[];
}

export const NOTION_TEMPLATES: Template[] = [
  {
    id: 'meeting-notes',
    title: 'Meeting Notes & Action Items',
    icon: '📝',
    category: 'Work',
    description: 'Structure agenda items, attendee notes, and track follow-up action deliverables.',
    blocks: [
      {
        id: 't-1',
        type: 'heading',
        props: { level: 1 },
        content: [{ type: 'text', text: 'Executive Sync & Action Items' }],
      },
      {
        id: 't-2',
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Date: ' + new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) + ' | Location: Zoom / HQ',
          },
        ],
      },
      {
        id: 't-3',
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: '👥 Attendees' }],
      },
      {
        id: 't-4',
        type: 'bulletListItem',
        content: [{ type: 'text', text: 'Laksha (Lead / Host)' }],
      },
      {
        id: 't-5',
        type: 'bulletListItem',
        content: [{ type: 'text', text: 'Product & Engineering Team' }],
      },
      {
        id: 't-6',
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: '🎯 Discussion Topics' }],
      },
      {
        id: 't-7',
        type: 'numberedListItem',
        content: [{ type: 'text', text: 'Review Q4 deliverables and launch timeline' }],
      },
      {
        id: 't-8',
        type: 'numberedListItem',
        content: [{ type: 'text', text: 'AI feature rollouts and user feedback analysis' }],
      },
      {
        id: 't-9',
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: '✅ Action Items' }],
      },
      {
        id: 't-10',
        type: 'checkListItem',
        props: { checked: false },
        content: [{ type: 'text', text: 'Finalize database indexing for performance' }],
      },
      {
        id: 't-11',
        type: 'checkListItem',
        props: { checked: false },
        content: [{ type: 'text', text: 'Deploy latest build to production edge nodes' }],
      },
      {
        id: 't-12',
        type: 'checkListItem',
        props: { checked: true },
        content: [{ type: 'text', text: 'Share meeting summary and AI transcript with stakeholders' }],
      },
    ],
  },
  {
    id: 'project-roadmap',
    title: 'Project Roadmap & Tasks',
    icon: '📋',
    category: 'Engineering',
    description: 'Sprint planning board with task priorities, backlog, and milestone tracking.',
    blocks: [
      {
        id: 'p-1',
        type: 'heading',
        props: { level: 1 },
        content: [{ type: 'text', text: 'Project Roadmap & Sprint Board' }],
      },
      {
        id: 'p-2',
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'High-level roadmap and active sprint execution matrix.',
          },
        ],
      },
      {
        id: 'p-3',
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: '🔥 Current Sprint (In Progress)' }],
      },
      {
        id: 'p-4',
        type: 'checkListItem',
        props: { checked: true },
        content: [{ type: 'text', text: 'Design premium dark/light mode typography' }],
      },
      {
        id: 'p-5',
        type: 'checkListItem',
        props: { checked: true },
        content: [{ type: 'text', text: 'Connect Google Gemini 1.5 streaming engine' }],
      },
      {
        id: 'p-6',
        type: 'checkListItem',
        props: { checked: false },
        content: [{ type: 'text', text: 'Add one-click document attachment uploads' }],
      },
      {
        id: 'p-7',
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: '📦 Upcoming Backlog' }],
      },
      {
        id: 'p-8',
        type: 'bulletListItem',
        content: [{ type: 'text', text: 'Multiplayer real-time collaboration with WebSockets' }],
      },
      {
        id: 'p-9',
        type: 'bulletListItem',
        content: [{ type: 'text', text: 'Custom relational database tables with Kanban views' }],
      },
    ],
  },
  {
    id: 'prd-template',
    title: 'Product Requirements Doc (PRD)',
    icon: '💡',
    category: 'Product',
    description: 'Define problem statements, user stories, success metrics, and technical requirements.',
    blocks: [
      {
        id: 'prd-1',
        type: 'heading',
        props: { level: 1 },
        content: [{ type: 'text', text: 'PRD: Next-Gen AI Workspace' }],
      },
      {
        id: 'prd-2',
        type: 'paragraph',
        content: [{ type: 'text', text: 'Author: Product Lead | Status: Draft | Target Launch: Q4' }],
      },
      {
        id: 'prd-3',
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: '1. Problem Statement' }],
      },
      {
        id: 'prd-4',
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Users need a single unified workspace that blends block-based notes with conversational intelligence without switching between multiple apps.',
          },
        ],
      },
      {
        id: 'prd-5',
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: '2. Key User Stories' }],
      },
      {
        id: 'prd-6',
        type: 'bulletListItem',
        content: [
          {
            type: 'text',
            text: 'As an author, I want to press Space on an empty line to brainstorm or draft content with Gemini AI.',
          },
        ],
      },
      {
        id: 'prd-7',
        type: 'bulletListItem',
        content: [
          {
            type: 'text',
            text: 'As an editor, I want to highlight text and instantly fix grammar or summarize the section.',
          },
        ],
      },
      {
        id: 'prd-8',
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: '3. Success Metrics' }],
      },
      {
        id: 'prd-9',
        type: 'checkListItem',
        props: { checked: false },
        content: [{ type: 'text', text: 'Sub-500ms streaming response latency' }],
      },
      {
        id: 'prd-10',
        type: 'checkListItem',
        props: { checked: false },
        content: [{ type: 'text', text: '100% free-tier architecture on Supabase & Vercel' }],
      },
    ],
  },
  {
    id: 'weekly-planner',
    title: 'Personal Weekly Planner',
    icon: '🚀',
    category: 'Personal',
    description: 'Weekly habit tracking, top 3 priorities, daily focus areas, and gratitude log.',
    blocks: [
      {
        id: 'w-1',
        type: 'heading',
        props: { level: 1 },
        content: [{ type: 'text', text: 'Weekly Focus & Daily Intentions' }],
      },
      {
        id: 'w-2',
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: '🎯 Top 3 Priorities for the Week' }],
      },
      {
        id: 'w-3',
        type: 'numberedListItem',
        content: [{ type: 'text', text: 'Ship the Notion AI clone redesign with premium UI' }],
      },
      {
        id: 'w-4',
        type: 'numberedListItem',
        content: [{ type: 'text', text: 'Exercise 4 days this week & stay hydrated' }],
      },
      {
        id: 'w-5',
        type: 'numberedListItem',
        content: [{ type: 'text', text: 'Read 30 pages of literature or technical docs' }],
      },
      {
        id: 'w-6',
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: '⚡ Habit Tracker' }],
      },
      {
        id: 'w-7',
        type: 'checkListItem',
        props: { checked: true },
        content: [{ type: 'text', text: 'Monday: Morning gym & deep work session' }],
      },
      {
        id: 'w-8',
        type: 'checkListItem',
        props: { checked: true },
        content: [{ type: 'text', text: 'Tuesday: Code review and feature release' }],
      },
      {
        id: 'w-9',
        type: 'checkListItem',
        props: { checked: false },
        content: [{ type: 'text', text: 'Wednesday: Customer feedback & polish' }],
      },
    ],
  },
];

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: Template) => void;
}

export function TemplatesModal({
  isOpen,
  onClose,
  onApplyTemplate,
}: TemplatesModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(NOTION_TEMPLATES[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[600px] max-h-[90vh] bg-white dark:bg-[#202020] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row overflow-hidden">
        {/* Left templates list */}
        <div className="w-full md:w-72 border-r border-neutral-200 dark:border-neutral-800 flex flex-col bg-[#fbfbfa] dark:bg-[#191919]">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">
                Templates
              </span>
            </div>
            <button
              onClick={onClose}
              className="md:hidden text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2 overflow-y-auto flex-1 space-y-1">
            {NOTION_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplate.id === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-purple-100/70 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span className="text-base select-none">{tmpl.icon}</span>
                  <div className="truncate flex-1">
                    <div className="truncate">{tmpl.title}</div>
                    <div className="text-[10px] text-neutral-400 font-normal">{tmpl.category}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right preview panel */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#202020]">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedTemplate.icon}</span>
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  {selectedTemplate.title}
                </h3>
                <p className="text-[11px] text-neutral-500">{selectedTemplate.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onApplyTemplate(selectedTemplate);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs shadow-md shadow-purple-600/20 transition"
              >
                <span>Use this template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="hidden md:block p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Template preview content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-3 font-sans">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {selectedTemplate.blocks[0]?.content[0]?.text || selectedTemplate.title}
              </div>
              <p className="text-sm text-neutral-500 italic">
                {selectedTemplate.blocks[1]?.content[0]?.text || ''}
              </p>
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-2">
                {selectedTemplate.blocks.slice(2).map((block: any, idx: number) => {
                  const text = block.content?.[0]?.text || '';
                  if (block.type === 'heading') {
                    return (
                      <h4 key={idx} className="text-base font-semibold text-neutral-800 dark:text-neutral-200 mt-4">
                        {text}
                      </h4>
                    );
                  }
                  if (block.type === 'checkListItem') {
                    return (
                      <div key={idx} className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                        <input
                          type="checkbox"
                          defaultChecked={block.props?.checked}
                          disabled
                          className="rounded text-purple-600"
                        />
                        <span className={block.props?.checked ? 'line-through text-neutral-400' : ''}>
                          {text}
                        </span>
                      </div>
                    );
                  }
                  if (block.type === 'bulletListItem') {
                    return (
                      <div key={idx} className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 pl-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                        <span>{text}</span>
                      </div>
                    );
                  }
                  return (
                    <p key={idx} className="text-xs text-neutral-600 dark:text-neutral-400">
                      {text}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
