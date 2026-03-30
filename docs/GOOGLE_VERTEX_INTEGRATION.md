# Google Vertex AI Integration Guide

Hướng dẫn tích hợp Google Cloud Vertex AI cho YogaKids app - sử dụng **một API key duy nhất** cho cả Image Generation (Imagen) và Text Generation (Gemini).

## Tổng quan

| Feature | API Endpoint | Models |
|---------|--------------|--------|
| **Image Generation** | `us-central1-aiplatform.googleapis.com` | Imagen 4.0, Imagen 3.0 |
| **Text Generation** | `generativelanguage.googleapis.com` | Gemini 2.5 Flash Lite |

## Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Ghi nhớ **Project ID** (ví dụ: `fourth-gantry-483803-q8`)

## Bước 2: Enable APIs

Enable các API sau trong [API Library](https://console.cloud.google.com/apis/library):

```
✅ Vertex AI API
✅ Generative Language API (cho Gemini text)
```

Links trực tiếp:
- [Enable Vertex AI API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com)
- [Enable Generative Language API](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com)

## Bước 3: Tạo API Key

1. Vào [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **"+ CREATE CREDENTIALS"** → **"API key"**
3. Copy API key (bắt đầu bằng `AQ.`)

### Restrict API Key (khuyến nghị)

1. Click vào API key vừa tạo
2. Trong **"API restrictions"**, chọn **"Restrict key"**
3. Chọn:
   - ✅ Vertex AI API
   - ✅ Generative Language API
4. Save

## Bước 4: Định dạng Key cho App

Kết hợp Project ID và API Key theo format:

```
{PROJECT_ID}|{API_KEY}
```

**Ví dụ:**
```
your-project-id|AQ.YourApiKeyHere...
```

## Bước 5: Sử dụng trong App

1. Mở YogaKids app
2. Chọn provider **"Google Vertex AI"** từ dropdown
3. Paste key đã format vào ô API Key
4. App sẽ tự động detect và chọn provider

### Auto-Detection Logic

App tự động nhận diện provider dựa trên format key:

| Key Format | Provider |
|------------|----------|
| `projectId\|AQ.xxx` | `google-vertex` |
| `AQ.xxx` | `google-vertex` |
| `AIzaSy...` | `google-ai` |
| `vai-...` | `vertex-key` |
| `domain.net\|token` | `gommo` |

## API Endpoints

### Image Generation (Imagen)

```bash
POST https://us-central1-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/us-central1/publishers/google/models/{MODEL}:predict?key={API_KEY}

# Models:
# - imagen-4.0-generate-001 (recommended)
# - imagen-3.0-generate-001
```

**Request Body:**
```json
{
  "instances": [
    { "prompt": "a cute cartoon girl doing tree pose yoga" }
  ],
  "parameters": {
    "aspectRatio": "16:9",
    "sampleCount": 1,
    "personGeneration": "allow_all",
    "addWatermark": false
  }
}
```

**Response:**
```json
{
  "predictions": [
    {
      "bytesBase64Encoded": "iVBORw0KGgo...",
      "mimeType": "image/png"
    }
  ]
}
```

### Text Generation (Gemini)

```bash
POST https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}

# Models:
# - gemini-2.5-flash-lite (recommended, fast & cheap)
# - gemini-2.5-flash
```

**Request Body:**
```json
{
  "system_instruction": {
    "parts": [{ "text": "You are a yoga script writer..." }]
  },
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "Write a 5-minute kids yoga script" }]
    }
  ],
  "generationConfig": {
    "maxOutputTokens": 4096,
    "temperature": 0.7
  }
}
```

**Response:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [{ "text": "# Kids Yoga Adventure\n\n..." }],
        "role": "model"
      }
    }
  ]
}
```

## Code Implementation

### Provider Definition (`imageGenerator.js`)

```javascript
export const PROVIDERS = {
    'google-vertex': {
        name: 'Google Vertex AI',
        description: 'Google Cloud Vertex AI - Imagen (ảnh) + Gemini (text)',
        keyPrefix: '',
        keyPlaceholder: 'projectId|AQ.xxx',
        models: {
            'imagen-4.0-generate-001': {
                name: 'Imagen 4.0 ⭐',
                resolution: 'Up to 2K',
                price: 'Pay-as-you-go',
                recommended: true,
            },
            'imagen-3.0-generate-001': {
                name: 'Imagen 3.0',
                resolution: 'Up to 2K',
                price: 'Pay-as-you-go',
            },
        },
    },
    // ... other providers
};
```

### Auto-Detect Provider

```javascript
function detectProvider(apiKey) {
    if (apiKey.startsWith('vai-')) return 'vertex-key';
    if (apiKey.includes('|AQ.') || apiKey.startsWith('AQ.')) return 'google-vertex';
    if (apiKey.includes('|') && apiKey.split('|')[0].includes('.')) return 'gommo';
    return 'google-ai';
}
```

### Parse Key Format

```javascript
function parseVertexKey(apiKey) {
    let projectId = 'default-project';
    let token = apiKey;

    if (apiKey.includes('|')) {
        const parts = apiKey.split('|');
        projectId = parts[0];
        token = parts.slice(1).join('|');
    }

    return { projectId, token };
}
```

### Image Generation Function

```javascript
async function generateImageGoogleVertex(prompt, apiKey, options = {}) {
    const { projectId, token } = parseVertexKey(apiKey);
    const model = options.model || 'imagen-4.0-generate-001';

    const endpoint = `/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:predict`;
    const url = `/api/vertex-ai${endpoint}?key=${token}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            instances: [{ prompt }],
            parameters: {
                aspectRatio: options.aspectRatio || '16:9',
                sampleCount: 1,
                personGeneration: 'allow_all',
                addWatermark: false,
            },
        }),
    });

    const data = await response.json();
    return data.predictions[0].bytesBase64Encoded;
}
```

### Text Generation Function

```javascript
async function googleVertexChat(systemPrompt, userPrompt, apiKey, options = {}) {
    const { token } = parseVertexKey(apiKey);
    const model = options.model || 'gemini-2.5-flash-lite';

    const url = `/api/google-ai/v1beta/models/${model}:generateContent?key=${token}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
                maxOutputTokens: options.maxTokens || 4096,
                temperature: options.temperature || 0.7,
            },
        }),
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}
```

## Vercel Proxy Setup

### `api/vertex-ai.js`

```javascript
export const maxDuration = 60;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const proxyPath = req.url.replace(/^\/api\/vertex-ai\/?/, '').split('?')[0];
        const qs = new URLSearchParams(req.query).toString();
        const targetUrl = `https://us-central1-aiplatform.googleapis.com/${proxyPath}${qs ? '?' + qs : ''}`;

        const response = await fetch(targetUrl, {
            method: req.method,
            headers: { 'Content-Type': 'application/json' },
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
        });

        const data = await response.text();
        res.setHeader('Content-Type', 'application/json');
        res.status(response.status).send(data);
    } catch (error) {
        res.status(502).json({ error: 'Proxy error', message: error.message });
    }
}
```

### `vercel.json`

```json
{
  "rewrites": [
    { "source": "/api/vertex-ai/:path*", "destination": "/api/vertex-ai" },
    { "source": "/api/google-ai/:path*", "destination": "/api/google-ai" }
  ]
}
```

## Rate Limiting & Error Handling

### Retry với Exponential Backoff

```javascript
const CONFIG = {
    maxRetries: 3,
    retryDelayBase: 5000,      // 5s
    retryDelayMax: 30000,      // 30s
    delayBetweenScenes: 4000,  // 4s giữa mỗi request
};

