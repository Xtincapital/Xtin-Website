# Document 03 - App Flow and User Journey Map

## App Name

Xtin Journal

## Purpose

This document maps how users move through Xtin Journal: pages, tabs, modals, entry points, redirects, core journeys, and edge states. It should be used with the PRD and TRD before changing navigation or adding new screens.

## Pages List

### `/` or `index.html`

Primary product experience and route fallback. This page contains the trading journal interface, top header, tab navigation, trade entry flows, analytics, AI coach tab, modals, and footer.

### `/dashboard` or `dashboard.html`

Account/profile dashboard. Users manage sign in, profile details, selected trading platforms, local/cloud sync visibility, and quick links back to the journal and pricing page.

### `/pricing` or `pricing.html`

AI token pricing page. Users review available AI credit packs and learn that payments are processed through Razorpay and credited after backend verification.

### External Links

- Xtin Capital website links in footer.
- Social media links in footer.
- Support email from pricing page.
- Razorpay checkout overlay for payment.

## Navigation Type

- Main journal navigation: Horizontal tab bar inside `index.html`.
- Account dashboard navigation: Topbar links to Journal and Pricing.
- Pricing navigation: Top navbar with Home, Pricing anchor, and FAQ anchor.
- AI coach navigation: Floating AI coach widget plus an AI Coach tab inside the journal.
- Mobile navigation: Same page and tab structure, wrapping horizontally/vertically as viewport space requires.

## User Session States

- Anonymous local user: Can log trades, use local dashboard state, import/export, load sample data, and explore analytics without signing in.
- Signed-in Supabase user: Gets cloud sync for journal state, profile identity, and account/dashboard details.
- Sample data user: Can load demo datasets for exploration; sample mode should not overwrite cloud data without explicit user action.
- AI-credit user: Has an AI wallet balance and can use coach chat, pre-trade checks, and weekly reviews.
- Zero-credit user: Can view AI surfaces but must recharge before paid AI actions complete.
- Backend unavailable user: Can still use local journal flows; AI, import backend parser, wallet, and payment verification may be unavailable.

## Main Journal Tabs

- Dashboard: Metrics, goal tracker, charts, recent trades, and primary actions.
- Trades: Quick add, full trade table, filters, import/export, backup/restore, edit/delete actions.
- Psychology: Emotion and psychology-related performance views.
- Hourly Analysis: Time-of-day performance breakdowns.
- Calendar: Calendar-based trade review.
- Setup: Trading types, markets, strategies, and asset category configuration.
- Metrics: Summary metrics and distribution charts.
- Monthly: Month-level performance view.
- Daily: Day-level performance view.
- Analytics: Strategy performance, win rate, monthly P&L trend, and trade count analytics.
- Heatmaps: Visual heatmap-style performance views.
- AI Coach: Wallet, AI insights, refresh actions, and recharge entry point.

## Tab-Level Action Map

| Tab | Primary Actions | Secondary Actions | Result |
|---|---|---|---|
| Dashboard | Add New Trade, Quick Add, Import Trades | Export CSV, Backup, Restore, Load Sample, Clear All | Updates metrics, goals, charts, recent trades |
| Trades | Save Fast, Add New Trade, Edit, Delete | Filter, Search, Import, Export, Backup, Restore | Updates trade table and all dependent analytics |
| Psychology | Review emotion performance | Switch filters/time views if available | Helps user identify behavioral patterns |
| Hourly Analysis | Review time-of-day performance | Inspect tables/charts | Helps user find strong and weak trading windows |
| Calendar | Change month, open day details | Previous/Next month | Shows daily trading distribution |
| Setup | Manage types, markets, strategies, assets | Add custom strategy through trade entry | Controls dropdown data and classification |
| Metrics | Review summary charts | Compare type/market distributions | Gives high-level performance summary |
| Monthly | Choose month | Review monthly charts and metrics | Narrows analysis to selected month |
| Daily | Choose date | Review day-specific performance | Narrows analysis to selected day |
| Analytics | Refresh/render analytics | Review strategy and trend charts | Shows deeper strategy performance |
| Heatmaps | Review heatmap views | Change related filters if present | Surfaces dense performance patterns |
| AI Coach | Refresh Wallet, Recharge Tokens, Refresh Insights | Open floating coach widget | Runs AI workflows and wallet checks |

