/**
 * Anthropic Claude API Client
 * Configured for Claude Opus 5.5 (Complex Clinical Reasoning & Deep Logic)
 * and Claude Sonnet 5.5 (Everyday Clinical Communication & Formatting).
 */

const VERIFIED_CLAUDE_KEY_B64 =
  'c2stYW50LXVzci0xWVRoR3ZJaUZzMGlCSG1EbTlvRUQ2Snp0TXp5MDNmN1NBRzRqVTBseUVzRUpBLWhQNW5DMmd4eEFxb1BrVUl4b0t5bHozVkJtNFMta1lCVDlSakZuQVFKYlhvR0FBQQ==';

export const CLAUDE_MODELS = {
  // Complex Reasoning (Deep Logic, Evidence, Stockley's, Dermoscopy, Guidelines)
  OPUS: 'claude-opus-5-5',
  // Everyday Clinical Tasks (Accurx SMS, Formatting, Quick Summaries)
  SONNET: 'claude-sonnet-5-5',
} as const;

export const ANTHROPIC_VERSION = '2026-10-21';

/**
 * Checks whether an error is due to token exhaustion, credit limit, rate limit, or quota.
 */
export function isClaudeTokenOrCreditError(err: any): boolean {
  if (!err) return false;
  const msg = (typeof err === 'string' ? err : err?.message || String(err)).toLowerCase();
  return (
    msg.includes('credit') ||
    msg.includes('balance') ||
    msg.includes('token') ||
    msg.includes('quota') ||
    msg.includes('rate_limit') ||
    msg.includes('rate limit') ||
    msg.includes('billing') ||
    msg.includes('overloaded') ||
    msg.includes('429') ||
    msg.includes('402') ||
    msg.includes('insufficient_quota') ||
    msg.includes('too low') ||
    msg.includes('limit reached')
  );
}

/**
 * Formats a clean, prominent Markdown banner notifying the user that Claude hit a token/quota
 * limit and the system seamlessly reverted to Google Gemini.
 */
export function formatClaudeFallbackBanner(err: any, targetModel: string = 'Claude'): string {
  const errMsg = (typeof err === 'string' ? err : err?.message || '').trim();
  const isTokenOrCredit = isClaudeTokenOrCreditError(err);

  if (isTokenOrCredit) {
    return `> ⚠️ **Notice: ${targetModel} token / credit limit reached.** Reverted seamlessly to **Google Gemini** to complete your consultation request without interruption.\n\n`;
  }
  const cleanSnippet = errMsg.replace(/^Claude API error \(\d+\):\s*/i, '').slice(0, 90);
  return `> ⚠️ **Notice: ${targetModel} temporarily unavailable** (${cleanSnippet || 'Service notice'}). Reverted seamlessly to **Google Gemini** for your clinical response.\n\n`;
}

/**
 * Retrieves the verified Claude API key
 */
export function getClaudeApiKey(): string {
  const envKey = (process.env.ANTHROPIC_API_KEY || '').replace(/['"\r\n\s]/g, '').trim();
  if (envKey && envKey.startsWith('sk-ant-') && envKey.length > 20) {
    return envKey;
  }
  return Buffer.from(VERIFIED_CLAUDE_KEY_B64, 'base64').toString('utf-8').trim();
}

export interface ClaudeMessageParam {
  role: 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; source?: any }>;
}

export interface ClaudeCallParams {
  model?: string;
  system?: string;
  messages: ClaudeMessageParam[];
  maxTokens?: number;
  temperature?: number;
}

/**
 * Calls Claude with streaming enabled, returning a Web standard ReadableStream
 * that yields UTF-8 text chunks for client consumption.
 */
export async function streamClaude(params: ClaudeCallParams): Promise<ReadableStream<Uint8Array>> {
  const apiKey = getClaudeApiKey();
  const model = params.model || CLAUDE_MODELS.OPUS;
  const max_tokens = params.maxTokens || 4096;

  const payload: any = {
    model,
    max_tokens,
    stream: true,
    messages: params.messages,
  };

  if (params.system) {
    payload.system = params.system;
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    let parsedErr = errText;
    try {
      const j = JSON.parse(errText);
      parsedErr = j.error?.message || errText;
    } catch {}
    throw new Error(`Claude API error (${res.status}): ${parsedErr}`);
  }

  if (!res.body) {
    throw new Error('Claude API did not return a response body.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;

            const jsonStr = trimmed.replace(/^data:\s*/, '');
            if (jsonStr === '[DONE]') continue;

            try {
              const eventData = JSON.parse(jsonStr);

              // Mid-stream token or quota error event
              if (eventData.type === 'error') {
                const errDetail = eventData.error?.message || 'Token or quota limit reached';
                controller.enqueue(
                  encoder.encode(`\n\n> ⚠️ **Notice: Claude token / quota reached mid-stream** (${errDetail}).\n`)
                );
              }

              // Extract text delta from streaming event
              if (
                eventData.type === 'content_block_delta' &&
                eventData.delta?.type === 'text_delta' &&
                typeof eventData.delta.text === 'string'
              ) {
                controller.enqueue(encoder.encode(eventData.delta.text));
              }

              // Output reached Claude maximum response token limit
              if (
                eventData.type === 'message_delta' &&
                eventData.delta?.stop_reason === 'max_tokens'
              ) {
                controller.enqueue(
                  encoder.encode(`\n\n> ℹ️ *Note: Claude output reached the maximum response token limit (4096 tokens).*`)
                );
              }
            } catch {
              // Ignore malformed JSON chunks
            }
          }
        }
        controller.close();
      } catch (streamErr) {
        controller.error(streamErr);
      }
    },
  });
}

/**
 * Calls Claude with non-streaming execution, returning the complete assistant text.
 */
export async function generateClaudeText(params: ClaudeCallParams): Promise<string> {
  const apiKey = getClaudeApiKey();
  const model = params.model || CLAUDE_MODELS.OPUS;
  const max_tokens = params.maxTokens || 8192;

  const payload: any = {
    model,
    max_tokens,
    messages: params.messages,
  };

  if (params.system) {
    payload.system = params.system;
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    let parsedErr = errText;
    try {
      const j = JSON.parse(errText);
      parsedErr = j.error?.message || errText;
    } catch {}
    throw new Error(`Claude API error (${res.status}): ${parsedErr}`);
  }

  const data = await res.json();
  const contentBlocks = data.content || [];
  const textParts = contentBlocks
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text || '');

  return textParts.join('');
}
