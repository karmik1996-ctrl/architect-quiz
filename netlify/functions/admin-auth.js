// Netlify Function: Admin authentication
// Server-side password verification with JWT tokens

// Simple JWT implementation (without external library for Netlify Functions)
function base64UrlEncode(str) {
    return Buffer.from(str).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function createJWT(payload, secret, expiresIn = 1800) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    payload.iat = now;
    payload.exp = now + expiresIn;
    
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    
    // Simple HMAC-SHA256 (in production, use crypto library)
    const crypto = require('crypto');
    const signature = crypto
        .createHmac('sha256', secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': event.headers.origin || '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const password = body.password || '';
        
        // Get admin password from environment variable (default: karmik1996)
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'karmik1996';
        const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

        // Password check
        if (password !== ADMIN_PASSWORD) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ 
                    authenticated: false, 
                    error: 'Invalid password' 
                })
            };
        }

        // Generate JWT token
        const payload = {
            userId: 'admin',
            role: 'admin',
            type: 'admin'
        };
        
        const token = createJWT(payload, JWT_SECRET, 1800); // 30 minutes
        
        // Set HttpOnly, Secure cookie
        headers['Set-Cookie'] = `authToken=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=1800`;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                authenticated: true,
                role: 'admin',
                expiresIn: 1800
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                authenticated: false, 
                error: 'Authentication failed' 
            })
        };
    }
};

