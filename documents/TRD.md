> **⚠️ Historical document — written before this migration.** Several
> items below are now stale: `chart.js`/`react-chartjs-2` were dropped in
> favor of `recharts` only, Daily.co video calling was retired in Phase 4,
> `jsonwebtoken` was removed entirely in Phase 12 (Supabase session tokens
> are now the only auth credential — see `documents/adr/
> 0002-supabase-only-auth.md`), and the `Client/`/`backend/` folder names
> and `.mjs` file convention were renamed/converted in Phases 1 and 5. Kept
> as a record of the original technical thinking, not current
> architecture. For current state, see `documents/adr/`, `README.md`'s
> Tech Stack section, and `database/SCHEMA.md`.

# Document 02 - TRD

## Frontend
- React 18 + Vite
- Tailwind CSS
- React Router

## Backend
- Node.js 18+
- Express.js (ESM modules)

## Database
- PostgreSQL via Supabase

## Auth
- Supabase Auth (JWT-based access tokens)

## Hosting
- Frontend: Vercel (Vite build)
- Backend: Render (Node web service)
- Database: Supabase

## Third-party APIs
- Supabase: database + auth
- Anthropic: AI features (Claude models)
- Groq: AI fallback provider (OpenAI-compatible)
- OpenAI: AI fallback provider
- Daily.co: video calling
- EmailJS: client-side email
- SendGrid / SMTP (Nodemailer): newsletter delivery
- Cloudinary: file storage / media
- Razorpay: advisory payments
- cron-job.org: newsletter cron triggers

## Key Libraries
Frontend:
- @supabase/supabase-js
- react-router-dom
- chart.js, react-chartjs-2, recharts
- framer-motion
- lucide-react, react-icons
- react-markdown, remark-gfm
- @daily-co/daily-react

Backend:
- express
- @supabase/supabase-js
- openai (OpenAI/Groq compatible)
- axios
- jsonwebtoken
- zod
- nodemailer / @sendgrid/mail
- multer
- node-cron

## Folder Structure and Naming Conventions
- Frontend: Client/ with src/ organized by components/, pages/, contexts/, hooks/, utils/, services/
- Backend: backend/ with routes/, controllers/, repository/, middlewares/, utils/, constants/
- ES modules for backend (.mjs)
- Route files use *.routes.mjs, controllers use *.controller.mjs

## Environment Variables
Backend:
- NODE_ENV
- HOST
- PORT
- API_URL
- JWT_SECRET
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- GROQ_API_KEY
- OPENAI_API_KEY
- ANTHROPIC_API_KEY
- ANTHROPIC_MODEL
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- CLOUDINARY_URL
- EMAIL_HOST
- EMAIL_PORT
- EMAIL_SECURE
- EMAIL_USER
- EMAIL_PASS
- EMAIL_FROM
- EMAIL_FROM_NAME
- EMAIL_REPLY_TO
- SENDGRID_API_KEY
- BACKEND_URL
- CRON_SECRET_TOKEN
- DAILY_API_KEY
- NEWSLETTER_DATE_OVERRIDE
- ALLOW_NEWSLETTER_DATE_OVERRIDE
- CORS_ORIGIN

Frontend (Vite):
- VITE_BACKEND_URL
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_GOOGLE_CLIENT_ID
- VITE_API_BASE_URL
- VITE_RAZORPAY_ADVISORY_BUTTON_ID

## Constraints
- Must work on mobile and desktop
- Prefer free tiers where possible (Render free, cron-job.org)
- Backend must accept CORS for production domains
- Keep newsletter cron external to Render
