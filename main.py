from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from io import BytesIO, StringIO
import json
import os
import csv
import re
import hmac
import hashlib
from dotenv import load_dotenv
import statistics
import httpx

try:
    from openpyxl import load_workbook
except ImportError:  # pragma: no cover - dependency is optional at import time
    load_workbook = None

try:
    import xlrd
except ImportError:  # pragma: no cover
    xlrd = None

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover
    PdfReader = None

# Load environment variables
# Load .env from this file's directory so the server works from any cwd.
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Get port from environment or default to 8001
PORT = int(os.getenv("PORT", 8001))
HOST = "0.0.0.0"  # Listen on all interfaces for production

# CORS configuration - set ALLOWED_ORIGINS as comma-separated values for production.
_env_origins = os.getenv("ALLOWED_ORIGINS", "")
DEFAULT_ALLOWED_ORIGINS = [
    "https://xtin-journal.vercel.app",
    "https://Xtin-journal.vercel.app",
    "https://xtinjournal.website",
    "https://www.xtinjournal.website",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "null"  # file:// origins during local testing
]
ALLOWED_ORIGINS = [o.strip() for o in _env_origins.split(",") if o.strip()] if _env_origins else DEFAULT_ALLOWED_ORIGINS
ALLOW_ALL_ORIGINS = "*" in ALLOWED_ORIGINS
LOCAL_ORIGIN_REGEX = r"^https?://(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$"

