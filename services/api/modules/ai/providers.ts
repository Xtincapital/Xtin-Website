import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize fallback AI client (Groq/OpenAI). XtinAI uses Claude first when
// ANTHROPIC_API_KEY is configured, then falls back to this client.
const aiClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,  // Prioritize Groq, fallback to OpenAI
  baseURL: process.env.GROQ_API_KEY ? 'https://api.groq.com/openai/v1' : undefined  // Use Groq baseURL if Groq key exists
});

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

export async function generateAIText({ messages, maxTokens = 400, temperature = 0.7 }) {
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
    });

    const data: any = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || `Claude API request failed with status ${response.status}`;
      throw new Error(message);
    }

    return data.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();
  }

  const providerInfo = getAIProviderInfo();
  const response = await aiClient.chat.completions.create({
    model: providerInfo.model,
    messages,
    max_tokens: maxTokens,
    temperature,
  });

  return response.choices[0].message.content.trim();
}
