# Document 04 - UI/UX Design Brief

## App Name

Xtin Journal

## Purpose

This design brief defines the visual and interaction direction for Xtin Journal so every future screen, component, and AI-generated change feels like part of the same product.

## Aesthetic

Xtin Journal should feel like a professional trading workstation: clean, focused, data-dense, and calm under pressure. The interface should prioritize fast scanning, clear metrics, disciplined action, and confidence without looking flashy or gamified.

The product should feel:

- Practical and analytical.
- Premium but not decorative.
- Light, spacious, and readable.
- Built for repeated daily use.
- Trading-focused, with green used as the brand/action color rather than as a full-page theme.

Avoid:

- Marketing-style hero layouts inside the actual app workspace.
- Excessive gradients.
- Oversized cards that reduce data density.
- Decorative blobs, orbs, or abstract backgrounds.
- Unnecessary animations that distract from trade review.
- Overly dark, crypto-style neon interfaces.

## Visual Direction

The main app is a light-mode dashboard with white cards, pale slate backgrounds, structured tables, and restrained green accents. AI coach surfaces can use stronger green headers or accents to distinguish AI-powered guidance, but the overall product should remain quiet and task-focused.

The design language should sit closest to:

- Linear for clean product discipline.
- Vercel for restrained spacing and neutral surfaces.
- Notion for readable utility.
- Modern brokerage dashboards for dense trading data.

## Primary Color

- Primary green: `#00AA5B`
- Primary hover/dark green: `#007A46`
- AI coach green: `#059669`
- AI coach dark green: `#047857`
- Soft green surface: `#E1F7EC`
- Success surface: `#F0FDF4`

Use green for:

- Primary actions.
- Positive P&L.
- Active tabs.
- Focus rings.
- Selected platform cards.
- AI coach highlights.

Do not use green for every section background. Keep it as a signal color.

## Background Color

- App background: `#F8FAFC`
- Card/surface background: `#FFFFFF`
- Subtle alternate surface: `#F9FAFB`
- Soft green alternate surface: `#F0FDF4`
- Dark footer/header surface: `#111625`

Primary app screens should use a light background. Dark surfaces should be reserved for headers, footers, pricing highlight bands, and occasional high-emphasis panels.

## Text Color

- Primary text: `#111625`
- Secondary text: `#4B5563`
- Muted text: `#64748B`
- Soft muted text: `#94A3B8`
- Dark panel text: `#FFFFFF`

Text should be high-contrast and compact. Avoid pale gray body copy on white backgrounds.

## Accent and Status Colors

- Error/loss red: `#DC2626`
- Deep loss red: `#991B1B`
- Loss surface: `#FEF2F2`
- Warning amber: `#F59E0B`
- Warning surface: `#FFFBEB`
- Info blue: `#3B82F6`
- Info surface: `#EFF6FF`
- Neutral border: `#E2E8F0`
- Secondary border: `#E5E7EB`

Status meanings:

- Green: gain, success, active, confirmed, selected.
- Red: loss, destructive action, failed state.
- Amber: warning, caution, incomplete condition.
- Blue: informational, neutral helper state.
- Slate/gray: passive metadata and disabled states.

## Design Tokens

Use these values as the default source of truth when adding or revising UI:

| Token | Value | Use |
|---|---|---|
| `--color-background` | `#F8FAFC` | App background |
| `--color-surface` | `#FFFFFF` | Cards, modals, tables |
| `--color-text` | `#111625` | Primary text |
| `--color-text-secondary` | `#4B5563` | Secondary text |
| `--color-primary` | `#00AA5B` | Primary action, active state |
| `--color-primary-hover` | `#007A46` | Button hover |
| `--color-border` | `#E2E8F0` | Borders and dividers |
| `--color-error` | `#DC2626` | Loss/error/destructive |
| `--color-warning` | `#F59E0B` | Warning/caution |
| `--radius-base` | `8px` | Default controls |
| `--radius-lg` | `12px` | Cards and panels |
| `--space-8` | `8px` | Tight gaps |
| `--space-16` | `16px` | Default section gap |
| `--space-24` | `24px` | Large panel padding |

