# Currency & Region Refactoring Guide

## Architecture Overview

This solution adds **zero-touch region-aware currency formatting** to the existing Xtin Capital React app. It wraps the existing `lib/region.js` service (which does IP geolocation, region detection, FX rates) in a proper React Context and provides a drop-in `<Price>` component.

```
┌─────────────────────────────────────────────────────────────┐
│  CurrencyProvider (Context)                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  lib/region.js                                           │ │
│  │  • IP geo (ipapi.co → ipwho.is fallback)                 │ │
│  │  • Timezone/locale heuristic (no API call needed)        │ │
│  │  • FX rates (Frankfurter API, 12h cache)                 │ │
│  │  • currencySymbol, convert, formatMoney helper           │ │
│  │  • Manual region toggle persisted to localStorage        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  Exposes via useCurrency() hook:                             │
│  • region, symbol, currency, locale                          │
│  • loading, ratesLoading (for graceful UI)                   │
│  • formatCurrency(amount, opts)                              │
│  • setRegion(code)                                           │
│  • convert(amount, from, to)                                 │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  `<Price>` / `<PriceGroup>` Components                      │
│  • Drop-in replacement for hardcoded `<span>$50</span>`     │
│  • Handles loading state (skeleton/placeholder)             │
│  • Auto Intl.NumberFormat formatting                        │
│  • Optional FX conversion                                   │
│  • Optional compact mode (1.2K, 5L, 2Cr)                   │
└─────────────────────────────────────────────────────────────┘
```

## Files Created

| File | Purpose |
|------|---------|
| `Client/src/contexts/CurrencyContext.jsx` | React Context provider + `useCurrency()` hook |
| `Client/src/components/Price.jsx` | `<Price>` and `<PriceGroup>` components |

## Files Modified

| File | Change |
|------|--------|
| `Client/src/App.jsx` | Wrapped app with `<CurrencyProvider>` |

## How It Works

### 1. Geolocation (no browser permission popups)

The existing `lib/region.js` already handles this via **server-side IP APIs**, not the browser's Geolocation API:

1. **localStorage override** — If the user manually selected a region via `RegionSwitcher`, that's used immediately (no loading).
2. **Timezone/locale heuristic** — `Intl.DateTimeFormat().resolvedOptions().timeZone` and `navigator.language` give a close guess in ~0ms.
3. **IP API call** — `ipapi.co` (2s timeout) → `ipwho.is` fallback. Result cached in localStorage for 24 hours.

### 2. Global State (CurrencyContext)

`CurrencyProvider` wraps the app once (in `App.jsx`) and:

- Calls `detectRegion()` on mount (IP detection).
- Calls `getRates()` on mount (FX rates, cached 12h).
- Exposes `loading` (true until IP resolves) and `ratesLoading` (true until FX resolves).
- Subscribes to region changes (so `RegionSwitcher` toggles propagate instantly).

### 3. Formatting Utility (`formatCurrency`)

Uses standard `Intl.NumberFormat` instead of manual string manipulation:

```js
// Indian numbering
formatCurrency(123456.78)          // → "₹1,23,457"  (en-IN locale)
formatCurrency(50, { convert: true }) // → "₹4,150"  (USD→INR at ~83)

// Western numbering
formatCurrency(123456.78)          // → "$123,457"  (en-US locale)
formatCurrency(50)                 // → "$50"

// European formatting
formatCurrency(123456.78)          // → "123.456,78 €" (de-DE locale)
```

**Key advantage over the existing `lib/region.js` `formatMoney`**: This uses `Intl.NumberFormat` which handles ALL locale rules correctly — symbol position, digit grouping, decimal separators — rather than doing manual string concatenation.

### 4. Drop-in Component Refactoring

## Before-and-After Examples

### Example 1: Static price display

**BEFORE:**
```jsx
<span className="text-2xl font-bold">$49.99</span>
```

**AFTER:**
```jsx
import Price from '../components/Price';

<Price amount={49.99} className="text-2xl font-bold" />
```

### Example 2: Pricing with FX conversion (USD → INR)

**BEFORE:**
```jsx
<div>₹4,149</div>  <!-- Hardcoded INR equivalent of $50 -->
```

**AFTER:**
```jsx
<Price amount={50} convert className="text-xl font-bold" />
<!-- Automatically converts 50 USD → local currency at live FX rate -->
```

### Example 3: Comparison pricing (monthly/yearly toggle)

**BEFORE:**
```jsx
<div className="text-center">
  <span className="text-5xl font-bold">$2.99</span>
  <span className="text-gray-500">/month</span>
  <p className="text-green-600">That's $1.25/month — about 4¢ a day</p>
</div>
```

**AFTER:**
```jsx
import Price, { PriceGroup } from '../components/Price';

<div className="text-center">
  <PriceGroup
    primaryAmount={2.99}
    primaryLabel="/month"
    secondaryAmount={14.99}
    secondaryLabel="/year"
    priceProps={{ className: "text-5xl font-bold" }}
  />
  <p className="text-green-600">
    That's <Price amount={1.25} className="font-semibold" />/month — about <Price amount={0.04} className="font-semibold" /> a day
  </p>
</div>
```

### Example 4: Large numbers with compact mode

**BEFORE:**
```jsx
<span>₹14,23,00,000</span>
```

**AFTER:**
```jsx
<Price amount={142300000} compact />
<!-- For India → "₹14.23Cr" -->
<!-- For US → "$142.3M" -->
```

### Example 5: Calculator results

**BEFORE:**
```jsx
<div className="text-2xl">
  ₹{Math.round(result).toLocaleString('en-IN')}
</div>
```

**AFTER:**
```jsx
<Price amount={result} className="text-2xl" />
```

## Loading State Handling

The `CurrencyProvider` exposes two flags:

| Flag | Meaning | When |
|------|---------|------|
| `loading` | Region still being detected | First visit, IP query in flight |
| `ratesLoading` | FX rates still being fetched | First visit or cache expired |

The `<Price>` component handles these automatically:

- **`loading=true`**: Shows fallback text (`—` by default)
- **`ratesLoading=true + convert=true`**: Shows a subtle pulse animation (⟳)
- **Both resolved**: Shows formatted currency

This means your UI never shows "$0.00" or "NaN" while geo data is loading.

## Migration Strategy (Incremental)

1. **Wrap with CurrencyProvider** ✅ (Already done in `App.jsx`)
2. **Start with high-visibility spots** — pricing pages, upgrade modals, checkout flows
3. **Work through calculators** — replace `₹{Math.round(n).toLocaleString('en-IN')}` with `<Price>`
4. **Work through static components** — replace hardcoded `$`, `₹`, `£` symbols
5. **Add PriceGroup** where you have monthly/yearly comparison displays

The existing `useRegion` hook from `hooks/useRegion.js` still works — it just reads from the same `lib/region.js` service. No breaking changes.

## Edge Cases Handled

| Case | Behavior |
|------|----------|
| User in unsupported country | Falls to `GLOBAL` region (USD) |
| IP API times out (2s) | Uses timezone/locale heuristic |
| FX API down | Uses hardcoded fallback rates (83 INR, 0.92 EUR, etc.) |
| User manually changes region | Persisted to localStorage, instant re-render |
| Intl.NumberFormat throws (unlikely) | Falls back to simple sym + toLocaleString() |
| `<Price convert>` while rates loading | Shows ⟳ pulse animation |

