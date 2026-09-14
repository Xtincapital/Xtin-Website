#!/usr/bin/env node

// Environment check script for authentication configuration
import { config } from './constants/config.js';
import { checkAuthConfig } from './utils/authDebug.js';

console.log('🔍 XtinCapital Backend Authentication Configuration Check');
console.log('=' .repeat(60));

// Check basic configuration
const authStatus = checkAuthConfig();

console.log('📋 Configuration Status:');
console.log('  JWT Secret configured:', authStatus.config.hasJwtSecret);
console.log('  JWT Secret length:', authStatus.config.jwtSecretLength);
console.log('  Supabase URL configured:', authStatus.config.hasSupabaseUrl);
console.log('  Supabase Anon Key configured:', authStatus.config.hasSupabaseAnonKey);
console.log('  Supabase Service Key configured:', authStatus.config.hasSupabaseServiceKey);

if (authStatus.issues.length > 0) {
    console.log('\n❌ Configuration Issues Found:');
    authStatus.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
    });
} else {
    console.log('\n✅ All authentication configuration checks passed!');
}

console.log('\n🌐 Environment Variables Status:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('  PORT:', process.env.PORT || 'not set');
console.log('  API_URL:', process.env.API_URL || 'using default');

// Test JWT creation and verification
if (authStatus.config.hasJwtSecret) {
    try {
        console.log('\n🔐 Testing JWT Creation and Verification...');
        
        const jwt = await import('jsonwebtoken');
        const testPayload = {
            userId: 'test-123',
            email: 'test@example.com',
            iat: Math.floor(Date.now() / 1000)
        };
        
        // Create token
        const token = jwt.default.sign(testPayload, config.JWT_SECRET, {
            expiresIn: '1h',
            algorithm: 'HS256'
        });
        
        console.log('  ✅ JWT token created successfully');
        
        // Verify token
        const verified = jwt.default.verify(token, config.JWT_SECRET, {
            algorithms: ['HS256']
        });
        
        console.log('  ✅ JWT token verified successfully');
        console.log('  📄 Token payload:', JSON.stringify(verified, null, 2));
        
    } catch (error) {
        console.log('  ❌ JWT test failed:', error.message);
    }
}

// Test Supabase connection
if (authStatus.config.hasSupabaseUrl && authStatus.config.hasSupabaseServiceKey) {
    try {
        console.log('\n🗄️ Testing Supabase Connection...');

        // Lazy import: this script's job is to diagnose missing/broken config,
        // and ./supabase/index.mjs throws at import time if the env vars it
        // needs aren't set -- importing it only once we've already confirmed
        // they're present keeps that diagnosis graceful.
        const { default: supabase } = await import('./supabase/index.js');

        // Simple health check query
        const { data, error } = await supabase
            .from('users')
            .select('count', { count: 'exact', head: true });
        
        if (error) {
            console.log('  ⚠️ Supabase query failed:', error.message);
        } else {
            console.log('  ✅ Supabase connection successful');
            console.log('  📊 Users table accessible');
        }
        
    } catch (error) {
        console.log('  ❌ Supabase connection test failed:', error.message);
    }
}

console.log('\n' + '='.repeat(60));
console.log('✨ Configuration check complete!');

if (!authStatus.isValid) {
    console.log('\n🚨 Please fix the configuration issues above before deploying to production.');
    process.exit(1);
} else {
    console.log('\n🎉 All systems ready for authentication!');
    process.exit(0);
}