Spacing should generally follow an 8px rhythm: `4`, `8`, `12`, `16`, `20`, `24`, `32`.

## Font

- Base UI font: system stack using `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Inter`, `Roboto`, `Helvetica Neue`, `Arial`, sans-serif.
- Brand/display font: `Poppins` where already used for brand or pricing surfaces.
- Monospace font: `Berkeley Mono`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, monospace.

Typography rules:

- Use system UI font for app controls, tables, forms, and dashboards.
- Use Poppins sparingly for brand-forward headings and pricing.
- Do not use more than two font families per screen.
- Keep letter spacing at `0` unless using tiny uppercase labels.

## Typography Scale

- Tiny metadata: `11px`
- Labels and table helper text: `12px`
- Body/table text: `14px`
- Important body/chat text: `15px`
- Button text: `14px` to `16px`
- Section headings: `18px` to `20px`
- Dashboard panel headings: `20px` to `24px`
- Page headings: `24px` to `30px`

Line height:

- Compact UI: `1.2` to `1.35`
- Body and AI coach responses: `1.5` to `1.7`

Do not use hero-scale type inside dashboard cards, tables, modals, or side panels.

## Border Radius

- Small controls: `6px`
- Standard buttons, inputs, tabs: `8px`
- Cards and chart panels: `10px` to `12px`
- Large modals/welcome panels: `12px` to `16px`
- Pills and badges: `999px`

Default radius should be `8px`. Use larger radii only for large panels or avatar-like elements.

## Shadows

Use subtle shadows only to separate elevated content from the background.

- Small card shadow: `0 1px 3px rgba(0, 0, 0, 0.05)`
- Medium hover shadow: `0 8px 22px rgba(15, 23, 42, 0.08)`
- Modal shadow: `0 10px 15px rgba(0, 0, 0, 0.1)` or stronger when needed.
- AI panel shadow: side shadow is acceptable for overlay separation.

Avoid heavy drop shadows and glowing effects except for the AI floating button or payment/AI emphasis states.

## Dark/Light Mode

Light mode is primary for v1.

Dark mode is not required as a full alternate theme yet. Dark surfaces may appear in:

- Header/footer bands.
- Pricing highlight sections.
- Brand panels.
- AI coach header.

If a future dark mode is added, it must preserve chart readability, table contrast, win/loss distinction, and accessible form controls.

## Layout Principles

- Keep the app workspace data-dense but not cramped.
- Use constrained content widths for marketing/pricing pages.
- Use full-width dashboard sections inside the journal workspace.
- Prefer grids for metrics and cards.
- Prefer tables for trade records and detailed comparisons.
- Avoid cards inside cards unless the inner card is a repeated item or true sub-record.
- Keep repeated controls in predictable positions across tabs.
- Put primary actions near the section title or top-right action cluster.
- Keep destructive actions visually separated from routine actions.

## Key UI Patterns

### Buttons

- Primary buttons: green background, white text, 8px radius.
- Secondary buttons: white or light gray background, slate text, border.
- Delete/destructive buttons: red background or red text with confirmation.
- Icon + label buttons are preferred for important dashboard actions.
- Icon-only buttons require accessible labels and tooltips when meaning is not obvious.

Button sizing:

- Compact: 32-36px high for dense table actions.
- Standard: 40-44px high for app actions.
- Large: 48px high for pricing/payment CTAs.
- Disabled buttons should reduce opacity and keep labels readable.

### Tabs

- Horizontal tab bar is the main journal navigation.
- Active tab uses green text and green underline/border.
- Inactive tabs use muted text.
- Tabs must support keyboard navigation.
- Tabs should not trigger full page reloads.

### Cards

- Use cards for metrics, charts, connection tiles, goal cards, and pricing packs.
- Cards should have white backgrounds, light borders, and subtle shadows.
- Card headings should be compact.
- Metric values should be visually prominent but not oversized.

### Tables

- Tables are central to the product and must remain scannable.
- Use sticky or visually distinct headers where practical.
- Align numeric values consistently.
- Use green/red status badges for win/loss.
- Avoid wrapping dense numeric table cells when possible.
- On mobile, allow horizontal scroll for wide trade tables rather than crushing columns.

Table row states:

