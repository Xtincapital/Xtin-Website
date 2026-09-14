#!/usr/bin/env node
/**
 * Keep-Alive Script for Render Free Tier
 * 
 * This script pings the main web service to prevent it from sleeping.
 * Run this as a cron job on Render every 10-14 minutes.
 * 
 * Note: This is only needed for Render free tier. Paid plans don't sleep.
 */

import https from 'https';
import http from 'http';

// Get the backend URL from environment or use default
const BACKEND_URL = process.env.BACKEND_URL || process.env.API_URL || 'https://xtin-capital-backend.onrender.com';
const HEALTH_ENDPOINT = `${BACKEND_URL}/health`;

console.log(`[Keep-Alive] Pinging: ${HEALTH_ENDPOINT}`);
console.log(`[Keep-Alive] Time: ${new Date().toISOString()}`);

const protocol = HEALTH_ENDPOINT.startsWith('https') ? https : http;

const req = protocol.get(HEALTH_ENDPOINT, { timeout: 30000 }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log(`[Keep-Alive] ✅ Server is awake (Status: ${res.statusCode})`);
      try {
        const json = JSON.parse(data);
        console.log(`[Keep-Alive] Server status: ${json.status || 'OK'}`);
      } catch {
        console.log('[Keep-Alive] Response received');
      }
      process.exit(0);
    } else {
      console.log(`[Keep-Alive] ⚠️ Unexpected status: ${res.statusCode}`);
      process.exit(0); // Don't fail the cron job
    }
  });
});

req.on('error', (error) => {
  console.error(`[Keep-Alive] ❌ Ping failed: ${error.message}`);
  // Don't exit with error - server might be restarting
  process.exit(0);
});

req.on('timeout', () => {
  console.log('[Keep-Alive] ⚠️ Request timed out - server may be waking up');
  req.destroy();
  process.exit(0);
});