app = FastAPI(
    title="Xtin Journal AI Coach API",
    description="Advanced Trading Intelligence for Xtin Journal",
    version="2.0"
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if ALLOW_ALL_ORIGINS else ALLOWED_ORIGINS,
    allow_origin_regex=None if ALLOW_ALL_ORIGINS else LOCAL_ORIGIN_REGEX,
    # Browsers reject credentials when allow_origins is wildcard.
    allow_credentials=not ALLOW_ALL_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== MODELS ====================

class TradeData(BaseModel):
    id: int
    symbol: str
    entry_price: float
    exit_price: float
    quantity: int
    profit_loss: float
    trading_type: str
    market: str
    strategy: str
    date: str
    exit_date: Optional[str] = None
    time_in_trade: Optional[str] = None
    win_loss: str

class ProfileRequest(BaseModel):
    user_id: str
    trades: Optional[List[TradeData]] = []

class AnalyzeRequest(BaseModel):
    user_id: str
    trades: List[TradeData]

class ChatRequest(BaseModel):
    message: str
    trades: Optional[List[dict]] = None
    user_id: Optional[str] = None
    display_name: str = ""
    history: Optional[List[dict]] = None
    goals: Optional[List[dict]] = None
    client_tier: str = "free"  # trusted only in local dev; prod uses Supabase
    currency: str = "INR"

class BehavioralAlert(BaseModel):
    type: str
    severity: str
    message: str
    recommendation: str

class PreTradeRequest(BaseModel):
    user_id: str
    symbol: Optional[str] = "Planned trade"
    trade_type: Optional[str] = "Manual"
    market: Optional[str] = "Unknown"
    strategy: Optional[str] = "Journal setup"
    risk_amount: float = 0
    potential_profit: float = 0

class WeeklyReviewRequest(BaseModel):
    user_id: str
    trades: List[TradeData]
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class SubscriptionCreateRequest(BaseModel):
    user_id: str
    plan: str
    payment_method: str

class SubscriptionCancelRequest(BaseModel):
    user_id: str

class AiOrderRequest(BaseModel):
    user_id: str
    package_id: str

class AiPaymentVerifyRequest(BaseModel):
    user_id: str
    package_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class PlanOrderRequest(BaseModel):
    user_id: str
    plan_id: str
    user_email: str = ""
    currency: str = "INR"
    region: Optional[str] = None

class PlanVerifyRequest(BaseModel):
    user_id: str
    plan_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    user_email: str = ""
    currency: str = "INR"
    region: Optional[str] = None

class ImportTradeResponse(BaseModel):
    trades: List[Dict[str, Any]]
    count: int
    file_type: str

# Lightweight in-memory stores (replace with DB in production)
SUBSCRIPTION_STORE: Dict[str, Dict[str, Any]] = {}
INVOICE_STORE: Dict[str, List[Dict[str, Any]]] = {}
AI_PACKAGES: Dict[str, Dict[str, Any]] = {
    "ai_500": {"id": "ai_500", "amount_inr": 500, "tokens": 300_000, "label": "Starter AI Pack"},
    "ai_1000": {"id": "ai_1000", "amount_inr": 1000, "tokens": 700_000, "label": "Growth AI Pack"},
    "ai_2000": {"id": "ai_2000", "amount_inr": 2000, "tokens": 1_600_000, "label": "Power AI Pack"},
}
LOCAL_FREE_AI_TOKENS = 20_000
PRODUCTION_FREE_AI_TOKENS = 300_000
AI_WALLET_STORE: Dict[str, Dict[str, Any]] = {}
AI_ORDER_STORE: Dict[str, Dict[str, Any]] = {}

# ==================== IMPORT HELPERS ====================

def normalize_import_header(header: Any) -> str:
    value = str(header or "").replace("\ufeff", "").lower()
    value = value.replace("&", " and ")
    value = re.sub(r"[%₹$€£¥]", " ", value)
    value = re.sub(r"[^a-z0-9]+", " ", value).strip()
    return re.sub(r"\s+", " ", value)

def import_header_aliases(keys: List[str]) -> List[str]:
    aliases = []
    for key in keys:
        normalized = normalize_import_header(key)
        if normalized:
            aliases.append(normalized)
            aliases.append(normalized.replace(" ", ""))
    return aliases

def parse_import_number(value: Any) -> Optional[float]:
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip()
    if not text:
        return None
    is_negative = bool(re.match(r"^\(.*\)$", text) or re.search(r"\b(dr|debit|loss)\b", text, re.I))
    text = re.sub(r"[,\s₹$€£¥()]", "", text)
    text = re.sub(r"\b(cr|credit|dr|debit|profit|loss)\b", "", text, flags=re.I)
    match = re.search(r"[-+]?\d*\.?\d+", text)
    if not match:
        return None
    number = float(match.group(0))
    return -number if is_negative and number > 0 else number

def parse_import_date(value: Any) -> str:
    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d")
    text = str(value or "").strip()
    if not text:
        return ""
    formats = [
        "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d",
        "%d.%m.%Y", "%Y.%m.%d", "%d-%b-%Y", "%d %b %Y",
        "%d-%B-%Y", "%d %B %Y", "%Y-%m-%d %H:%M:%S",
        "%d/%m/%Y %H:%M:%S", "%d-%m-%Y %H:%M:%S"
    ]
    for fmt in formats:
        try:
            return datetime.strptime(text, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    try:
        # Handles some ISO-like values exported by spreadsheets.
        return datetime.fromisoformat(text.replace("Z", "+00:00")).strftime("%Y-%m-%d")
    except ValueError:
        return text

def rows_to_import_trades(rows: List[List[Any]]) -> List[Dict[str, Any]]:
    if len(rows) < 2:
        return []
    headers = [normalize_import_header(cell) for cell in rows[0]]
    trades = []
    for row in rows[1:]:
        if not row or all(str(cell or "").strip() == "" for cell in row):
            continue
        row_data = {
            header: row[index] if index < len(row) else ""
            for index, header in enumerate(headers)
            if header
        }
        trade = map_import_row_to_trade(row_data)
        if trade:
            trades.append(trade)
    return trades

def map_import_row_to_trade(row: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    def find_value(keys: List[str]) -> Any:
        for key in import_header_aliases(keys):
            value = row.get(key)
            if value is not None and str(value).strip() != "":
                return value
        return ""

    date_value = find_value(["date", "trade date", "entry date", "entry day", "datetime", "time", "date/time", "order execution time", "trade execution time"])
    exit_date_value = find_value(["exit day", "exit date", "close date", "closed date", "closing date", "exit datetime", "exit date/time"])
    asset = str(find_value(["asset", "asset/stock", "stock", "symbol", "ticker", "instrument", "asset name", "scrip", "scrip name", "security", "contract"]) or "").strip()
    quantity = parse_import_number(find_value(["quantity", "qty", "qty.", "volume", "size", "shares", "lots", "lot size", "filled qty", "executed quantity"]))
    entry_price = parse_import_number(find_value(["entry price", "entry", "buy price", "price", "entryprice", "entry avg price", "average buy price", "avg buy price", "buy avg", "buy average"]))
    exit_price = parse_import_number(find_value(["exit price", "exit", "sell price", "exitprice", "exit avg price", "average sell price", "avg sell price", "sell avg", "sell average"]))
    buy_sell_raw = str(find_value(["buysell", "buy/sell", "action", "type", "direction", "b/s"]) or "").lower()
    buy_sell = "Sell" if buy_sell_raw.startswith("s") or "short" in buy_sell_raw else "Buy"
    brokerage = parse_import_number(find_value(["brokerage", "fee", "fees", "charges", "total charges"])) or 0
    imported_pnl = parse_import_number(find_value(["p&l", "pnl", "p/l", "profit loss", "profit/loss", "net pnl", "net p&l", "realized pnl", "realised pnl"]))

    if exit_price is None and imported_pnl is not None and quantity and entry_price is not None:
        exit_price = entry_price + ((imported_pnl + brokerage) / quantity) if buy_sell == "Buy" else entry_price - ((imported_pnl + brokerage) / quantity)

    if not date_value or not asset or quantity is None or entry_price is None or exit_price is None:
        return None

    pnl = (exit_price - entry_price) * quantity - brokerage if buy_sell == "Buy" else (entry_price - exit_price) * quantity - brokerage
    tags_raw = str(find_value(["tags", "labels"]) or "imported")
    tags = [tag.strip() for tag in tags_raw.split(",") if tag.strip()] or ["imported"]
    currency = str(find_value(["currency", "trade currency", "ccy"]) or "INR").strip().upper() or "INR"

    return {
        "date": parse_import_date(date_value),
        "exitDate": parse_import_date(exit_date_value) if exit_date_value else parse_import_date(date_value),
        "entryTime": str(find_value(["entry time", "entrytime"]) or "09:15:00"),
        "exitTime": str(find_value(["exit time", "exittime"]) or "15:30:00"),
        "type": str(find_value(["trading type", "trade type", "category", "product", "product type"]) or "Intraday"),
        "market": str(find_value(["trade market", "market", "segment"]) or "Equity"),
        "asset": asset,
        "currency": currency,
        "quantity": quantity,
        "entryPrice": entry_price,
        "targetPrice": parse_import_number(find_value(["target price", "target"])) or 0,
        "stopLoss": parse_import_number(find_value(["stop loss", "sl"])) or 0,
        "exitPrice": exit_price,
        "brokerage": brokerage,
        "strategy": str(find_value(["trading strategy", "strategy", "setup"]) or "Breakout"),
        "margin": parse_import_number(find_value(["margin", "capital", "required capital", "turnover"])) or quantity * entry_price,
        "buySell": buy_sell,
        "pnl": pnl,
        "emotion": str(find_value(["emotion", "emotion/psychology", "psychology"]) or "neutral").lower(),
        "notes": str(find_value(["notes", "trade notes/journal", "journal", "comment", "description"]) or "Imported from file"),
        "tags": tags,
        "strikePrice": parse_import_number(find_value(["strike price", "strike", "strikeprice", "strike_price"])),
        "optionType": str(find_value(["option type", "optiontype", "opt type", "call/put", "cp", "option_type"]) or "") or None,
        "underlyingPrice": parse_import_number(find_value(["underlying price", "underlying", "underlyingprice", "spot price", "spot", "underlying_price"])),
        "impliedVolatility": parse_import_number(find_value(["implied volatility", "iv", "volatility", "impliedvolatility", "implied_volatility", "vol"])),
        "daysToExpiry": parse_import_number(find_value(["days to expiry", "days to expiration", "dte", "daystoexpiry", "days_to_expiry"]))
    }

def parse_csv_import(content: bytes) -> List[Dict[str, Any]]:
    text = content.decode("utf-8-sig", errors="replace")
    rows = list(csv.reader(StringIO(text)))
    return rows_to_import_trades(rows)

def parse_excel_import(content: bytes, filename: str) -> List[Dict[str, Any]]:
    lower_name = filename.lower()
    rows: List[List[Any]] = []
    if lower_name.endswith(".xls"):
        if xlrd is None:
            raise HTTPException(status_code=500, detail="XLS parser is not installed")
        workbook = xlrd.open_workbook(file_contents=content)
        sheet = workbook.sheet_by_index(0)
        for row_idx in range(sheet.nrows):
            row = []
            for col_idx in range(sheet.ncols):
                cell = sheet.cell(row_idx, col_idx)
                if cell.ctype == xlrd.XL_CELL_DATE:
                    row.append(datetime(*xlrd.xldate_as_tuple(cell.value, workbook.datemode)))
                else:
                    row.append(cell.value)
            rows.append(row)
    else:
        if load_workbook is None:
            raise HTTPException(status_code=500, detail="XLSX parser is not installed")
        workbook = load_workbook(BytesIO(content), read_only=True, data_only=True)
        sheet = workbook[workbook.sheetnames[0]]
        rows = [list(row) for row in sheet.iter_rows(values_only=True)]
    return rows_to_import_trades(rows)

def parse_pdf_import(content: bytes) -> List[Dict[str, Any]]:
    if PdfReader is None:
        raise HTTPException(status_code=500, detail="PDF parser is not installed")
    reader = PdfReader(BytesIO(content))
    lines: List[str] = []
    for page in reader.pages:
        text = page.extract_text() or ""
        lines.extend(line.strip() for line in text.splitlines() if line.strip())
    return parse_pdf_lines_to_import_trades(lines)

def parse_pdf_lines_to_import_trades(lines: List[str]) -> List[Dict[str, Any]]:
    trades = []
    date_regex = re.compile(r"\b(\d{4}[-/.]\d{2}[-/.]\d{2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})\b")
    action_regex = re.compile(r"\b(buy|sell|long|short)\b", re.I)
    for line in lines:
        date_match = date_regex.search(line)
        action_match = action_regex.search(line)
        if not date_match or not action_match:
            continue
        clean_line = date_regex.sub(" ", line)
        numbers = [parse_import_number(value) for value in re.findall(r"[-+()]?[\d,]+(?:\.\d+)?", clean_line)]
        numbers = [number for number in numbers if number is not None]
        if len(numbers) < 3:
            continue
        words = [
            word for word in re.split(r"\s+", clean_line)
            if len(word) > 1
            and not action_regex.search(word)
            and not re.match(r"[-+()]?[\d,.]+$", word)
            and word.lower() not in {"intraday", "scalping", "swing", "equity", "futures", "options", "commodity", "forex", "crypto"}
        ]
        quantity, entry_price, exit_price = numbers[:3]
        buy_sell = "Buy" if action_match.group(1).lower() in {"buy", "long"} else "Sell"
        pnl = (exit_price - entry_price) * quantity if buy_sell == "Buy" else (entry_price - exit_price) * quantity
        trades.append({
            "date": parse_import_date(date_match.group(1)),
            "exitDate": parse_import_date(date_match.group(1)),
            "entryTime": "09:15:00",
            "exitTime": "15:30:00",
            "type": "Intraday",
            "market": "Equity",
            "asset": " ".join(words) or "Unknown",
            "currency": "INR",
            "quantity": quantity,
            "entryPrice": entry_price,
            "targetPrice": 0,
            "stopLoss": 0,
            "exitPrice": exit_price,
            "brokerage": 0,
            "strategy": "Breakout",
            "margin": quantity * entry_price,
            "buySell": buy_sell,
            "pnl": pnl,
            "emotion": "neutral",
            "notes": "Imported from PDF statement",
            "tags": ["imported", "pdf"]
        })
    return trades

# ==================== AI CREDIT + CLAUDE HELPERS ====================

def supabase_state_enabled() -> bool:
    return bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)

def supabase_headers() -> Dict[str, str]:
    return {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "content-type": "application/json"
    }

def load_ai_wallet_from_supabase(user_id: str) -> Optional[Dict[str, Any]]:
    if not supabase_state_enabled():
        return None
    try:
        with httpx.Client(timeout=8) as client:
            response = client.get(
                f"{SUPABASE_URL}/rest/v1/journal_user_state",
                headers=supabase_headers(),
                params={
                    "user_id": f"eq.{user_id}",
                    "state_key": "eq.ai_wallet",
                    "select": "payload"
                }
            )
        if response.status_code >= 400:
            return None
        rows = response.json()
        if rows:
            return rows[0].get("payload")
    except Exception as exc:
        print(f"Supabase wallet load skipped: {exc}")
    return None

def save_ai_wallet_to_supabase(wallet: Dict[str, Any]) -> None:
    if not supabase_state_enabled():
        return
    try:
        payload = {
            "user_id": wallet["user_id"],
            "state_key": "ai_wallet",
            "payload": wallet,
            "updated_at": datetime.now().isoformat()
        }
        with httpx.Client(timeout=8) as client:
            client.post(
                f"{SUPABASE_URL}/rest/v1/journal_user_state",
                headers={**supabase_headers(), "prefer": "resolution=merge-duplicates,return=minimal"},
                params={"on_conflict": "user_id,state_key"},
                json=payload
            )
    except Exception as exc:
        print(f"Supabase wallet save skipped: {exc}")

def is_local_runtime() -> bool:
    return PORT == 8001 and os.getenv("RENDER") != "true"

def get_free_ai_token_grant() -> int:
    override = os.getenv("FREE_AI_TOKENS", "").strip()
    if override:
        try:
            return max(0, int(override))
        except ValueError:
            pass
    return LOCAL_FREE_AI_TOKENS if is_local_runtime() else PRODUCTION_FREE_AI_TOKENS

def apply_free_ai_tokens(wallet: Dict[str, Any]) -> Dict[str, Any]:
    grant = get_free_ai_token_grant()
    if grant <= 0 or wallet.get("free_tokens_granted"):
        return wallet
    wallet["token_balance"] = int(wallet.get("token_balance", 0) or 0) + grant
    wallet["free_tokens_granted"] = grant
    wallet["free_tokens_granted_at"] = datetime.now().isoformat()
    wallet["free_tokens_runtime"] = "local" if is_local_runtime() else "production"
    wallet["updated_at"] = datetime.now().isoformat()
    save_ai_wallet_to_supabase(wallet)
    return wallet

def get_ai_wallet(user_id: str) -> Dict[str, Any]:
    supabase_wallet = load_ai_wallet_from_supabase(user_id)
    if supabase_wallet:
        apply_free_ai_tokens(supabase_wallet)
        AI_WALLET_STORE[user_id] = supabase_wallet
        return supabase_wallet

    wallet = AI_WALLET_STORE.get(user_id)
    if wallet:
        apply_free_ai_tokens(wallet)
        return wallet
    grant = get_free_ai_token_grant()
    wallet = {
        "user_id": user_id,
        "token_balance": grant,
        "tokens_purchased": 0,
        "tokens_used": 0,
        "free_tokens_granted": grant,
        "free_tokens_granted_at": datetime.now().isoformat() if grant else None,
        "free_tokens_runtime": "local" if is_local_runtime() else "production",
        "credited_payments": [],
        "updated_at": datetime.now().isoformat()
    }
    AI_WALLET_STORE[user_id] = wallet
    save_ai_wallet_to_supabase(wallet)
    return wallet

def add_ai_tokens(user_id: str, tokens: int, source: str, amount_inr: int = 0, payment_id: Optional[str] = None) -> Dict[str, Any]:
    wallet = get_ai_wallet(user_id)
    credited = wallet.setdefault("credited_payments", [])
    if payment_id and payment_id in credited:
        return wallet
    wallet["token_balance"] += tokens
    wallet["tokens_purchased"] += tokens
    wallet["last_recharge"] = {
        "source": source,
        "amount_inr": amount_inr,
        "tokens": tokens,
        "payment_id": payment_id,
        "at": datetime.now().isoformat()
    }
    if payment_id:
        credited.append(payment_id)
        wallet["credited_payments"] = credited[-25:]
    wallet["updated_at"] = datetime.now().isoformat()
    AI_WALLET_STORE[user_id] = wallet
    save_ai_wallet_to_supabase(wallet)
    return wallet

def deduct_ai_tokens(user_id: str, tokens: int) -> Dict[str, Any]:
    wallet = get_ai_wallet(user_id)
    wallet["token_balance"] = max(0, wallet["token_balance"] - tokens)
    wallet["tokens_used"] += tokens
    wallet["updated_at"] = datetime.now().isoformat()
    AI_WALLET_STORE[user_id] = wallet
    save_ai_wallet_to_supabase(wallet)
    return wallet

def ensure_ai_tokens(user_id: str, minimum: int = 800) -> Dict[str, Any]:
    wallet = get_ai_wallet(user_id)
    if wallet["token_balance"] < minimum:
        raise HTTPException(
            status_code=402,
            detail={
                "message": "AI token balance is low. Please recharge to continue.",
                "token_balance": wallet["token_balance"],
                "plans": list(AI_PACKAGES.values())
            }
        )
    return wallet

def trade_to_dict(trade: Any) -> Dict[str, Any]:
    if isinstance(trade, dict):
        return trade
    if hasattr(trade, "dict"):
        return trade.dict()
    return trade.__dict__ if hasattr(trade, "__dict__") else {}

def compact_trade_context(trades: List[Any], max_recent: int = 12) -> str:
    rows = [trade_to_dict(t) for t in trades or []]
    if not rows:
        return "No trades logged."

    def pnl(t):
        return float(t.get("profit_loss", t.get("pnl", 0)) or 0)

    total = len(rows)
    total_pnl = sum(pnl(t) for t in rows)
    wins = sum(1 for t in rows if pnl(t) > 0)
    losses = sum(1 for t in rows if pnl(t) < 0)
    win_rate = (wins / total * 100) if total else 0
    strategies: Dict[str, Dict[str, float]] = {}
    markets: Dict[str, int] = {}
    for t in rows:
        strategy = t.get("strategy") or "Unknown"
        market = t.get("market") or "Unknown"
        strategies.setdefault(strategy, {"count": 0, "pnl": 0})
        strategies[strategy]["count"] += 1
        strategies[strategy]["pnl"] += pnl(t)
        markets[market] = markets.get(market, 0) + 1

    top_strategies = sorted(strategies.items(), key=lambda item: item[1]["pnl"], reverse=True)[:5]
    recent = sorted(rows, key=lambda t: str(t.get("date", "")), reverse=True)[:max_recent]
    recent_lines = [
        f"{t.get('date','?')}->{t.get('exit_date') or t.get('exitDate') or t.get('date','?')} {t.get('symbol') or t.get('asset','?')} {t.get('strategy','?')} PnL={pnl(t):.2f}"
        for t in recent
    ]
    strategy_lines = [f"{name}: {data['count']} trades, PnL {data['pnl']:.2f}" for name, data in top_strategies]
    market_lines = [f"{name}: {count}" for name, count in sorted(markets.items(), key=lambda item: item[1], reverse=True)]

    return "\n".join([
        f"Trades={total}, Wins={wins}, Losses={losses}, WinRate={win_rate:.1f}%, TotalPnL={total_pnl:.2f}",
        "Markets: " + "; ".join(market_lines[:6]),
        "Top strategies: " + "; ".join(strategy_lines),
        "Recent trades: " + " | ".join(recent_lines)
    ])

async def call_claude(user_id: str, prompt: str, trades: Optional[List[Any]] = None, max_tokens: int = 260) -> Dict[str, Any]:
    ensure_ai_tokens(user_id, minimum=800)
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY is not configured")

    context = compact_trade_context(trades or [])
    system = (
        "You are Xtin Journal AI, a concise trading performance coach. "
        "Use only the supplied trade context. Be personalized, specific, and under 160 words unless asked otherwise. "
        "Do not give financial advice or trade signals; focus on journaling, risk, discipline, and review."
    )
    payload = {
        "model": ANTHROPIC_MODEL,
        "max_tokens": max_tokens,
        "temperature": 0.35,
        "system": system,
        "messages": [{
            "role": "user",
            "content": f"TRADE CONTEXT:\n{context}\n\nUSER REQUEST:\n{prompt}"
        }]
    }
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            json=payload
        )
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Claude API error: {response.text[:300]}")
    data = response.json()
    usage = data.get("usage", {})
    used_tokens = int(usage.get("input_tokens", 0)) + int(usage.get("output_tokens", 0))
    wallet = deduct_ai_tokens(user_id, used_tokens)
    text = "\n".join(block.get("text", "") for block in data.get("content", []) if block.get("type") == "text").strip()
    return {"text": text, "usage": usage, "tokens_used": used_tokens, "wallet": wallet}

async def create_razorpay_order(user_id: str, package: Dict[str, Any]) -> Dict[str, Any]:
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay credentials are not configured")
    receipt = f"xtin_ai_{user_id[-8:]}_{int(datetime.now().timestamp())}"
    payload = {
        "amount": package["amount_inr"] * 100,
        "currency": "INR",
        "receipt": receipt,
        "notes": {"user_id": user_id, "package_id": package["id"], "tokens": str(package["tokens"])}
    }
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            "https://api.razorpay.com/v1/orders",
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
            json=payload
        )
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Razorpay order error: {response.text[:300]}")
    order = response.json()
    AI_ORDER_STORE[order["id"]] = {"user_id": user_id, "package_id": package["id"], "status": "created"}
    return order