- Default row: white background, slate text.
- Hover row: very subtle slate/green tint.
- Winning trade: green status badge, not a full green row.
- Losing trade: red status badge, not a full red row unless the section explicitly compares outcomes.
- Selected/edited row: green border or pale green background.
- Empty table: short message plus Add New Trade and Import Trades actions.

### Forms

- Inputs should use 8px radius, light border, white background, and clear labels.
- Required fields should be obvious through label/content, not only color.
- Form grids should collapse cleanly on mobile.
- Save/cancel buttons should be in modal footer or section action area.

Form states:

- Focus: green outline/ring.
- Error: red border plus short helper text.
- Success: green helper text only when useful.
- Disabled: pale gray background and muted text.
- Loading submit: button text should change or show progress without shifting layout.

### Modals

- Use modals for trade entry, auth, import type, import preview, sample data, and AI pricing gates.
- Modals should include a clear title, close button, body, and footer actions.
- Close/cancel should never perform the destructive action.
- On open, focus the first useful field or control.

### Toasts

- Toasts are for short-lived feedback after saves, imports, auth events, and errors.
- Toast copy should be specific and action-oriented.
- Success toasts use green.
- Error toasts use red.
- Do not use toasts for complex decisions.

### AI Coach

- AI coach panel should feel like a focused assistant, not a separate app.
- Use green gradient or green header treatment for AI identity.
- Keep chat readable with generous line height.
- AI insights should use bordered cards with left accent bars.
- Warnings and errors should use amber/red accent bars.
- Wallet and recharge controls must be visible without dominating the chat.

### Charts

- Charts should use green for positive/profit, red for negative/loss, amber for caution, blue for neutral comparison, and slate for inactive categories.
- Chart legends should be visible and readable.
- Axis labels should use muted slate text.
- Avoid 3D charts, heavy gradients, and decorative chart effects.
- Empty charts should show an action-oriented empty state instead of blank canvases.
- Currency values must use the selected currency symbol where possible.

### Badges and Pills

- Use pills for selected filters, connection states, tags, and compact statuses.
- Pills should use 999px radius.
- Status badges should include text, not color alone.
- Tags should be visually quieter than critical statuses.

## Page-Specific Guidance

### Main Journal

- The first screen should be the usable dashboard, not a marketing hero.
- Dashboard actions should remain prominent: Add New Trade, Quick Add, Import Trades.
- Metrics and charts should update visually without moving the overall layout abruptly.
- Tables should preserve readability over decoration.

### Account Dashboard

- Should feel like profile and setup utility, not a sales page.
- Use concise stats: saved trades, selected platforms, currency, sync mode.
- Platform cards can have hover elevation and selected green state.
- Sign-in state should be obvious.

### Pricing

- Pricing page can be slightly more brand-forward than the app workspace.
- Cards should clearly compare token packs.
- Featured plan may use stronger border/shadow.
- Payment trust copy should be visible near pricing and FAQ.

### Auth and Profile

- Auth should feel secure and low-friction.
- Continue Local must remain visible when sign-in is optional.
- Profile/dashboard views should clearly distinguish Local mode from Cloud mode.
- Do not shame users for staying local.

### Import Flow

- Import type selection should be simple: spreadsheet or PDF.
- Import preview should prioritize date, direction, asset, quantity, entry, exit, fees, and P&L.
- Confirm Import should be primary only after parsed rows exist.
- Error states should explain file type, missing data, or parsing failure.

### Payment Flow

- Payment CTAs must be visually strong but not pushy.
- Token balance should appear near recharge controls.
- Successful recharge should show new balance.
- Failed or cancelled payment should never look like success.

## Mobile Requirements

- Main journal must remain usable on common mobile widths.
- Tab navigation may wrap or horizontally scroll.
- Wide tables should scroll horizontally.
- Modals should fit within viewport height and allow internal scrolling.
- Primary action clusters should wrap cleanly.
- Form fields should become one column.
- AI coach panel should use full width or near-full width on mobile.
- Text in buttons must not overflow; allow wrapping or tighter labels where needed.

Responsive breakpoints:

- Small mobile: below `480px`.
- Mobile/tablet: `480px` to `767px`.
- Tablet: `768px` to `1023px`.
- Desktop: `1024px` and above.

