# 🚀 Deployment Guide - Xtin Capital

Complete guide to deploy the Xtin Capital application on **Vercel** (Frontend) and **Render** (Backend).

---

## 📋 Prerequisites

- GitHub account with your code repository
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Render account (sign up at [render.com](https://render.com))
- Supabase project (already configured)
- All API keys ready (GROQ, OpenAI, Email credentials)

---

## 🎯 Part 1: Deploy Backend on Render

### Step 1: Connect GitHub Repository

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the `Xtincapital/Xtin-Website` repository (repo moved here as part of the Supabase/secret-rotation migration — see `documents/migration/PLAN.md`)

### Step 2: Configure Web Service

**Basic Settings:**
- **Name:** `xtin-capital-backend`
- **Region:** Singapore (or closest to your users)
- **Branch:** `main` (or your production branch)
- **Root Directory:** `services/api`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npx tsx index.ts`

**Instance Type:**
- Select **Free** (or paid plan for better performance)

### Step 3: Add Environment Variables

Click **"Environment"** tab and add these variables:

```bash
# Required Variables
NODE_ENV=production
PORT=5002

# Supabase Configuration — get these from Supabase Dashboard > Project Settings > API
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Secret - generate with: openssl rand -base64 48
JWT_SECRET=your-strong-random-secret

# NOTE: FRONTEND_URL / FRONTEND_URL_ALT / ALLOWED_ORIGINS do nothing — CORS is
# a hardcoded array (`allowedOrigins`) in services/api/app.ts, not env-driven.
# If your deployed frontend URL isn't in that array, add it there and redeploy
# instead of setting these vars.

# AI APIs
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key

# Email Configuration (Gmail App Password, not your normal password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=your-gmail@gmail.com

# Cron Secret for Newsletter
CRON_SECRET_TOKEN=generate-a-random-token
```

> ⚠️ **Never commit real values here.** This file is a template — copy the values
> into the Render dashboard's Environment tab, don't paste real secrets into this
> document. (A previous version of this file had real production credentials
> committed in plaintext; they were rotated — see
> `documents/migration/PHASE-0-secret-rotation.md`.)

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for the build to complete (5-10 minutes)
3. Once deployed, copy your backend URL: `https://xtincapital-backend-6pf2.onrender.com`

### Step 5: Verify Backend

Test the backend by visiting:
```
https://xtincapital-backend-6pf2.onrender.com/health
```

You should see a JSON response with `status: "healthy"`.

---

## 🌐 Part 2: Deploy Frontend on Vercel

### Step 1: Connect GitHub Repository

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select the `XtinCapital` repository

### Step 2: Configure Project

**Framework Preset:** Vite

**Root Directory:** `apps/web`

**Build Settings:**
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add:

```bash
# Backend API URL - Use your Render backend URL
VITE_BACKEND_URL=https://xtincapital-backend-6pf2.onrender.com

# Supabase Configuration (anon/public key — safe to expose in the browser bundle)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (3-5 minutes)
3. Once deployed, copy your frontend URL: `https://your-app.vercel.app`

### Step 5: Update Backend CORS

Now that you have your Vercel URL, add it to the hardcoded `allowedOrigins`
array in `services/api/app.ts` (there is no env var for this — see the note
in Step 3) and redeploy the backend.

---

## 🔧 Part 3: Post-Deployment Configuration

### 1. Custom Domain (Optional)

**For Vercel (Frontend):**
1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `xtincapital.com`)
3. Follow DNS configuration instructions

**For Render (Backend):**
1. Go to Settings → Custom Domains
2. Add your API subdomain (e.g., `api.xtincapital.com`)
3. Update DNS records as instructed

### 2. Set Up Newsletter Cron Jobs

Since Render's free plan doesn't include cron jobs, use [cron-job.org](https://cron-job.org) (free):

**Morning Newsletter (8:00 AM IST):**
- URL: `https://xtincapital-backend-6pf2.onrender.com/api/trigger-newsletter?token=YOUR_CRON_SECRET_TOKEN`
- Schedule: `30 2 * * *` (2:30 AM UTC = 8:00 AM IST)
- Method: POST
- Timeout: 300 seconds

**Evening Newsletter (5:00 PM IST):**
- URL: `https://xtincapital-backend-6pf2.onrender.com/api/trigger-newsletter?token=YOUR_CRON_SECRET_TOKEN`
- Schedule: `30 11 * * *` (11:30 AM UTC = 5:00 PM IST)
- Method: POST
- Timeout: 300 seconds

**Keep-Alive Ping (every 14 minutes):**
- URL: `https://xtincapital-backend-6pf2.onrender.com/health`
- Schedule: `*/14 * * * *`
- Method: GET
- Timeout: 30 seconds

### 3. Update Email Templates

If using custom domain, update email links in:
- `services/api/services/mail.service.ts`
- Replace `localhost` URLs with your production domain

---

## ✅ Verification Checklist

After deployment, verify these features:

### Backend:
- [ ] `/health` endpoint returns healthy status
- [ ] `/api/courses/available` returns course data
- [ ] Authentication works (login/signup)
- [ ] Certificate verification works

### Frontend:
- [ ] Homepage loads correctly
- [ ] Navigation works on all pages
- [ ] User authentication (login/signup)
- [ ] Course enrollment and progress tracking
- [ ] Newsletter subscription

(Advisor pages, advisor dashboard, and the in-app chat widget were retired
in Phase 4 of the migration — don't expect them to exist anymore.)

### Integration:
- [ ] Frontend can call backend APIs
- [ ] CORS is working (no console errors)
- [ ] Supabase data loads correctly
- [ ] Images and assets load properly
- [ ] Forms submit successfully

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** CORS errors in browser console
**Solution:** 
1. Check `ALLOWED_ORIGINS` includes your Vercel URL
2. Verify no trailing slashes in URLs
3. Redeploy backend after changes

**Problem:** Backend keeps spinning down (Render free tier)
**Solution:** 
- Set up keep-alive cron job (every 14 minutes)
- First request may be slow as service spins up

**Problem:** Environment variables not working
**Solution:**
- Verify all required variables are set in Render dashboard
- Check for typos in variable names
- Redeploy after adding variables

### Frontend Issues

**Problem:** API calls fail with 404
**Solution:**
- Verify `VITE_BACKEND_URL` is correct
- Check backend is deployed and healthy
- Ensure no trailing slash in backend URL

**Problem:** Build fails on Vercel
**Solution:**
- Check `apps/web` is set as root directory
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

**Problem:** Environment variables not available
**Solution:**
- All Vite env vars must start with `VITE_`
- Redeploy after adding variables
- Clear build cache if needed

---

## 📝 Important Notes

1. **Security:**
   - Never commit `.env` files to GitHub
   - Use strong JWT secrets (32+ characters)
   - Keep API keys secure in platform dashboards

2. **Render Free Tier:**
   - Services spin down after 15 minutes of inactivity
   - First request after spin-down takes 30-60 seconds
   - Limited to 750 hours/month (use keep-alive wisely)
   - Use paid plan for production ($7/month)

3. **Vercel:**
   - Automatic deployments on git push
   - Preview deployments for PRs
   - Free tier is generous for personal projects

4. **Database:**
   - Supabase handles all data storage
   - Schema lives in `database/migrations/*.sql` — run each file once, in
     order, in the Supabase SQL Editor before the first deploy against a
     new project

---

## 🎉 Success!

Your application is now live! Share your URLs:
- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://xtincapital-backend-6pf2.onrender.com`

For ongoing maintenance:
- Monitor logs in respective dashboards
- Set up error tracking (Sentry recommended)
- Keep dependencies updated
- Regular backups of Supabase data

---

## 📞 Support

If you encounter issues:
1. Check platform status pages
2. Review deployment logs
3. Test locally with production URLs
4. Verify all environment variables

Need help? Check:
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
