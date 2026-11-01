/**
 * Browser-Side Document & Lecture Parser
 * Extracts plain text directly in the browser using Web standard DecompressionStream and TextDecoder APIs.
 * Sending lightweight extracted text (< 40 KB) to /api/ai prevents HTTP 413 Payload Too Large errors
 * caused by multi-megabyte base64 PDF uploads on serverless platforms (Vercel).
 */

export interface ExtractionResult {
  text: string;
  wordCount: number;
  charCount: number;
  extractedLocally: boolean;
  error?: string;
}

/**
 * Format raw byte count into human-readable string (e.g. "4.2 MB", "850 KB").
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Extract readable text from any supported file directly in the browser.
 */
export async function extractTextFromFileInBrowser(file: File): Promise<ExtractionResult> {
  if (!file || file.size === 0) {
    return { text: '', wordCount: 0, charCount: 0, extractedLocally: false };
  }

  const name = (file.name || '').toLowerCase();
  const mime = (file.type || '').toLowerCase();

  try {
    // 1. Plain Text, Markdown, CSV, JSON
    if (
      mime.startsWith('text/') ||
      name.endsWith('.txt') ||
      name.endsWith('.md') ||
      name.endsWith('.csv') ||
      name.endsWith('.tsv') ||
      name.endsWith('.json')
    ) {
      const raw = await file.text();
      const cleaned = cleanDocumentText(raw);
      return toExtractionResult(cleaned, true);
    }

    // 2. Word Document (.docx)
    if (name.endsWith('.docx') || mime.includes('wordprocessingml')) {
      const buffer = await file.arrayBuffer();
      const raw = await extractDocxTextInBrowser(buffer);
      if (raw && raw.trim().length > 20) {
        const cleaned = cleanDocumentText(raw);
        return toExtractionResult(cleaned, true);
      }
    }

    // 3. PowerPoint Slides (.pptx)
    if (name.endsWith('.pptx') || mime.includes('presentationml')) {
      const buffer = await file.arrayBuffer();
      const raw = await extractPptxTextInBrowser(buffer);
      if (raw && raw.trim().length > 20) {
        const cleaned = cleanDocumentText(raw);
        return toExtractionResult(cleaned, true);
      }
    }

    // 4. PDF Document (.pdf)
    if (name.endsWith('.pdf') || mime.includes('pdf')) {
      const buffer = await file.arrayBuffer();
      const raw = await extractPdfTextInBrowser(buffer);
      if (raw && isGenuineReadableText(raw)) {
        const cleaned = cleanDocumentText(raw);
        return toExtractionResult(cleaned, true);
      }
    }

    return {
      text: '',
      wordCount: 0,
      charCount: 0,
      extractedLocally: false,
      error: 'Could not extract text client-side.',
    };
  } catch (err: any) {
    console.warn('Client document extraction notice:', err);
    return {
      text: '',
      wordCount: 0,
      charCount: 0,
      extractedLocally: false,
      error: err?.message || 'Error extracting text',
    };
  }
}

