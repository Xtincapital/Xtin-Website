import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize fallback AI client (Groq/OpenAI). XtinAI uses Claude first when
// ANTHROPIC_API_KEY is configured, then falls back to this client.
// Created on first use, not at import: the OpenAI SDK throws when it has no key,
// which broke every module (and test) that merely imports this file.
let aiClient: OpenAI | undefined;
const getAiClient = () =>
  (aiClient ??= new OpenAI({
    apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,  // Prioritize Groq, fallback to OpenAI
    baseURL: process.env.GROQ_API_KEY ? 'https://api.groq.com/openai/v1' : undefined  // Use Groq baseURL if Groq key exists
  }));

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

export function getAIProviderInfo() {
  if (process.env.ANTHROPIC_API_KEY) {
    return { provider: 'Claude', model: CLAUDE_MODEL };
  }

  if (process.env.GROQ_API_KEY) {
    return { provider: 'Groq', model: 'llama-3.1-8b-instant' };
  }

  return { provider: 'OpenAI', model: 'gpt-3.5-turbo' };
}

export interface AITextResult {
  text: string;
  /** Claude's stop_reason ("max_tokens" means the reply was cut off); undefined on Groq/OpenAI. */
  stopReason?: string;
}

export async function generateAIText(params: GenerateAITextParams): Promise<string> {
  return (await generateAITextWithMeta(params)).text;
}

interface GenerateAITextParams {
  messages: any[];
  maxTokens?: number;
  temperature?: number;
}

export async function generateAITextWithMeta({ messages, maxTokens = 400, temperature = 0.7 }: GenerateAITextParams): Promise<AITextResult> {
  if (process.env.ANTHROPIC_API_KEY) {
    const systemPrompt = messages
      .filter((message) => message.role === 'system')
      .map((message) => message.content)
      .join('\n\n');

    const claudeMessages = messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content,
      }));

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        temperature,
        ...(systemPrompt ? { system: systemPrompt } : {}),
        messages: claudeMessages,
      }),
      // A hung connection would otherwise leave callers (e.g. a background
      // report) waiting forever; a timeout lets their retry/failure path run.
      signal: AbortSignal.timeout(240_000),
    });

    const data: any = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || `Claude API request failed with status ${response.status}`;
      throw new Error(message);
    }

    return {
      text: data.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n')
        .trim(),
      stopReason: data.stop_reason,
    };
  }

  const providerInfo = getAIProviderInfo();
  const response = await getAiClient().chat.completions.create({
    model: providerInfo.model,
    messages,
    max_tokens: maxTokens,
    temperature,
  });

  return { text: response.choices[0].message.content.trim() };
}

export interface AIUsage {
  inputTokens: number;
  outputTokens: number;
}

interface GenerateAIWithUsageParams {
  system?: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  maxTokens?: number;
  temperature?: number;
  /** Overrides the default Claude model (CLAUDE_MODEL) for this call. */
  model?: string;
}

interface GenerateAIWithUsageResult {
  text: string;
  usage: AIUsage;
}

/**
 * Claude-only text generation that returns the REAL token usage from
 * Anthropic's own API response (`usage.input_tokens` + `usage.output_tokens`),
 * for callers that need exact accounting instead of `generateAIText`'s
 * length-based estimate (used e.g. by Journal's AI wallet, which must deduct
 * the precise cost of every coaching message — see
 * modules/journal/aiWallet.repository.ts).
 *
 * Deliberately has no OpenAI/Groq fallback: unlike `generateAIText`
 * (which FundaKaMental needs a fallback for), the callers of this function
 * only ever call Claude — mirroring their own Python source
 * (features-incoming/journal/main.py's `call_claude`), which never had a
 * fallback provider either. Throws if ANTHROPIC_API_KEY isn't configured,
 * same as that source.
 */
export async function generateAIWithUsage({
  system,
  messages,
  maxTokens = 400,
  temperature = 0.7,
  model = CLAUDE_MODEL,
}: GenerateAIWithUsageParams): Promise<GenerateAIWithUsageResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      ...(system ? { system } : {}),
      messages,
    }),
  });

  const data: any = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || `Claude API request failed with status ${response.status}`;
    throw new Error(message);
  }

  const text = data.content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('\n')
    .trim();

  const usage = data.usage || {};
  return {
    text,
    usage: {
      inputTokens: Number(usage.input_tokens || 0),
      outputTokens: Number(usage.output_tokens || 0),
    },
  };
}
