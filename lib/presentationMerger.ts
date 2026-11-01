/**
 * Clinical Presentation Merger & BlockNote Block Builder
 * Used by PDF Guideline Sync to merge extracted medical intelligence into
 * GP Common Presentations (NICE CKS / RCGP standard structure).
 */

import { Document, AttachedFile } from './types';

export const COMMON_PRESENTATIONS_PARENT_ID = '74ae5917-c661-4e8e-b993-d9aa5052185f';

export interface ExtractedClinicalSections {
  history: string[];
  examination: string[];
  investigations: string[];
  differentials: string[];
  rare: string[];
  plan: string[];
  safetynetting: string[];
  followup: string[];
  referral: string[];
  clinicalPearls?: string[];
}

export interface AnalyzedPresentationResult {
  guidelineTitle: string;
  issuingAuthority: string;
  matchedPresentationId: string | null;
  matchedPresentationTitle: string;
  matchedPresentationIcon: string;
  confidence: 'high' | 'medium' | 'low';
  matchReason: string;
  suggestedAction: 'merge' | 'create';
  sections: ExtractedClinicalSections;
}

export const SECTION_DEFINITIONS: {
  key: keyof ExtractedClinicalSections;
  heading: string;
  matchPattern: RegExp;
  description: string;
}[] = [
  {
    key: 'history',
    heading: '📋 History',
    matchPattern: /history/i,
    description: 'Key symptoms, risk factors, screening questions & red flags',
  },
  {
    key: 'examination',
    heading: '🩺 Examination',
    matchPattern: /examination/i,
    description: 'Physical exam findings, vital sign thresholds & diagnostic signs',
  },
  {
    key: 'investigations',
    heading: '🔬 Investigations',
    matchPattern: /investigations/i,
    description: 'Bedside tests, blood panels, diagnostic thresholds & imaging',
  },
  {
    key: 'differentials',
    heading: '🔀 Differentials',
    matchPattern: /differentials/i,
    description: 'Key common and secondary differential diagnoses',
  },
  {
    key: 'rare',
    heading: '🚩 Rare / not to miss',
    matchPattern: /rare|not to miss/i,
    description: 'Life-threatening emergencies, occult cancer & serious mimics',
  },
  {
    key: 'plan',
    heading: '💊 Plan',
    matchPattern: /plan|management/i,
    description: 'First-line medications, exact BNF doses, durations & self-care',
  },
  {
    key: 'safetynetting',
    heading: '🔒 Safety-netting',
    matchPattern: /safety-netting|safetynetting/i,
    description: 'Emergency attendance triggers & worsening red flags',
  },
  {
    key: 'followup',
    heading: '📅 Follow-up',
    matchPattern: /follow-up|followup/i,
    description: 'Review timeframes, monitoring intervals & response checks',
  },
  {
    key: 'referral',
    heading: '🚑 When to Refer',
    matchPattern: /refer|referral/i,
    description: '2-Week Wait (2WW), same-day admission & routine clinic criteria',
  },
  {
    key: 'clinicalPearls',
    heading: '💡 Clinical Pearls & Guideline Updates',
    matchPattern: /pearl|guideline update/i,
    description: 'Local formulary quirks, practical nuances & prescribing tips',
  },
];

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'b-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
}

export function makeHeadingBlock(text: string, level: number = 2) {
  return {
    id: generateUUID(),
    type: 'heading',
    props: {
      level,
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
      isToggleable: false,
    },
    content: [{ type: 'text', text, styles: {} }],
    children: [],
  };
}

export function makeBulletBlock(text: string, prefixBadge?: string) {
  const contentItems: any[] = [];
  if (prefixBadge) {
    contentItems.push({
      type: 'text',
      text: `[${prefixBadge}] `,
      styles: { bold: true },
    });
  }
  contentItems.push({
    type: 'text',
    text,
    styles: {},
  });

  return {
    id: generateUUID(),
    type: 'bulletListItem',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: contentItems,
    children: [],
  };
}

export function makeQuoteBlock(text: string) {
  return {
    id: generateUUID(),
    type: 'quote',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
    },
    content: [{ type: 'text', text, styles: {} }],
    children: [],
  };
}

