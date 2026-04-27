# AI Assistant

A simple web-based AI chat assistant powered by OpenAI via Replit AI Integrations.

## Overview

This project provides a clean, dark-themed chat interface where users can have real-time conversations with an AI assistant. Responses are streamed word-by-word for a smooth experience.

## Architecture

- **Backend**: `server.js` — Node.js/Express server
  - `POST /api/chat` — Sends a message and streams the AI response via SSE
  - `POST /api/reset` — Clears conversation history for a session
  - Serves static files from `public/`
- **Frontend**: `public/index.html` — Single-page chat UI

## AI Integration

- Provider: OpenAI via Replit AI Integrations
- Model: `gpt-5.4`
- Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`
- No personal API key required — billed to Replit credits

## Running

```bash
npm start
```

Runs on port 5000.
