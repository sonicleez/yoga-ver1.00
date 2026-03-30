# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YogaKids is a web application that generates consistent 3D cartoon illustrations for yoga scripts. Users paste a yoga script, customize a character, and generate start/end frame images for each pose using AI image generation providers.

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Test prompt generation logic
node test_logic.js
```

## Architecture

### Frontend (Vanilla JS + Vite)
- **`src/main.js`** — App entry point, wires all modules to UI event handlers
- **`index.html`** — Single-page app with all HTML/UI

### Core Modules (`src/modules/`)

| Module | Purpose |
|--------|---------|
| `scriptParser.js` | Parses raw yoga script text → structured scenes (intro, poses, outro) |
| `promptGenerator.js` | 6-layer prompt architecture: generates START + END frame prompts per pose using a 15+ pose knowledge base |
| `imageGenerator.js` | Multi-provider image generation (Google AI, Vertex Key, Gommo) |
| `imageQueue.js` | Rate-limited sequential queue with retry and cancel support |
| `state.js` | Hybrid persistence: settings → localStorage, images → IndexedDB |
| `thumbnailGenerator.js` | Generates video thumbnails with pose overlays |
| `logger.js` | Production-safe logging utility |

### Script Generator System (`src/modules/scriptGenerator/`)

AI-powered yoga script generation with:
- **`index.js`** — Main orchestrator (only entry point for script generation)
- **`poseDatabase.js`** + `poses_extended_*.js` — 100+ pose definitions with categories, difficulty, body focus
- **`flowStrategies.js`** — Sequence building (progressive, warm-to-cool, body-scan, chakra, themed)
- **`promptBuilder.js`** — System/user prompt construction for LLM
- **`textProvider.js`** — LLM text generation abstraction
- **`scriptTemplates.js`** — Pre-built templates (bedtime, morning, kids, etc.)
- **`variationEngine.js`** — Generates unique script variations
- **`fingerprintDB.js`** — Duplicate detection for quality assurance
- **`auditAgent.js`** + `autoFixer.js` — Script validation and auto-correction
- **`seriesGenerator.js`** — Batch generation for series/playlists
- **`gamification.js`** — XP, levels, achievements, skill packs
- **`historyManager.js`** — Script history and user templates

### API Proxies (`api/`)

Vercel serverless functions that proxy external API calls to avoid CORS:
- `google-ai.js` → `generativelanguage.googleapis.com`
- `vertex-key.js` → `vertex-key.com`
- `gommo.js` → `api.gommo.net`

In development, Vite's built-in proxy handles these routes (see `vite.config.js`).

## Key Data Flows

### Image Generation Pipeline
```
User pastes script
    → scriptParser.parseScript() → scenes[]
    → promptGenerator.generateAllFramePrompts() → {startFrame, endFrame, videoPrompt}[]
    → imageQueue.enqueueAll() → rate-limited API calls
    → imageGenerator.generateImage() → base64 images
    → state.setState('generatedImages', ...) → IndexedDB persistence
```

### Prompt Architecture (6 layers)
1. Style preset (3D cartoon, watercolor, anime, etc.)
2. Character description (consistent across all frames)
3. Environment/background
4. Pose-specific body position from knowledge base
5. Camera angle and composition
6. Reference images (optional)

## State Management

- **`state.js`** uses reactive pattern with `getState()`, `setState()`, `onStateChange()`
- Settings auto-persist to localStorage with `yk_` prefix
- Large images stored in IndexedDB (`yogakids_db`)
- Full project export/import via ZIP (includes images)

## Supported Image Providers

| Provider | Key Format | Notes |
|----------|------------|-------|
| Google AI Direct | `AIzaSy...` | Free tier available |
| Vertex Key | `vai-...` | Premium models (1K/2K/4K resolution) |
| Gommo AI | `domain\|token` | Async polling (check status endpoint) |

## Deployment

Configured for Vercel:
- `vercel.json` defines API rewrites
- Serverless functions in `/api/` handle CORS proxying
- Build output to `dist/`