# ==================== HELPER FUNCTIONS ====================

def calculate_trader_type(trades: List[TradeData]) -> str:
    """Determine trader type based on trading patterns"""
    if not trades:
        return "beginner"
    
    # Analyze hold times
    hold_times = []
    for trade in trades:
        if trade.time_in_trade:
            # Parse time format like "2h 30m"
            parts = trade.time_in_trade.split()
            hours = 0
            minutes = 0
            for i, part in enumerate(parts):
                if 'h' in part:
                    hours = int(part.replace('h', ''))
                elif 'm' in part:
                    minutes = int(part.replace('m', ''))
            total_minutes = hours * 60 + minutes
            hold_times.append(total_minutes)
    
    if not hold_times:
        return "beginner"
    
    avg_hold_time = sum(hold_times) / len(hold_times)
    
    if avg_hold_time < 5:
        return "scalper"
    elif avg_hold_time < 60:
        return "intraday"
    elif avg_hold_time < 1440:  # Less than a day
        return "swing trader"
    else:
        return "position trader"

def calculate_win_rate(trades: List[TradeData]) -> float:
    """Calculate win rate percentage"""
    if not trades:
        return 0.0
    
    wins = sum(1 for trade in trades if trade.win_loss == "Win" or trade.profit_loss > 0)
    return (wins / len(trades)) * 100 if trades else 0.0

