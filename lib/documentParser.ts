import zlib from 'zlib';

/**
 * Universal document text extractor for PDFs, Text, Markdown, CSV, JSON, and Code.
 * Safe for server runtime with dual-engine PDF extraction and Flate stream decompression.
 */

export async function extractTextFromDataUrl(
  dataUrl: string,
  fileName: string,
  fileType: string
): Promise<string> {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return '';
  }

  try {
    // Robust base64 extraction (never breaks on multi-line base64 or custom mime headers)
    const commaIdx = dataUrl.indexOf(',');
    const header = commaIdx !== -1 ? dataUrl.slice(0, commaIdx) : '';
    const rawBase64 = commaIdx !== -1 ? dataUrl.slice(commaIdx + 1) : dataUrl;

    const mimeMatch = header.match(/^data:([^;]+)/);
    const detectedMime = (mimeMatch ? mimeMatch[1] : fileType || '').toLowerCase();

    // Strip whitespace/newlines that may be present in base64 strings
    const cleanBase64 = rawBase64.replace(/[\r\n\s]/g, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const isPdf =
      detectedMime.includes('pdf') ||
      (fileName && fileName.toLowerCase().endsWith('.pdf')) ||
      (buffer.length >= 4 && buffer.slice(0, 4).toString() === '%PDF');

    if (isPdf) {
      // 1. Primary Engine: PDFParse v2
      try {
        const { PDFParse } = await import('pdf-parse');
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        const res = await parser.getText();
        if (res && res.text && res.text.trim().length > 15) {
          const cleaned = cleanExtractedText(res.text);
          if (cleaned.length > 15) {
            return cleaned;
          }
        }
      } catch (err) {
        // Fallback to stream extraction below
      }

      // 2. Secondary Engine: Decompressed Flate & raw text stream extractor
      const streamText = extractTextFromPdfBuffer(buffer);
      if (streamText && isValidDocumentText(streamText)) {
        return cleanExtractedText(streamText);
      }

      // If text cannot be parsed into human-readable words, return empty so multimodal PDF buffer is passed
      return '';
    }

    // Text / Markdown / CSV / JSON / Code
    const text = buffer.toString('utf-8');
    return cleanExtractedText(text);
  } catch (error: any) {
    console.warn(`Text extraction notice for ${fileName}:`, error.message);
    return '';
  }
}

function isValidDocumentText(text: string): boolean {
  if (!text || text.trim().length < 30) return false;
  // Must contain at least 10 readable words with 3+ alphabetic characters
  const words = text.match(/[a-zA-Z]{3,}/g);
  return words !== null && words.length >= 10;
}

function extractTextFromPdfBuffer(buffer: Buffer): string {
  try {
    const texts: string[] = [];
    const content = buffer.toString('binary');

    // 1. Try extracting and decompressing /FlateDecode streams
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let match: RegExpExecArray | null;

    while ((match = streamRegex.exec(content)) !== null) {
      try {
        const streamBytes = Buffer.from(match[1], 'binary');
        let decompressed: string | null = null;
        try {
          decompressed = zlib.inflateSync(streamBytes).toString('latin1');
        } catch {
          try {
            decompressed = zlib.inflateRawSync(streamBytes).toString('latin1');
          } catch {}
        }

        if (decompressed) {
          parseTextOperators(decompressed, texts);
        }
      } catch {}
    }

    // 2. Also parse uncompressed operators directly in the PDF body
    parseTextOperators(content, texts);

    return texts.join(' ');
  } catch {
    return '';
  }
}

function parseTextOperators(content: string, outTexts: string[]): void {
  // Match (text) Tj
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  let match: RegExpExecArray | null;
  while ((match = tjRegex.exec(content)) !== null) {
    if (match[1] && match[1].length > 1) {
      outTexts.push(match[1]);
    }
  }

  // Match [(text) 10 (text)] TJ
  const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
  while ((match = tjArrayRegex.exec(content)) !== null) {
    const inner = match[1];
    const subMatches = inner.match(/\(([^)]+)\)/g);
    if (subMatches) {
      outTexts.push(subMatches.map((s) => s.slice(1, -1)).join(' '));
    }
  }

  // Match uncompressed blocks between BT and ET
  const btRegex = /BT[\r\n\s]+([\s\S]*?)[\r\n\s]+ET/g;
  while ((match = btRegex.exec(content)) !== null) {
    const block = match[1];
    const parenMatches = block.match(/\(([^)]+)\)/g);
    if (parenMatches) {
      outTexts.push(parenMatches.map((s) => s.slice(1, -1)).join(' '));
    }
  }
}

function cleanExtractedText(text: string): string {
  // Normalize whitespace, remove binary garbage
  const cleaned = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Cap at 35,000 characters for optimal AI context and low latency
  if (cleaned.length > 35000) {
    return cleaned.slice(0, 35000) + '\n\n[... Document truncated for AI context ...]';
  }
  return cleaned;
}