## First Screen

A brand new visitor lands on `/` and sees the Xtin Journal trading journal experience with the Dashboard tab active. The header includes currency/time controls, dashboard/account access, and trade count. A welcome modal may appear for first-time users unless they have already dismissed it.

Primary first actions:

- Add New Trade.
- Quick Add.
- Import Trades.
- Load Sample.
- Open Dashboard/account page.
- Open AI Coach.

## First-Run Experience

1. App loads `index.html`.
2. App initializes local storage-backed journal state.
3. App initializes Supabase if configured.
4. App restores active tab if the user has visited before.
5. If no welcome dismissal exists, the welcome modal appears after a short delay.
6. User chooses Get Started or Maybe Later.
7. Dismissal is stored so the welcome modal does not keep interrupting future sessions.

Recommended first-run next actions:

- If user has no trades: Show add/import/sample actions prominently.
- If Supabase is not configured or user is signed out: Keep local mode clear and non-blocking.
- If user opens AI before logging trades: Explain that analysis improves after trades are added.

## Entry Points

- Direct visit to `/`: Opens the main journal.
- Direct visit to `/dashboard`: Opens account/profile dashboard.
- Direct visit to `/pricing`: Opens pricing page.
- Vercel fallback route: Unknown routes rewrite to `index.html`.
- Returning user: Restores last active journal tab from local storage.
- AI coach floating button: Opens the AI coach widget on top of the current page.

## Decision Rules

| Situation | App Behavior |
|---|---|
| User has no trades | Keep Dashboard usable and emphasize Add New Trade, Import Trades, and Load Sample |
| User has trades | Render metrics, charts, recent trades, and analysis tabs from real data |
| User is not signed in | Use Local mode and offer sign in without blocking core journal work |
| User signs in | Reload cloud state, update profile labels, and show Cloud mode |
| Supabase is missing | Show configuration/auth error only where auth is attempted |
| Backend is offline | Keep local journal usable; show errors for AI/import/wallet backend features |
| AI wallet is empty | Open recharge path before paid AI actions |
| Razorpay payment fails or is cancelled | Do not credit tokens; return user to pricing/current AI flow |
| Import parser returns no trades | Do not modify journal; show clear error |
| User attempts destructive action | Ask for confirmation before modifying data |

## Auth Flow

### Local Mode

1. User lands on `/`.
2. User can continue without signing in.
3. Trades, goals, settings, drafts, and AI usage state remain in browser storage.
4. User can open the auth modal later from profile/account controls.

### Signup Flow

1. User opens auth modal from the journal or visits `/dashboard`.
2. User clicks Create Account.
3. Signup fields for name and age are shown if needed.
4. User enters name, age, email, and password.
5. Supabase creates account.
6. UI tells user to verify email if required.
7. User signs in after verification.
8. Journal reloads cloud state and continues in Cloud mode.

### Sign In Flow

1. User opens auth modal or `/dashboard`.
2. User enters email and password.
3. Supabase signs the user in.
4. UI shows success message.
5. Journal cloud state reloads from Supabase.
6. User remains on the current page or dashboard; sync mode changes to Cloud.

### Logout Flow

1. User clicks Sign Out on dashboard/profile controls.
2. Supabase session is cleared.
3. UI returns to Local mode.
4. User is not redirected away from the current page.

## Core User Journey 1 - Log and Review a Trade

Goal: User wants to record a trade and see performance update.

1. User lands on `/`.
2. Dashboard tab is active.
3. User clicks Add New Trade.
4. Trade modal opens.
5. User fills trade details: date, time, type, market, asset, currency, quantity, prices, strategy, risk fields, notes, tags, and emotion.
6. User clicks Save Trade.
7. Modal closes.
8. Trade is saved to local storage and cloud state if signed in.
9. Dashboard metrics, recent trades, analytics, charts, and trade count update.
10. User can switch to Trades tab to edit/delete the trade or review the full table.

