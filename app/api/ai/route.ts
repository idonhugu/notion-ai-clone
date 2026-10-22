import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { action, prompt, context, selectedText, tone, language, messages } = await req.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Missing GOOGLE_GENERATIVE_AI_API_KEY. Please provide your Google Gemini API key in .env.local or Vercel environment variables.',
        },
        { status: 400 }
      );
    }

    const google = createGoogleGenerativeAI({ apiKey });

    let systemInstruction = `You are Notion AI, an expert, thoughtful, and highly capable writing assistant embedded inside an enterprise block-based document editor.
Always format your output in clean, crisp Markdown (using #, ##, ### for headings, bullet points -, numbered lists 1., checkboxes - [ ], blockquotes >, and code fences \`\`\` when appropriate).
DO NOT wrap the entire answer in a top-level markdown code fence unless asked for raw code.
DO NOT include conversational filler like "Here is your response:", "Sure, I can help with that", or "Let me know if you need anything else".
Deliver pure, well-structured, publication-grade content.`;

    let userPrompt = '';

    switch (action) {
      case 'generate':
        userPrompt = `Generate a comprehensive, structured document section or draft based on the following instructions:
Prompt: "${prompt || 'Write a comprehensive guide'}"
${context ? `Context from the current document:\n${context}` : ''}`;
        break;

      case 'continue':
        systemInstruction += `\nYour goal is to autocomplete and continue writing directly where the author left off. Do not repeat existing content. Flow naturally from the preceding thoughts.`;
        userPrompt = `Continue writing seamlessly from the following existing text:\n\n"""\n${
          context || selectedText || ''
        }\n"""`;
        break;

      case 'summarize':
        userPrompt = `Provide a crisp, actionable executive summary of the following document content. Use bullet points for key takeaways:\n\n"""\n${
          selectedText || context || prompt || ''
        }\n"""`;
        break;

      case 'improve':
        const toneInstruction = tone
          ? `Adapt the tone to be strictly ${tone}.`
          : 'Fix all spelling, punctuation, grammar, and flow while enhancing clarity.';
        userPrompt = `Improve and polish the following text. ${toneInstruction}\n\nOriginal Text:\n"""\n${
          selectedText || context || prompt || ''
        }\n"""`;
        break;

      case 'longer':
        userPrompt = `Expand upon the following text by adding depth, illustrative examples, context, and detailed explanations while maintaining the core meaning:\n\n"""\n${
          selectedText || context || prompt || ''
        }\n"""`;
        break;

      case 'simplify':
        userPrompt = `Simplify the following text. Make it crystal clear, concise, and easy to read using plain language and short sentences:\n\n"""\n${
          selectedText || context || prompt || ''
        }\n"""`;
        break;

      case 'action_items':
        userPrompt = `Carefully analyze the following document content and extract a comprehensive, prioritized checklist of concrete action items and next steps. Format each item as a markdown checklist (- [ ] Item):\n\n"""\n${
          selectedText || context || prompt || ''
        }\n"""`;
        break;

      case 'translate':
        const targetLang = language || 'Spanish';
        userPrompt = `Translate the following content accurately and naturally into ${targetLang}. Maintain all markdown formatting, bullet points, and headers:\n\n"""\n${
          selectedText || context || prompt || ''
        }\n"""`;
        break;

      case 'eli5':
        userPrompt = `Explain the following concept like I am 5 years old. Use an intuitive, fun metaphor, simple vocabulary, and short sentences to make it effortlessly understandable:\n\n"""\n${
          selectedText || context || prompt || ''
        }\n"""`;
        break;

      case 'table':
        userPrompt = `Convert the following information or data into a clean, well-organized Markdown table with descriptive column headers:\n\n"""\n${
          selectedText || context || prompt || ''
        }\n"""`;
        break;

      case 'chat':
        systemInstruction = `You are Notion AI Copilot, an intelligent workspace sidecar assistant. You have full visibility into the author's active document.
Use the provided document context to give insightful, accurate, and direct answers.
If the user asks to draft, rewrite, or brainstorm, respond in clean Markdown with bolding and bullet points.`;
        userPrompt = `Document Context:\n"""\n${context || 'No document text yet.'}\n"""\n\nUser Question/Request:\n"${prompt}"`;
        break;

      default:
        userPrompt = prompt || selectedText || context || 'Help brainstorm ideas for this document.';
    }

    const result = streamText({
      model: google('gemini-3.5-flash'),
      system: systemInstruction,
      prompt: userPrompt,
      temperature: 0.7,
    });

    return result.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error in AI route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error processing AI request' },
      { status: 500 }
    );
  }
}