def calculate_risk_profile(trades: List[TradeData]) -> str:
    """Determine risk profile based on trade patterns"""
    if not trades:
        return "conservative"
    
    # Calculate average risk per trade
    profit_losses = [trade.profit_loss for trade in trades]
    avg_loss = abs(min(profit_losses)) if profit_losses else 0
    
    # Calculate volatility (standard deviation)
    if len(profit_losses) > 1:
        mean = sum(profit_losses) / len(profit_losses)
        variance = sum((x - mean) ** 2 for x in profit_losses) / len(profit_losses)
        volatility = variance ** 0.5
    else:
        volatility = 0
    
    if volatility < 100 and avg_loss < 500:
        return "conservative"
    elif volatility < 300 and avg_loss < 1500:
        return "moderate"
    else:
        return "aggressive"

def identify_behavioral_patterns(trades: List[TradeData]) -> List[Dict[str, Any]]:
    """Analyze trades for behavioral patterns"""
    alerts = []
    
    if not trades:
        return alerts
    
    # Check for overtrading
    trades_last_day = sum(1 for t in trades if t.date == datetime.now().strftime("%Y-%m-%d"))
    if trades_last_day > 5:
        alerts.append({
            "type": "overtrading",
            "severity": "high",
            "message": f"You've made {trades_last_day} trades today. High frequency trading increases risk.",
            "recommendation": "Take a break and review your trading strategy. Quality over quantity."
        })
    
    # Check for revenge trading (losses followed by aggressive trades)
    recent_losses = sum(1 for t in trades[-5:] if t.profit_loss < 0)
    if recent_losses >= 3:
        alerts.append({
            "type": "revenge_trading",
            "severity": "high",
            "message": "You've had 3+ losses recently. Beware of revenge trading.",
            "recommendation": "Step back, review your losses, and stick to your strategy."
        })
    
    # Check for inconsistent strategy use
    strategies = [t.strategy for t in trades[-10:] if t.strategy]
    unique_strategies = set(strategies)
    if len(unique_strategies) > 5:
        alerts.append({
            "type": "strategy_inconsistency",
            "severity": "medium",
            "message": f"You're using {len(unique_strategies)} different strategies recently.",
            "recommendation": "Master 2-3 core strategies before experimenting with new ones."
        })
    
    # Check for time-of-day bias
    morning_trades = sum(1 for t in trades[-20:] if t.time_in_trade and 'morning' in t.time_in_trade.lower())
    if morning_trades > 15:
        alerts.append({
            "type": "time_bias",
            "severity": "low",
            "message": "Most of your recent trades are in the morning. Consider diversifying.",
            "recommendation": "Analyze your performance across different time periods."
        })
    
    return alerts

# ==================== API ENDPOINTS ====================

@app.get("/api")
async def root():
    """API root endpoint"""
    render_external_url = os.getenv("RENDER_EXTERNAL_URL", "")
    return {
        "message": "✅ Xtin Journal AI Coach API V2 is RUNNING",
        "status": "healthy",
        "host": HOST,
        "port": PORT,
        "environment": "production" if (os.getenv("RENDER") == "true" or PORT != 8001) else "development",
        "deployment": "render" if render_external_url else "local",
        "base_url": render_external_url or f"http://{HOST}:{PORT}",
        "endpoints": {
            "health": "/health",
            "profile": "/api/v2/profile",
            "behavioral_alerts": "/api/v2/behavioral-alerts",
            "analyze": "/api/v2/analyze",
            "chat": "/api/v2/chat",
            "import_trades": "/api/v2/import-trades",
            "pre_trade_check": "/api/v2/pre-trade-check",
            "weekly_review": "/api/v2/weekly-review",
            "ai_plans": "/api/v2/ai/plans",
            "ai_wallet": "/api/v2/ai/wallet",
            "razorpay_order": "/api/v2/ai/razorpay/order",
            "razorpay_verify": "/api/v2/ai/razorpay/verify"
        },
        "docs": "/docs"
    }