async function fetchWithRetry(url, options, retries = CONFIG.maxRetries) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                const isRetryable = [429, 500, 503].includes(response.status);
                if (isRetryable && attempt < retries) {
                    const delay = Math.min(
                        CONFIG.retryDelayBase * Math.pow(2, attempt - 1),
                        CONFIG.retryDelayMax
                    );
                    await sleep(delay);
                    continue;
                }
                throw new Error(`API error: ${response.status}`);
            }

            return response;
        } catch (error) {
            if (attempt === retries) throw error;
        }
    }
}
```

## Pricing

### Imagen (Image Generation)

| Model | Price per image |
|-------|-----------------|
| Imagen 4.0 | ~$0.04 |
| Imagen 3.0 | ~$0.03 |

### Gemini (Text Generation)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| Gemini 2.5 Flash Lite | $0.075 | $0.30 |
| Gemini 2.5 Flash | $0.15 | $0.60 |

## Troubleshooting

### Error: 401 Unauthorized
- Kiểm tra API key có đúng format không
- Kiểm tra API key chưa hết hạn
- Kiểm tra đã enable đúng APIs chưa

### Error: 403 Forbidden
- Kiểm tra billing đã được enable cho project
- Kiểm tra API restrictions có đúng không

### Error: 404 Model Not Found
- Kiểm tra model name đúng chính tả
- Kiểm tra region (chỉ hỗ trợ `us-central1` cho Imagen)

### Error: 429 Rate Limited
- App đã có retry logic tự động
- Tăng `delayBetweenScenes` nếu cần

### Image Generation lỗi nhiều
- Tăng `maxRetries` trong config
- Tăng `retryDelayBase` để chờ lâu hơn

## Testing

### Test Image Generation (curl)

```bash
curl -X POST \
  "https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/us-central1/publishers/google/models/imagen-4.0-generate-001:predict?key=YOUR_AQ_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{"prompt": "a red apple on white background"}],
    "parameters": {"sampleCount": 1}
  }'
```

### Test Text Generation (curl)

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=YOUR_AQ_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"role": "user", "parts": [{"text": "Say hello"}]}]
  }'
```

## Files Reference

| File | Purpose |
|------|---------|
| `src/modules/imageGenerator.js` | Image generation với Imagen API |
| `src/modules/scriptGenerator/textProvider.js` | Text generation với Gemini API |
| `src/modules/imageQueue.js` | Queue management với rate limiting |
| `src/main.js` | UI auto-detect logic |
| `api/vertex-ai.js` | Vercel proxy cho Imagen |
| `api/google-ai.js` | Vercel proxy cho Gemini |

---

**Last updated:** March 2026
