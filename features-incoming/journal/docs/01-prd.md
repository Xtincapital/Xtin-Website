# Document 01 - Product Requirements Document

## App Name

Xtin Journal

## Tagline

AI-powered trading journal that helps traders understand performance, improve discipline, and make better decisions.

## Problem

Active traders often record trades inconsistently, miss behavioral patterns, and struggle to turn raw performance data into practical improvement. The pain is strongest for self-directed retail traders who need a simple way to review execution, risk, psychology, and strategy quality without building spreadsheets or hiring a coach.

## Target User

The primary user is a self-directed trader who places regular trades and wants to improve consistency, discipline, and risk management. They are comfortable using web tools, care about performance data, and want concise coaching insights without spending hours analyzing their journal manually.

## Secondary Users

- New traders who need structure for reviewing trades and avoiding impulsive decisions.
- Part-time traders who cannot spend hours maintaining spreadsheets but still want weekly feedback.
- Paid AI users who value coaching, weekly reviews, and pre-trade checks enough to purchase token packs.

## Core Value Proposition

Xtin Journal combines trade logging, analytics, behavioral alerts, and an AI coach in one focused workflow. Unlike a generic spreadsheet or chat assistant, it uses trading context to surface patterns, review decisions, and help users build better habits over time.

## Product Principles

- Make trade review faster than maintaining a spreadsheet.
- Focus coaching on process, discipline, and risk management rather than trade calls.
- Show users their actual numbers wherever possible.
- Keep the first-time experience simple enough that a user can log a trade without reading instructions.
- Treat AI as a coach and analyst, not as a signal provider.

## Core Features (Must Have)

- Trade logging workflow for recording trade details.
- Performance analytics with strategy-level breakdowns.
- Behavioral pattern alerts for discipline and risk control.
- AI coach chat with trade-context awareness.
- AI pre-trade checklist for decision support before entering trades.
- Weekly AI review that summarizes performance, mistakes, strengths, and next steps.
- AI credit wallet and payment flow for paid AI usage.
- Health check and deployment-ready backend configuration.

## Key Screens

- Home page: Introduces the product and moves users into the journal workflow.
- Dashboard: Primary workspace for trade logging, journal review, goals, analytics, and AI coach access.
- Trade entry form: Captures trade details, strategy, risk, emotion, notes, and outcome.
- Analytics view: Shows performance metrics, strategy breakdowns, win rate, profit factor, expectancy, and trends.
- AI coach view: Lets users ask questions, run pre-trade checks, generate weekly reviews, and see wallet balance.
- Pricing page: Shows AI token packs and explains prepaid usage.

## User Journey

1. User lands on Xtin Journal and understands it is an AI-powered trading journal.
2. User opens the dashboard and logs the first trade.
3. User reviews initial analytics after one or more trades are added.
4. User runs AI analysis to identify patterns, strengths, and weaknesses.
5. User uses the pre-trade checklist before entering a new trade.
6. User returns at the end of the week to generate a weekly review.
7. User buys AI tokens when free or existing credits are exhausted.

## Nice to Have

- Broker import or CSV import.
- Screenshot and chart annotation support.
- Goal tracking for trading plans and rules.
- Streaks or habit tracking for process discipline.
- Multi-account or multi-portfolio support.
- Community benchmarks or anonymized peer comparisons.
- Mobile-first trade entry flow.

## Out of Scope

- Live trade execution or broker order placement.
- Financial advice, guaranteed trade signals, or profit predictions.
- Real-time market data streaming.
- Tax filing or formal accounting features.
- Social trading, copy trading, or public leaderboards.
- Enterprise team administration.
- Native iOS or Android apps for this version.

## User Stories

- As a trader, I want to log every trade with relevant details so that I can review my process instead of relying on memory.
- As a trader, I want to see performance analytics by strategy so that I know which setups are actually working.
- As a trader, I want behavioral alerts so that I can catch revenge trading, overtrading, poor risk control, and discipline issues.
- As a trader, I want an AI coach that understands my trade history so that I can get specific feedback instead of generic advice.
- As a trader, I want a pre-trade checklist so that I can slow down and validate a setup before entering.
- As a trader, I want a weekly review so that I can identify patterns and choose focused improvements for the next week.
- As a paying user, I want a clear AI credit balance so that I understand how much AI usage I have available.

## MVP Acceptance Criteria

### Trade Logging

- Users can add, edit, and review trades from the dashboard.
- A trade can include asset, market, buy/sell direction, quantity, entry price, exit price, stop loss, target, strategy, notes, tags, and emotion.
- Saved trades are available for analytics and AI context.

### Analytics

- Users can view total P&L, win rate, profit factor, expectancy, and trade count.
- Users can compare performance by strategy.
- Empty states guide users to add trades when no data exists.
- Analytics update when trade data changes.