/**
 * Builds a brand new complete presentation document with all standard NICE/RCGP sections.
 */
export function buildCompletePresentationBlocks(
  title: string,
  sections: ExtractedClinicalSections,
  guidelineCite?: string
): any[] {
  const blocks: any[] = [];

  for (const def of SECTION_DEFINITIONS) {
    const items = sections[def.key];
    if (Array.isArray(items) && items.length > 0) {
      blocks.push(makeHeadingBlock(def.heading, 2));
      for (const item of items) {
        blocks.push(makeBulletBlock(item));
      }
    }
  }

  const citeText = guidelineCite
    ? `🇬🇧 NICE CKS-style · Guideline Source: ${guidelineCite}`
    : '🇬🇧 NICE CKS-style · RCGP — Clinical Practice / Managing Complexity';

  blocks.push(makeQuoteBlock(citeText));

  return blocks;
}

/**
 * Intelligently merges extracted guideline bullet items into the matching sections of an existing document.
 * Weaves each item cleanly under its corresponding Heading 2 without erasing any existing points.
 */
export function smartMergePresentationBlocks(
  existingBlocks: any[],
  selectedSections: Partial<ExtractedClinicalSections>,
  guidelineBadge?: string
): any[] {
  let blocks = Array.isArray(existingBlocks) ? [...existingBlocks] : [];

  for (const def of SECTION_DEFINITIONS) {
    const newItems = selectedSections[def.key];
    if (!Array.isArray(newItems) || newItems.length === 0) continue;

    // Find if the section heading already exists
    let headingIndex = -1;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.type === 'heading') {
        const headingText = (b.content || []).map((c: any) => c.text || '').join('');
        if (def.matchPattern.test(headingText)) {
          headingIndex = i;
          break;
        }
      }
    }

    if (headingIndex !== -1) {
      // Find the end of this section (the next heading or the end of the blocks)
      let insertIndex = headingIndex + 1;
      while (insertIndex < blocks.length && blocks[insertIndex].type !== 'heading' && blocks[insertIndex].type !== 'quote') {
        insertIndex++;
      }

      // Create new bullet blocks
      const bulletBlocks = newItems.map((item) => makeBulletBlock(item, guidelineBadge));
      blocks.splice(insertIndex, 0, ...bulletBlocks);
    } else {
      // Heading does not exist yet. Insert heading + bullets right before the trailing quote block (or at the end).
      let quoteIndex = blocks.findIndex((b) => b.type === 'quote');
      if (quoteIndex === -1) quoteIndex = blocks.length;

      const newSectionBlocks = [
        makeHeadingBlock(def.heading, 2),
        ...newItems.map((item) => makeBulletBlock(item, guidelineBadge)),
      ];

      blocks.splice(quoteIndex, 0, ...newSectionBlocks);
    }
  }

  return blocks;
}

/**
 * Appends a dedicated, standalone "Guideline Update" section at the end of the document.
 */
export function createDedicatedGuidelineSection(
  existingBlocks: any[],
  guidelineTitle: string,
  issuingAuthority: string,
  selectedSections: Partial<ExtractedClinicalSections>
): any[] {
  const blocks = Array.isArray(existingBlocks) ? [...existingBlocks] : [];
  const dateStr = new Date().toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });

  const headingText = `📄 Guideline Update: ${guidelineTitle} (${issuingAuthority || 'Clinical Guidance'} · ${dateStr})`;
  const newBlocks: any[] = [makeHeadingBlock(headingText, 2)];

  for (const def of SECTION_DEFINITIONS) {
    const items = selectedSections[def.key];
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        newBlocks.push(makeBulletBlock(item, def.key.toUpperCase()));
      }
    }
  }

  // Insert before trailing quote
  let quoteIndex = blocks.findIndex((b) => b.type === 'quote');
  if (quoteIndex === -1) {
    blocks.push(...newBlocks);
  } else {
    blocks.splice(quoteIndex, 0, ...newBlocks);
  }

  return blocks;
}