Alternative quick path:

1. User clicks Quick Add.
2. App switches to Trades tab and focuses quick asset input.
3. User fills compact trade fields.
4. User clicks Save Fast.
5. Trade appears in table and metrics update.

Edit/delete path:

1. User opens Trades tab.
2. User clicks Edit on a table row.
3. Trade modal opens with existing trade data.
4. User saves changes.
5. Existing row is updated and analytics refresh.
6. If user clicks Delete, confirmation is required before removal.

## Core User Journey 2 - Import Trades

Goal: User wants to load trades from broker/export files.

1. User clicks Import Trades from Dashboard or Trades tab.
2. Import Type modal opens.
3. User chooses CSV/XLS/XLSX or PDF.
4. File picker opens.
5. User selects a file.
6. App attempts backend parsing through `/api/v2/import-trades`.
7. If backend parsing fails, app attempts browser fallback parsing.
8. Import Preview modal opens with parsed trades and estimated cumulative P&L.
9. User reviews rows.
10. User clicks Confirm Import.
11. Trades are added to journal.
12. Dashboard, tables, analytics, monthly/daily views, hourly analysis, and heatmaps refresh.

Cancel paths:

- Close Import Type modal: No file is selected.
- Close Import Preview modal: Parsed trades are discarded.
- Unsupported or empty file: User sees an error toast and stays on current page.

## Core User Journey 3 - Use AI Coach

Goal: User wants trading feedback from AI.

1. User opens the AI Coach tab or floating AI coach widget.
2. App loads wallet balance and available AI state.
3. User can run analysis, ask a chat question, request a pre-trade check, or generate weekly review.
4. Frontend sends journal context to FastAPI.
5. Backend calls Claude and deducts tokens after successful response.
6. AI response appears in the coach interface.
7. Wallet balance updates.

Insufficient token path:

1. AI action detects low or missing token balance.
2. Pricing gate modal opens.
3. User chooses a token pack.
4. Razorpay checkout opens.
5. Backend creates and verifies order.
6. Tokens are credited.
7. User returns to AI coach and retries the AI action.

AI coach widget path:

1. User clicks the floating AI coach button.
2. Widget opens without leaving the current tab.
3. User switches between Insights, Profile, and Chat inside the widget.
4. User can clear chat history or close the widget.
5. Closing the widget returns user to the same underlying page/tab.

## Core User Journey 4 - Manage Account and Profile

Goal: User wants cloud sync and profile control.

1. User clicks Dashboard/account link or opens `/dashboard`.
2. Dashboard shows profile hero, saved trades count, selected platform count, currency, and sync mode.
3. User signs in or creates account.
4. User updates name and age.
5. User toggles platform placeholders such as Zerodha, Upstox, Dhan, TradingView, or Binance.
6. User can navigate back to Journal or Pricing from the topbar.

## Core User Journey 5 - Recharge AI Tokens

Goal: User wants to buy AI credits.

1. User opens `/pricing` or clicks Recharge Tokens in the AI Coach tab.
2. Pricing page or in-app pricing gate shows token packs.
3. User chooses a pack.
4. Razorpay checkout opens.
5. User completes payment.
6. Backend verifies Razorpay signature.
7. Wallet receives tokens.
8. UI shows successful recharge and current token balance.

## Core User Journey 6 - Backup, Restore, and Export

Goal: User wants control over journal data portability.

1. User opens Dashboard or Trades tab.
2. User clicks Export CSV to download trade data.
3. User clicks Backup to download a JSON backup with trades, goals, custom strategies, and metadata.
4. User clicks Restore to choose a JSON backup file.
5. App shows confirmation before replacing/restoring local journal data.
6. If confirmed, journal state is restored and all views refresh.
7. If cancelled or invalid file, current data remains unchanged.

## Core User Journey 7 - Goals and Accountability

Goal: User wants to track a personal trading target.

