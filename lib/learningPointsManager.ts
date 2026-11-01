/**
 * Clinical Learning Points & CPD Log Manager
 * Handles extracting, persisting, and syncing clinical pearls and learning points
 * generated from Heidi Evidence consultations and queries.
 */

import { fetchAllDocuments, fetchDocumentById, createDocument, updateDocument } from './api/documents';
import { Document } from './types';

export interface SavedClinicalLearning {
  id: string;
  timestamp: string; // ISO date
  dateFormatted: string; // e.g. "1 Nov 2026, 13:20"
  topic: string; // Short title / condition
  query: string; // Original clinical query or pasted consultation text
  learningPoints: string[]; // Extracted or user-edited key takeaways
  personalReflection?: string; // Optional clinician reflection for CPD
  fullEvidence: string; // Complete Markdown from Heidi Evidence
  docTitleContext?: string; // If viewed while in a specific presentation
}

const STORAGE_KEY = 'notion_heidi_saved_learnings';
const CPD_DOC_TITLE = '💡 Clinical Learning Points & CPD Log';

/**
 * Safely retrieves saved clinical learnings from local cache
 */
export function getSavedLearnings(): SavedClinicalLearning[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to read saved clinical learnings from localStorage:', err);
    return [];
  }
}

/**
 * Persists a new or updated learning item into local cache
 */
export function persistLearningLocally(item: SavedClinicalLearning): SavedClinicalLearning[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getSavedLearnings();
    const filtered = existing.filter((l) => l.id !== item.id);
    const updated = [item, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 100))); // keep up to 100 recent
    window.dispatchEvent(new CustomEvent('notion:heidi_learning_saved', { detail: item }));
    return updated;
  } catch (err) {
    console.warn('Failed to persist learning item locally:', err);
    return [];
  }
}

/**
 * Deletes a learning item from local cache
 */
export function deleteLearningLocally(id: string): SavedClinicalLearning[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getSavedLearnings();
    const updated = existing.filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('notion:heidi_learning_deleted', { detail: { id } }));
    return updated;
  } catch (err) {
    console.warn('Failed to delete learning item locally:', err);
    return [];
  }
}

/**
 * Smartly extracts structured learning points, title, and key clinical pearls
 * from Heidi Evidence markdown output.
 */
