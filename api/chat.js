/**
 * Vercel Serverless Function
 * Secure Claude API Proxy - API key stored in environment variable
 */

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
const ANTHROPIC_VERSION = '2023-06-01';

function normalizeClaudeMessages(messages) {
  const systemParts = [];
  const chatMessages = [];

  messages.forEach((message) => {
    const role = message?.role === 'assistant' ? 'assistant' : message?.role === 'system' ? 'system' : 'user';
    const content = String(message?.content || '').trim();
    if (!content) return;

    if (role === 'system') {
      systemParts.push(content);
      return;
    }

    const previous = chatMessages[chatMessages.length - 1];
    if (previous?.role === role) {
      previous.content += `\n\n${content}`;
    } else {
      chatMessages.push({ role, content });
    }
  });

  if (chatMessages[0]?.role === 'assistant') {
    chatMessages.unshift({ role: 'user', content: 'Continue the financial planning conversation.' });
  }

  return {
    system: systemParts.join('\n\n'),
    messages: chatMessages
  };
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, maxOutputTokens } = req.body;

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array required' });
    }

    // Get API key from environment variable (NOT exposed in code)
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      console.error('[Claude] ANTHROPIC_API_KEY not configured');
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const normalized = normalizeClaudeMessages(messages);
    if (!normalized.messages.length) {
      return res.status(400).json({ error: 'Invalid request: at least one user message required' });
    }

    // Clamp: floor keeps tiny requests sane, ceiling covers full Pro-depth
    // advisor answers (~120 words + reasoning).
    const safeMaxTokens = Math.min(
      Math.max(Number(maxOutputTokens) || 180, 32),
      800
    );

    // Call Claude API from server (key never exposed to client)
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        system: normalized.system,
        messages: normalized.messages,
        temperature: 0.35,
        max_tokens: safeMaxTokens
      })
    });

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.json();
      console.error('[Claude] API Error:', errorData);
      return res.status(claudeResponse.status).json({
        error: errorData.error?.message || 'Claude API error'
      });
    }

    const data = await claudeResponse.json();
    const reply = Array.isArray(data.content)
      ? data.content.filter(part => part.type === 'text').map(part => part.text).join('\n').trim()
      : '';
    
    // Extract the response
    if (reply) {
      return res.status(200).json({
        success: true,
        reply,
        usage: {
          inputTokens: data.usage?.input_tokens || 0,
          outputTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        },
        model: data.model || DEFAULT_MODEL
      });
    } else {
      return res.status(500).json({
        error: 'Invalid response from Claude API'
      });
    }

  } catch (error) {
    console.error('[Claude Proxy] Error:', error);
    return res.status(500).json({
      error: 'Internal server error: ' + error.message
    });
  }
}
