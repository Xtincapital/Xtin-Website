#!/usr/bin/env python3
"""Rebuild modules/fundakamental/directory/companies.json (all NSE + US listed companies).

Sources (public, no API key):
  NSE  https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv
  SEC  https://www.sec.gov/files/company_tickers.json   (needs a descriptive User-Agent)

Usage: python3 scripts/build-company-directory.py NSE_CSV SEC_JSON
Sectors only exist for the curated names in CURATED below; the rest get "".
Output rows: [ticker, name, market, sector, aliases?]  (India tickers carry the Yahoo ".NS" suffix).
"""
import csv, json, re, sys, pathlib

nse_path, sec_path = sys.argv[1], sys.argv[2]
root = pathlib.Path(__file__).resolve().parent.parent
out = root / "modules/fundakamental/directory/companies.json"

# Curated big names: they rank first and are the only rows with a sector.
# (ticker without .NS, display name, sector)
CURATED = [
    ('RELIANCE', 'Reliance Industries Ltd', 'Energy / Conglomerate'),
    ('TCS', 'Tata Consultancy Services Ltd', 'Information Technology'),
    ('INFY', 'Infosys Ltd', 'Information Technology'),
    ('HDFCBANK', 'HDFC Bank Ltd', 'Banking'),
    ('ICICIBANK', 'ICICI Bank Ltd', 'Banking'),
    ('HINDUNILVR', 'Hindustan Unilever Ltd', 'FMCG'),
    ('BHARTIARTL', 'Bharti Airtel Ltd', 'Telecom'),
    ('ITC', 'ITC Ltd', 'FMCG'),
    ('SBIN', 'State Bank of India', 'Banking'),
    ('LT', 'Larsen & Toubro Ltd', 'Infrastructure'),
    ('KOTAKBANK', 'Kotak Mahindra Bank Ltd', 'Banking'),
    ('BAJFINANCE', 'Bajaj Finance Ltd', 'Financial Services'),
    ('ASIANPAINT', 'Asian Paints Ltd', 'Consumer'),
    ('MARUTI', 'Maruti Suzuki India Ltd', 'Automobile'),
    ('TITAN', 'Titan Company Ltd', 'Consumer'),
    ('SUNPHARMA', 'Sun Pharmaceutical Industries Ltd', 'Pharmaceuticals'),
    ('WIPRO', 'Wipro Ltd', 'Information Technology'),
    ('HCLTECH', 'HCL Technologies Ltd', 'Information Technology'),
    ('ADANIENT', 'Adani Enterprises Ltd', 'Conglomerate'),
    ('TATAMOTORS', 'Tata Motors Ltd', 'Automobile'),
    ('AXISBANK', 'Axis Bank Ltd', 'Banking'),
    ('NESTLEIND', 'Nestle India Ltd', 'FMCG'),
    ('ULTRACEMCO', 'UltraTech Cement Ltd', 'Cement'),
    ('ONGC', 'Oil & Natural Gas Corporation Ltd', 'Energy'),
    ('POWERGRID', 'Power Grid Corporation of India Ltd', 'Utilities'),
    ('AAPL', 'Apple Inc.', 'Technology'),
    ('MSFT', 'Microsoft Corporation', 'Technology'),
    ('GOOGL', 'Alphabet Inc.', 'Technology'),
    ('AMZN', 'Amazon.com Inc.', 'Consumer / Cloud'),
    ('NVDA', 'NVIDIA Corporation', 'Semiconductors'),
    ('META', 'Meta Platforms Inc.', 'Technology'),
    ('TSLA', 'Tesla Inc.', 'Automobile'),
    ('BRK.B', 'Berkshire Hathaway Inc.', 'Conglomerate'),
    ('JPM', 'JPMorgan Chase & Co.', 'Banking'),
    ('V', 'Visa Inc.', 'Financial Services'),
    ('JNJ', 'Johnson & Johnson', 'Healthcare'),
    ('WMT', 'Walmart Inc.', 'Retail'),
    ('PG', 'Procter & Gamble Co.', 'Consumer'),
    ('MA', 'Mastercard Inc.', 'Financial Services'),
    ('KO', 'Coca-Cola Co.', 'Beverages'),
    ('DIS', 'Walt Disney Co.', 'Media'),
    ('NFLX', 'Netflix Inc.', 'Media'),
    ('INTC', 'Intel Corporation', 'Semiconductors'),
    ('AMD', 'Advanced Micro Devices Inc.', 'Semiconductors'),
]
curated = {t: (n, sec) for t, n, sec in CURATED}

