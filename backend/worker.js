/**
 * Cloudflare Worker Backend
 * 
 * Purpose: Hide API keys from frontend browser code
 * 
 * Frontend JavaScript is public and visible via DevTools (F12).
 * This backend stores secrets in environment variables.
 * Frontend only calls this backend URL, never directly calls APIs with keys.
 */

export default {
  async fetch(request, env) {
    // CORS headers for GitHub Pages frontend
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route: /api/firebase-config
      // Returns Firebase config without exposing API key
      if (path === '/api/firebase-config') {
        // API key is stored in env.SECRET_FIREBASE_API_KEY (not in frontend)
        const config = {
          apiKey: env.SECRET_FIREBASE_API_KEY || '',
          authDomain: env.FIREBASE_AUTH_DOMAIN || 'architect-quiz-c5273.firebaseapp.com',
          projectId: env.FIREBASE_PROJECT_ID || 'architect-quiz-c5273',
          storageBucket: env.FIREBASE_STORAGE_BUCKET || 'architect-quiz-c5273.firebasestorage.app',
          messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || '566027889328',
          appId: env.FIREBASE_APP_ID || '1:566027889328:web:efb894feed4b74bd4ca975',
          measurementId: env.FIREBASE_MEASUREMENT_ID || 'G-57NQ5TB1NP'
        };

        return new Response(JSON.stringify(config), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      }

      // Route: /api/proxy-firestore
      // Proxy Firestore requests (if needed for sensitive operations)
      if (path === '/api/proxy-firestore' && request.method === 'POST') {
        const body = await request.json();
        const { collection, document, data, operation } = body;

        // Use Firebase Admin SDK (server-side only)
        // Note: Firebase Admin SDK requires Node.js, so for Cloudflare Workers
        // we might need to use REST API with service account key
        
        // Example: Write to Firestore via REST API
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${document}`;
        
        const response = await fetch(firestoreUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.SECRET_FIREBASE_SERVICE_ACCOUNT_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: data
          }),
        });

        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      }

      // Route: /api/ip-geolocation
      // Proxy IP geolocation API calls
      if (path === '/api/ip-geolocation' && request.method === 'GET') {
        const ip = url.searchParams.get('ip') || '';
        
        // API key stored in env, not in frontend
        const apiKey = env.SECRET_IPGEOLOCATION_API_KEY || 'free';
        const apiUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        return new Response(JSON.stringify(data), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      }

      // Health check
      if (path === '/health') {
        return new Response(JSON.stringify({ status: 'ok', message: 'Backend API is running' }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      }

      // 404
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });

    } catch (error) {
      console.error('Backend error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }
  },
};

