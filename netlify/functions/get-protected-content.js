// Netlify Function: Get protected content (quiz data) only after authentication
// Never expose protected content in HTML - load via API

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': event.headers.origin || '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
        // Verify authentication
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const token = authHeader ? authHeader.replace('Bearer ', '') : null;
        
        if (!token) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ 
                    error: 'Authentication required',
                    content: null 
                })
            };
        }

        // Verify token (in production, use proper JWT verification)
        const PAYMENT_TOKEN_PREFIX = 'PAID_';
        if (!token.startsWith(PAYMENT_TOKEN_PREFIX)) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ 
                    error: 'Invalid token',
                    content: null 
                })
            };
        }

        // In production, load quiz data from secure storage
        // For now, return empty (quiz data should be loaded from secure API)
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                message: 'Content loaded securely',
                content: null // Load from secure storage in production
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to load content' 
            })
        };
    }
};





