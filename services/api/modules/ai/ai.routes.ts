import express from 'express';
import { getAIProviderInfo, generateAIText } from './providers.js';
import { analyzeQueryIntent, buildXtinAISystemPrompt } from './promptBuilder.js';
import { analyzeTrades, identifyIssues } from './tradeAnalysis.js';
import { enforceCompliance } from './compliance.js';

const router = express.Router();

// Unified AI Chat endpoint for all bots
router.post('/ai/chat', async (req, res) => {
  try {
    // Support both formats: {text, context, systemPrompt} and ChatWidget format {message, user_metadata, etc.}
    const text = req.body.text || req.body.message;
    const context = req.body.context || '';
    const customSystemPrompt = req.body.systemPrompt || '';
    const conversationHistory = req.body.user_metadata?.conversation_history || [];

    if (!text) {
      return res.status(400).json({ error: 'Text or message is required' });
    }

    // Analyze query intent for adaptive response
    const queryIntent = analyzeQueryIntent(text, conversationHistory);
    console.log('[XtinAI] Query intent:', queryIntent);

    // Build conversation context from history
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = '## Previous Conversation:\n' + 
        conversationHistory.slice(-4).map(h => `User: ${h.user}\nXtinAI: ${h.assistant}`).join('\n\n') + 
        '\n\n---\n';
    }

    // Use XtinAI identity-based system prompt (unless custom override provided)
    const systemPrompt = customSystemPrompt || buildXtinAISystemPrompt(queryIntent);

    // Determine max tokens based on query depth
    const maxTokens = {
      'minimal': 100,
      'brief': 200,
      'guiding': 400,
      'practical': 500,
      'emotional': 400,
      'balanced': 500,
      'detailed': 700,
      'adaptive': 400
    }[queryIntent.depth] || 400;

    // Build messages for chat completion
    const messages = [
      { role: "system", content: systemPrompt },
    ];
    
    // Add conversation context if exists
    if (conversationContext) {
      messages.push({ role: "user", content: conversationContext + `Current question: ${text}` });
    } else {
      messages.push({ role: "user", content: text });
    }

    // Generate response using Claude first, then fallback provider while Claude key is absent.
    const rawReply = await generateAIText({
      messages,
      maxTokens,
      temperature: 0.55,
    });

    // Enforce compliance on the actual output — redact prohibited claims and
    // force in required disclaimers, independent of whether the model followed the prompt.
    const { response: reply } = enforceCompliance(rawReply, text);

    // Return response in format expected by ChatWidget
    res.json({ response: reply });
  } catch (error) {
    console.error('AI API Error:', error);
    res.status(500).json({
      error: 'AI service temporarily unavailable',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Legacy endpoint for Gini bot compatibility - Enhanced for v2 AI Engine
router.post('/ai/gemini', async (req, res) => {
  try {
    const { text, messages } = req.body;

    if (!text && !messages) {
      return res.status(400).json({ error: 'Text or messages required' });
    }

    // Determine input format - new AI Engine sends full transcript in text
    const prompt = text;
    
    // Parse system/user/assistant format if present
    const hasSystemPrompt = prompt && prompt.includes('═══════════════════════════════════════════════════════════════════════════════');
    
    // Set appropriate model and parameters based on complexity
    const isComplexQuery = hasSystemPrompt || (prompt && prompt.length > 2000);
    
    // Use Claude first, then fallback provider while Claude key is absent.
    const rawReply = await generateAIText({
      messages: [{
        role: "user",
        content: hasSystemPrompt ? prompt : `You are Gini, an expert financial advisor AI with comprehensive knowledge of Indian financial markets, investments, and personal finance. Provide helpful, accurate, and personalized financial advice.

User question: ${prompt}

Provide a clear, actionable response:`
      }],
      maxTokens: isComplexQuery ? 1200 : 600, // More tokens for complex queries
      temperature: 0.7
    });

    const { response: reply } = enforceCompliance(rawReply, prompt || '');

    res.json({ reply });
  } catch (error) {
    console.error('AI API Error:', error);
    let errorMessage = 'AI service temporarily unavailable';
    if (error.message && error.message.includes('credits or licenses')) {
      errorMessage = 'AI service is currently unavailable due to API credit limits. Please try again later or contact support.';
    } else if (error.message && error.message.includes('Incorrect API key')) {
      errorMessage = 'Invalid API key. Please check your OpenAI API key configuration.';
    }
    res.status(200).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Advanced analysis endpoint for AI Coach
router.post('/ai/analyze', async (req, res) => {
  try {
    const { trades } = req.body;

    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      return res.status(400).json({ error: 'Trades array is required' });
    }

    // Analyze trading performance
    const analysis = analyzeTrades(trades);

    // Generate improvement plan
    const improvementPrompt = `Based on this trading analysis: ${JSON.stringify(analysis)}

Generate a comprehensive improvement plan. Return ONLY valid JSON with these exact keys:
{
  "immediate_actions": [{"issue": "string", "action": "string"}],
  "skill_development": ["skill1", "skill2"],
  "risk_management": ["improvement1", "improvement2"],
  "learning_resources": {"skill1": "resource", "skill2": "resource"}
}

Return only the JSON, no markdown or explanations.`;

    const improvementTextRaw = await generateAIText({
      messages: [
        {
          role: "system",
          content: "Return only valid JSON. Do not include markdown fences or explanations.",
        },
        { role: "user", content: improvementPrompt },
      ],
      maxTokens: 1200,
      temperature: 0.4,
    });

    let improvementText = improvementTextRaw.trim();
    // Remove markdown code blocks if present
    improvementText = improvementText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const improvement_plan = JSON.parse(improvementText);

    res.json({
      analysis,
      improvement_plan,
      issues: identifyIssues(analysis)
    });
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({
      error: 'Analysis service unavailable',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check for AI service
router.get('/ai/health', async (req, res) => {
  try {
    // Test AI API
    await generateAIText({
      messages: [{ role: "user", content: "Hello" }],
      maxTokens: 10,
      temperature: 0,
    });

    const providerInfo = getAIProviderInfo();
    res.json({
      status: 'healthy',
      model: providerInfo.model,
      provider: providerInfo.provider,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