### Behavioral Alerts

- The system identifies process and risk issues from journal data.
- Alerts are written in plain language and include a practical next step.
- Alerts do not make guaranteed profit claims or direct users to buy or sell a specific instrument.

### AI Coach

- Users can ask questions about their trade history.
- AI answers reference actual user metrics when available.
- AI responses stay concise by default and focus on improvement.
- AI use deducts tokens from the user's wallet when paid AI usage is required.

### Pre-Trade Checklist

- Users can submit intended trade context before entry.
- The system returns a brief risk/process assessment.
- The checklist encourages rule validation and position sizing discipline.
- The checklist does not approve trades as guaranteed winners.

### Weekly Review

- Users can generate a weekly review from recent trades.
- Review includes performance summary, strengths, mistakes, behavioral patterns, and next-week focus.
- When no trades exist, the review returns a useful empty state.

### AI Credits and Payments

- Users can view AI token balance.
- Users can purchase predefined token packs through Razorpay.
- Successful payment verification credits the wallet.
- Duplicate payment credits are prevented.

## Data Requirements

### Trade Data

- Trade ID
- User ID
- Date
- Entry time and exit time
- Trade type
- Market or instrument category
- Asset or symbol
- Buy/sell direction
- Quantity
- Entry price
- Exit price
- Stop loss
- Target price
- Brokerage or fees
- Strategy
- Margin or capital used
- Tags
- Emotion
- Notes
- Computed P&L
- Created and updated timestamps

### AI Wallet Data

- User ID
- Token balance
- Tokens purchased
- Tokens used
- Last recharge details
- Credited payment IDs
- Updated timestamp

### AI Context Data

- Recent trades
- Aggregate metrics
- Strategy performance
- Behavioral alerts
- User-selected prompt or question

## AI Behavior Guidelines

- The AI must act as a trading journal coach, not a financial advisor.
- The AI should focus on risk, discipline, planning, review, and process quality.
- The AI should reference actual journal data when available.
- The AI should clearly say when there is not enough data to make a useful observation.
- The AI must not guarantee profits, predict certainty, or instruct the user to enter a specific trade.
- The AI should avoid hype, fear-based language, and overconfident claims.
- The AI should keep routine answers short and expand only when the user asks for deeper analysis.

## Monetization

- AI features use prepaid token packs.
- Token packs are sold through Razorpay.
- Core journaling and analytics should remain useful without forcing immediate payment.
- Paid AI usage should include coach chat, pre-trade checks, and weekly reviews.
- Users should always be able to see their current token balance before or during AI interactions.

## Trust, Safety, and Compliance

- The product should include clear language that Xtin Journal is not a financial advisor.
- AI output should be positioned as educational and reflective coaching.
- Payment verification must happen server-side.
- Secrets such as payment keys and AI API keys must not be exposed in frontend code.
- User trade data should be handled as sensitive personal financial data.
- Production deployments must use configured CORS origins rather than open origins.

## Non-Functional Requirements

- Dashboard interactions should feel fast for common journal workflows.
- Backend health check must be available for deployment monitoring.
- AI endpoints should return useful errors when tokens, API keys, or upstream services are unavailable.
- The UI should work on desktop and common mobile screen sizes.
- The product should be deployable with the existing frontend and backend hosting setup.

## Launch Scope

Version 1 is complete when users can log trades, view analytics, identify behavioral patterns, chat with the AI coach, run pre-trade checks, generate weekly reviews, purchase AI credits, and deploy the app with documented backend/frontend configuration.

## Risks and Assumptions

- Users may enter incomplete or inaccurate trade data, which can reduce analysis quality.
- AI costs may rise if prompts are too long or usage grows faster than token revenue.
- Traders may misunderstand AI feedback as financial advice if product language is not careful.
- Payment and wallet persistence depend on correct Razorpay and Supabase configuration.
- Early analytics may feel less useful until a user has logged enough trades.
- Retail traders may churn if the product does not create value within the first session.

## Open Questions

- Should Xtin Journal require authentication in v1, or continue supporting a lightweight local/user-id flow?
- Which markets should be explicitly supported first: stocks, futures, options, crypto, forex, or all user-defined assets?
- Should broker or CSV imports be prioritized before native mobile support?
- What free AI allowance should new users receive, if any?
- Should token pricing differ for Indian users and international users?
- What minimum trade count should trigger more confident AI pattern detection?

## Success Metrics

- 100 signups in the first week after launch.
- At least 60% of new users log one or more trades within 24 hours.
- At least 40% of active users return for a weekly review.
- AI coach satisfaction score greater than 80%.
- Pre-trade checklist completion rate greater than 50% among active users.
- Payment conversion rate greater than 5% from active AI users.
- Backend health check uptime greater than 99% during the first production month.
