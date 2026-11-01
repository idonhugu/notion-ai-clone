import zlib from 'zlib';
import { isGenuineReadableText } from '@/lib/clientDocumentParser';

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

      // 2. Secondary Engine: Decompressed Flate stream extractor
      const streamText = extractTextFromPdfBuffer(buffer);
      if (streamText && isGenuineReadableText(streamText)) {
        return cleanExtractedText(streamText);
      }

      // If text cannot be parsed into human-readable words, return empty so multimodal PDF buffer is passed
      return '';
    }

    // Word Document (.docx / Office Open XML)
    const isDocx =
      (fileName && fileName.toLowerCase().endsWith('.docx')) ||
      detectedMime.includes('wordprocessingml') ||
      (buffer.length >= 4 && buffer.slice(0, 4).toString() === 'PK\x03\x04');

    if (isDocx) {
      try {
        const docxText = extractTextFromDocxBuffer(buffer);
        if (docxText && docxText.trim().length > 15) {
          return cleanExtractedText(docxText);
        }
      } catch (err) {
        console.warn('Docx extraction notice:', err);
      }
    }

    // Text / Markdown / CSV / JSON / Code
    const text = buffer.toString('utf-8');
    return cleanExtractedText(text);
  } catch (error: any) {
    console.warn(`Text extraction notice for ${fileName}:`, error.message);
    return '';
  }
}

function extractTextFromPdfBuffer(buffer: Buffer): string {
  try {
    const texts: string[] = [];
    const content = buffer.toString('binary');

    // Extract and decompress /FlateDecode streams only
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

        if (
          decompressed &&
          (decompressed.includes('BT') ||
            decompressed.includes('Tj') ||
            decompressed.includes('TJ'))
        ) {
          parseTextOperators(decompressed, texts);
        }
      } catch {}
    }

    // Note: Never parse raw binary PDF bytes to prevent binary noise
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

/**
 * Extracts plain text from Word .docx archives by locating word/document.xml
 * and inflating the deflate stream with Node.js built-in zlib.
 */
function extractTextFromDocxBuffer(buffer: Buffer): string {
  try {
    let offset = 0;
    while (offset < buffer.length - 30) {
      if (buffer.readUInt32LE(offset) !== 0x04034b50) {
        break; // End of zip local headers
      }

      const compression = buffer.readUInt16LE(offset + 8);
      const compressedSize = buffer.readUInt32LE(offset + 18);
      const fileNameLen = buffer.readUInt16LE(offset + 26);
      const extraLen = buffer.readUInt16LE(offset + 28);
      const entryName = buffer.toString('utf-8', offset + 30, offset + 30 + fileNameLen);
      const dataStart = offset + 30 + fileNameLen + extraLen;

      if (entryName === 'word/document.xml' && dataStart + compressedSize <= buffer.length) {
        const compressedData = buffer.slice(dataStart, dataStart + compressedSize);
        let xmlString = '';
        if (compression === 8) {
          xmlString = zlib.inflateRawSync(compressedData).toString('utf-8');
        } else if (compression === 0) {
          xmlString = compressedData.toString('utf-8');
        }

        if (xmlString) {
          const texts: string[] = [];
          const textTagRegex = /<w:t(?:\s+[^>]*)?>([\s\S]*?)<\/w:t>/g;
          let m: RegExpExecArray | null;
          while ((m = textTagRegex.exec(xmlString)) !== null) {
            if (m[1]) texts.push(m[1]);
          }
          return texts.join(' ');
        }
      }

      offset = dataStart + compressedSize;
    }
  } catch (err) {
    console.warn('Docx parser notice:', err);
  }
  return '';
}