function toExtractionResult(text: string, extractedLocally: boolean): ExtractionResult {
  const words = text.match(/[a-zA-Z0-9'-]+/g) || [];
  return {
    text,
    wordCount: words.length,
    charCount: text.length,
    extractedLocally,
  };
}

/**
 * Verifies that extracted text consists of authentic, readable natural language words
 * rather than compressed binary fragments, PDF operator noise, or corrupted stream bytes.
 */
export function isGenuineReadableText(text: string): boolean {
  if (!text || text.trim().length < 30) return false;

  const words = text.match(/[a-zA-Z]{2,}/g) || [];
  if (words.length < 10) return false;

  // 1. Check for PDF internal syntax dominance
  const pdfKeywords = [
    'obj',
    'endobj',
    'stream',
    'endstream',
    'xref',
    'trailer',
    'flatedecode',
    'fontfile',
    'type1',
    'truetype',
    'procset',
    'colorspace',
    'fontdescriptor',
    'length',
    'filter',
  ];
  let pdfKeywordHits = 0;
  for (const w of words) {
    if (pdfKeywords.includes(w.toLowerCase())) pdfKeywordHits++;
  }
  if (pdfKeywordHits / words.length > 0.35) return false;

  // 2. Must contain common English or clinical words
  const commonWords =
    /\b(the|and|is|in|to|of|for|with|on|at|by|from|this|that|or|an|not|be|are|as|have|has|patient|clinical|management|guideline|symptom|dose|treatment|referral|review|history|exam|acute|chronic|care|skin|rash|lesion|primary|nhs|gp|medicine|disease|infection|blood|notes|session|slides|presentation)\b/i;
  if (!commonWords.test(text)) return false;

  // 3. Vowel ratio check (natural human language has 22% - 65% vowels among letters)
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 20) return false;
  const vowels = (letters.match(/[aeiouyAEIOUY]/g) || []).length;
  const vowelRatio = vowels / letters.length;
  if (vowelRatio < 0.22 || vowelRatio > 0.65) return false;

  return true;
}

/**
 * Normalizes extracted text, eliminates non-printable binary garbage, and caps for AI context.
 */
function cleanDocumentText(text: string): string {
  const cleaned = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Cap at 40,000 characters (plenty of context for all 10 clinical sections, under 45 KB)
  if (cleaned.length > 40000) {
    return cleaned.slice(0, 40000) + '\n\n[... Document truncated for AI context ...]';
  }
  return cleaned;
}

/* =========================================================================
   PDF IN-BROWSER PARSER (PDFParse v2 with Dual-Engine Fallback)
   ========================================================================= */

async function extractPdfTextInBrowser(buffer: ArrayBuffer): Promise<string> {
  // 1. Primary Engine: Mozilla PDF.js (Pre-compiled native browser bundle from /pdf.min.mjs)
  // Handles all complex PDF Object Streams (/ObjStm), ToUnicode CMaps, layout fonts, and multi-page slide decks
  try {
    let pdfjs: any = null;

    if (typeof window !== 'undefined') {
      try {
        // @ts-ignore - runtime native ES module fetch from public static assets
        pdfjs = await import(/* webpackIgnore: true */ '/pdf.min.mjs');
        if (pdfjs && pdfjs.GlobalWorkerOptions) {
          pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        }
      } catch (e) {
        console.warn('Native /pdf.min.mjs load notice:', e);
      }
    }

    if (!pdfjs) {
      pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    }

    if (pdfjs && typeof pdfjs.getDocument === 'function') {
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(buffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      const pageTexts: string[] = [];
      const maxPages = Math.min(pdf.numPages || 1, 120);

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const line = textContent.items
            .map((item: any) => (item && typeof item.str === 'string' ? item.str : ''))
            .filter(Boolean)
            .join(' ');

          if (line.trim().length > 0) {
            pageTexts.push(`[Slide / Page ${pageNum}]: ${line.trim()}`);
          }
        } catch (pageErr) {
          console.warn(`Notice reading page ${pageNum}:`, pageErr);
        }
      }

      const fullText = pageTexts.join('\n\n');
      if (fullText && fullText.trim().length > 30 && isGenuineReadableText(fullText)) {
        return fullText;
      }
    }
  } catch (err) {
    console.warn('PDF.js text extraction notice:', err);
  }

  // 2. Secondary Engine: Decompressed /FlateDecode stream extraction
  // (strictly parses only successfully decompressed text streams, NEVER raw binary files)
  const bytes = new Uint8Array(buffer);
  const outTexts: string[] = [];

  const streamKw = [115, 116, 114, 101, 97, 109]; // "stream"
  const endStreamKw = [101, 110, 100, 115, 116, 114, 101, 97, 109]; // "endstream"

  let pos = 0;
  const maxStreamsToParse = 160;
  let streamsParsed = 0;

  while (pos < bytes.length - 10 && streamsParsed < maxStreamsToParse) {
    let match = true;
    for (let i = 0; i < streamKw.length; i++) {
      if (bytes[pos + i] !== streamKw[i]) {
        match = false;
        break;
      }
    }

    if (match) {
      let dataStart = pos + streamKw.length;
      if (bytes[dataStart] === 13) dataStart++;
      if (bytes[dataStart] === 10) dataStart++;

      // Scan for matching endstream
      let endPos = dataStart;
      let foundEnd = false;
      const scanLimit = Math.min(bytes.length - endStreamKw.length, dataStart + 600000);
      while (endPos < scanLimit) {
        let endMatch = true;
        for (let j = 0; j < endStreamKw.length; j++) {
          if (bytes[endPos + j] !== endStreamKw[j]) {
            endMatch = false;
            break;
          }
        }
        if (endMatch) {
          foundEnd = true;
          break;
        }
        endPos++;
      }

      if (foundEnd) {
        let dataEnd = endPos;
        if (dataEnd > dataStart && bytes[dataEnd - 1] === 10) dataEnd--;
        if (dataEnd > dataStart && bytes[dataEnd - 1] === 13) dataEnd--;

        const streamSlice = bytes.subarray(dataStart, dataEnd);
        if (streamSlice.length > 4) {
          let decompressed = await inflateZlibStream(streamSlice);
          if (!decompressed) {
            decompressed = await inflateRawStream(streamSlice);
          }

          if (decompressed && decompressed.length > 10) {
            // Only parse if decompressed stream contains text operators (BT, ET, Tj, TJ)
            if (
              decompressed.includes('BT') ||
              decompressed.includes('Tj') ||
              decompressed.includes('TJ')
            ) {
              parsePdfOperators(decompressed, outTexts);
            }
          }
        }

        streamsParsed++;
        pos = endPos + endStreamKw.length;
        continue;
      }
    }
    pos++;
  }

  // NOTE: Never decode uncompressed raw binary with latin1 to avoid catching binary font/image noise.
  return outTexts.join(' ');
}

