# 🧘 YogaKids — Yoga Script Image Generator

Generate consistent, professional 3D cartoon illustrations for yoga scripts. Paste a yoga script, customize the character, and generate start/end frame images for each pose using AI.

## ✨ Features

- **Script Parser** — Paste any yoga script; auto-detects intro, poses (numbered), and outro sections
- **Prompt Generator** — 6-layer prompt architecture with a 15-pose knowledge base for accurate yoga poses
- **Multi-Provider Image Generation** — Google AI (Gemini), Vertex Key, and Gommo AI
- **Character Consistency** — Reference images + detailed character description for consistent look across all frames
- **Sequential Queue** — Rate-limited, retry-capable queue with cancel support
- **Persistent State** — Hybrid localStorage + IndexedDB; survives page refreshes
- **ZIP Export/Import** — Download project as ZIP or load a previous project from ZIP
- **Veo 3 Video Prompts** — Auto-generated video transition prompts for each pose

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔑 API Keys

The app supports three providers. Enter your API key in the Settings panel:

| Provider | Key Format | How to Get |
|----------|-----------|------------|
| Google AI | `AIzaSy...` | [Google AI Studio](https://aistudio.google.com/) |
| Vertex Key | `vai-...` | [Vertex Key](https://vertex-key.com/) |
| Gommo AI | `domain\|token` | [Gommo AI](https://gommo.net/) |

API keys are stored in your browser's localStorage only — never sent to our servers.

## 📁 Project Structure

```
src/
├── main.js                  # App entry point + UI wiring
├── modules/
│   ├── imageGenerator.js    # Multi-provider image generation
│   ├── imageQueue.js        # Sequential queue with retry
│   ├── logger.js            # Production-safe logging
│   ├── promptGenerator.js   # 6-layer prompt builder
│   ├── scriptParser.js      # Yoga script parser
│   └── state.js             # Persistent state (localStorage + IndexedDB)
├── styles/
│   └── index.css            # All styles
api/                         # Vercel serverless proxy functions
├── google-ai.js
├── vertex-key.js
└── gommo.js
```

## 🌐 Deployment

Configured for **Vercel**. Push to GitHub and connect via Vercel dashboard.

- Proxy functions in `/api/` handle CORS for external API calls
- `vercel.json` configures rewrites and build settings

## License

MIT
