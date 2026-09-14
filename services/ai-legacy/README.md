
# XtinAI Backend (FastAPI + Gemini) — LEGACY, scheduled for removal

> **Status:** per `documents/migration/PLAN.md` Phase 7, this Python service's
> logic (compliance engine, user profiler, prompt builder, token optimizer,
> knowledge base) is being folded into `services/api` (the Express API) as
> `modules/ai`. This directory is kept temporarily for reference during that
> migration and will be deleted once parity is confirmed. Do not build new
> features here.

This is a lightweight FastAPI service powering the XtinAI chatbot for finance-focused assistance with compliance guardrails.

## Quick start (Windows PowerShell)

1. Configure Python interpreter (3.11+ recommended). This project currently uses `C:/Python313/python.exe`.
2. Install deps:

   - Bootstrap pip if needed:
     - `C:/Python313/python.exe -m ensurepip --upgrade`
   - Install requirements:
     - `C:/Python313/python.exe -m pip install -r requirements.txt`

3. Create `.env` from example and set your keys:

```
copy .env.example .env
# Edit .env and set GEMINI_API_KEY, optional Redis or CORS overrides
```

4. Run the server:

```
C:/Python313/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

5. Health check: http://localhost:8000/api/v1/health

If `GEMINI_API_KEY` is not set, the chat endpoint will return an informative stub message instead of erroring.

## Frontend integration

The React app includes a global floating widget `src/components/ChatWidget.jsx`.
Set the frontend API base URL by creating `.env.local` in the project root:

```
VITE_API_BASE_URL=http://localhost:8000
```

Then run the frontend as usual (`npm run dev`).

## Notes
- Market data, RAG, and Pinecone integrations are stubbed for now to keep the local setup light and avoid native builds. They can be enabled later.
- Redis is optional. If not running, the server will still start, but caching/history requires Redis.