function parsePdfOperators(content: string, outTexts: string[]): void {
  // 1. Array strings: [(str1) 123 (str2)] TJ
  const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
  let match: RegExpExecArray | null;
  while ((match = tjArrayRegex.exec(content)) !== null) {
    const inner = match[1];
    const strRegex = /\((?:[^()\\]|\\.)*\)/g;
    let s: RegExpExecArray | null;
    const parts: string[] = [];
    while ((s = strRegex.exec(inner)) !== null) {
      parts.push(unescapePdfString(s[0].slice(1, -1)));
    }
    if (parts.length > 0) {
      outTexts.push(parts.join(' '));
    }
    // Hex strings inside TJ: <48656c6c6f>
    const hexRegex = /<([0-9a-fA-F]+)>/g;
    let h: RegExpExecArray | null;
    while ((h = hexRegex.exec(inner)) !== null) {
      const decoded = decodeHexPdfString(h[1]);
      if (decoded.trim()) outTexts.push(decoded);
    }
  }

  // 2. Direct string: (text) Tj or ' or "
  const tjRegex = /\(((?:[^()\\]|\\.)*)\)\s*(?:Tj|'|")/g;
  while ((match = tjRegex.exec(content)) !== null) {
    const raw = match[1];
    if (raw) outTexts.push(unescapePdfString(raw));
  }

  // 3. Hex string: <48656c6c6f> Tj
  const hexTjRegex = /<([0-9a-fA-F]+)>\s*Tj/g;
  while ((match = hexTjRegex.exec(content)) !== null) {
    const decoded = decodeHexPdfString(match[1]);
    if (decoded.trim()) outTexts.push(decoded);
  }
}

function unescapePdfString(str: string): string {
  return str
    .replace(/\\\\/g, '\u0000')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\u0000/g, '\\');
}

function decodeHexPdfString(hex: string): string {
  let decoded = '';
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.substr(i, 2), 16);
    if (!isNaN(byte) && byte >= 32 && byte <= 126) {
      decoded += String.fromCharCode(byte);
    } else if (byte === 10 || byte === 13 || byte === 9) {
      decoded += ' ';
    }
  }
  return decoded;
}

/* =========================================================================
   DECOMPRESSION STREAM HELPERS
   ========================================================================= */

