import jwt from 'jsonwebtoken';
import { config } from '../constants/config.js';

/**
 * Utility to decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {object} Decoded token payload or error info
 */
export const debugToken = (token) => {
    try {
        // Decode without verification to see the payload
        const decoded = jwt.decode(token, { complete: true });
        
        if (!decoded) {
            return { error: 'Unable to decode token - possibly malformed' };
        }

        const { header, payload } = decoded;
        
        return {
            header,
            payload,
            isExpired: payload.exp && (payload.exp * 1000) < Date.now(),
            expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiry',
            issuedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'Not specified',
            algorithm: header.alg,
            valid: false // We haven't verified the signature yet
        };
    } catch (error) {
        return { 
            error: 'Token decode failed', 
            details: error.message 
        };
    }
};

/**
 * Utility to verify JWT token with proper error details
 * @param {string} token - JWT token to verify
 * @returns {object} Verification result
 */
export const verifyTokenDebug = (token) => {
    try {
        if (!config.JWT_SECRET) {
            return { 
                error: 'JWT_SECRET not configured',
                valid: false 
            };
        }

        const payload = jwt.verify(token, config.JWT_SECRET, { 
            algorithms: ['HS256'],
            clockTolerance: 30 
        });
        
        return {
            valid: true,
            payload,
            message: 'Token verified successfully'
        };
    } catch (error) {
        const debugInfo = debugToken(token);
        
        return {
            valid: false,
            error: error.name,
            message: error.message,
            debugInfo
        };
    }
};

/**
 * Check if environment variables are properly configured
 * @returns {object} Configuration status
 */
export const checkAuthConfig = () => {
    const issues = [];
    
    if (!config.JWT_SECRET) {
        issues.push('JWT_SECRET is not configured');
    } else if (config.JWT_SECRET.length < 32) {
        issues.push('JWT_SECRET is too short (should be at least 32 characters)');
    }
    
    if (!process.env.SUPABASE_URL) {
        issues.push('SUPABASE_URL is not configured');
    }
    
    if (!process.env.SUPABASE_ANON_KEY) {
        issues.push('SUPABASE_ANON_KEY is not configured');
    }
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        issues.push('SUPABASE_SERVICE_ROLE_KEY is not configured');
    }
    
    return {
        isValid: issues.length === 0,
        issues,
        config: {
            hasJwtSecret: !!config.JWT_SECRET,
            jwtSecretLength: config.JWT_SECRET?.length || 0,
            hasSupabaseUrl: !!process.env.SUPABASE_URL,
            hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
            hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
    };
};