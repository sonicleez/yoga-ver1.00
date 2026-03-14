/**
 * Vercel Serverless Proxy: Gommo AI API
 * Routes: /api/gommo/* → https://api.gommo.net/*
 * 
 * Gommo uses x-www-form-urlencoded body format.
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const fullUrl = req.url;
    const proxyPath = fullUrl.replace(/^\/api\/gommo\/?/, '');

    const targetUrl = `https://api.gommo.net/${proxyPath}`;
    console.log(`[Gommo Proxy] ${req.method} → ${targetUrl}`);

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

    // Gommo uses URL-encoded bodies — forward raw body
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/x-www-form-urlencoded')) {
        // Reconstruct URL-encoded body from parsed body
        if (typeof req.body === 'object' && req.body !== null) {
          fetchOptions.body = new URLSearchParams(req.body).toString();
        } else {
          fetchOptions.body = req.body;
        }
      } else {
        fetchOptions.body = JSON.stringify(req.body);
      }
    }

    const response = await fetch(targetUrl, fetchOptions);

    for (const [key, value] of response.headers.entries()) {
      if (!['transfer-encoding', 'content-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    const data = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(data));
  } catch (error) {
    console.error('[Gommo Proxy] Error:', error);
    res.status(502).json({ error: 'Proxy error', message: error.message });
  }
}