async function inflateZlibStream(data: Uint8Array): Promise<string> {
  if (typeof DecompressionStream === 'undefined') return '';
  try {
    const ds = new DecompressionStream('deflate');
    const stream = new Response(data as any).body?.pipeThrough(ds);
    if (!stream) return '';
    return await new Response(stream).text();
  } catch {
    return '';
  }
}

async function inflateRawStream(data: Uint8Array): Promise<string> {
  if (typeof DecompressionStream === 'undefined') return '';
  try {
    const ds = new DecompressionStream('deflate-raw');
    const stream = new Response(data as any).body?.pipeThrough(ds);
    if (!stream) return '';
    return await new Response(stream).text();
  } catch {
    return '';
  }
}

/* =========================================================================
   WORD (.DOCX) IN-BROWSER ZIP & XML PARSER
   ========================================================================= */

async function extractDocxTextInBrowser(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let offset = 0;

  while (offset < bytes.length - 30) {
    if (view.getUint32(offset, true) !== 0x04034b50) break;
    const compression = view.getUint16(offset + 8, true);
    const compressedSize = view.getUint32(offset + 18, true);
    const fileNameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);
    const fnBytes = bytes.subarray(offset + 30, offset + 30 + fileNameLen);
    const entryName = new TextDecoder('utf-8').decode(fnBytes);
    const dataStart = offset + 30 + fileNameLen + extraLen;

    if (entryName === 'word/document.xml' && dataStart + compressedSize <= bytes.length) {
      const slice = bytes.subarray(dataStart, dataStart + compressedSize);
      let xml = '';
      if (compression === 8) {
        xml = await inflateRawStream(slice);
      } else if (compression === 0) {
        xml = new TextDecoder('utf-8').decode(slice);
      }

      if (xml) {
        const textTagRegex = /<w:t(?:\s+[^>]*)?>([\s\S]*?)<\/w:t>/g;
        const parts: string[] = [];
        let m: RegExpExecArray | null;
        while ((m = textTagRegex.exec(xml)) !== null) {
          if (m[1]) parts.push(m[1]);
        }
        return parts.join(' ');
      }
    }
    offset = dataStart + compressedSize;
  }
  return '';
}

/* =========================================================================
   POWERPOINT (.PPTX) IN-BROWSER ZIP & XML PARSER
   ========================================================================= */

async function extractPptxTextInBrowser(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let offset = 0;
  const slideTexts: { slideNum: number; text: string }[] = [];

  while (offset < bytes.length - 30) {
    if (view.getUint32(offset, true) !== 0x04034b50) break;
    const compression = view.getUint16(offset + 8, true);
    const compressedSize = view.getUint32(offset + 18, true);
    const fileNameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);
    const fnBytes = bytes.subarray(offset + 30, offset + 30 + fileNameLen);
    const entryName = new TextDecoder('utf-8').decode(fnBytes);
    const dataStart = offset + 30 + fileNameLen + extraLen;

    const slideMatch = entryName.match(/^ppt\/slides\/slide(\d+)\.xml$/i);
    if (slideMatch && dataStart + compressedSize <= bytes.length) {
      const slideNum = parseInt(slideMatch[1], 10);
      const slice = bytes.subarray(dataStart, dataStart + compressedSize);
      let xml = '';
      if (compression === 8) {
        xml = await inflateRawStream(slice);
      } else if (compression === 0) {
        xml = new TextDecoder('utf-8').decode(slice);
      }

      if (xml) {
        const textTagRegex = /<a:t(?:\s+[^>]*)?>([\s\S]*?)<\/a:t>/g;
        const parts: string[] = [];
        let m: RegExpExecArray | null;
        while ((m = textTagRegex.exec(xml)) !== null) {
          if (m[1]) parts.push(m[1]);
        }
        if (parts.length > 0) {
          slideTexts.push({ slideNum, text: parts.join(' ') });
        }
      }
    }
    offset = dataStart + compressedSize;
  }

  slideTexts.sort((a, b) => a.slideNum - b.slideNum);
  return slideTexts.map((s) => `[Slide ${s.slideNum}]: ${s.text}`).join('\n\n');
}