1. User opens Dashboard tab.
2. User enters goal title, metric, timeframe, and target.
3. User submits goal form.
4. Goal appears as a goal card.
5. Progress updates from current journal data.
6. User can refresh goals or remove a goal.
7. If no goals exist, user sees the empty goal prompt.

## Modal, Drawer, and Overlay Interactions

- Welcome modal: First-time product introduction; user can close or choose show later.
- Trade modal: Add/edit trade; closes on Cancel, close button, outside click, or successful save.
- Sample Data modal: Choose one of several sample datasets; Cancel closes without changes.
- Auth modal: Sign in/create account/continue local; signup reveals extra profile fields.
- Import Type modal: Choose spreadsheet or PDF before file picker.
- Import Preview modal: Review parsed trades before commit.
- AI pricing gate modal: Choose AI token pack and proceed to Razorpay.
- AI subscription/wallet manager modal: View wallet and recharge/refresh controls.
- AI coach widget: Floating overlay with Insights, Profile, and Chat tabs.
- Toast: Short success/error feedback after saves, imports, auth events, backup/restore, and failures.
- Native browser confirms/prompts: Used for destructive or file-related flows such as clear, restore, and name changes.

## Click Outcome Map

| User Action | Expected Outcome |
|---|---|
| Click Add New Trade | Opens trade modal in add mode |
| Click Edit trade | Opens trade modal in edit mode |
| Click Save Trade | Validates, saves, closes modal, refreshes dependent views |
| Click Quick Add | Moves/focuses user into Trades quick form |
| Submit Save Fast | Adds compact trade and refreshes metrics |
| Click Import Trades | Opens import type modal |
| Select import type | Opens file picker with relevant file extensions |
| Confirm Import | Commits pending imported trades |
| Click Export CSV | Downloads trades CSV |
| Click Backup | Downloads JSON backup |
| Click Restore | Opens JSON file picker and confirmation flow |
| Click Load Sample | Opens sample data modal |
| Choose sample data | Loads selected sample set after confirmation where applicable |
| Click Clear All | Requires confirmation, then clears journal data |
| Click Dashboard/account | Navigates to `/dashboard` or `dashboard.html` |
| Click Pricing page link | Navigates to `/pricing` or `pricing.html` |
| Click Recharge Tokens | Opens AI pricing gate if coach is available |
| Click Pay with Razorpay | Opens Razorpay checkout |
| Close modal | Returns to same page and tab |

## Redirects and Route Logic

- `/dashboard` rewrites to `dashboard.html` on Vercel.
- `/pricing` rewrites to `pricing.html` on Vercel.
- Unknown Vercel routes rewrite to `index.html`.
- Pricing page Home links return to `index.html`.
- Dashboard Journal links return to `index.html`.
- Dashboard Pricing links go to `pricing.html`.
- Pricing page “Recharge in Journal” buttons currently route to `index.html`.
- In-app “Recharge Tokens” opens the AI pricing gate when AI coach is available.
- After sign in, user stays in place and cloud state reloads.
- After sign out, user stays in place and switches to Local mode.
- Last active journal tab is restored on return using local storage.

## URL and History Expectations

- Switching journal tabs should not require a page reload.
- Switching journal tabs does not need to update the URL in v1.
- Page-level navigation is reserved for `/`, `/dashboard`, and `/pricing`.
- Modal open/close does not create browser history entries.
- Browser refresh should restore saved local state and last active tab.

## Empty States

- No trades: Dashboard, analytics, recent trades, charts, and AI analysis should prompt user to add or import trades.
- No goals: Goal tracker shows “No goals yet” and invites user to add one.
- No selected platforms: Dashboard profile page shows no platform selected yet.
- No Supabase session: UI shows Local mode or “Not signed in.”
- No AI wallet or zero tokens: AI interface shows recharge path.
- No weekly trades: Weekly review returns a useful message encouraging trade logging.
- No parsed import rows: User sees a parsing/formatting error toast.

## Empty State CTA Rules

- No trades CTA priority: Add New Trade, Import Trades, Load Sample.
- No goals CTA priority: Add Goal form should be visible in place.
- No AI context CTA priority: Add/import trades before requesting deep AI analysis.
- No account CTA priority: Continue Local and Sign In should both be available.
- No wallet CTA priority: Recharge Tokens.

