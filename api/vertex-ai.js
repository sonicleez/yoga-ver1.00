/**
 * Vercel Serverless Proxy: Google Vertex AI (Imagen)
 * Routes: /api/vertex-ai/* → https://us-central1-aiplatform.googleapis.com/*
 */
export const maxDuration = 60;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let proxyPath = '';
    const query = { ...(req.query || {}) };

    if (query.path) {
      proxyPath = Array.isArray(query.path) ? query.path.join('/') : query.path;
      delete query.path;
    } else {
      proxyPath = req.url.replace(/^\/api\/vertex-ai\/?/, '').split('?')[0];
    }

    const qs = new URLSearchParams(query).toString();
    const targetUrl = `https://us-central1-aiplatform.googleapis.com/${proxyPath}${qs ? '?' + qs : ''}`;
    console.log(`[VertexAI Proxy] ${req.method} → ${targetUrl}`);

    const forwardHeaders = {
      'Content-Type': 'application/json',
    };

    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);

    // Get response as text first (JSON with base64)
    const responseText = await response.text();

    // Forward status and content-type
    res.setHeader('Content-Type', 'application/json');
    res.status(response.status).send(responseText);
  } catch (error) {
    console.error('[VertexAI Proxy] Error:', error);
    res.status(502).json({ error: 'Proxy error', message: error.message });
  }
}
