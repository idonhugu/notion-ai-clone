/**
 * Universal document text extractor for PDFs, Text, Markdown, CSV, JSON, and Code.
 * Safe for server runtime with dual-engine PDF extraction.
 */

export async function extractTextFromDataUrl(
  dataUrl: string,
  fileName: string,
  fileType: string
): Promise<string> {
  try {
    // Parse mime and base64 data
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    const base64Data = matches ? matches[2] : dataUrl.replace(/^data:[^,]+,/, '');
    const detectedMime = (matches ? matches[1] : fileType || '').toLowerCase();
    const buffer = Buffer.from(base64Data, 'base64');

    const isPdf =
      detectedMime.includes('pdf') || fileName.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      // 1. Try PDFParse (v2)
      try {
        const { PDFParse } = await import('pdf-parse');
        const parser = new PDFParse({ data: Uint8Array.from(buffer) });
        const res = await parser.getText();
        if (res && res.text && res.text.trim().length > 10) {
          return cleanExtractedText(res.text);
        }
      } catch (err) {
        // Fallback to stream extraction below
      }

      // 2. Stream & TJ object fallback extractor
      const streamText = extractTextFromPdfStream(buffer);
      if (streamText && streamText.trim().length > 0) {
        return cleanExtractedText(streamText);
      }

      return `[PDF Document: ${fileName} (${Math.round(
        buffer.length / 1024
      )} KB) - Text stream contained encoded vectors or scanned image content]`;
    }

    // Text / Markdown / CSV / JSON / Code
    const text = buffer.toString('utf-8');
    return cleanExtractedText(text);
  } catch (error: any) {
    console.error('Error extracting text from document:', error);
    return `[Could not extract text from ${fileName}: ${error.message}]`;
  }
}

function extractTextFromPdfStream(buffer: Buffer): string {
  try {
    const content = buffer.toString('binary');
    const texts: string[] = [];

    // Match (string) Tj
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let match: RegExpExecArray | null;
    while ((match = tjRegex.exec(content)) !== null) {
      texts.push(match[1]);
    }

    // Match [(string) 10 (string)] TJ
    const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
    while ((match = tjArrayRegex.exec(content)) !== null) {
      const inner = match[1];
      const subMatches = inner.match(/\(([^)]+)\)/g);
      if (subMatches) {
        texts.push(subMatches.map((s) => s.slice(1, -1)).join(' '));
      }
    }

    // Match uncompressed plain text blocks between BT and ET
    const btRegex = /BT[\r\n\s]+([\s\S]*?)[\r\n\s]+ET/g;
    while ((match = btRegex.exec(content)) !== null) {
      const block = match[1];
      const parenMatches = block.match(/\(([^)]+)\)/g);
      if (parenMatches) {
        texts.push(parenMatches.map((s) => s.slice(1, -1)).join(' '));
      }
    }

    return texts.join(' ');
  } catch {
    return '';
  }
}

function cleanExtractedText(text: string): string {
  // Normalize whitespace, remove binary garbage
  const cleaned = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Truncate to reasonable context window limit (max 40,000 chars)
  if (cleaned.length > 40000) {
    return cleaned.slice(0, 40000) + '\n\n[... Document truncated for AI context ...]';
  }
  return cleaned;
}
