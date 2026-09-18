#!/usr/bin/env node

// Debug script for newsletter cron jobs
import dotenv from 'dotenv';
dotenv.config();

console.log('🕒 Newsletter Cron Debug Script');
console.log('================================');
console.log('Current UTC time:', new Date().toISOString());
console.log('Current IST time:', new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}));
console.log('');

// Check environment variables
console.log('📋 Environment Variables Check:');
const requiredVars = [
  'NODE_ENV',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY',
  'EMAIL_USER',
  'EMAIL_PASS'
];

const missingVars = [];
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const display = value ? (value.length > 20 ? value.substring(0, 20) + '...' : value) : 'NOT SET';
  console.log(`  ${status} ${varName}: ${display}`);
  if (!value) missingVars.push(varName);
});

console.log('');

if (missingVars.length > 0) {
  console.log('❌ Missing Environment Variables:', missingVars.join(', '));
  console.log('⚠️  Newsletter generation will likely fail!');
} else {
  console.log('✅ All required environment variables are set!');
}

// Test imports
console.log('');
console.log('📦 Testing Module Imports:');
try {
  console.log('  📄 Loading newsletter generator...');
  const { generateAndSendNewsletter } = await import('./utils/newsletterGeneratorSimple.js');
  console.log('  ✅ Newsletter generator loaded successfully');
  
  console.log('  📄 Loading Supabase...');
  const supabase = await import('./supabase/index.js');
  console.log('  ✅ Supabase client loaded successfully');
  
  console.log('  📄 Testing Supabase connection...');
  const { data, error } = await supabase.default
    .from('users')
    .select('count', { count: 'exact', head: true });
    
  if (error) {
    console.log('  ⚠️  Supabase connection test failed:', error.message);
  } else {
    console.log('  ✅ Supabase connection test passed');
  }
  
} catch (error) {
  console.log('  ❌ Module import failed:', error.message);
}

console.log('');
console.log('⏰ Render Cron Schedule Information:');
console.log('  ┌─────────────────────────────────────────────────────────┐');
console.log('  │  CRON JOBS ARE CONFIGURED IN render.yaml                │');
console.log('  │  They run INDEPENDENTLY of the web service!             │');
console.log('  └─────────────────────────────────────────────────────────┘');
console.log('');
console.log('  📧 Morning Newsletter:');
console.log('     Schedule: 30 2 * * * (2:30 AM UTC = 8:00 AM IST)');
console.log('     Command:  npx tsx run-newsletter-cron.ts morning');
console.log('');
console.log('  📧 Evening Newsletter:');
console.log('     Schedule: 30 11 * * * (11:30 AM UTC = 5:00 PM IST)');
console.log('     Command:  npx tsx run-newsletter-cron.ts evening');
console.log('');
console.log('  🏓 Keep-Alive Ping:');
console.log('     Schedule: */10 * * * * (Every 10 minutes)');
console.log('     Command:  npx tsx keep-alive.ts');
console.log('     Purpose:  Prevents free tier web service from sleeping');
console.log('');
console.log('💡 Important Notes:');
console.log('  1. Render cron jobs run as SEPARATE services');
console.log('  2. Each cron job needs its own ENV VARS in Render dashboard');
console.log('  3. The in-process node-cron is a backup when server is running');
console.log('  4. For manual testing: npm run cron:morning or npm run cron:evening');
console.log('');
console.log('🌐 Manual Trigger Endpoint:');
console.log('  POST /api/trigger-newsletter?token=CRON_SECRET_TOKEN');
console.log('');
console.log('🎉 Debug check completed!');

process.exit(0);