/**
 * Utility functions to sanitize and clean AI-generated Markdown
 * before inserting into BlockNote canvas.
 * Prevents conversational preambles/postscripts from becoming unwanted blocks.
 */

export function sanitizeAIMarkdown(rawMarkdown: string): string {
  if (!rawMarkdown) return '';

  let text = rawMarkdown.trim();

  // Strip wrapping markdown code fences if entire response is wrapped
  if (text.startsWith('```markdown') && text.endsWith('```')) {
    text = text.slice(11, -3).trim();
  } else if (text.startsWith('```md') && text.endsWith('```')) {
    text = text.slice(5, -3).trim();
  } else if (text.startsWith('```') && text.endsWith('```') && !text.includes('\n```\n')) {
    const firstNewline = text.indexOf('\n');
    if (firstNewline !== -1) {
      text = text.slice(firstNewline + 1, -3).trim();
    }
  }

  const lines = text.split('\n');
  const cleanedLines: string[] = [];
  let foundContent = false;

  const isIntroductoryFiller = (line: string): boolean => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    const lower = trimmed.toLowerCase();
    
    // Check for conversational phrases that end in colon or introduce the document/checklist
    if (
      lower.includes('converted into an interactive checklist') ||
      lower.includes('here is your document converted') ||
      lower.includes('here is your list converted') ||
      lower.includes('here is an interactive checklist') ||
      lower.includes('here is the interactive checklist') ||
      lower.includes('here is your checklist') ||
      lower.includes('here are your checklist') ||
      lower.includes('here are the items') ||
      lower.includes('converted to a checklist') ||
      lower.includes('here are your action items') ||
      lower.includes('sure, here is') ||
      lower.includes('certainly, here is') ||
      lower.startsWith('here is:') ||
      lower.startsWith('sure!') ||
      lower.startsWith('certainly!')
    ) {
      return true;
    }

    // Lines like "Here is your document..." or "Below is the converted..." ending with a colon
    if (
      /^(?:here\s+(?:is|are)|below\s+(?:is|are)|sure[,!]|certainly[,!]|i['’]ve\s+converted|converted)\b.*?:?\s*$/i.test(
        trimmed
      )
    ) {
      return true;
    }

    return false;
  };

  const isTrailingFiller = (line: string): boolean => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    const lower = trimmed.toLowerCase();

    // Check for conversational sign-offs or follow-up questions
    if (
      lower.startsWith('*would you like') ||
      lower.startsWith('would you like me to') ||
      lower.startsWith('let me know if') ||
      lower.startsWith('*let me know') ||
      lower.startsWith('hope this helps') ||
      lower.startsWith('*hope this') ||
      lower.startsWith('feel free to') ||
      lower.startsWith('*feel free')
    ) {
      return true;
    }

    return false;
  };

  // Find start index by skipping leading conversational lines
  let startIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    // If it looks like a list item, heading, or table, we hit real content!
    if (
      trimmed.startsWith('- [ ]') ||
      trimmed.startsWith('- [x]') ||
      trimmed.startsWith('* [ ]') ||
      trimmed.startsWith('* [x]') ||
      trimmed.startsWith('- ') ||
      trimmed.startsWith('* ') ||
      /^\d+\.\s/.test(trimmed) ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('|')
    ) {
      startIndex = i;
      foundContent = true;
      break;
    }

    if (isIntroductoryFiller(line)) {
      continue;
    }

    // If not obviously filler, check if next non-empty line is a checklist/list item
    const nextNonEmpty = lines.slice(i + 1).find((l) => l.trim().length > 0);
    if (
      nextNonEmpty &&
      (nextNonEmpty.trim().startsWith('- [ ]') ||
        nextNonEmpty.trim().startsWith('* [ ]') ||
        nextNonEmpty.trim().startsWith('- ') ||
        nextNonEmpty.trim().startsWith('* '))
    ) {
      // It's a preamble line preceding a list
      continue;
    }

    startIndex = i;
    foundContent = true;
    break;
  }

  // Find end index by skipping trailing conversational lines
  let endIndex = lines.length;
  for (let i = lines.length - 1; i >= startIndex; i--) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isTrailingFiller(line)) {
      endIndex = i;
      continue;
    }
    break;
  }

  const result = lines.slice(startIndex, endIndex).join('\n').trim();
  return result || rawMarkdown.trim();
}

/**
 * Returns true if the markdown contains checklist items: - [ ] or * [ ]
 */
export function isChecklistMarkdown(markdown: string): boolean {
  if (!markdown) return false;
  return /(?:^|\n)\s*[-*]\s*\[[ xX]\]/m.test(markdown);
}

/**
 * Extracts normalized plain-text strings of items from a markdown checklist or bullet list.
 */
export function extractListItems(markdown: string): string[] {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const items: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(?:[-*]\s*(?:\[[ xX]\]\s*)?|\d+\.\s*)(.*)$/);
    if (match && match[1]) {
      const clean = match[1].replace(/[*_`]/g, '').trim();
      if (clean) items.push(clean);
    }
  }

  return items;
}
