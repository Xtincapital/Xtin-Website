import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '../contexts/ThemeContext';

// Use the app-wide backend URL (VITE_BACKEND_URL) so the chatbot hits the
// deployed backend in production. Falls back to the legacy VITE_API_BASE_URL,
// then localhost for dev.
const API_BASE =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:5002';

/**
 * ChatWidget - Persistent AI chat interface
 * 
 * Conversation Persistence Strategy:
 * - Messages: Saved to sessionStorage (persists during tab/window session, clears on browser close)
 * - Session ID: Saved to localStorage (persists across browser restarts for backend continuity)
 * 
 * User Experience:
 * - Navigate between pages → Chat history preserved
 * - Close tab/browser → Chat history cleared, fresh start on next visit
 * - Manual clear → "Clear" button resets conversation
 */
function ChatWidget() {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  
  // Load messages from sessionStorage on mount (persists during tab session, clears on close)
  const [messages, setMessages] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = window.sessionStorage.getItem('xtin_chat_messages');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('[XtinAI] Could not load saved messages:', e);
    }
    // Default initial message
    return [{ role: 'assistant', content: 'Welcome to Xtin Capital. I\'m XtinAI.\n\nWe\'re on a mission to make people wealthy, not just rich — leading India\'s second freedom movement: Financial Freedom.\n\nWhether you\'re planning your first investment or building long-term wealth, I\'m here to guide you with clarity and confidence. How can I help you today?' }];
  });
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // Persist session across page reloads for better continuity
  const sessionId = useMemo(() => {
    try {
      const KEY = 'xtin_session_id';
      const existing = typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null;
      if (existing) return existing;
      const id = `web_${Math.random().toString(36).slice(2)}`;
      if (typeof window !== 'undefined') window.localStorage.setItem(KEY, id);
      return id;
    } catch {
      // Fallback if localStorage is unavailable
      return `web_${Math.random().toString(36).slice(2)}`;
    }
  }, []);
  const listRef = useRef(null);

  const palette = useMemo(
    () =>
      isDark
        ? {
            launcherBg: '#14532d',
            launcherText: '#f8fafc',
            panelBg: '#111827',
            panelBorder: '#374151',
            panelHeaderBg: '#0b1220',
            panelHeaderMuted: '#94a3b8',
            panelBodyBg: '#0f172a',
            bubbleUser: '#1d4ed8',
            bubbleAssistant: '#1f2937',
            bubbleText: '#e5e7eb',
            label: '#9ca3af',
            subtle: '#0f172a',
            codeBg: '#020617',
            codeText: '#cbd5e1',
            inlineCodeBg: '#334155',
            tableHeader: '#1e293b',
            tableBorder: '#475569',
            quoteBorder: '#475569',
            link: '#60a5fa',
            actionBg: '#0b1220',
            actionText: '#f8fafc',
            footerBg: '#0b1220',
          }
        : {
            launcherBg: '#0F172A',
            launcherText: '#ffffff',
            panelBg: '#ffffff',
            panelBorder: '#e5e7eb',
            panelHeaderBg: '#f8fafc',
            panelHeaderMuted: '#64748b',
            panelBodyBg: '#ffffff',
            bubbleUser: '#eef2ff',
            bubbleAssistant: '#f1f5f9',
            bubbleText: '#111827',
            label: '#64748b',
            subtle: '#f1f5f9',
            codeBg: '#1e293b',
            codeText: '#e2e8f0',
            inlineCodeBg: '#e2e8f0',
            tableHeader: '#e2e8f0',
            tableBorder: '#cbd5e1',
            quoteBorder: '#cbd5e1',
            link: '#3b82f6',
            actionBg: '#0F172A',
            actionText: '#ffffff',
            footerBg: '#fafafa',
          },
    [isDark],
  );

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && messages.length > 0) {
        window.sessionStorage.setItem('xtin_chat_messages', JSON.stringify(messages));
      }
    } catch (e) {
      console.warn('[XtinAI] Could not save messages:', e);
    }
  }, [messages]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    
    // Create new user message
    const userMessage = { role: 'user', content: text };
    setMessages((m) => [...m, userMessage]);
    setLoading(true);
    
    try {
      console.log('[XtinAI] Sending request to:', `${API_BASE}/api/ai/chat`);
      
      // Prepare conversation history as paired exchanges (exclude initial greeting)
      const conversationHistory = (() => {
        const history = [];
        let pendingUser = null;
        // Pair user -> assistant messages into single objects
        for (const msg of messages.slice(1)) { // Skip greeting
          if (msg.role === 'user') {
            // If a previous user message had no assistant reply yet, push it with empty assistant
            if (pendingUser !== null) {
              history.push({ user: pendingUser, assistant: '' });
            }
            pendingUser = msg.content;
          } else if (msg.role === 'assistant') {
            if (pendingUser !== null) {
              history.push({ user: pendingUser, assistant: msg.content });
              pendingUser = null;
            } else {
              // Assistant message without a preceding user message
              history.push({ user: '', assistant: msg.content });
            }
          }
        }
        if (pendingUser !== null) {
          history.push({ user: pendingUser, assistant: '' });
        }
        // Keep only the last 6 exchanges to stay within token budget
        return history.slice(-6);
      })();
      
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'web-anon',
          message: text,
          session_id: sessionId,
          user_metadata: { 
            source: 'web', 
            authenticated: false,
            conversation_history: conversationHistory, // Include chat history for context
          },
        }),
      });
      console.log('[XtinAI] Response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('[XtinAI] Response data:', data);
      
      if (data && data.response) {
        setMessages((m) => [...m, { role: 'assistant', content: data.response }]);
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, I could not respond right now.' }]);
      }
    } catch (e) {
      console.error('[XtinAI] Error:', e);
      setMessages((m) => [...m, { role: 'assistant', content: `Network error: ${e.message}. Check console for details.` }]);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    const initialMessage = { role: 'assistant', content: 'Welcome to Xtin Capital. I\'m XtinAI.\n\nWe\'re on a mission to make people wealthy, not just rich — leading India\'s second freedom movement: Financial Freedom.\n\nWhether you\'re planning your first investment or building long-term wealth, I\'m here to guide you with clarity and confidence. How can I help you today?' };
    setMessages([initialMessage]);
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('xtin_chat_messages');
      }
    } catch (e) {
      console.warn('[XtinAI] Could not clear saved messages:', e);
    }
  }

  return (
    <div>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          background: palette.launcherBg,
          color: palette.launcherText,
          borderRadius: '9999px',
          padding: '12px 16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {open ? 'Close XtinAI' : 'Chat with XtinAI'}
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 88,
            right: 24,
            width: 360,
            maxWidth: '90vw',
            height: 520,
            maxHeight: '75vh',
            background: palette.panelBg,
            border: `1px solid ${palette.panelBorder}`,
            borderRadius: 12,
            boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1000,
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${palette.panelBorder}`, background: palette.panelHeaderBg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>XtinAI</strong>
              <div style={{ fontSize: 12, color: palette.panelHeaderMuted }}>
                Your smart financial friend
                {messages.length > 1 && (
                  <span style={{ marginLeft: 8, color: '#10b981', fontWeight: 500 }}>
                    • {messages.length - 1} messages
                  </span>
                )}
              </div>
            </div>
            {messages.length > 1 && (
              <button
                onClick={clearChat}
                style={{
                  background: 'transparent',
                  border: `1px solid ${palette.panelBorder}`,
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 11,
                  color: palette.panelHeaderMuted,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = palette.subtle;
                  e.currentTarget.style.color = palette.bubbleText;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = palette.panelHeaderMuted;
                }}
                title="Clear chat history"
              >
                Clear
              </button>
            )}
          </div>
          <div ref={listRef} style={{ flex: 1, overflow: 'auto', padding: 12, background: palette.panelBodyBg }}>
            {messages.map((m, idx) => (
              <div key={idx} style={{ margin: '8px 0' }}>
                <div style={{ fontSize: 12, color: palette.label, marginBottom: 4 }}>{m.role === 'user' ? 'You' : 'XtinAI'}</div>
                <div style={{ 
                  background: m.role === 'user' ? palette.bubbleUser : palette.bubbleAssistant,
                  color: palette.bubbleText,
                  padding: 12, 
                  borderRadius: 8,
                  fontSize: 14,
                  lineHeight: 1.6,
                }}>
                  {m.role === 'assistant' ? (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Style tables
                        table: ({ ...props}) => (
                          <table style={{ 
                            borderCollapse: 'collapse', 
                            width: '100%', 
                            margin: '12px 0',
                            fontSize: '13px',
                            color: palette.bubbleText,
                          }} {...props} />
                        ),
                        thead: ({ ...props}) => (
                          <thead style={{ background: palette.tableHeader }} {...props} />
                        ),
                        th: ({ ...props}) => (
                          <th style={{ 
                            border: `1px solid ${palette.tableBorder}`,
                            padding: '8px', 
                            textAlign: 'left',
                            fontWeight: 600,
                          }} {...props} />
                        ),
                        td: ({node, ...props}) => (
                          <td style={{ 
                            border: `1px solid ${palette.tableBorder}`,
                            padding: '8px' 
                          }} {...props} />
                        ),
                        // Style headers
                        h1: ({node, ...props}) => (
                          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: '16px 0 8px 0', color: palette.bubbleText }} {...props} />
                        ),
                        h2: ({node, ...props}) => (
                          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '14px 0 6px 0', color: palette.bubbleText }} {...props} />
                        ),
                        h3: ({node, ...props}) => (
                          <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '12px 0 6px 0', color: palette.bubbleText }} {...props} />
                        ),
                        // Style lists
                        ul: ({node, ...props}) => (
                          <ul style={{ margin: '8px 0', paddingLeft: '24px' }} {...props} />
                        ),
                        ol: ({node, ...props}) => (
                          <ol style={{ margin: '8px 0', paddingLeft: '24px' }} {...props} />
                        ),
                        li: ({node, ...props}) => (
                          <li style={{ margin: '4px 0' }} {...props} />
                        ),
                        // Style paragraphs
                        p: ({node, ...props}) => (
                          <p style={{ margin: '8px 0' }} {...props} />
                        ),
                        // Style links
                        a: ({node, ...props}) => (
                          <a style={{ color: palette.link, textDecoration: 'underline' }} {...props} />
                        ),
                        // Style code blocks
                        code: ({node, inline, children, ...props}: any) => (
                          inline ? 
                            <code style={{ 
                              background: palette.inlineCodeBg,
                              padding: '2px 6px', 
                              borderRadius: 4,
                              fontSize: '12px',
                              color: palette.bubbleText,
                            }} {...props}>{children}</code> :
                            <code style={{ 
                              display: 'block',
                              background: palette.codeBg,
                              color: palette.codeText,
                              padding: '12px', 
                              borderRadius: 6,
                              fontSize: '12px',
                              overflowX: 'auto'
                            }} {...props}>{children}</code>
                        ),
                        // Style blockquotes
                        blockquote: ({node, ...props}) => (
                          <blockquote style={{ 
                            borderLeft: `4px solid ${palette.quoteBorder}`,
                            paddingLeft: '12px',
                            margin: '12px 0',
                            color: palette.label,
                            fontStyle: 'italic'
                          }} {...props} />
                        ),
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                  )}
                </div>
              </div>
            ))}
            {loading && <div style={{ fontSize: 12, color: palette.label, fontStyle: 'italic', marginTop: 8 }}>Thinking...</div>}
          </div>
          <div style={{ padding: 12, borderTop: `1px solid ${palette.panelBorder}`, background: palette.footerBg }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask about markets, tools, or our platform..."
              rows={2}
              style={{ width: '100%', borderRadius: 8, border: `1px solid ${palette.panelBorder}`, padding: 8, resize: 'none', fontFamily: 'system-ui, -apple-system, sans-serif', background: palette.panelBg, color: palette.bubbleText }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={sendMessage} disabled={loading} style={{ background: palette.actionBg, color: palette.actionText, border: 'none', borderRadius: 8, padding: '8px 12px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;
