// Netlify Function: Server-side authentication verification
// This function validates JWT tokens and checks user permissions

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': event.headers.origin || '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Get token from Authorization header or cookie
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const token = authHeader ? authHeader.replace('Bearer ', '') : null;
        
        // Also check cookies
        const cookies = event.headers.cookie || '';
        const cookieToken = cookies.split(';').find(c => c.trim().startsWith('authToken='));
        const tokenFromCookie = cookieToken ? cookieToken.split('=')[1] : null;
        
        const authToken = token || tokenFromCookie;

        if (!authToken) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ 
                    authenticated: false, 
                    error: 'No authentication token provided' 
                })
            };
        }

        // Verify JWT token
        const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
        
        let isAuthenticated = false;
        let role = 'guest';
        let decoded = null;
        
        try {
            // Parse JWT token
            const parts = authToken.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid token format');
            }
            
            const [encodedHeader, encodedPayload, signature] = parts;
            
            // Verify signature
            const crypto = require('crypto');
            const expectedSignature = crypto
                .createHmac('sha256', JWT_SECRET)
                .update(`${encodedHeader}.${encodedPayload}`)
                .digest('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');
            
            if (signature !== expectedSignature) {
                throw new Error('Invalid signature');
            }
            
            // Decode payload
            const payload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString());
            
            // Check expiration
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                throw new Error('Token expired');
            }
            
            // Token is valid
            isAuthenticated = true;
            role = payload.role || 'user';
            decoded = payload;
            
        } catch (error) {
            // Token invalid or expired
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ 
                    authenticated: false, 
                    error: 'Invalid or expired token',
                    details: error.message 
                })
            };
        }

        // Check if requesting admin route
        const requestedPath = event.path || '';
        if (requestedPath.includes('/admin') && role !== 'admin') {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ 
                    authenticated: false, 
                    authorized: false,
                    error: 'Admin access required' 
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                authenticated: true,
                authorized: true,
                role: role,
                message: 'Access granted' 
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                authenticated: false, 
                error: 'Internal server error' 
            })
        };
    }
};

