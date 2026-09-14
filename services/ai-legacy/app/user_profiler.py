from enum import Enum
from typing import Optional, List

class UserType(Enum):
    RETAIL_BEGINNER = "retail_beginner"
    RETAIL_INTERMEDIATE = "retail_intermediate"
    FINANCIAL_PROFESSIONAL = "financial_pro"
    INTERNAL_SUPPORT = "internal_support"
    INSTITUTIONAL = "institutional"

class UserProfile:
    """Complete user profile for adaptive responses"""

    def __init__(self):
        self.user_id: str = ""
        self.user_type: UserType = UserType.RETAIL_BEGINNER
        self.experience_level: int = 0  # 0-10 scale
        self.preferred_language: str = "en"
        self.knowledge_areas: List[str] = []
        self.communication_preference: str = "simple"  # simple/technical/balanced
        self.is_authenticated: bool = False
        self.role_permissions: List[str] = []  # What data they can access

class UserProfiler:
    """Detect and classify users for adaptive communication"""

    @staticmethod
    def detect_user_type(user_id: str, query: str, metadata: dict) -> UserProfile:
        """
        Determine user type from multiple signals
        """
        profile = UserProfile()
        profile.user_id = user_id

        # Signal 1: Explicit identification (logged-in users)
        if metadata.get('authenticated'):
            profile.is_authenticated = True
            role = metadata.get('role', UserType.RETAIL_BEGINNER.value)
            if isinstance(role, str):
                try:
                    profile.user_type = UserType(role)
                except ValueError:
                    profile.user_type = UserType.RETAIL_BEGINNER
            else:
                profile.user_type = UserType.RETAIL_BEGINNER
            profile.experience_level = metadata.get('experience_level', 0)
            profile.role_permissions = metadata.get('permissions', [])
            return profile

        # Signal 2: Query complexity analysis
        complexity_score = UserProfiler.analyze_query_complexity(query)
        
        # Check if query is just a greeting or very short (neutral/unknown level)
        query_lower = query.lower().strip()
        is_greeting = any(greeting in query_lower for greeting in ['hi', 'hello', 'hey', 'hiya', 'greetings'])
        is_very_short = len(query.strip()) < 10 and '?' not in query
        
        # For greetings/neutral queries, default to INTERMEDIATE (don't assume beginner)
        if (is_greeting or is_very_short) and complexity_score <= 1:
            profile.user_type = UserType.RETAIL_INTERMEDIATE
            profile.experience_level = 5
            profile.communication_preference = "balanced"
        elif complexity_score > 7:
            profile.user_type = UserType.FINANCIAL_PROFESSIONAL
            profile.experience_level = 8
            profile.communication_preference = "technical"
        elif complexity_score > 4:
            profile.user_type = UserType.RETAIL_INTERMEDIATE
            profile.experience_level = 5
            profile.communication_preference = "balanced"
        else:
            profile.user_type = UserType.RETAIL_BEGINNER
            profile.experience_level = 2
            profile.communication_preference = "simple"

        return profile

    @staticmethod
    def analyze_query_complexity(query: str) -> int:
        """
        Score query from 0-10 based on technical terminology
        """
        advanced_terms = [
            'alpha', 'beta', 'sharpe ratio', 'sortino', 'volatility smile',
            'delta neutral', 'arbitrage', 'black-scholes', 'var', 'cvar',
            'bollinger bands', 'macd divergence', 'fibonacci retracement',
            'option greeks', 'implied volatility', 'term structure',
            'yield curve', 'duration', 'convexity', 'credit spread'
        ]
        intermediate_terms = [
            'p/e ratio', 'market cap', 'dividend yield', 'eps', 'roe',
            'technical analysis', 'support resistance', 'moving average',
            'rsi', 'candlestick', 'portfolio', 'diversification',
            'asset allocation', 'rebalancing', 'tax loss harvesting'
        ]
        beginner_phrases = [
            'what is', 'how to start', 'explain', 'i am new',
            'beginner', 'simple terms', "dont understand",
            'can you help', 'i want to learn'
        ]

        q = query.lower()
        if any(phrase in q for phrase in beginner_phrases):
            return 1

        advanced_count = sum(1 for term in advanced_terms if term in q)
        intermediate_count = sum(1 for term in intermediate_terms if term in q)

        if advanced_count >= 2:
            return 9
        elif advanced_count == 1:
            return 7
        elif intermediate_count >= 2:
            return 5
        elif intermediate_count == 1:
            return 3
        else:
            return 2

    @staticmethod
    def get_audience_specific_instructions(profile: UserProfile) -> str:
        if profile.user_type == UserType.RETAIL_BEGINNER:
            return (
                "\n**AUDIENCE: Retail Beginner Investor**\n\n"
                "Communication Guidelines:\n"
                "- Use simple, jargon-free language with clear formatting\n"
                "- Define all technical terms when first mentioned\n"
                "- Use analogies and examples from everyday life\n"
                "- Break complex concepts into bullet points and numbered steps\n"
                "- Encourage questions and learning\n"
                "- Use tables and visual formatting to compare options\n"
                "- Provide step-by-step guidance\n\n"
                "Example Adaptations:\n"
                "- Use: '**Price-to-Earnings (P/E) ratio** - measures how expensive a stock is'\n"
                "- Use tables to compare investment options\n"
                "- Always explain WHY something matters, not just WHAT it is\n\n"
                "Tone: Patient, educational, supportive, never condescending\n"
            )
        elif profile.user_type == UserType.RETAIL_INTERMEDIATE:
            return (
                "\n**AUDIENCE: Intermediate Retail Investor**\n\n"
                "Communication Guidelines:\n"
                "- Use standard financial terminology (explain only advanced concepts)\n"
                "- Provide moderate depth with actionable insights in structured format\n"
                "- Use bullet points, tables, and clear sections\n"
                "- Reference common investing strategies with comparisons\n"
                "- Include relevant metrics and data points in organized layout\n"
                "- Assume basic knowledge of markets\n\n"
                "Example Adaptations:\n"
                "- Present data in tables when comparing multiple options\n"
                "- Use numbered lists for sequential processes\n"
                "- Link concepts to strategies with clear headers\n\n"
                "Tone: Informative, professional yet approachable, collaborative\n"
            )
        elif profile.user_type == UserType.FINANCIAL_PROFESSIONAL:
            return (
                "\n**AUDIENCE: Financial Professional (Advisor/Trader/Analyst)**\n\n"
                "Communication Guidelines:\n"
                "- Use advanced technical terminology freely\n"
                "- Provide detailed quantitative analysis\n"
                "- Reference academic research and methodologies\n"
                "- Discuss nuanced strategies and edge cases\n"
                "- Include statistical measures and risk metrics\n"
                "- Assume deep domain expertise\n"
                "- Be precise and data-driven\n"
            )
        elif profile.user_type == UserType.INTERNAL_SUPPORT:
            return (
                "\n**AUDIENCE: Internal Support Agent (Xtin Staff)**\n\n"
                "Communication Guidelines:\n"
                "- Provide procedural, step-by-step instructions\n"
                "- Reference specific internal systems and tools\n"
                "- Include exact navigation paths and button names\n"
                "- Cite internal policy documents and version numbers\n"
                "- Focus on 'how to' rather than 'what is'\n"
                "- Use internal terminology and system names\n"
                "- Provide troubleshooting steps\n"
            )
        else:
            return (
                "\n**AUDIENCE: General User (Default)**\n\n"
                "Use balanced language - professional but accessible.\n"
                "Define key terms briefly. Provide clear, actionable information.\n"
            )