Mobile priorities:

- Keep Add New Trade, Quick Add, Import Trades, and AI Coach reachable.
- Collapse metric grids to 1-2 columns.
- Use horizontal scrolling for large data tables.
- Keep modal footers visible or easy to reach.
- Avoid fixed-width panels wider than the viewport.

## Accessibility Considerations

- Maintain strong contrast between text and backgrounds.
- Never rely on color alone for win/loss or success/error; include text labels or icons where possible.
- Focus states should use green focus ring with visible outline.
- All modals need accessible labels.
- Close buttons need descriptive labels.
- Tables should keep clear headers.
- Toasts should use live-region behavior.
- Inputs must have labels.
- Touch targets should be at least 40px high where practical.
- Avoid tiny text below 11px.

Accessibility checklist:

- Every input has a visible label.
- Every icon-only action has an `aria-label`.
- Every modal has a title connected to the dialog.
- Keyboard focus is visible at all times.
- Tab navigation works without a mouse.
- Error messages are text-based, not color-only.
- Charts have nearby textual metrics or summaries.
- Links and buttons are visually distinguishable.

## Motion and Interaction

- Use short transitions, around `150ms` to `250ms`.
- Hover effects should be subtle: slight elevation, border color change, or background change.
- Tab changes can use a light fade/slide but should feel instant.
- AI panel slide-in is acceptable.
- Avoid motion that changes layout unexpectedly.
- Loading states should be calm and clear.

Loading patterns:

- Use inline loading text for wallet, auth, and cloud sync.
- Use skeletons or empty containers only when layout would otherwise jump.
- Use a spinner for AI generation only when the wait is expected to be noticeable.
- Never block local journal actions while unrelated AI/payment requests are loading.

## Content Tone in UI

- Keep labels short and direct.
- Use trading language traders understand: P&L, win rate, strategy, risk, setup, review.
- Avoid hype, promises, or guaranteed performance language.
- Empty states should tell the user the next useful action.
- Error messages should explain what happened and what to try next.

Preferred copy examples:

- Empty trades: “No trades yet. Add a trade or import your broker file to start analysis.”
- Empty AI context: “Add a few trades first so the AI coach can use your real data.”
- Payment success: “Recharge successful. Your AI token balance has been updated.”
- Payment failure: “Payment could not be verified. No tokens were credited.”
- Cloud sync: “Signed in. Your journal will sync to Supabase.”

## Component Do and Do Not

Do:

- Use green for primary action and success.
- Use red carefully for losses and destructive actions.
- Keep tables clean and compact.
- Use badges for statuses.
- Use consistent 8px control radius.
- Use cards for repeated objects.
- Keep the dashboard immediately usable.

Do not:

- Convert the app into a landing page first.
- Use large decorative illustrations in the app workspace.
- Add new color palettes without updating this brief.
- Use heavy shadows on every card.
- Hide primary actions behind menus on desktop.
- Make AI responses visually louder than journal data.
- Add visual clutter around trading metrics.

## Design QA Checklist

Before considering a UI change done:

- Primary action is visible without searching.
- Text fits in buttons, cards, tabs, and table cells.
- Empty, loading, success, and error states exist.
- Mobile layout has no incoherent overlap.
- Keyboard focus is visible.
- Win/loss states are clear without relying only on color.
- New colors match this brief or are added here intentionally.
- The screen still feels like a trading journal, not a generic SaaS template.

## Reference Apps

- Linear: disciplined spacing, clean controls, restrained visual hierarchy.
- Vercel: crisp surfaces, simple cards, clean typography.
- Notion: readable utility and calm workspace feel.
- TradingView/Broker dashboards: dense but organized market/trade data.

## Design Success Criteria

The UI is successful when:

- A new user can find Add New Trade, Import Trades, and AI Coach immediately.
- A returning user can scan performance in under 10 seconds.
- Trade tables remain readable on desktop and usable on mobile.
- Win/loss, warnings, AI advice, and payment states are visually distinct.
- The app feels like one coherent product across journal, dashboard, pricing, and AI coach.
- No screen relies on decoration to feel polished.
