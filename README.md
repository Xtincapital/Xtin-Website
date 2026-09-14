# Xtin Capital

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-47A248?logo=mongodb)](https://www.mongodb.com/)

Xtin Capital is a modern web application built with React and Node.js, designed to provide a robust platform for financial management and investment tracking. The application follows a clean architecture pattern with separate frontend and backend services.

## ✨ Features

- **User Authentication**: Secure login and registration system with JWT
- **Dashboard**: Interactive financial dashboard with data visualization
- **Investment Tracking**: Monitor and manage investment portfolios
- **Responsive Design**: Fully responsive UI that works on all devices
- **Real-time Updates**: Live updates for financial data and transactions
- **Secure API**: RESTful API with proper authentication and validation
- **Region-Aware Currency**: Automatic IP-based region detection with live FX rates and locale-aware formatting

## 🌍 Region-Aware Currency System

Xtin Capital includes a fully internationalized currency formatting system that automatically adapts to each visitor's country.

### How It Works

```
Visitor arrives → IP geolocation (ipapi.co → ipwho.is) → Region detected
                                                              ↓
                                              Currency & locale configured
                                                              ↓
                                      All prices auto-format in local currency
```

| Feature | How |
|---------|-----|
| **Region detection** | IP geo (2s timeout) → timezone/locale heuristic → manual override via RegionSwitcher |
| **Live FX rates** | Frankfurter API (cached 12h in localStorage, hardcoded fallback rates) |
| **Formatting** | Native `Intl.NumberFormat` — correct for en-IN (₹1,23,456), en-US ($123,456), de-DE (123.456,78 €) |
| **No browser popups** | Uses server-side IP APIs, NOT the browser's Geolocation API |
| **Loading states** | Graceful `—` skeleton and animated pulse while geo/FX data resolves |
| **Compact mode** | India: ₹14.23Cr / ₹5L. Global: $142.3M / $5K |

### Key Files

| File | Purpose |
|------|---------|
| `apps/web/src/contexts/CurrencyContext.tsx` | React Context provider + `useCurrency()` hook |
| `apps/web/src/components/Price.tsx` | `<Price>` and `<PriceGroup>` drop-in components |
| `apps/web/src/contexts/CURRENCY_REFACTOR_GUIDE.md` | Complete migration guide with before/after examples |
| `apps/web/src/hooks/useRegion.ts` | Bridge — prefers `CurrencyContext`, falls back to standalone |
| `apps/web/src/lib/region.ts` | IP geo, FX rates, region config, format helpers |
| `apps/web/src/lib/learnPlan.ts` | `formatLearnPrice()` — refactored to use `Intl.NumberFormat` |
| `apps/web/src/features/newsletter/lib/newsletterPlan.ts` | `formatNewsletterPrice()` — refactored to use `Intl.NumberFormat` |

### Quick Usage

```jsx
// Drop-in replacement for hardcoded <span>$49.99</span>
import Price from '../components/Price';

<Price amount={49.99} className="text-xl font-bold" />

// With FX conversion (USD → local currency)
<Price amount={50} convert />

// Compact mode (1.2K, 5L, 2Cr)
<Price amount={5000000} compact />

// Comparison pricing (monthly vs yearly)
<PriceGroup
  primaryAmount={2.99}
  primaryLabel="/month"
  secondaryAmount={29.99}
  secondaryLabel="/year"
/>
```

### Supported Regions

| Code | Name | Currency | Symbol | Locale |
|------|------|----------|--------|--------|
| IN | India | INR | ₹ | en-IN |
| US | United States | USD | $ | en-US |
| GB | United Kingdom | GBP | £ | en-GB |
| EU | Europe | EUR | € | de-DE |
| AE | UAE | AED | AED | en-AE |
| SG | Singapore | SGD | S$ | en-SG |
| GLOBAL | Rest of World | USD | $ | en-US |

## 🚀 Tech Stack

### Frontend
- **Framework**: React 19
- **State Management**: React Context API (AuthContext, CurrencyContext, ThemeContext)
- **Styling**: Tailwind CSS
- **Charts**: Recharts & Chart.js
- **Routing**: React Router v7
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + custom JWT
- **Validation**: Zod
- **AI Integration**: Claude (Anthropic), Groq (Llama), OpenAI

## 🛠️ Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Git
- Supabase account (for database + auth)

## 🚀 Getting Started

### Clone the Repository

```bash
git clone https://github.com/yourusername/Xtin-capital.git
cd Xtin-capital
```

This repo is an **npm workspaces monorepo** (`apps/web` = frontend, `services/api`
= backend). `npm install` at the repo root installs both at once and is the
recommended path; the per-directory steps below still work if you prefer running
each service independently.

```bash
npm install                       # installs apps/web + services/api
npm run dev:api                   # start the backend (services/api)
npm run dev:web                   # start the frontend (apps/web), in another terminal
```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd services/api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `sample.env`:
   ```bash
   cp sample.env .env
   ```
   Update the environment variables in the `.env` file with your configuration.

4. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend server will start at `http://localhost:5000` by default.

### Frontend Setup

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd ../../apps/web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (optional — defaults work for local development):
   ```bash
   touch .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173` by default.

## 📁 Project Structure

```
Xtin-capital/
├── apps/web/                 # Frontend React application
│   ├── public/             # Static assets
│   └── src/                # Source code
│       ├── assets/         # Images, fonts, etc.
│       ├── components/     # Reusable UI components
│       │   ├── calculcators/   # SIP, FD, PPF, Tax, etc.
│       │   ├── learn/          # Learn upgrade modal, lock screen
│       │   ├── newsletter/     # Pro upgrade modal, celebration
│       │   ├── chat/           # Chat widget, conversations
│       │   └── ...             # Navbar, Footer, Price, etc.
│       ├── contexts/       # React context providers
│       │   ├── AuthContext.tsx      # User authentication
│       │   ├── CurrencyContext.tsx  # Region, FX, formatting (NEW)
│       │   └── ThemeContext.tsx     # Dark/light mode
│       ├── hooks/          # Custom React hooks
│       │   └── useRegion.ts         # Region binding (bridge)
│       ├── lib/            # Business logic
│       │   ├── region.ts           # IP geo, FX rates, format helpers
│       │   └── learnPlan.ts        # Learn Pro pricing + gating
│       ├── features/       # Feature-folder pages, components & services
│       └── utils/          # Utility functions
│
├── services/api/                # Backend Node.js application
│   ├── constants/          # Config, constants
│   ├── controllers/        # Request handlers
│   ├── middlewares/        # Express middlewares (auth, advisorAuth)
│   ├── repository/         # Database access layer
│   ├── routes/             # API routes
│   ├── services/           # Business services
│   ├── supabase/           # Supabase client
│   ├── utils/              # Utility functions
│   └── validators/         # Request validation
```

This is an **npm workspaces monorepo** — see `documents/migration/PLAN.md` for the
full consolidation roadmap (bringing XTIN Gini, Journal, and FundaKaMental into
this same repo) and `documents/AUDIT.md` for the architecture audit behind it.

## 🤝 Contributing

We welcome contributions to Xtin Capital! Please read our [Contribution Guidelines](CONTRIBUTION.md) for details on our code of conduct and the process for submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For any questions or feedback, please contact [Your Name] at [your.email@example.com]

---

<div align="center">
  Made with ❤️ by the Xtin Capital Team
</div>
