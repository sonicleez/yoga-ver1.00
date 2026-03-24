/**
 * Vercel Serverless Proxy: Google AI API
 * Routes: /api/google-ai/* → https://generativelanguage.googleapis.com/*
 * 
 * This avoids CORS issues when calling Google AI from the browser.
 */
export const maxDuration = 60; // Max timeout for Vercel

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-goog-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extract the path correctly handling Vercel's rewrite query
    let proxyPath = '';
    const query = { ...(req.query || {}) };

    if (query.path) {
      proxyPath = Array.isArray(query.path) ? query.path.join('/') : query.path;
      delete query.path;
    } else {
      proxyPath = req.url.replace(/^\/api\/google-ai\/?/, '').split('?')[0];
    }
    
    const qs = new URLSearchParams(query).toString();
    const targetUrl = `https://generativelanguage.googleapis.com/${proxyPath}${qs ? '?' + qs : ''}`;
    console.log(`[GoogleAI Proxy] ${req.method} → ${targetUrl}`);

    // Forward headers (exclude host/connection)
    const forwardHeaders = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (!['host', 'connection', 'transfer-encoding'].includes(key.toLowerCase())) {
        forwardHeaders[key] = value;
      }
    }

    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders,
    };

    // Forward body for POST/PUT
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);

    // Forward response headers
    for (const [key, value] of response.headers.entries()) {
      if (!['transfer-encoding', 'content-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    const data = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(data));
  } catch (error) {
    console.error('[GoogleAI Proxy] Error:', error);
    res.status(502).json({ error: 'Proxy error', message: error.message });
  }
}
