from typing import List, Dict, Optional
from datetime import datetime

# LangChain + embeddings
try:
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    from langchain_community.vectorstores import Pinecone as PineconeVectorStore
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_community.document_loaders import (
        WebBaseLoader,
        PyPDFLoader,
        CSVLoader,
        UnstructuredMarkdownLoader,
    )
    from pinecone import Pinecone
except Exception:
    GoogleGenerativeAIEmbeddings = None  # type: ignore
    PineconeVectorStore = None  # type: ignore
    RecursiveCharacterTextSplitter = None  # type: ignore
    WebBaseLoader = None  # type: ignore
    PyPDFLoader = None  # type: ignore
    CSVLoader = None  # type: ignore
    UnstructuredMarkdownLoader = None  # type: ignore
    Pinecone = None  # type: ignore

class KnowledgeBaseManager:
    """Unified knowledge base with multiple specialized sources.
    This implementation is resilient: if vector DB or APIs are not configured,
    it will gracefully return empty results rather than raising.
    """

    def __init__(self, api_keys: Dict[str, Optional[str]]):
        self.gemini_api_key = api_keys.get('gemini')
        self.pinecone_api_key = api_keys.get('pinecone')
        self.alpha_vantage_key = api_keys.get('alpha_vantage')

        self.embeddings = None
        self.indexes = {
            'internal_kb': 'xtin-internal-kb',
            'market_research': 'xtin-market-research',
            'compliance': 'xtin-compliance-docs',
            'user_content': 'xtin-user-generated',
        }

        if GoogleGenerativeAIEmbeddings and self.gemini_api_key:
            try:
                self.embeddings = GoogleGenerativeAIEmbeddings(
                    model="models/embedding-001",
                    google_api_key=self.gemini_api_key,
                )
            except Exception:
                self.embeddings = None

    def query_knowledge_base(self, query: str, user_profile, k: int = 5) -> List[Dict]:
        # If any of the required components are missing, return []
        if not (self.embeddings and PineconeVectorStore and self.pinecone_api_key):
            return []

        searchable_indexes = ['internal_kb', 'compliance']
        if getattr(user_profile, 'user_type', None) and getattr(user_profile.user_type, 'value', '') == 'financial_pro':
            searchable_indexes.append('market_research')

        results: List[Dict] = []
        try:
            pc = Pinecone(api_key=self.pinecone_api_key)
            for index_name in set(searchable_indexes):
                try:
                    vectorstore = PineconeVectorStore(
                        index_name=self.indexes[index_name],
                        embedding=self.embeddings,
                    )
                    hits = vectorstore.similarity_search_with_score(query, k=k)
                    for doc, score in hits:
                        results.append({
                            'content': doc.page_content,
                            'metadata': getattr(doc, 'metadata', {}),
                            'relevance_score': float(score),
                            'source': index_name,
                        })
                except Exception:
                    continue
        except Exception:
            return []

        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        return results[:k]

class MarketDataIntegrator:
    def __init__(self, api_keys: Dict[str, Optional[str]]):
        self.alpha_vantage_key = api_keys.get('alpha_vantage')
        self.news_api_key = api_keys.get('news_api')

    def get_stock_data(self, symbol: str, exchange: str = "NSE") -> Dict:
        try:
            import yfinance as yf
            if exchange == "NSE":
                ticker_symbol = f"{symbol}.NS"
            elif exchange == "BSE":
                ticker_symbol = f"{symbol}.BO"
            else:
                ticker_symbol = symbol
            stock = yf.Ticker(ticker_symbol)
            info = getattr(stock, 'info', {})
            hist = stock.history(period="1d")
            return {
                'symbol': symbol,
                'exchange': exchange,
                'current_price': float(hist['Close'].iloc[-1]) if not hist.empty else None,
                'open': float(hist['Open'].iloc[-1]) if not hist.empty else None,
                'high': float(hist['High'].iloc[-1]) if not hist.empty else None,
                'low': float(hist['Low'].iloc[-1]) if not hist.empty else None,
                'volume': int(hist['Volume'].iloc[-1]) if not hist.empty else None,
                'market_cap': info.get('marketCap'),
                'pe_ratio': info.get('trailingPE'),
                'dividend_yield': info.get('dividendYield'),
                'company_name': info.get('longName'),
                'sector': info.get('sector'),
                'timestamp': datetime.utcnow().isoformat(),
                'source': 'yfinance',
            }
        except Exception as e:
            return {'error': f"Could not fetch data for {symbol}", 'details': str(e)}

    def get_market_indices(self) -> Dict:
        data = {}
        try:
            import yfinance as yf
            indices = {
                'NIFTY_50': '^NSEI',
                'SENSEX': '^BSESN',
                'NIFTY_BANK': '^NSEBANK',
            }
            for name, symbol in indices.items():
                try:
                    t = yf.Ticker(symbol)
                    hist = t.history(period="1d")
                    if not hist.empty:
                        current = float(hist['Close'].iloc[-1])
                        previous = float(hist['Open'].iloc[-1])
                        change = current - previous
                        change_percent = (change / previous) * 100 if previous else 0
                        data[name] = {
                            'value': round(current, 2),
                            'change': round(change, 2),
                            'change_percent': round(change_percent, 2),
                            'timestamp': datetime.utcnow().isoformat(),
                        }
                except Exception:
                    continue
        except Exception:
            pass
        return data

    def get_financial_news(self, topic: str = "stock market india", count: int = 5) -> List[Dict]:
        try:
            if self.news_api_key:
                import requests
                url = "https://newsapi.org/v2/everything"
                params = {
                    'q': topic,
                    'apiKey': self.news_api_key,
                    'language': 'en',
                    'sortBy': 'publishedAt',
                    'pageSize': count,
                }
                r = requests.get(url, params=params)
                data = r.json()
                return [
                    {
                        'title': a.get('title'),
                        'description': a.get('description'),
                        'url': a.get('url'),
                        'published_at': a.get('publishedAt'),
                        'source': (a.get('source') or {}).get('name'),
                    }
                    for a in data.get('articles', [])[:count]
                ]
            else:
                import feedparser
                feed = feedparser.parse("https://finance.yahoo.com/news/rssindex")
                return [
                    {
                        'title': e.title,
                        'description': getattr(e, 'summary', ''),
                        'url': e.link,
                        'published_at': getattr(e, 'published', ''),
                        'source': 'Yahoo Finance',
                    }
                    for e in getattr(feed, 'entries', [])[:count]
                ]
        except Exception:
            return []
