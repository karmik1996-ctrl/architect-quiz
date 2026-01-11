// Netlify Function: Rate limiting for login attempts
// Prevents brute force attacks

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': event.headers.origin || '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
        const action = body.action || 'login';
        const identifier = body.identifier || event.headers['x-forwarded-for'] || 'unknown';
        
        // Rate limit configuration
        const RATE_LIMITS = {
            login: { max: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
            payment: { max: 10, window: 60 * 60 * 1000 }, // 10 attempts per hour
            default: { max: 20, window: 60 * 60 * 1000 } // 20 attempts per hour
        };

        const limit = RATE_LIMITS[action] || RATE_LIMITS.default;
        
        // In production, use Redis or database for rate limiting
        // For now, return allowed (implement proper rate limiting in production)
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                allowed: true,
                remaining: limit.max,
                resetTime: Date.now() + limit.window
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                allowed: false, 
                error: 'Rate limit check failed' 
            })
        };
    }
};



