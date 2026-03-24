/**
 * Vercel Serverless Proxy: Vertex Key API
 * Routes: /api/vertex-key/* → https://vertex-key.com/*
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
      proxyPath = req.url.replace(/^\/api\/vertex-key\/?/, '').split('?')[0];
    }
    
    const qs = new URLSearchParams(query).toString();
    const targetUrl = `https://vertex-key.com/${proxyPath}${qs ? '?' + qs : ''}`;
    console.log(`[VertexKey Proxy] ${req.method} → ${targetUrl}`);

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

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
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
    console.error('[VertexKey Proxy] Error:', error);
    res.status(502).json({ error: 'Proxy error', message: error.message });
  }
}
