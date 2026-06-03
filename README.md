# Veda AI - Automated Question Paper Generator

Veda AI is a robust, production-ready application designed for educational institutions to automate the creation of high-quality assessment papers. By uploading a study material document (PDF/TXT) and configuring desired question types, the AI engine dynamically generates a structured, syllabus-aligned question paper.

## Key Features
- **AI-Powered Generation**: Integrates with Groq API (using large OSS models) to contextually generate questions based strictly on uploaded study material.
- **Asynchronous Processing**: Uses BullMQ and Redis to offload heavy PDF extraction and AI generation to a background worker, ensuring the web API remains snappy.
- **Real-Time Progress**: Utilizes Server-Sent Events (SSE) and Redis PubSub to stream live generation progress to the UI.
- **Strict Validation**: Employs Zod schemas across the frontend forms, API endpoints, and AI response parsing to ensure data integrity and prevent AI hallucinations.
- **Storage Abstraction**: Features an `IStorageProvider` interface currently using local disk, ready to be swapped for AWS S3.
- **Premium UI**: Built with Next.js 15, TailwindCSS, and Shadcn UI, featuring micro-animations, glassmorphism, and a polished design system.

## Project Documentation
Detailed documentation on the system design and implementation can be found in the `docs/` folder:
- [System Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Deployment & Scaling Guide](docs/deployment.md)

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React, Zustand, TailwindCSS, Radix UI.
- **Backend**: Next.js API Routes, Node.js (Worker).
- **Database**: MongoDB (Mongoose).
- **Queues & PubSub**: Redis, BullMQ.
- **AI**: Groq API, standard prompt engineering techniques.
- **Validation**: Zod.

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- Redis instance (local or Upstash)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/veda-ai
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=your_groq_api_key
```

### 3. Start the Application
You need to run both the Next.js web server and the background worker.

**Terminal 1 (Web Server):**
```bash
npm run dev
```

**Terminal 2 (Background Worker):**
```bash
npx tsx workers/generation.worker.ts
```
*(Note: You may want to add a `"worker": "tsx workers/generation.worker.ts"` script to your package.json)*

### 4. Access the App
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Refactoring and Audit Notes
This codebase recently underwent a comprehensive architectural audit resulting in:
1. **Centralized Validation**: Zod schemas moved to `schemas/` and integrated directly with TypeScript `types/` using `z.infer`.
2. **API Abstraction**: Frontend API calls abstracted into `services/api.client.ts`, cleaning up Zustand stores.
3. **Decoupled PDF Extraction**: Heavy `pdf-parse` operations moved out of the API route and into the background worker.
4. **Storage Providers**: Uploads migrated to a provider interface for future cloud scalability.
5. **AI Dependency Injection**: Created `features/ai/ai.factory.ts` allowing easy swaps of AI providers (e.g., from Groq to OpenAI).