@app.post("/api/v2/import-trades", response_model=ImportTradeResponse)
async def import_trades(
    file_type: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Parse uploaded trade files on the backend so the frontend only handles preview/save.
    Supported file_type values: csv, excel, pdf.
    """
    normalized_type = file_type.strip().lower()
    filename = file.filename or ""
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        if normalized_type == "csv":
            trades = parse_csv_import(content)
        elif normalized_type in {"excel", "xls", "xlsx"}:
            trades = parse_excel_import(content, filename)
            normalized_type = "excel"
        elif normalized_type == "pdf":
            trades = parse_pdf_import(content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported import type")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not parse file: {exc}") from exc

    return {
        "trades": trades,
        "count": len(trades),
        "file_type": normalized_type
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy ✅",
        "message": "Xtin Journal AI Backend is running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v2/profile")
async def get_profile(user_id: str = Query(...)):
    """
    Get user trading profile - returns structure for frontend to populate
    Real stats are computed from trades passed via the analyze endpoint
    """
    return {
        "user_id": user_id,
        "trader_type": "unknown",
        "risk_profile": "unknown",
        "experience_level": "unknown",
        "statistics": {
            "total_trades": 0,
            "win_rate": 0,
            "profit_factor": 0,
            "average_win": 0,
            "average_loss": 0,
            "largest_win": 0,
            "largest_loss": 0,
            "consecutive_wins": 0,
            "consecutive_losses": 0
        },
        "preferences": {
            "favorite_markets": [],
            "favorite_strategies": [],
            "risk_per_trade": "N/A",
            "preferred_time_frame": "N/A"
        },
        "note": "Profile stats are computed from real trades via the analyze endpoint"
    }

@app.post("/api/v2/analyze")
async def analyze_trades(request: AnalyzeRequest):
    """
    Analyze trades for deep insights and performance metrics
    """
    trades_data = request.trades
    
    if not trades_data:
        return {
            "analysis": {
                "win_rate": 0,
                "total_pnl": 0,
                "profit_factor": 0,
                "expectancy": 0
            },
            "insights": {
                "issues": [{
                    "title": "No Trades to Analyze",
                    "metric": "0 trades",
                    "insight": "You haven't added any trades to your journal yet.",
                    "action": "Add some trades to your journal to get AI-powered analysis and insights.",
                    "severity": "low",
                    "learning": ["Trade logging", "Journal maintenance", "Data collection"]
                }],
                "strengths": []
            }
        }
    
    # Convert to TradeData objects if needed
    trades = []
    for t in trades_data:
        if isinstance(t, dict):
            trades.append(t)
        else:
            trades.append(t.dict() if hasattr(t, 'dict') else t)
    
    # Calculate metrics
    total_trades = len(trades)
    wins = sum(1 for t in trades if t.get('profit_loss', 0) > 0)
    losses = total_trades - wins
    win_rate = (wins / total_trades) if total_trades > 0 else 0
    
    total_profit = sum(t.get('profit_loss', 0) for t in trades)
    avg_win = sum(t.get('profit_loss', 0) for t in trades if t.get('profit_loss', 0) > 0) / wins if wins > 0 else 0
    avg_loss = sum(t.get('profit_loss', 0) for t in trades if t.get('profit_loss', 0) <= 0) / losses if losses > 0 else 0
    
    # Profit factor
    total_wins = sum(t.get('profit_loss', 0) for t in trades if t.get('profit_loss', 0) > 0)
    total_losses = abs(sum(t.get('profit_loss', 0) for t in trades if t.get('profit_loss', 0) < 0))
    profit_factor = total_wins / total_losses if total_losses > 0 else (float('inf') if total_wins > 0 else 0)
    
    # Strategy analysis
    strategies = {}
    for trade in trades:
        strategy = trade.get('strategy', 'Unknown')
        if strategy not in strategies:
            strategies[strategy] = {'wins': 0, 'losses': 0, 'profit': 0, 'count': 0}
        strategies[strategy]['profit'] += trade.get('profit_loss', 0)
        strategies[strategy]['count'] += 1
        if trade.get('profit_loss', 0) > 0:
            strategies[strategy]['wins'] += 1
        else:
            strategies[strategy]['losses'] += 1
    
    # Generate insights
    issues = []
    strengths = []
    
    if win_rate < 0.4:
        issues.append({
            "title": "Low Win Rate",
            "metric": f"{win_rate*100:.1f}%",
            "insight": "Your win rate is below 40%. This indicates your winning trades are not frequent enough.",
            "action": "Review your entry signal setup and ensure you're trading high-probability setups. Consider implementing stricter entry criteria.",
            "severity": "high",
            "learning": ["Entry signal optimization", "Trade setup validation", "Risk-reward filtering"]
        })
    elif win_rate > 0.6:
        strengths.append({
            "title": "Strong Win Rate",
            "metric": f"{win_rate*100:.1f}%",
            "insight": "Excellent! Your win rate is above 60%. You're consistently picking winning setups.",
            "learning": None
        })
    
    if profit_factor < 1.5 and profit_factor > 0:
        issues.append({
            "title": "Low Profit Factor",
            "metric": f"{profit_factor:.2f}",
            "insight": "Your profit factor is below 1.5. This means your losing trades are too large relative to your winning trades.",
            "action": "Focus on risk management. Ensure winners are at least 2x your risk per trade. Implement tighter stops or reduce position size on losing trades.",
            "severity": "high",
            "learning": ["Risk management", "Position sizing", "Stop loss placement"]
        })
    elif profit_factor > 2:
        strengths.append({
            "title": "Excellent Profit Factor",
            "metric": f"{profit_factor:.2f}",
            "insight": "Exceptional risk-reward management! Your average winners are significantly larger than your average losers.",
            "learning": None
        })
    
    # Check for overtrading
    recent_trades = len([t for t in trades if t.get('date') == datetime.now().strftime("%Y-%m-%d")])
    if recent_trades > 5:
        issues.append({
            "title": "Overtrading Pattern",
            "metric": f"{recent_trades} trades today",
            "insight": "You've taken many trades in a single day. Overtrading often leads to emotional decision-making and reduced effectiveness.",
            "action": "Set a daily trade limit (3-5 maximum). Wait for the highest probability setups. Quality over quantity always wins.",
            "severity": "medium",
            "learning": ["Trading discipline", "Patience in trading", "Emotional control"]
        })
    
    # Check for consistency in strategies
    unique_strategies = len(strategies)
    if unique_strategies > 5:
        issues.append({
            "title": "Too Many Strategies",
            "metric": f"{unique_strategies} different strategies",
            "insight": "Trading with too many strategies spreads your focus too thin and prevents mastery of any single approach.",
            "action": "Identify your 2-3 best performing strategies. Stop trading the others until you achieve mastery and consistency.",
            "severity": "medium",
            "learning": ["Strategy mastery", "Trading specialization", "Focus and discipline"]
        })
    
    return {
        "analysis": {
            "core_metrics": {
                "total_trades": total_trades,
                "win_rate": win_rate,
                "profit_factor": round(profit_factor, 2) if profit_factor != float('inf') else 999,
                "total_profit": total_profit,
                "average_win": round(avg_win, 2),
                "average_loss": round(avg_loss, 2),
                "wins": wins,
                "losses": losses
            },
            "strategy_performance": {k: {
                "trades": v['count'],
                "wins": v['wins'],
                "losses": v['losses'],
                "win_rate": (v['wins'] / v['count'] * 100) if v['count'] > 0 else 0,
                "profit": round(v['profit'], 2)
            } for k, v in strategies.items()},
            "win_rate": win_rate,
            "total_pnl": total_profit,
            "profit_factor": round(profit_factor, 2) if profit_factor != float('inf') else 999,
            "expectancy": round(total_profit / total_trades, 2) if total_trades > 0 else 0
        },
        "insights": {
            "issues": issues,
            "strengths": strengths
        }
    }

@app.get("/api/v2/behavioral-alerts")
async def get_behavioral_alerts(user_id: str = Query(...)):
    """
    Behavioral alerts endpoint - returns empty alerts.
    Real alerts are computed from trades in the analyze endpoint.
    """
    return {
        "user_id": user_id,
        "alert_count": 0,
        "alerts": [],
        "last_updated": datetime.now().isoformat()
    }

@app.get("/api/v2/ai/plans")
async def ai_plans():
    return {"plans": list(AI_PACKAGES.values()), "currency": "INR"}

@app.get("/api/v2/ai/wallet")
async def ai_wallet(user_id: str = Query(...)):
    return {"wallet": get_ai_wallet(user_id), "plans": list(AI_PACKAGES.values())}

@app.post("/api/v2/ai/razorpay/order")
async def ai_razorpay_order(request: AiOrderRequest):
    package = AI_PACKAGES.get(request.package_id)
    if not package:
        raise HTTPException(status_code=400, detail="Invalid AI package")
    order = await create_razorpay_order(request.user_id, package)
    return {
        "key_id": RAZORPAY_KEY_ID,
        "order": order,
        "package": package
    }

@app.post("/api/v2/ai/razorpay/verify")
async def ai_razorpay_verify(request: AiPaymentVerifyRequest):
    package = AI_PACKAGES.get(request.package_id)
    if not package:
        raise HTTPException(status_code=400, detail="Invalid AI package")
    stored_order = AI_ORDER_STORE.get(request.razorpay_order_id)
    if stored_order and (
        stored_order.get("user_id") != request.user_id or
        stored_order.get("package_id") != request.package_id
    ):
        raise HTTPException(status_code=400, detail="Razorpay order does not match this user or package")
    message = f"{request.razorpay_order_id}|{request.razorpay_payment_id}"
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(expected, request.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid Razorpay signature")
    wallet = add_ai_tokens(
        request.user_id,
        package["tokens"],
        "razorpay",
        package["amount_inr"],
        payment_id=request.razorpay_payment_id
    )
    AI_ORDER_STORE[request.razorpay_order_id] = {
        "user_id": request.user_id,
        "package_id": request.package_id,
        "payment_id": request.razorpay_payment_id,
        "status": "paid",
        "tokens": package["tokens"],
        "amount_inr": package["amount_inr"]
    }
    return {"wallet": wallet, "package": package, "message": "AI tokens added"}

# ==================== JOURNAL PRO PLAN (real payments) ====================
# Unlike the legacy mock /api/v2/subscription, these endpoints require a
# verified Razorpay payment and persist the plan server-side in Supabase
# (journal_pro_plans, service-role writes only — see journal-pro-plans.sql).

# Regional charm price points (whole units). amount_inr stays for backward
# compatibility / analytics; `amounts` is the per-currency source of truth.
PRO_PLANS = {
    "journal_pro_monthly": {
        "id": "journal_pro_monthly", "amount_inr": 299, "label": "Journal Pro — Monthly",
        "billing": "monthly", "duration_days": 31,
        "amounts": {"INR": 299, "USD": 5, "GBP": 4, "EUR": 5},
    },
    "journal_pro_yearly": {
        "id": "journal_pro_yearly", "amount_inr": 2399, "label": "Journal Pro — Yearly",
        "billing": "yearly", "duration_days": 366,
        "amounts": {"INR": 2399, "USD": 39, "GBP": 29, "EUR": 39},
    }
}
PLAN_CURRENCIES = {"INR", "USD", "GBP", "EUR"}


async def create_plan_order_in_currency(user_id: str, plan: Dict[str, Any], currency: str) -> Dict[str, Any]:
    """Create a Razorpay order for a Pro plan in the buyer's currency."""
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay credentials are not configured")
    amount_whole = plan.get("amounts", {}).get(currency)
    if amount_whole is None:
        currency = "INR"
        amount_whole = plan["amount_inr"]
    receipt = f"xtin_pro_{user_id[-8:]}_{int(datetime.now().timestamp())}"
    payload = {
        "amount": int(amount_whole) * 100,
        "currency": currency,
        "receipt": receipt,
        "notes": {"user_id": user_id, "plan_id": plan["id"]},
    }
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            "https://api.razorpay.com/v1/orders",
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
            json=payload,
        )
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Razorpay order error: {response.text[:300]}")
    return response.json()