## Loading States

- Supabase initialization: Auth/status labels may show unsigned/local state until initialized.
- Cloud state reload: User should see success or remain in local state without losing data.
- Import parsing: Toast indicates upload/parsing progress.
- AI analysis: AI coach shows loading while requesting backend/Claude response.
- Wallet refresh: Wallet label may show loading until `/api/v2/ai/wallet` responds.
- Razorpay checkout: User stays in checkout overlay until payment succeeds, fails, or is cancelled.

## Error States

- Supabase not configured: Auth modal shows configuration error; user can continue local.
- Invalid login/signup fields: Auth modal shows field-specific message.
- Auth failure: User remains in modal or dashboard form and sees error message.
- Network/backend unavailable: Import, AI, and wallet actions show error toast or fallback where possible.
- Backend import unavailable: Browser parser fallback runs.
- Unsupported file type: User remains on current page and sees file type error.
- Empty import result: User sees “No trades found” style message.
- Failed AI request: User stays in AI coach and sees failure message.
- Insufficient AI tokens: User is sent to recharge flow.
- Failed Razorpay order creation: Pricing/payment flow shows order creation error.
- Invalid Razorpay signature: Tokens are not credited; user sees payment verification error.
- Duplicate payment verification: Tokens are not credited twice.
- Clear/restore cancelled: User remains on current page with no data change.

## Recovery Rules

- Errors should keep the user on the same screen whenever possible.
- Failed saves should not close modals until the user can fix the issue.
- Failed imports should not modify existing trades.
- Failed AI requests should preserve the user's typed message when possible.
- Failed payment verification should not show success messaging or update wallet balance.
- Failed cloud sync should preserve local data and allow retry.

## Back and Cancel Behavior

- Browser back from `/dashboard` or `/pricing` returns to prior page if present.
- Closing modals should not change active tab.
- Canceling trade entry should preserve existing data and discard unsaved modal changes unless draft restore is active.
- Canceling import preview should clear pending imported trades.
- Canceling Razorpay should return user to the AI pricing gate or current page without token credit.
- Continue Local closes auth modal and leaves user in browser-local mode.

## State Persistence

- Active tab persists in local storage.
- Journal trades persist in local storage and optionally Supabase cloud state.
- Goals, custom strategies, settings, subscription/invoice records, AI usage, and drafts persist locally and optionally in Supabase.
- AI user ID persists locally and uses Supabase user ID when signed in.
- Currency and timezone selections persist locally.
- Welcome modal dismissed state persists locally.

## Accessibility and Interaction Requirements

- Tabs must keep `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, and `aria-hidden` behavior.
- Keyboard users must be able to move across tabs with arrow keys, Home, End, Enter, and Space.
- Modals must expose dialog semantics and should focus the first useful field/control when opened.
- Close buttons must have accessible labels.
- Toasts should use live-region behavior for status updates.
- Destructive actions must be clear before confirmation.
- Mobile layouts must keep primary actions reachable without horizontal page overflow.

## Navigation Rules for Future Work

- Keep the main journal as one coherent tabbed workspace unless a future architecture decision changes it.
- New analysis views should become tabs only if they represent repeated workflows.
- One-off tasks should be modals or inline panels rather than new pages.
- Account, billing, and profile actions should remain reachable from `/dashboard`.
- Paid AI actions must always provide a clear recharge path.
- Destructive actions must use confirmation and stay on the current page.
- Empty states should always offer the next best action: add trade, import trades, load sample data, sign in, or recharge tokens.

## Future Flow Considerations

- If broker integrations become real, add a dedicated connection flow under `/dashboard` before importing directly from brokers.
- If normalized database trade storage is added, introduce a migration/sync conflict flow.
- If email verification becomes mandatory, add a visible verification pending state after signup.
- If subscription plans return, separate recurring subscription flows from prepaid AI token packs.
- If mobile usage becomes primary, consider a bottom navigation pattern for Dashboard, Trades, Analytics, and AI Coach.