SMALL = {"and", "of", "the", "for", "inc", "co", "corp", "ltd", "plc", "de", "&"}
KEEP_UPPER = {"USA", "US", "AI", "ETF", "REIT", "II", "III", "IV", "ADR", "LP", "LLC", "NV", "SA", "AG", "ASA", "HK", "UK"}

def title(name):
    words = name.split()
    res = []
    for i, w in enumerate(words):
        bare = re.sub(r"[^A-Za-z]", "", w)
        if bare.upper() in KEEP_UPPER or (len(bare) <= 3 and "." in w and w.isupper()) or any(c.isdigit() for c in w):
            res.append(w)
        elif w.lower() in SMALL and i > 0:
            res.append(w.lower() if w.lower() not in ("inc", "co", "corp", "ltd") else w.capitalize())
        else:
            res.append(w.capitalize())
    return " ".join(res)

# Former / popular names that no longer match the legal name. ticker -> keywords
ALIASES = {
    "ETERNAL.NS": "zomato blinkit",
    "PAYTM.NS": "paytm",
    "META": "facebook instagram whatsapp",
    "GOOGL": "google youtube",
    "GOOG": "google",
    "TMPV.NS": "tata motors passenger vehicles jaguar land rover",
    "TMCV.NS": "tata motors commercial vehicles",
    "TATAMOTORS.NS": "tata motors",
    "LICI.NS": "lic life insurance corporation",
    "SBIN.NS": "sbi",
    "HDFCBANK.NS": "hdfc",
    "BRK-B": "berkshire hathaway",
    "BRK-A": "berkshire hathaway",
}

rows, seen = [], set()

def add(ticker, name, market):
    key = (market, ticker.upper().removesuffix(".NS"))
    if key in seen or not name:
        return
    seen.add(key)
    base = ticker.removesuffix(".NS")
    c = curated.get(base)
    nm = c[0] if c else (title(name) if name.isupper() else name)
    row = [ticker, nm, market, c[1] if c else ""]
    if ticker in ALIASES:
        row.append(ALIASES[ticker])
    rows.append(row)

# curated big names first so they win ranking ties
for base, (n, s) in curated.items():
    # curated list mixes India (no suffix) and US; decide by presence in NSE file below
    pass

nse = {}
with open(nse_path, newline="", encoding="utf-8", errors="replace") as f:
    r = csv.reader(f)
    next(r)
    for row in r:
        if len(row) < 3:
            continue
        sym, name, series = row[0].strip(), row[1].strip(), row[2].strip()
        if series in ("EQ", "BE", "BZ", "SM", "ST", "SZ"):
            nse[sym] = name

sec = json.load(open(sec_path))
us = [(v["ticker"].strip(), title(v["title"].strip())) for v in sec.values()]

for base in curated:                       # curated first
    if base in nse:
        add(base + ".NS", nse[base], "IN")
for t, n in us:
    if t in curated and t not in nse:
        add(t, n, "US")
for sym, name in sorted(nse.items()):
    add(sym + ".NS", name, "IN")
for t, n in us:                            # SEC list is ordered by size
    add(t, n, "US")

out.write_text(json.dumps(rows, ensure_ascii=False, separators=(",", ":")))
print(f"{len(rows)} companies -> {out} ({out.stat().st_size/1024:.0f} KB)")