def persist_pro_plan(user_id: str, user_email: str, plan: Dict[str, Any], payment_id: str, order_id: str,
                     currency: str = "INR", region: Optional[str] = None) -> Dict[str, Any]:
    """Write the verified plan to Supabase. Never fails the payment response."""
    if not supabase_state_enabled() or not user_id:
        return {"saved": False, "reason": "supabase not configured or no user id"}
    now = datetime.now()
    valid_until = now + timedelta(days=plan["duration_days"])
    try:
        with httpx.Client(timeout=8) as client:
            response = client.post(
                f"{SUPABASE_URL}/rest/v1/journal_pro_plans",
                headers={**supabase_headers(), "prefer": "resolution=merge-duplicates"},
                json={
                    "user_id": user_id,
                    "plan_id": plan["id"],
                    "billing": plan["billing"],
                    "currency": (currency or "INR").upper(),
                    "region": (region or "").upper() or None,
                    "activated_at": now.isoformat(),
                    "valid_until": valid_until.isoformat(),
                    "payment_id": payment_id,
                    "order_id": order_id,
                    "user_email": (user_email or "")[:254],
                    "updated_at": now.isoformat()
                }
            )
        if response.status_code >= 400:
            print(f"[ProPlan] Supabase persist error {response.status_code}: {response.text[:200]}")
            return {"saved": False, "reason": f"supabase {response.status_code}"}
        return {"saved": True, "valid_until": valid_until.isoformat()}
    except Exception as exc:
        print(f"[ProPlan] Persist error: {exc}")
        return {"saved": False, "reason": str(exc)}

@app.post("/api/v2/plan/razorpay/order")
async def plan_razorpay_order(request: PlanOrderRequest):
    plan = PRO_PLANS.get(request.plan_id)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan")
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Payment service not configured")
    currency = (request.currency or "INR").upper()
    if currency not in PLAN_CURRENCIES:
        currency = "INR"
    try:
        order = await create_plan_order_in_currency(request.user_id, plan, currency)
    except HTTPException:
        raise
    except Exception as exc:
        # Network/DNS failures reaching Razorpay — surface a clean message
        # the client can react to instead of a raw 500.
        raise HTTPException(status_code=503, detail=f"Payment gateway unreachable: {exc}")
    return {"key_id": RAZORPAY_KEY_ID, "order": order, "plan": plan}

