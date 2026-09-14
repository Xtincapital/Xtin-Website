from typing import Dict, List, Tuple, Optional
from enum import Enum
from .user_profiler import UserProfile

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ComplianceViolationType(Enum):
    PERSONALIZED_ADVICE = "personalized_advice"
    GUARANTEED_RETURNS = "guaranteed_returns"
    MISLEADING_CLAIM = "misleading_claim"
    INCOMPLETE_DISCLOSURE = "incomplete_disclosure"
    REGULATORY_BREACH = "regulatory_breach"

class ComplianceEngine:
    PROHIBITED_PHRASES = [
        "guaranteed returns",
        "risk-free",
        "sure profit",
        "cannot lose",
        "certain to",
        "will definitely",
        "100% returns",
        "no risk",
        "promised returns",
    ]

    HIGH_RISK_TRIGGERS = [
        "recommend",
        "should buy",
        "should sell",
        "this is a good stock",
        "you should invest",
        "perfect time to",
        "hot tip",
        "insider",
        "my advice",
    ]

    DISCLAIMER_TRIGGERS = {
        'investment_advice': ["invest", "buy", "sell", "trade", "portfolio", "stock pick"],
        'market_prediction': ["will rise", "will fall", "expected to", "forecast", "predict"],
        'returns': ["return", "gain", "profit", "growth", "appreciation"],
        'risk': ["risk", "volatile", "speculation", "derivative", "leverage"],
    }

    @staticmethod
    def assess_query_risk(query: str, user_profile: UserProfile) -> RiskLevel:
        q = query.lower()
        personalized_indicators = [
            "should i buy", "should i sell", "my portfolio",
            "what should i invest in", "which stock for me",
            "recommend for my", "advise me", "tell me what to buy",
        ]
        if any(phrase in q for phrase in personalized_indicators):
            return RiskLevel.CRITICAL

        if any(phrase in q for phrase in ["should i", "is this good", "price target"]):
            return RiskLevel.HIGH

        market_questions = [
            "what is the market", "how is sector", "market trend",
            "stock performance", "fund returns",
        ]
        if any(phrase in q for phrase in market_questions):
            return RiskLevel.MEDIUM

        return RiskLevel.LOW

    @staticmethod
    def validate_response_pre_generation(query: str, user_profile: UserProfile) -> Dict:
        risk_level = ComplianceEngine.assess_query_risk(query, user_profile)
        violations: List[Dict] = []
        warnings: List[Dict] = []

        if risk_level == RiskLevel.CRITICAL:
            if not user_profile.is_authenticated:
                violations.append({
                    'type': ComplianceViolationType.PERSONALIZED_ADVICE.value,
                    'message': 'Cannot provide personalized advice to unauthenticated users',
                    'action': 'redirect_to_advisor',
                })

        regulated_products = ['derivative', 'option', 'future', 'leverage', 'margin']
        if any(product in query.lower() for product in regulated_products):
            warnings.append({
                'type': 'regulated_product',
                'message': 'Response must include derivative risk warnings',
                'required_disclaimer': 'DERIVATIVE_RISK',
            })

        return {
            'risk_level': risk_level.value,
            'violations': violations,
            'warnings': warnings,
            'requires_human_review': len(violations) > 0,
            'can_proceed': len(violations) == 0,
        }

    @staticmethod
    def validate_response_post_generation(bot_response: str, query: str, risk_level: RiskLevel) -> Tuple[str, List[Dict]]:
        violations: List[Dict] = []
        modified_response = bot_response

        # Clean up formatting issues before adding official disclaimers
        import re
        # Remove horizontal rules (*** or ---)
        modified_response = re.sub(r'\n\*\*\*\n', '\n', modified_response)
        modified_response = re.sub(r'\n---\n', '\n', modified_response)
        modified_response = re.sub(r'^\*\*\*$', '', modified_response, flags=re.MULTILINE)
        modified_response = re.sub(r'^---$', '', modified_response, flags=re.MULTILINE)
        
        # Remove Gemini's own disclaimer sections (they duplicate our official ones)
        # Strategy 1: Remove any paragraph that starts with "Disclaimer:" or similar
        modified_response = re.sub(
            r'\n\n\*\*(Disclaimer|Important Note|Compliance Note|Notice):\*\*[^\n]*(?:\n[^\n]+)*?(?=\n\n|\Z)',
            '',
            modified_response,
            flags=re.IGNORECASE
        )
        
        # Strategy 2: Find paragraphs that contain multiple disclaimer keywords
        paragraphs = modified_response.split('\n\n')
        cleaned_paragraphs = []
        disclaimer_keywords = ['personalized', 'financial advisor', 'registered', 'consult', 'risk tolerance', 'investment recommendation', 'guarantee', 'not provide', 'educational purposes only']
        
        for para in paragraphs:
            para_lower = para.lower()
            # Count how many disclaimer keywords appear in this paragraph
            keyword_count = sum(1 for kw in disclaimer_keywords if kw in para_lower)
            # If a paragraph has 3+ disclaimer keywords, it's likely Gemini's disclaimer
            # OR if it has 2+ keywords AND the word "disclaimer" or "reminder"
            is_disclaimer = (keyword_count >= 3) or (keyword_count >= 2 and ('disclaimer' in para_lower or 'reminder' in para_lower or 'compliance' in para_lower))
            if is_disclaimer:
                continue  # Skip this paragraph (don't add it to cleaned)
            cleaned_paragraphs.append(para)
        
        modified_response = '\n\n'.join(cleaned_paragraphs)
        # Clean up any trailing whitespace
        modified_response = modified_response.strip()

        for phrase in ComplianceEngine.PROHIBITED_PHRASES:
            if phrase in bot_response.lower():
                violations.append({
                    'type': ComplianceViolationType.GUARANTEED_RETURNS.value,
                    'phrase': phrase,
                    'severity': 'critical',
                })
                modified_response = modified_response.replace(phrase, "[REMOVED: PROHIBITED CLAIM]")

        for trigger in ComplianceEngine.HIGH_RISK_TRIGGERS:
            if trigger in bot_response.lower():
                violations.append({
                    'type': ComplianceViolationType.PERSONALIZED_ADVICE.value,
                    'trigger': trigger,
                    'severity': 'high',
                })

        required_disclaimers: List[str] = []
        for category, triggers in ComplianceEngine.DISCLAIMER_TRIGGERS.items():
            if any(trigger in bot_response.lower() for trigger in triggers):
                required_disclaimers.append(category)

        modified_response = ComplianceEngine.inject_disclaimers(modified_response, required_disclaimers, risk_level)
        return modified_response, violations

    @staticmethod
    def inject_disclaimers(response: str, categories: List[str], risk_level: RiskLevel) -> str:
        disclaimers: List[str] = []
        if risk_level in [RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL]:
            disclaimers.append(
                "\n\n---\n"
                "⚠️ **Disclaimer**: This information is for educational purposes only and "
                "should not be considered as personalized financial advice. "
            )
        if 'investment_advice' in categories or risk_level == RiskLevel.HIGH:
            disclaimers.append(
                "Investments in securities market are subject to market risks. "
                "Please read all related documents carefully before investing. "
            )
        if 'returns' in categories or 'market_prediction' in categories:
            disclaimers.append("Past performance is not indicative of future results. ")
        if 'risk' in categories:
            disclaimers.append(
                "All investments involve varying degrees of risk, including loss of principal. "
            )
        disclaimers.append(
            "For personalized advice, please consult a qualified financial advisor. "
        )
        disclaimers.append(
            "\n💼 **Want expert guidance?** [Schedule a consultation]"
            "(/advisory) with our professional advisors."
        )
        return response + "".join(disclaimers)

    @staticmethod
    def create_audit_log(user_id: str, query: str, response: str, risk_level: RiskLevel, violations: List[Dict], user_profile: UserProfile) -> Dict:
        from datetime import datetime
        prohibited = ComplianceEngine.PROHIBITED_PHRASES
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'user_id': user_id,
            'user_type': user_profile.user_type.value,
            'session_id': user_profile.user_id,
            'query': query,
            'response': response,
            'risk_level': risk_level.value,
            'violations': violations,
            'requires_review': len(violations) > 0 or risk_level == RiskLevel.CRITICAL,
            'compliance_flags': {
                'contains_advice': 'recommend' in response.lower(),
                'contains_prediction': any(word in response.lower() for word in ['will', 'forecast', 'expect']),
                'contains_guarantee': any(phrase in response.lower() for phrase in prohibited),
                'disclaimers_added': 'Disclaimer' in response,
            },
        }
        return log_entry
