# Document 03 - App Flow

## Pages List
Public pages:
- / (Landing / marketing home)
- /about (About)
- /products (Products overview)
- /help (Support / Help Center)
- /terms (Terms of Service)
- /algo-terms (Algorithm terms)
- /privacy (Privacy policy)
- /login (User login)
- /signup (User signup)
- /forgot-password (Password reset request)
- /reset-password (Password reset form)
- /advisor/login (Advisor login)
- /advisor/dashboard (Advisor dashboard)
- /advisory/submissions (Advisor submissions)
- /intro/advisory
- /intro/algorithms
- /intro/dashboard
- /intro/learn
- /intro/newsletter
- /intro/tools
- /intro/journal
- /intro/gini
- /intro/fundakamental
- /intro/mutualfunds
- /intro/mutalfunds (alias)
- /fundakamental (Fundamental analysis home)
- /mutualfunds (Mutual funds home)
- /mutalfunds (Mutual funds home alias)

Core app (auth-protected by modal or redirect):
- /dashboard (User dashboard)
- /tools (Tools hub)
- /tools/index
- /tools/cagr
- /tools/compound-interest
- /tools/elss
- /tools/epf
- /tools/fd
- /tools/gratuity
- /tools/hra
- /tools/income-tax
- /tools/inflation
- /tools/lumpsum
- /tools/nps
- /tools/ppf
- /tools/rd
- /tools/retirement
- /tools/simple-interest
- /tools/sip
- /tools/ssy
- /tools/ssy-calculator
- /tools/step-up-sip
- /tools/swp
- /tools/real-estate-investment
- /learn (Learn hub)
- /algos (Algorithms)
- /advisory (Advisory)
- /newsletter (Newsletter index)
- /newsletter/:id (Newsletter detail)
- /journal (Journal landing)
- /gini (Gini landing)

Courses:
- /courses/:courseId
- /courses/:courseId/purchase

Learn modules and lessons (auth-protected):
- /learn/personal-finance-basics
- /learn/personal-finance-lesson-1..9
- /learn/emergency-fund
- /learn/emergency-fund-lesson-1..15
- /learn/money-mindset
- /learn/money-mindset-lesson-1..15
- /learn/financial-planning
- /learn/financial-planning-lesson-1..15
- /learn/mutual-funds
- /learn/mutual-funds-lesson-1..6
- /learn/stock-market
- /learn/stock-market-lesson-1..7
- /learn/trading-basics
- /learn/trading-basics-lesson-1..7
- /learn/technical-analysis
- /learn/technical-analysis-lesson-2..7
- /learn/algorithmic-trading
- /learn/algo-trading-lesson-1..9
- /learn/risk-management
- /learn/risk-lesson-1..7
- /learn/long-term-investing
- /learn/lti-lesson-1..7
- /learn/portfolio-construction
- /learn/pc-lesson-1..12
- /learn/derivatives
- /learn/deriv-lesson-1..7
- /learn/derivatives/lesson-1..12
- /learn/taxes
- /learn/tax-lesson-1..6
- /learn/debt-management
- /learn/debt-management-lesson-1..15
- /learn/insurance
- /learn/insurance-lesson-1..7
- /learn/retirement-planning
- /learn/retirement-planning-lesson-1..7
- /learn/real-estate
- /learn/real-estate-lesson-1..10
- /learn/crypto
- /learn/crypto-lesson-1..15
- /learn/estate-planning
- /learn/estate-planning-lesson-1..12

System:
- * (Not Found)

## Navigation Type
- Desktop: Top navbar with primary links and a user greeting button.
- Mobile: Hamburger menu with the same links + user name shortcut.
- Global: Back button appears on all pages except the home page.
- Learn course detail: Left sidebar for course chapters and lessons.

## First Screen
- New visitors land on / (Landing page).

## Auth Flow
- Signup: /signup -> login -> /dashboard (default) or returnUrl.
- Email/password login: /login -> redirect to stored returnUrl or stay on flow opener.
- OAuth (Google): redirects to returnUrl if present, otherwise /dashboard.
- Protected pages:
  - /dashboard uses redirect to /login.
  - Tools, Learn modules, Advisory, Newsletter, Journal, Algorithms use sign-in modal.

## Core User Journey 1
Goal: Use a calculator
1) Visitor lands on / and clicks Tools.
2) If logged out, sign-in modal opens.
3) After login, user returns to /tools.
4) User selects a calculator route (e.g., /tools/sip).

## Core User Journey 2
Goal: Learn a module
1) User opens /learn.
2) Selects a module (e.g., /learn/stock-market).
3) Opens a lesson (e.g., /learn/stock-market-lesson-1).
4) Progress is tracked and shown in course sidebar when in course views.

## Core User Journey 3
Goal: Read newsletter
1) User opens /newsletter.
2) Picks a newsletter -> /newsletter/:id.
3) Can return to /newsletter using back navigation.

## Empty States
- Dashboard: no portfolios, no recent activity.
- Newsletter list: no issues available.
- Advisory: no advisor matches or submissions.
- Learn: no progress yet, show intro state.

## Error States
- Login/signup errors (invalid credentials, network error).
- Protected route access without auth (modal or redirect).
- Newsletter fetch errors (show retry CTA).
- Course data not found (show Not Found).

## Modal / Drawer / Overlay Interactions
- Sign-in modal appears for protected tools and module pages.
- Mobile navigation uses a slide-down menu overlay.

## Redirects
- /dashboard: unauthenticated -> /login (with return URL state).
- ProtectedPageRoute: unauthenticated -> sign-in modal; close -> /; success -> returnUrl.
- ProtectedModuleRoute: unauthenticated -> sign-in modal; close -> /learn; success -> returnUrl.
- OAuth sign-in: redirect to returnUrl if set, else /dashboard.
- Catch-all route -> NotFound.
