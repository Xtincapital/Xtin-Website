import os
import json
import time
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .config import get_settings
from dotenv import load_dotenv

# Load environment variables from .env at startup
load_dotenv()
from .user_profiler import UserProfiler, UserProfile, UserType
from .compliance_engine import ComplianceEngine, RiskLevel
from .knowledge_base_manager import KnowledgeBaseManager, MarketDataIntegrator
from .adaptive_prompt_builder import AdaptivePromptBuilder
from .token_optimizer import TokenOptimizer

# External services
from groq import Groq
import redis

settings = get_settings()

app = FastAPI(
    title="Xtin AI Bot API",
    description="Enterprise-grade financial AI assistant with compliance",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEYS = {
    'groq': os.getenv("GROQ_API_KEY"),
}

groq_client = Groq(api_key=API_KEYS['groq']) if API_KEYS.get('groq') else None

_redis_client = None
try:
    _redis_client = redis.Redis(
        host=os.getenv('REDIS_HOST', settings.REDIS_HOST),
        port=int(os.getenv('REDIS_PORT', settings.REDIS_PORT)),
        decode_responses=True,
    )
    # try a ping
    _redis_client.ping()
except Exception:
    class _NoopRedis:
        def get(self, *_, **__):
            return None
        def setex(self, *_, **__):
            return None
        def lrange(self, *_, **__):
            return []
        def rpush(self, *_, **__):
            return None
        def expire(self, *_, **__):
            return None
        def lpush(self, *_, **__):
            return None
        def ltrim(self, *_, **__):
            return None
    _redis_client = _NoopRedis()

redis_client = _redis_client

# Simplified: no external knowledge base or market data

class ChatRequest(BaseModel):
    user_id: str
    message: str
    session_id: str
    user_metadata: Optional[Dict] = {}

class ChatResponse(BaseModel):
    success: bool
    response: str
    type: str
    risk_level: str
    sources: List[str]
    disclaimers_added: bool
    requires_human: bool
    timestamp: str

class XtinBotEngine:
    def __init__(self):
        # Use Grok client
        self.grok_client = grok_client

    def process_query(self, query: str, user_id: str, session_id: str, user_metadata: Dict) -> ChatResponse:
        start_time = time.time()
        try:
            # If no Groq API key configured, return informative stub
            if not API_KEYS.get('groq'):
                return ChatResponse(
                    success=True,
                    response=(
                        "XtinAI backend is running but the Groq API key isn't configured yet. "
                        "Set GROQ_API_KEY in server/.env to enable AI answers."
                    ),
                    type="info",
                    risk_level="low",
                    sources=[],
                    disclaimers_added=False,
                    requires_human=False,
                    timestamp=datetime.utcnow().isoformat(),
                )
            user_profile = UserProfiler.detect_user_type(user_id=user_id, query=query, metadata=user_metadata)
            
            # ====== TOKEN OPTIMIZATION & SPAM DETECTION ======
            conversation_history = self._get_conversation_history(session_id)
            # Merge client-provided history (fallback when Redis is disabled)
            try:
                client_hist = user_metadata.get('conversation_history') if isinstance(user_metadata, dict) else None
                if isinstance(client_hist, list) and client_hist:
                    # Normalize items to {'user': str, 'assistant': str}
                    normalized = []
                    for item in client_hist:
                        if isinstance(item, dict):
                            u = str(item.get('user', '') or '')
                            a = str(item.get('assistant', '') or '')
                            normalized.append({'user': u, 'assistant': a})
                    # Append and trim to last 8 exchanges total
                    conversation_history = (conversation_history or []) + normalized
                    conversation_history = conversation_history[-8:]
            except Exception as _:
                # Non-fatal: ignore malformed metadata
                pass
            print(f"[CONVERSATION] Session: {session_id}, History length: {len(conversation_history)}")
            if conversation_history:
                print(f"[CONVERSATION] Last exchange: {conversation_history[-1]}")
            optimization = TokenOptimizer.analyze_query_and_optimize(
                query=query,
                user_id=user_id,
                session_id=session_id,
                conversation_history=conversation_history
            )
            
            # Block spam immediately
            if not optimization['should_respond']:
                return ChatResponse(
                    success=True,
                    response=optimization['suggested_response'],
                    type="spam_blocked",
                    risk_level="low",
                    sources=[],
                    disclaimers_added=False,
                    requires_human=False,
                    timestamp=datetime.utcnow().isoformat(),
                )
            
            print(f"[TOKEN OPT] Complexity: {optimization['complexity']}, Intent: {optimization['intent']}, Max tokens: {optimization['max_tokens']}")
            
            compliance_check = ComplianceEngine.validate_response_pre_generation(query=query, user_profile=user_profile)
            if not compliance_check['can_proceed']:
                return ChatResponse(
                    success=True,
                    response=self._generate_escalation_message(compliance_check),
                    type="escalation_required",
                    risk_level=compliance_check['risk_level'],
                    sources=[],
                    disclaimers_added=True,
                    requires_human=True,
                    timestamp=datetime.utcnow().isoformat(),
                )

            cached_response = self._check_cache(query, user_profile.user_type)
            if cached_response:
                return cached_response

            knowledge_context = []  # Simplified, no external knowledge base
            market_data = None  # Simplified, no market data

            system_prompt = AdaptivePromptBuilder.build_system_prompt(
                user_profile=user_profile, 
                compliance_context=compliance_check, 
                knowledge_context=knowledge_context,
                optimization_context=optimization  # Add optimization instructions
            )
            enhanced_query = AdaptivePromptBuilder.build_user_query_with_context(query=query, conversation_history=conversation_history, market_data=market_data)

            model = self._select_model(user_profile, compliance_check['risk_level'])
            
            # Generate response with token optimization
            full_prompt = system_prompt + "\n\n" + enhanced_query
            
            print(f"[DEBUG] Calling Groq API")
            print(f"[DEBUG] Conversation history included: {len(conversation_history)} exchanges")
            print(f"[DEBUG] Prompt length: {len(full_prompt)} characters")
            response = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": enhanced_query}
                ],
                max_tokens=150,
                temperature=0.7
            )
            bot_response = response.choices[0].message.content
            print(f"[DEBUG] Got response: {bot_response[:100]}...")

            validated_response, violations = ComplianceEngine.validate_response_post_generation(
                bot_response=bot_response,
                query=query,
                risk_level=RiskLevel(compliance_check['risk_level']),
            )

            self._save_conversation(session_id=session_id, user_query=query, bot_response=validated_response, user_profile=user_profile)
            ComplianceEngine.create_audit_log(user_id=user_id, query=query, response=validated_response, risk_level=RiskLevel(compliance_check['risk_level']), violations=violations, user_profile=user_profile)
            self._cache_response(query, validated_response, user_profile.user_type)

            response_time = time.time() - start_time
            self._track_metrics(response_time, compliance_check['risk_level'], violations)

            return ChatResponse(
                success=True,
                response=validated_response,
                type="finance_answer",
                risk_level=compliance_check['risk_level'],
                sources=[doc.get('metadata', {}).get('source_type', 'unknown') for doc in knowledge_context[:3]],
                disclaimers_added=('Disclaimer' in validated_response),
                requires_human=len(violations) > 0,
                timestamp=datetime.utcnow().isoformat(),
            )
        except Exception as e:
            print(f"Error processing query: {e}")
            return ChatResponse(
                success=False,
                response="I encountered an error processing your request. Please try again or contact support.",
                type="error",
                risk_level="unknown",
                sources=[],
                disclaimers_added=False,
                requires_human=True,
                timestamp=datetime.utcnow().isoformat(),
            )

    def _select_model(self, user_profile: UserProfile, risk_level: str):
        # Groq has various models
        return groq_client

    def _get_relevant_market_data(self, query: str) -> Optional[Dict]:
        # Simplified, no market data
        return None

    def _check_cache(self, query: str, user_type: UserType) -> Optional[ChatResponse]:
        import hashlib
        cache_key = f"response_cache:{user_type.value}:{hashlib.md5(query.lower().encode()).hexdigest()}"
        cached = redis_client.get(cache_key)
        if cached:
            cached_data = json.loads(cached)
            cached_data['timestamp'] = datetime.utcnow().isoformat()
            cached_data['from_cache'] = True
            return ChatResponse(**cached_data)
        return None

    def _cache_response(self, query: str, response: str, user_type: UserType):
        import hashlib
        cache_key = f"response_cache:{user_type.value}:{hashlib.md5(query.lower().encode()).hexdigest()}"
        cache_data = {'response': response, 'cached_at': datetime.utcnow().isoformat()}
        redis_client.setex(cache_key, 3600, json.dumps(cache_data))

    def _get_conversation_history(self, session_id: str) -> List[Dict]:
        history_key = f"chat_history:{session_id}"
        history = redis_client.lrange(history_key, -10, -1)
        messages: List[Dict] = []
        for msg in history:
            messages.append(json.loads(msg))
        return messages

    def _save_conversation(self, session_id: str, user_query: str, bot_response: str, user_profile: UserProfile):
        history_key = f"chat_history:{session_id}"
        exchange = {
            'user': user_query,
            'assistant': bot_response,
            'timestamp': datetime.utcnow().isoformat(),
            'user_type': user_profile.user_type.value,
        }
        redis_client.rpush(history_key, json.dumps(exchange))
        redis_client.expire(history_key, 86400)

    def _generate_escalation_message(self, compliance_check: Dict) -> str:
        violations = compliance_check.get('violations', [])
        if violations:
            return (
                "📞 **This requires personalized advice from a qualified advisor.**\n\n"
                "Your question is important and deserves expert attention. Our professional "
                "financial advisors can provide you with personalized recommendations based on your "
                "financial situation, goals, and risk tolerance.\n\n"
                "**What happens next:**\n"
                "1. Schedule a free consultation with our advisors\n"
                "2. They'll understand your complete financial picture\n"
                "3. Get tailored advice that's right for YOU\n\n"
                "🔗 **[Schedule Consultation Now](/advisory)**\n\n"
                "In the meantime, I can help you understand general investment concepts or explain how our platform works!\n"
            )
        return (
            "I'd love to help, but this question requires expertise from a human advisor.\n\n"
            "**[Connect with our advisors](/advisory)** for personalized guidance.\n\n"
            "Ask me about general financial concepts, market trends, or Xtin platform features!\n"
        )

    def _track_metrics(self, response_time: float, risk_level: str, violations: List):
        metrics = {
            'timestamp': datetime.utcnow().isoformat(),
            'response_time_ms': response_time * 1000,
            'risk_level': risk_level,
            'violations_count': len(violations),
            'has_violations': len(violations) > 0,
        }
        redis_client.lpush('metrics_queue', json.dumps(metrics))
        redis_client.ltrim('metrics_queue', 0, 999)

