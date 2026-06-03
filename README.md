# VedaAI - AI Assessment Creator

VedaAI is a full-stack Next.js application that empowers teachers to generate comprehensive question papers from their own study materials using AI.

## Features

- **Document Parsing:** Upload PDF or TXT files.
- **AI Generation Pipeline:** Background workers (BullMQ) coupled with Groq AI integration to generate structured JSON output.
- **Real-Time Progress:** WebSocket / Server-Sent Events (SSE) tracking of generation status.
- **PDF Export:** Download generated question papers natively on the client.
- **Clean Architecture:** Fully typed, modular codebase utilizing strict Zod schemas and Next.js 16 App Router.

## Tech Stack

- **Framework:** Next.js 16.2.7 (App Router, React 19)
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **Queues & Pub/Sub:** Redis (IORedis, BullMQ)
- **AI Provider:** Groq (Default Model: `openai/gpt-oss-120b`)
- **Styling:** Tailwind CSS v4

## Environment Setup

Create a `.env.local` file in the root directory and configure the following variables:

```env
# ─── Database ─────────────────────────────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/vedaai

# ─── Redis ────────────────────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ─── Groq AI ──────────────────────────────────────────────────────────────────
# Get your key from: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here
# Optional: Set model (falls back to deepseek-r1-distill-llama-70b or llama-4-maverick)
GROQ_MODEL=openai/gpt-oss-120b

# ─── App ──────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Running Locally

1. Start MongoDB and Redis locally (or use Docker).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:3000`.
