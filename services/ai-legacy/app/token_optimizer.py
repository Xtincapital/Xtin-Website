"""
Token Optimization and Spam Detection Engine
Intelligently manages response length, detects spam, and optimizes token usage
"""
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
from enum import Enum
import re
import hashlib

class ResponseComplexity(Enum):
    """Determines how detailed the response should be"""
    MINIMAL = "minimal"  # 50-100 tokens - Yes/No, quick facts
    BRIEF = "brief"  # 100-200 tokens - Short explanation
    STANDARD = "standard"  # 200-400 tokens - Normal detailed answer
    COMPREHENSIVE = "comprehensive"  # 400-800 tokens - Full detailed explanation

class SpamIndicator(Enum):
    CLEAN = "clean"
    SUSPICIOUS = "suspicious"
    LIKELY_SPAM = "likely_spam"
    DEFINITE_SPAM = "definite_spam"

class TokenOptimizer:
    """
    Optimizes token usage by:
    1. Analyzing query complexity to determine appropriate response length
    2. Detecting spam and repetitive queries
    3. Providing context-aware response guidelines
    4. Tracking user patterns to prevent abuse
    """
    
    # In-memory storage for user behavior tracking (use Redis in production)
    _user_query_history: Dict[str, List[Dict]] = {}
    
    @staticmethod
    def analyze_query_and_optimize(
        query: str, 
        user_id: str, 
        session_id: str,
        conversation_history: List[Dict]
    ) -> Dict:
        """
        Main optimization function that analyzes the query and returns optimization guidelines
        """
        # 1. Detect spam first
        spam_check = TokenOptimizer._check_spam(query, user_id, session_id, conversation_history)
        
        if spam_check['is_spam']:
            return {
                'should_respond': False,
                'spam_detected': True,
                'spam_level': spam_check['level'],
                'block_reason': spam_check['reason'],
                'suggested_response': "I notice unusual activity. Please ask genuine financial questions.",
            }
        
        # 2. Determine query complexity and required response detail
        complexity = TokenOptimizer._determine_response_complexity(query, conversation_history)
        
        # 3. Check if this is a follow-up question (can reference previous context)
        is_followup = TokenOptimizer._is_followup_question(query, conversation_history)
        
        # 4. Detect query intent to optimize response
        intent = TokenOptimizer._classify_query_intent(query)
        
        # 5. Build optimization instructions
        optimization_instructions = TokenOptimizer._build_optimization_instructions(
            complexity, intent, is_followup, query
        )
        
        # 6. Track this query for spam detection
        TokenOptimizer._track_query(user_id, session_id, query)
        
        return {
            'should_respond': True,
            'spam_detected': False,
            'complexity': complexity.value,
            'intent': intent,
            'is_followup': is_followup,
            'optimization_instructions': optimization_instructions,
            'max_tokens': TokenOptimizer._get_max_tokens(complexity),
            'suggested_format': TokenOptimizer._get_suggested_format(intent, complexity),
        }
    
    @staticmethod
    def _check_spam(
        query: str, 
        user_id: str, 
        session_id: str,
        conversation_history: List[Dict]
    ) -> Dict:
        """
        Comprehensive spam detection using multiple signals
        """
        spam_signals = []
        spam_score = 0
        
        # Signal 1: Repetitive queries (exact duplicates)
        if TokenOptimizer._is_repetitive(user_id, query):
            spam_signals.append("repeated_query")
            spam_score += 30
        
        # Signal 2: Rapid fire queries (rate limiting)
        if TokenOptimizer._is_rapid_fire(user_id):
            spam_signals.append("rapid_queries")
            spam_score += 25
        
        # Signal 3: Nonsense or gibberish
        if TokenOptimizer._is_gibberish(query):
            spam_signals.append("gibberish")
            spam_score += 40
        
        # Signal 4: Very short meaningless queries
        if len(query.strip()) < 3:
            spam_signals.append("too_short")
            spam_score += 35
        
        # Signal 5: Excessive special characters or numbers
        special_char_ratio = len(re.findall(r'[^a-zA-Z0-9\s]', query)) / max(len(query), 1)
        if special_char_ratio > 0.4:
            spam_signals.append("excessive_special_chars")
            spam_score += 20
        
        # Signal 6: Same question rephrased multiple times
        if TokenOptimizer._is_semantic_duplicate(query, conversation_history):
            spam_signals.append("semantic_duplicate")
            spam_score += 15
        
        # Signal 7: Known spam patterns
        spam_patterns = [
            r'test\s*test\s*test',
            r'(hello\s+){5,}',
            r'(a+\s*){10,}',
            r'^[0-9]+$',  # Only numbers
            r'^[.!?]+$',  # Only punctuation
        ]
        for pattern in spam_patterns:
            if re.search(pattern, query.lower()):
                spam_signals.append("spam_pattern")
                spam_score += 30
                break
        
        # Determine spam level
        is_spam = False
        spam_level = SpamIndicator.CLEAN
        reason = ""
        
        if spam_score >= 60:
            is_spam = True
            spam_level = SpamIndicator.DEFINITE_SPAM
            reason = f"Spam detected: {', '.join(spam_signals)}"
        elif spam_score >= 40:
            is_spam = True
            spam_level = SpamIndicator.LIKELY_SPAM
            reason = f"Likely spam: {', '.join(spam_signals)}"
        elif spam_score >= 20:
            spam_level = SpamIndicator.SUSPICIOUS
            reason = f"Suspicious activity: {', '.join(spam_signals)}"
        
        return {
            'is_spam': is_spam,
            'level': spam_level.value,
            'score': spam_score,
            'signals': spam_signals,
            'reason': reason,
        }
    
    @staticmethod
    def _determine_response_complexity(query: str, conversation_history: List[Dict]) -> ResponseComplexity:
        """
        Determine how detailed the response should be based on query characteristics
        """
        query_lower = query.lower().strip()
        
        # MINIMAL - Greetings, simple acknowledgments, very basic questions
        minimal_indicators = [
            r'^(hi|hello|hey|hiya|greetings?)\s*$',  # Just greetings
            r'^(yes|no|ok|okay|thanks?|thank you|ty)\s*$',  # Acknowledgments
            r'^(good morning|good afternoon|good evening)\s*$',  # Time greetings
            r'^what is\s+\w+\s*\??$',  # "what is SIP?" - single term
            r'^define\s+\w+\s*\??$',  # "define ETF" - single term
            r'^\w{1,15}\??$',  # Single word question (15 chars max)
        ]
        for pattern in minimal_indicators:
            if re.search(pattern, query_lower):
                return ResponseComplexity.MINIMAL
        
        # COMPREHENSIVE - Complex, multi-part questions
        comprehensive_indicators = [
            'compare.*and.*',  # Comparisons
            'explain.*detail',
            'how does.*work',
            'difference between',
            'step by step',
            'comprehensive',
            'everything about',
            'in depth',
        ]
        if any(indicator in query_lower for indicator in comprehensive_indicators):
            return ResponseComplexity.COMPREHENSIVE
        
        # BRIEF - Quick factual questions
        brief_indicators = [
            r'^what is\s+\w+',  # "what is ETF"
            r'^who is',
            r'^when ',
            r'^where ',
            'tell me about',
            'quick question',
        ]
        for pattern in brief_indicators:
            if re.search(pattern, query_lower):
                return ResponseComplexity.BRIEF
        
        # Default to STANDARD for most questions
        return ResponseComplexity.STANDARD
    
    @staticmethod
    def _classify_query_intent(query: str) -> str:
        """
        Classify the user's intent to optimize response structure
        """
        query_lower = query.lower()
        
        # Definition/Explanation
        if any(word in query_lower for word in ['what is', 'define', 'meaning', 'explain']):
            return "definition"
        
        # Comparison
        if any(word in query_lower for word in ['compare', 'difference', 'vs', 'versus', 'better']):
            return "comparison"
        
        # How-to / Process
        if any(word in query_lower for word in ['how to', 'how do', 'how can', 'steps', 'process']):
            return "howto"
        
        # Recommendation (high compliance risk)
        if any(word in query_lower for word in ['should i', 'recommend', 'suggest', 'best for me', 'which one']):
            return "recommendation"
        
        # List/Examples
        if any(word in query_lower for word in ['examples', 'types of', 'list', 'kinds of']):
            return "list"
        
        # Calculation/Numerical
        if any(word in query_lower for word in ['calculate', 'how much', 'cost', 'return', 'profit']):
            return "calculation"
        
        # General question
        return "general"
    
    @staticmethod
    def _is_followup_question(query: str, conversation_history: List[Dict]) -> bool:
        """
        Detect if this is a follow-up question that can reference previous context
        """
        if not conversation_history or len(conversation_history) < 1:
            return False
        
        query_lower = query.lower().strip()
        
        # Follow-up indicators (expanded to catch more patterns)
        followup_patterns = [
            r'^(and|also|what about|how about)',
            r'^(more|tell me more|explain more|in depth|in detail)',
            r'(more details?|more info|elaborate|expand)',
            r'^(that|this|it|they|these|those)',  # Pronoun references
            r'^(why|how come|but why)',
            r'^(can you|could you|please)',  # Polite requests often follow up
            r'(explain.*more|go.*deeper|dive.*deeper)',
        ]
        
        for pattern in followup_patterns:
            if re.search(pattern, query_lower):
                return True
        
        # Check if query is very short (likely referencing context)
        if len(query.split()) <= 4:  # Increased from 3 to catch "tell me in depth"
            return True
        
        return False
    
    @staticmethod
    def _build_optimization_instructions(
        complexity: ResponseComplexity,
        intent: str,
        is_followup: bool,
        query: str
    ) -> str:
        """
        Build specific instructions for the LLM to generate optimized responses
        """
        instructions = []
        
        # Complexity-based instructions
        if complexity == ResponseComplexity.MINIMAL:
            instructions.append(
                "⚡ MINIMAL RESPONSE (20-50 tokens MAXIMUM): This is a greeting or very simple query. "
                "Respond in 1-2 SHORT sentences only. NO introductions, NO explanations, NO lists. "
                "Examples: 'Hi' → 'Hello! I'm XtinAI. What can I help you with?', "
                "'What is ETF?' → 'An ETF is a basket of investments traded like a stock.' "
                "STOP after answering. Do NOT add extra content."
            )
        elif complexity == ResponseComplexity.BRIEF:
            instructions.append(
                "📝 BRIEF RESPONSE (80-150 tokens): Give a short explanation with key points. "
                "Maximum 3-4 sentences OR 2-3 bullet points. Keep it succinct. NO tables, NO lengthy examples."
            )
        elif complexity == ResponseComplexity.STANDARD:
            instructions.append(
                "📄 STANDARD RESPONSE (150-350 tokens): Provide a balanced explanation. "
                "Use headers, bullets, or a small table if appropriate. Be clear but not excessive."
            )
        else:  # COMPREHENSIVE
            instructions.append(
                "📚 COMPREHENSIVE RESPONSE (350-700 tokens): Provide detailed explanation. "
                "Use tables, multiple sections, examples. Be thorough but stay focused."
            )
        
        # Intent-based optimization
        if intent == "definition":
            instructions.append("Focus on: Clear definition → Key characteristics → Simple example (if needed)")
        elif intent == "comparison":
            instructions.append("Use a comparison table with 3-5 key differences. Be concise in each cell.")
        elif intent == "howto":
            instructions.append("Use numbered steps. Keep each step to 1-2 sentences.")
        elif intent == "recommendation":
            instructions.append("DO NOT give personalized advice. Explain general factors to consider instead.")
        elif intent == "list":
            instructions.append("Use bullet points. Limit to 5-7 items maximum. One line per item.")
        elif intent == "calculation":
            instructions.append("Show formula → Example with numbers → Brief explanation of result")
        
        # Follow-up optimization
        if is_followup:
            instructions.append(
                "This is a FOLLOW-UP question. Reference the previous context briefly. "
                "Don't repeat information already provided."
            )
        
        return "\n".join(instructions)
    
    @staticmethod
    def _get_max_tokens(complexity: ResponseComplexity) -> int:
        """Return maximum token limit based on complexity"""
        token_limits = {
            ResponseComplexity.MINIMAL: 50,        # Reduced from 100
            ResponseComplexity.BRIEF: 150,         # Reduced from 200
            ResponseComplexity.STANDARD: 350,      # Reduced from 400
            ResponseComplexity.COMPREHENSIVE: 700,  # Reduced from 800
        }
        return token_limits.get(complexity, 350)
    
    @staticmethod
    def _get_suggested_format(intent: str, complexity: ResponseComplexity) -> str:
        """Suggest the best format for the response"""
        if intent == "comparison" and complexity != ResponseComplexity.MINIMAL:
            return "table"
        elif intent in ["list", "howto"]:
            return "bullets_or_numbers"
        elif intent == "definition" and complexity == ResponseComplexity.MINIMAL:
            return "single_paragraph"
        else:
            return "mixed"
    
    @staticmethod
    def _is_repetitive(user_id: str, query: str) -> bool:
        """Check if user is asking the same question repeatedly"""
        if user_id not in TokenOptimizer._user_query_history:
            return False
        
        query_hash = hashlib.md5(query.lower().strip().encode()).hexdigest()
        recent_queries = TokenOptimizer._user_query_history[user_id][-10:]  # Last 10 queries
        
        # Count exact duplicates
        duplicate_count = sum(1 for q in recent_queries if q.get('hash') == query_hash)
        
        return duplicate_count >= 2  # Asked same question 2+ times
    
    @staticmethod
    def _is_rapid_fire(user_id: str) -> bool:
        """Detect if user is sending queries too rapidly (spam)"""
        if user_id not in TokenOptimizer._user_query_history:
            return False
        
        recent_queries = TokenOptimizer._user_query_history[user_id]
        if len(recent_queries) < 5:
            return False
        
        # Check if last 5 queries were within 30 seconds
        last_5 = recent_queries[-5:]
        time_span = last_5[-1]['timestamp'] - last_5[0]['timestamp']
        
        return time_span < 30  # 5 queries in under 30 seconds = spam
    
    @staticmethod
    def _is_gibberish(query: str) -> bool:
        """Detect if query is gibberish/nonsense"""
        # Check for excessive repeated characters
        if re.search(r'(.)\1{5,}', query):  # Same char repeated 6+ times
            return True
        
        # Check if query has reasonable vowel-consonant ratio
        vowels = len(re.findall(r'[aeiouAEIOU]', query))
        consonants = len(re.findall(r'[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]', query))
        
        if consonants > 0:
            vowel_ratio = vowels / consonants
            if vowel_ratio < 0.1 or vowel_ratio > 3:  # Unusual ratio
                return True
        
        # Check if query contains actual words
        words = query.split()
        if len(words) > 2:
            # At least 50% should be somewhat word-like (contain vowels)
            word_like = sum(1 for w in words if re.search(r'[aeiouAEIOU]', w))
            if word_like / len(words) < 0.5:
                return True
        
        return False
    
    @staticmethod
    def _is_semantic_duplicate(query: str, conversation_history: List[Dict]) -> bool:
        """Check if this question is semantically similar to recent ones"""
        if not conversation_history or len(conversation_history) < 2:
            return False
        
        # Simple semantic check: extract key financial terms
        key_terms = set(re.findall(r'\b(?:sip|etf|mutual fund|stock|bond|invest|portfolio|risk|return|dividend)\b', 
                                   query.lower()))
        
        if not key_terms:
            return False
        
        # Check last 3 user queries
        recent_user_queries = [msg.get('user', '') for msg in conversation_history[-3:] if 'user' in msg]
        
        for prev_query in recent_user_queries:
            prev_terms = set(re.findall(r'\b(?:sip|etf|mutual fund|stock|bond|invest|portfolio|risk|return|dividend)\b', 
                                       prev_query.lower()))
            
            # If 80%+ overlap in key terms, likely duplicate
            if prev_terms and len(key_terms.intersection(prev_terms)) / len(key_terms.union(prev_terms)) > 0.8:
                return True
        
        return False
    
    @staticmethod
    def _track_query(user_id: str, session_id: str, query: str):
        """Track user queries for spam detection"""
        if user_id not in TokenOptimizer._user_query_history:
            TokenOptimizer._user_query_history[user_id] = []
        
        query_hash = hashlib.md5(query.lower().strip().encode()).hexdigest()
        
        TokenOptimizer._user_query_history[user_id].append({
            'query': query,
            'hash': query_hash,
            'session_id': session_id,
            'timestamp': datetime.utcnow().timestamp(),
        })
        
        # Keep only last 50 queries per user to prevent memory bloat
        if len(TokenOptimizer._user_query_history[user_id]) > 50:
            TokenOptimizer._user_query_history[user_id] = TokenOptimizer._user_query_history[user_id][-50:]
    
    @staticmethod
    def cleanup_old_history():
        """Clean up query history older than 1 hour (call periodically)"""
        cutoff_time = (datetime.utcnow() - timedelta(hours=1)).timestamp()
        
        for user_id in list(TokenOptimizer._user_query_history.keys()):
            TokenOptimizer._user_query_history[user_id] = [
                q for q in TokenOptimizer._user_query_history[user_id]
                if q['timestamp'] > cutoff_time
            ]
            
            # Remove user if no recent queries
            if not TokenOptimizer._user_query_history[user_id]:
                del TokenOptimizer._user_query_history[user_id]
