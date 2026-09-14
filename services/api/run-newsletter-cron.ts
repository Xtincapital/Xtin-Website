#!/usr/bin/env node
/**
 * Newsletter Cron Job Runner
 * 
 * This script is designed to be run by Render's cron service.
 * It generates and sends newsletters independently of the main web service.
 * 
 * Usage:
 *   npx tsx run-newsletter-cron.ts [morning|evening]
 */

import dotenv from 'dotenv';
dotenv.config();

const cronType = process.argv[2] || 'scheduled';

console.log(`[Newsletter Cron] Starting ${cronType} newsletter job`);
console.log(`[Newsletter Cron] UTC Time: ${new Date().toISOString()}`);
console.log(`[Newsletter Cron] IST Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
console.log('');

// Verify required environment variables
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'CRON_SECRET_TOKEN'
];

const missingVars = requiredVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error('[Newsletter Cron] ❌ Missing environment variables:', missingVars.join(', '));
  process.exit(1);
}

const hasSmtp = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
if (!hasSmtp) {
  console.error('[Newsletter Cron] ❌ SMTP is not configured. Set EMAIL_USER and EMAIL_PASS for Gmail sending.');
  process.exit(1);
}

if (process.env.SENDGRID_API_KEY) {
  console.log('[Newsletter Cron] ℹ️ SENDGRID_API_KEY is set but ignored (SMTP-only mode active).');
}

console.log('[Newsletter Cron] ✅ All required environment variables present');

try {
  console.log('[Newsletter Cron] Loading newsletter generator...');
  const { generateAndSendNewsletter } = await import('./utils/newsletterGeneratorSimple.js');
  
  console.log('[Newsletter Cron] Generating and sending newsletter...');
  const result = await generateAndSendNewsletter();
  
  console.log('[Newsletter Cron] ✅ Newsletter job completed successfully');
  console.log('[Newsletter Cron] Result:', JSON.stringify(result, null, 2));
  
  process.exit(0);
} catch (error) {
  console.error('[Newsletter Cron] ❌ Newsletter job failed:', error.message);
  console.error('[Newsletter Cron] Stack:', error.stack);
  process.exit(1);
}