export function extractLearningPointsFromEvidence(
  evidenceText: string,
  query: string,
  docContextTitle?: string
): { topic: string; suggestedPoints: string[] } {
  // 1. Determine Topic / Title
  let topic = '';

  // Look for Executive summary topic or first markdown header
  const titleMatch = evidenceText.match(/### 🎯 Executive Clinical Recommendation\s*\n+([^\n]+)/i);
  if (titleMatch && titleMatch[1]) {
    const firstSentence = titleMatch[1].split('.')[0].trim();
    if (firstSentence.length > 5 && firstSentence.length < 80) {
      topic = firstSentence;
    }
  }

  if (!topic && docContextTitle) {
    topic = docContextTitle;
  }

  if (!topic) {
    // Clean up query if short
    const cleanQuery = query.replace(/^["']|["']$/g, '').trim();
    topic = cleanQuery.length <= 60 ? cleanQuery : cleanQuery.slice(0, 57) + '...';
  }

  // 2. Extract Key Learning Points from structured sections
  const points: string[] = [];

  // A. Executive summary points
  const execMatch = evidenceText.match(/### 🎯 Executive Clinical Recommendation\s*([\s\S]*?)(?:###|$)/i);
  if (execMatch && execMatch[1]) {
    const lines = execMatch[1]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 15 && !l.startsWith('(') && !l.startsWith('```'));
    for (const l of lines.slice(0, 2)) {
      const cleaned = l.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (cleaned && !points.includes(cleaned)) {
        points.push(cleaned);
      }
    }
  }

  // B. First-line management rules from Management Pathway
  const mgmtMatch = evidenceText.match(/### 💊 Management & Dosing Pathway[^\n]*\s*([\s\S]*?)(?:###|$)/i);
  if (mgmtMatch && mgmtMatch[1]) {
    const firstLineMatch = mgmtMatch[1].match(/[-*]\s*\*\*First-Line:\*\*\s*([^\n]+)/i);
    if (firstLineMatch && firstLineMatch[1]) {
      const pt = `First-line: ${firstLineMatch[1].trim()}`;
      if (!points.includes(pt)) points.push(pt);
    }
  }

  // C. Critical Red Flags
  const redFlagMatch = evidenceText.match(/### 🚩 Red Flags & Urgent Referral Thresholds[^\n]*\s*([\s\S]*?)(?:###|$)/i);
  if (redFlagMatch && redFlagMatch[1]) {
    const flagLines = redFlagMatch[1]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('-') || l.startsWith('*'));
    if (flagLines.length > 0) {
      const pt = `Red flags: ${flagLines[0].replace(/^[-*]\s*/, '').trim()}`;
      if (!points.includes(pt)) points.push(pt);
    }
  }

  // D. Monitoring / Safety Netting
  const safetyMatch = evidenceText.match(/### 🔒 Safety Netting & Monitoring Protocols\s*([\s\S]*?)(?:###|$)/i);
  if (safetyMatch && safetyMatch[1]) {
    const safetyLines = safetyMatch[1]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => (l.startsWith('-') || l.startsWith('*')) && l.length > 15);
    if (safetyLines.length > 0) {
      const pt = `Monitoring: ${safetyLines[0].replace(/^[-*]\s*/, '').trim()}`;
      if (!points.includes(pt)) points.push(pt);
    }
  }

  // Fallback if parsing failed to extract at least 2 points
  if (points.length === 0) {
    const candidateLines = evidenceText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 25 && !l.startsWith('#') && !l.startsWith('```') && !l.startsWith('>'));
    for (const l of candidateLines.slice(0, 3)) {
      points.push(l.replace(/^[-*]\s*/, ''));
    }
  }

  return {
    topic: topic || 'Clinical Learning Point',
    suggestedPoints: points.slice(0, 5),
  };
}

/**
 * Appends the learning point into the user's dedicated workspace document:
 * "💡 Clinical Learning Points & CPD Log".
 * If the document does not exist, automatically creates it in Supabase!
 */
export async function appendLearningToCloudCPDDoc(
  learning: SavedClinicalLearning
): Promise<{ success: boolean; docId: string; docTitle: string }> {
  try {
    const allDocs = await fetchAllDocuments();
    let cpdDoc = allDocs.find(
      (d) =>
        d.title.trim().toLowerCase() === CPD_DOC_TITLE.toLowerCase() ||
        d.title.toLowerCase().includes('clinical learning points') ||
        d.title.toLowerCase().includes('cpd log')
    );

    // Helpers to construct BlockNote blocks
    const makeId = () =>
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : 'blk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const newBlocks: any[] = [
      {
        id: makeId(),
        type: 'heading',
        props: { level: 2, textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
        content: [{ type: 'text', text: `💡 ${learning.dateFormatted} — ${learning.topic}`, styles: { bold: true } }],
        children: [],
      },
      {
        id: makeId(),
        type: 'quote',
        props: { textColor: 'default', backgroundColor: 'default' },
        content: [
          { type: 'text', text: `Clinical Query / Consultation: `, styles: { bold: true } },
          { type: 'text', text: `"${learning.query}"`, styles: { italic: true } },
        ],
        children: [],
      },
    ];

    // Add learning point bullets
    for (const pt of learning.learningPoints) {
      newBlocks.push({
        id: makeId(),
        type: 'bulletListItem',
        props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
        content: [
          { type: 'text', text: '🎯 ', styles: {} },
          { type: 'text', text: pt, styles: {} },
        ],
        children: [],
      });
    }

    // Add personal reflection if provided
    if (learning.personalReflection && learning.personalReflection.trim()) {
      newBlocks.push({
        id: makeId(),
        type: 'paragraph',
        props: { textColor: 'purple', backgroundColor: 'default' },
        content: [
          { type: 'text', text: '📝 Clinician Reflection / CPD Note: ', styles: { bold: true } },
          { type: 'text', text: learning.personalReflection.trim(), styles: { italic: true } },
        ],
        children: [],
      });
    }

    // Divider / spacing
    newBlocks.push({
      id: makeId(),
      type: 'paragraph',
      props: { textColor: 'default', backgroundColor: 'default' },
      content: [{ type: 'text', text: '', styles: {} }],
      children: [],
    });

    if (cpdDoc) {
      // Document already exists, fetch full content and append
      const { document: fullDoc } = await fetchDocumentById(cpdDoc.id);
      const existingBlocks = Array.isArray(fullDoc?.content) ? fullDoc.content : [];
      const updatedBlocks = [...existingBlocks, ...newBlocks];

      await updateDocument(cpdDoc.id, {
        content: updatedBlocks,
        updated_at: new Date().toISOString(),
      });

      return { success: true, docId: cpdDoc.id, docTitle: cpdDoc.title };
    } else {
      // Document does not exist yet; create it at root
      const initialHeaderBlocks = [
        {
          id: makeId(),
          type: 'heading',
          props: { level: 1, textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
          content: [{ type: 'text', text: '💡 Clinical Learning Points & CPD Log', styles: { bold: true } }],
          children: [],
        },
        {
          id: makeId(),
          type: 'quote',
          props: { textColor: 'default', backgroundColor: 'default' },
          content: [
            {
              type: 'text',
              text: 'A structured record of clinical learning points, pearls, and evidence takeaways generated during GP consultations via Heidi Evidence. Suitable for appraisal and revalidation.',
              styles: { italic: true },
            },
          ],
          children: [],
        },
        {
          id: makeId(),
          type: 'paragraph',
          props: { textColor: 'default', backgroundColor: 'default' },
          content: [{ type: 'text', text: '', styles: {} }],
          children: [],
        },
      ];

      const created = await createDocument({
        title: CPD_DOC_TITLE,
        icon: '💡',
        content: [...initialHeaderBlocks, ...newBlocks],
        is_favorite: true,
        is_archived: false,
      });

      return { success: true, docId: created.id, docTitle: created.title };
    }
  } catch (err: any) {
    console.error('Failed to append learning point to CPD document in cloud:', err);
    throw err;
  }
}

/**
 * Formats all saved learnings as clean Markdown for export or copying into an appraisal portfolio.
 */
export function formatLearningsForAppraisal(learnings: SavedClinicalLearning[]): string {
  if (learnings.length === 0) return 'No saved clinical learning points yet.';

  const lines = [
    `# 💡 Clinical Learning & CPD Portfolio`,
    `*Generated from Heidi Evidence & GP WorkSpace — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}*`,
    ``,
    `---`,
    ``,
  ];

  learnings.forEach((item, idx) => {
    lines.push(`## ${idx + 1}. ${item.topic} (${item.dateFormatted})`);
    lines.push(`> **Clinical Scenario / Query:** "${item.query}"`);
    lines.push(``);
    lines.push(`### 🎯 Key Learning Points:`);
    item.learningPoints.forEach((pt) => {
      lines.push(`- ${pt}`);
    });
    if (item.personalReflection) {
      lines.push(``);
      lines.push(`### 📝 Clinician Reflection:`);
      lines.push(`*${item.personalReflection}*`);
    }
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  });

  return lines.join('\n');
}