xtin_bot = XtinBotEngine()

# Startup event to schedule periodic cleanup
@app.on_event("startup")
async def startup_event():
    """Background tasks on startup"""
    print("[STARTUP] Xtin AI Bot starting up...")
    print("[STARTUP] Token optimizer and spam detector active")
    # In production, use a proper task scheduler like APScheduler or Celery
    # For now, cleanup happens on-demand

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # Periodic cleanup of old query history (every 100 requests)
        import random
        if random.random() < 0.01:  # 1% chance per request
            TokenOptimizer.cleanup_old_history()
        
        response = xtin_bot.process_query(
            query=request.message,
            user_id=request.user_id,
            session_id=request.session_id,
            user_metadata=request.user_metadata,
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/health")
async def health_check():
    return {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '2.0.0',
        'features': {
            'token_optimization': True,
            'spam_detection': True,
            'markdown_formatting': True,
        }
    }

@app.get("/api/v1/optimizer/stats")
async def optimizer_stats():
    """Get current token optimizer statistics"""
    return {
        'tracked_users': len(TokenOptimizer._user_query_history),
        'total_queries_tracked': sum(len(queries) for queries in TokenOptimizer._user_query_history.values()),
        'description': 'Token optimizer actively monitoring for spam and optimizing response lengths'
    }

# Removed market data endpoint

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            response = xtin_bot.process_query(
                query=data['message'],
                user_id=data.get('user_id', 'anonymous'),
                session_id=data.get('session_id', f"ws_{int(time.time())}"),
                user_metadata=data.get('metadata', {}),
            )
            await websocket.send_json(response.model_dump())
    except Exception:
        await websocket.close()

# Local dev entry
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