@app.post("/api/v2/plan/razorpay/verify")
async def plan_razorpay_verify(request: PlanVerifyRequest):
    plan = PRO_PLANS.get(request.plan_id)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan")
    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Payment service not configured")
    message = f"{request.razorpay_order_id}|{request.razorpay_payment_id}"
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(expected, request.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid Razorpay signature")

    persisted = persist_pro_plan(
        request.user_id, request.user_email, plan,
        request.razorpay_payment_id, request.razorpay_order_id,
        currency=(request.currency or "INR"), region=request.region
    )

    # Pro includes a large AI coach token grant. add_ai_tokens is
    # replay-safe (credited_payments tracks payment ids), so a re-verify
    # can never double-credit.
    add_ai_tokens(request.user_id, 100_000, "pro_included", 0, payment_id=request.razorpay_payment_id)
    # Fresh tier takes effect immediately for the chat depth
    PLAN_TIER_CACHE.pop(request.user_id, None)
    valid_until = persisted.get("valid_until") or (datetime.now() + timedelta(days=plan["duration_days"])).isoformat()
    return {
        "success": True,
        "plan": plan,
        "payment_id": request.razorpay_payment_id,
        "order_id": request.razorpay_order_id,
        "valid_until": valid_until,
        "cloud_saved": persisted.get("saved", False)
    }

@app.get("/api/v2/plan")
async def get_pro_plan(user_id: str = Query(...)):
    """Server-authoritative plan lookup for the given user."""
    if not supabase_state_enabled():
        return {"user_id": user_id, "plan": None, "source": "unconfigured"}
    try:
        with httpx.Client(timeout=8) as client:
            response = client.get(
                f"{SUPABASE_URL}/rest/v1/journal_pro_plans",
                headers=supabase_headers(),
                params={"user_id": f"eq.{user_id}", "select": "plan_id,billing,activated_at,valid_until,payment_id"}
            )
        if response.status_code >= 400:
            return {"user_id": user_id, "plan": None, "source": "error"}
        rows = response.json()
        return {"user_id": user_id, "plan": rows[0] if rows else None, "source": "supabase"}
    except Exception:
        return {"user_id": user_id, "plan": None, "source": "error"}

@app.post("/api/v2/pre-trade-check")
async def pre_trade_check(request: PreTradeRequest):
    """
    AI-powered pre-trade checklist using Claude with minimal context.
    """
    risk_amount = request.risk_amount
    potential_profit = request.potential_profit
    risk_reward_ratio = (potential_profit / risk_amount) if risk_amount > 0 else 0

    prompt = f"""A trader is about to enter a trade. Give them a quick pre-trade assessment.

TRADE DETAILS:
- Symbol: {request.symbol}
- Type: {request.trade_type}
- Market: {request.market}
- Strategy: {request.strategy}
- Risk Amount: ₹{risk_amount:,.0f}
- Potential Profit: ₹{potential_profit:,.0f}
- Risk/Reward Ratio: {risk_reward_ratio:.2f}:1

Provide:
1. Quick verdict: GO / WAIT / DON'T TRADE with one sentence reason
2. Risk/Reward assessment (is {risk_reward_ratio:.2f}:1 acceptable?)
3. Two quick reminders before entering

Be direct and under 100 words total."""

    claude = await call_claude(request.user_id, prompt, [], max_tokens=180)
    reminder = claude["text"]

    return {
        "user_id": request.user_id,
        "symbol": request.symbol,
        "reminder": reminder,
        "risk_reward": round(risk_reward_ratio, 2),
        "tokens_used": claude["tokens_used"],
        "token_balance": claude["wallet"]["token_balance"],
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v2/weekly-review")
async def weekly_review(request: WeeklyReviewRequest):
    """
    Generate AI-powered weekly trading review using Claude with compact trade context.
    """
    trades = request.trades if request.trades else []

    if not trades:
        return {"review": "No trades logged this week. Start adding trades to get your weekly AI review!", "trade_count": 0}

    total_trades = len(trades)
    wins = sum(1 for t in trades if t.profit_loss > 0)
    losses = total_trades - wins
    win_rate = (wins / total_trades * 100) if total_trades > 0 else 0
    total_profit = sum(t.profit_loss for t in trades)
    avg_win = sum(t.profit_loss for t in trades if t.profit_loss > 0) / wins if wins > 0 else 0
    avg_loss = abs(sum(t.profit_loss for t in trades if t.profit_loss < 0) / losses) if losses > 0 else 0
    gross_wins = sum(t.profit_loss for t in trades if t.profit_loss > 0)
    gross_losses = abs(sum(t.profit_loss for t in trades if t.profit_loss < 0))
    profit_factor = gross_wins / gross_losses if gross_losses > 0 else 0

    strategies = {}
    for t in trades:
        s = t.strategy
        if s not in strategies:
            strategies[s] = {'count': 0, 'profit': 0, 'wins': 0}
        strategies[s]['count'] += 1
        strategies[s]['profit'] += t.profit_loss
        if t.profit_loss > 0:
            strategies[s]['wins'] += 1

    strategy_lines = ""
    for s, d in strategies.items():
        wr = (d['wins'] / d['count'] * 100) if d['count'] > 0 else 0
        strategy_lines += f"  - {s}: {d['count']} trades, {wr:.1f}% WR, ₹{d['profit']:,.0f} P&L\n"

    sorted_trades = sorted(trades, key=lambda x: x.profit_loss, reverse=True)
    top3 = "".join(f"  +₹{t.profit_loss:,.0f} | {t.strategy} | {t.symbol} | {t.date}\n" for t in sorted_trades[:3])
    worst3 = "".join(f"  ₹{t.profit_loss:,.0f} | {t.strategy} | {t.symbol} | {t.date}\n" for t in sorted_trades[-3:])

    period_start = request.start_date or (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    period_end = request.end_date or datetime.now().strftime("%Y-%m-%d")

    prompt = f"""Generate a detailed weekly trading review for this trader.

WEEK: {period_start} to {period_end}
TOTAL TRADES: {total_trades} ({wins} wins, {losses} losses)
WIN RATE: {win_rate:.1f}%
TOTAL P&L: ₹{total_profit:,.0f}
AVERAGE WINNER: ₹{avg_win:,.0f}
AVERAGE LOSER: ₹{avg_loss:,.0f}
PROFIT FACTOR: {profit_factor:.2f}

STRATEGY BREAKDOWN:
{strategy_lines}

BEST 3 TRADES:
{top3}
WORST 3 TRADES:
{worst3}

Write a structured review with:
1. Week Summary (2-3 sentences on overall performance)
2. What Worked Well (specific strategies/behaviours with their actual numbers)
3. What Needs Improvement (specific issues with actual numbers)
4. Key Lessons (3 bullet points)
5. Next Week Focus (2-3 concrete actions)

Be specific, reference the actual numbers. Keep total response under 300 words."""

    claude = await call_claude(request.user_id, prompt, [t.dict() for t in trades], max_tokens=420)
    review_text = claude["text"]

    return {
        "review": review_text,
        "trade_count": total_trades,
        "tokens_used": claude["tokens_used"],
        "token_balance": claude["wallet"]["token_balance"],
        "generated_at": datetime.now().isoformat()
    }

# ---- Plan-tier lookup (server-authoritative, 60s cache) -------------------
PLAN_TIER_CACHE: Dict[str, Dict[str, Any]] = {}

def get_plan_tier(user_id: Optional[str], client_tier: str = "free") -> str:
    """Pro/free for AI depth. Production trusts only Supabase; local dev
    falls back to the client's tier so simulated Pro is testable offline."""
    if not user_id:
        return "free"
    cached = PLAN_TIER_CACHE.get(user_id)
    if cached and (datetime.now().timestamp() - cached["at"]) < 60:
        return cached["tier"]

    tier = "free"
    if supabase_state_enabled():
        try:
            with httpx.Client(timeout=5) as client:
                response = client.get(
                    f"{SUPABASE_URL}/rest/v1/journal_pro_plans",
                    headers=supabase_headers(),
                    params={"user_id": f"eq.{user_id}", "select": "valid_until"}
                )
            if response.status_code < 400:
                rows = response.json()
                if rows and rows[0].get("valid_until"):
                    valid_until = datetime.fromisoformat(rows[0]["valid_until"].replace("Z", "+00:00"))
                    if valid_until.timestamp() > datetime.now().timestamp():
                        tier = "pro"
        except Exception:
            pass

    if tier == "free" and is_local_runtime() and client_tier == "pro":
        tier = "pro"

    PLAN_TIER_CACHE[user_id] = {"tier": tier, "at": datetime.now().timestamp()}
    return tier

# Currency symbols for coach replies — must cover CURRENCY_CONFIG in index.html
CURRENCY_SYMBOLS = {
    "INR": "₹", "USD": "$", "EUR": "€", "GBP": "£", "JPY": "¥",
    "AUD": "A$", "CAD": "C$", "CHF": "Fr", "CNY": "¥", "SGD": "S$"
}

@app.post("/api/v2/chat")
async def chat_coach(request: ChatRequest):
    """
    AI Coach chat powered by Claude with compact journal context.
    """
    message = request.message.strip()
    trades = request.trades or []
    cur = (request.currency or "INR").upper()
    sym = CURRENCY_SYMBOLS.get(cur, "₹")

    # Convert trades to dicts
    trades_list = []
    for t in trades:
        if isinstance(t, dict):
            trades_list.append(t)
        elif hasattr(t, '__dict__'):
            trades_list.append(t.__dict__)
        else:
            trades_list.append(t)

    # Build trade stats for context
    total_trades = len(trades_list)
    total_profit = sum(t.get('profit_loss', 0) for t in trades_list)
    wins = sum(1 for t in trades_list if t.get('profit_loss', 0) > 0)
    losses = total_trades - wins
    win_rate = (wins / total_trades * 100) if total_trades > 0 else 0
    avg_trade = (total_profit / total_trades) if total_trades > 0 else 0

    wins_list = [t.get('profit_loss', 0) for t in trades_list if t.get('profit_loss', 0) > 0]
    losses_list = [abs(t.get('profit_loss', 0)) for t in trades_list if t.get('profit_loss', 0) < 0]
    avg_win = sum(wins_list) / len(wins_list) if wins_list else 0
    avg_loss = sum(losses_list) / len(losses_list) if losses_list else 0
    profit_factor = (sum(wins_list) / sum(losses_list)) if sum(losses_list) > 0 else 0

    strategies_used = {}
    for t in trades_list:
        s = t.get('strategy', 'Unknown')
        if s and s != 'Unknown':
            if s not in strategies_used:
                strategies_used[s] = {'count': 0, 'profit': 0, 'wins': 0}
            strategies_used[s]['count'] += 1
            strategies_used[s]['profit'] += t.get('profit_loss', 0)
            if t.get('profit_loss', 0) > 0:
                strategies_used[s]['wins'] += 1

    strategy_summary = ""
    for s, d in strategies_used.items():
        wr = (d['wins'] / d['count'] * 100) if d['count'] > 0 else 0
        strategy_summary += f"  - {s}: {d['count']} trades, {wr:.1f}% WR, {sym}{d['profit']:,.0f} P&L\n"

    markets = list(set(t.get('market', 'Equity') for t in trades_list))

    # Top 5 trades for context
    sorted_trades = sorted(trades_list, key=lambda x: x.get('profit_loss', 0), reverse=True)
    top_trades_text = ""
    for t in sorted_trades[:3]:
        top_trades_text += f"  +{sym}{t.get('profit_loss',0):,.0f} | {t.get('strategy','?')} | {t.get('symbol','?')} | {t.get('date','?')}\n"
    worst_trades_text = ""
    for t in sorted_trades[-3:]:
        worst_trades_text += f"  {sym}{t.get('profit_loss',0):,.0f} | {t.get('strategy','?')} | {t.get('symbol','?')} | {t.get('date','?')}\n"

    # Emotion → P&L fingerprint (the heart of psychology coaching)
    emotions_used: Dict[str, Dict[str, Any]] = {}
    for t in trades_list:
        emo = (t.get('emotion') or '').strip().lower()
        if emo:
            slot = emotions_used.setdefault(emo, {'count': 0, 'profit': 0.0, 'wins': 0})
            slot['count'] += 1
            slot['profit'] += t.get('profit_loss', 0)
            if t.get('profit_loss', 0) > 0:
                slot['wins'] += 1
    emotion_summary = ""
    for emo, d in sorted(emotions_used.items(), key=lambda kv: kv[1]['profit']):
        ewr = (d['wins'] / d['count'] * 100) if d['count'] else 0
        emotion_summary += f"  - feeling '{emo}': {d['count']} trades, {ewr:.0f}% WR, {sym}{d['profit']:,.0f} P&L\n"

    # Performance goals the trader has committed to
    goals_summary = ""
    for g in (request.goals or [])[:5]:
        goals_summary += f"  - {g.get('title', 'Goal')}: target {g.get('target')} ({g.get('metric', '?')}, {g.get('timeframe', '?')})\n"

    tier = get_plan_tier(request.user_id, request.client_tier)
    trader_name = (request.display_name or "").strip()[:40]

    length_rule = (
        "- LENGTH: up to ~220 words when the question deserves depth. Explain the reasoning behind your read, then end with ONE concrete action for the next session."
        if tier == "pro" else
        "- LENGTH: under ~110 words. Lead with the single most important insight and one concrete action."
    )

    # Build system prompt with full trade context
    system_prompt = f"""You are Xtin Coach, a seasoned trading mentor sitting beside {trader_name or 'this trader'} reviewing their actual journal. You've seen a thousand traders blow up and a handful make it — and you talk like it: warm, direct, zero fluff.

HOW TO SPEAK:
- Address the trader{f' by name ({trader_name})' if trader_name else ''} naturally, like a mentor who knows them.
- Ground EVERY claim in their actual numbers below. Never invent figures. If data is missing, say exactly what to log and why it will pay off.
- When emotions show up in the data (revenge, fear, overconfidence), name the pattern gently but honestly — that's the coaching they can't get from a spreadsheet.
- Acknowledge how they're feeling first if the question sounds frustrated or excited, then go to the data.
- Plain language. {'Indian market context (₹, intraday, F&O, brokerage).' if cur == 'INR' else f"The trader works in {cur} — always quote amounts with {sym}, and use their own market's context (equities/options/futures as relevant); avoid India-specific terms like lakh/crore or F&O unless they use them first."} Plain text only — no markdown, no bullet lists.
{length_rule}

TRADER'S CURRENT STATS:
- Total Trades: {total_trades}
- Win Rate: {win_rate:.1f}% ({wins} wins, {losses} losses)
- Total P&L: {sym}{total_profit:,.0f}
- Average Trade: {sym}{avg_trade:,.0f}
- Average Winner: {sym}{avg_win:,.0f}
- Average Loser: {sym}{avg_loss:,.0f}
- Profit Factor: {profit_factor:.2f}
- Markets Traded: {', '.join(markets) if markets else 'N/A'}

STRATEGY BREAKDOWN:
{strategy_summary if strategy_summary else '  No strategy data available'}

EMOTION FINGERPRINT (how feelings correlate with P&L):
{emotion_summary if emotion_summary else '  No emotion tags logged yet — encourage tagging emotions on trades.'}

PERFORMANCE GOALS:
{goals_summary if goals_summary else '  No goals set — a written target is worth suggesting.'}

TOP 3 WINNING TRADES:
{top_trades_text if top_trades_text else '  No data'}

WORST 3 LOSING TRADES:
{worst_trades_text if worst_trades_text else '  No data'}

PLAN: {'Pro (all analysis modules available: Psychology, Hourly, Analytics, Heatmaps)' if tier == 'pro' else 'Free (Psychology, Hourly, Analytics and Heatmaps are Pro modules — mention one honestly if it would clearly answer their question, never pushily)'}

RULES:
- Always use the trader's ACTUAL data above in your answers
- Be specific - mention actual numbers, actual strategy names, actual P&L figures
- Give actionable, concrete recommendations
- If asked about something unrelated to trading, briefly answer then steer back to trading"""

    # Conversation memory: a coach remembers what was said two questions ago
    history_lines = ""
    history_depth = 10 if tier == "pro" else 6
    for h in (request.history or [])[-history_depth:]:
        role = "TRADER" if h.get("role") == "user" else "YOU (coach)"
        content = str(h.get("content", ""))[:400]
        if content:
            history_lines += f"{role}: {content}\n"

    claude_prompt = f"{system_prompt}\n"
    if history_lines:
        claude_prompt += f"\nCONVERSATION SO FAR:\n{history_lines}"
    claude_prompt += f"\nTRADER'S QUESTION:\n{message}"

    max_tokens = 550 if tier == "pro" else 300
    claude = await call_claude(request.user_id or "anonymous", claude_prompt, trades_list, max_tokens=max_tokens)
    return {
        "reply": claude["text"],
        "tokens_used": claude["tokens_used"],
        "token_balance": claude["wallet"]["token_balance"],
        "tier": tier
    }

@app.get("/api/v2/subscription")
async def get_subscription(user_id: str = Query(...)):
    subscription = SUBSCRIPTION_STORE.get(user_id)
    return {
        "user_id": user_id,
        "subscription": subscription,
        "has_subscription": subscription is not None
    }

@app.post("/api/v2/subscription")
async def create_subscription(request: SubscriptionCreateRequest):
    now = datetime.now()
    renewal = now + timedelta(days=30)
    amount_map = {
        "starter": 299,
        "pro": 999
    }
    amount_inr = amount_map.get(request.plan.lower(), 299)

    subscription = {
        "user_id": request.user_id,
        "plan": request.plan.lower(),
        "payment_method": request.payment_method.lower(),
        "status": "active",
        "started_at": now.isoformat(),
        "renewal_at": renewal.isoformat(),
        "amount_inr": amount_inr
    }
    SUBSCRIPTION_STORE[request.user_id] = subscription

    invoice_id = f"INV-{now.strftime('%Y%m%d')}-{len(INVOICE_STORE.get(request.user_id, [])) + 1:03d}"
    invoice = {
        "id": invoice_id,
        "user_id": request.user_id,
        "issue_date": now.isoformat(),
        "due_date": (now + timedelta(days=7)).isoformat(),
        "plan": request.plan.lower(),
        "payment_method": request.payment_method.lower(),
        "amount_inr": amount_inr,
        "status": "Paid"
    }
    INVOICE_STORE.setdefault(request.user_id, []).append(invoice)

    return {
        "message": "Subscription created successfully",
        "subscription": subscription,
        "invoice": invoice
    }

@app.patch("/api/v2/subscription/cancel")
async def cancel_subscription(request: SubscriptionCancelRequest):
    subscription = SUBSCRIPTION_STORE.get(request.user_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")

    subscription["status"] = "cancelled"
    subscription["cancelled_at"] = datetime.now().isoformat()
    SUBSCRIPTION_STORE[request.user_id] = subscription

    return {
        "message": "Subscription cancelled successfully",
        "subscription": subscription
    }

@app.get("/api/v2/invoices")
async def get_invoices(user_id: str = Query(...)):
    invoices = INVOICE_STORE.get(user_id, [])
    return {
        "user_id": user_id,
        "invoice_count": len(invoices),
        "invoices": invoices
    }

# ==================== ERROR HANDLING ====================

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    # Must return a Response object — returning a bare dict makes Starlette
    # crash with "'dict' object is not callable" and clients get a raw 500.
    return JSONResponse(
        status_code=500,
        content={
            "error": str(exc),
            "status": "error",
            "timestamp": datetime.now().isoformat()
        }
    )

# ---------------------------------------------------------------------------
# Static frontend serving (local dev): serve the HTML/JS/CSS from this same
# server so the app is reachable at http://localhost:8001 with same-origin API.
# In production the frontend is hosted separately (Vercel) so this is harmless.
# These are registered after all API routes; the catch-all mount is last.
# ---------------------------------------------------------------------------
_FRONTEND_DIR = os.path.dirname(os.path.abspath(__file__))


@app.get("/", include_in_schema=False)
async def serve_index():
    return FileResponse(os.path.join(_FRONTEND_DIR, "index.html"))


@app.get("/dashboard", include_in_schema=False)
async def serve_dashboard():
    return FileResponse(os.path.join(_FRONTEND_DIR, "dashboard.html"))


@app.get("/pricing", include_in_schema=False)
async def serve_pricing():
    return FileResponse(os.path.join(_FRONTEND_DIR, "pricing.html"))


# Catch-all for static assets (app.js, ai-coach.js, style.css, assets/, favicons…).
# Registered last so explicit API routes above always take precedence.
app.mount("/", StaticFiles(directory=_FRONTEND_DIR, html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    print(f"Starting Xtin Journal AI Coach API Server on {HOST}:{PORT}...")
    print(f"Listening on http://{HOST}:{PORT}/")
    print(f"API Documentation: http://{HOST}:{PORT}/docs")
    print(f"Render URL: {os.getenv('RENDER_EXTERNAL_URL', 'N/A')}")
    uvicorn.run(app, host=HOST, port=PORT, log_level="info")
