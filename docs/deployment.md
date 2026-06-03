# Veda AI - Deployment Guide

This document outlines the scaling and deployment considerations for running Veda AI in a production environment.

## Prerequisites
- Node.js 18.x or 20.x
- MongoDB (Atlas recommended or v5.0+)
- Redis (Upstash, AWS ElastiCache, or Redis v6.0+)
- Groq API Key

## Infrastructure Overview

Veda AI requires two distinct runtimes to function properly in production:

1. **Web Server** (Next.js): Handles HTTP requests, SSE connections, and serves the UI.
2. **Worker Process** (BullMQ/Node): Pulls jobs from Redis to extract PDF content and call the AI API.

## Scaling Considerations

### 1. Decoupled Processing
Because PDF extraction and LLM generation are heavily CPU-bound and time-consuming, Veda AI uses BullMQ and Redis to offload this work from the main Next.js API. 
- The Web Server can be horizontally scaled infinitely behind a load balancer.
- The Worker Process can also be horizontally scaled. Ensure `GROQ_API_KEY` rate limits support the number of concurrent workers you run.

### 2. State Management (Redis PubSub)
The API uses Redis PubSub for Server-Sent Events (SSE). This means if Web Server A queues a job, and Web Server B receives the SSE connection from the client, Web Server B will still receive the PubSub updates from the Worker and push them to the client. This allows for multi-region or multi-instance web deployments without sticky sessions.

### 3. File Storage
By default, the application uses `LocalStorageProvider` (`features/storage/local.provider.ts`), saving files to the `./uploads` directory. 
**For production**, this is unsuitable if you have multiple web servers. You should replace this provider with an S3-compatible provider:
1. Implement `IStorageProvider` using the AWS SDK (`s3.provider.ts`).
2. Update the API and Worker to use the new provider.
3. This allows workers on different machines to download the file by URL for processing.

### 4. Database
MongoDB is used for document storage. Ensure you create indexes on:
- `Assignment`: `status`, `createdAt` (for sorting).
- `GenerationStatus`: `jobId`, `assignmentId`.
- `GeneratedPaper`: `assignmentId`.

## Recommended Platform Stacks

### Option A: Vercel + Render (Recommended for easiest setup)
- **Web**: Deploy the Next.js app on Vercel.
- **Worker**: Deploy the worker script (`npm run worker`) as a Background Worker on Render or Railway.
- **DB**: MongoDB Atlas.
- **Redis**: Upstash (Serverless Redis).

### Option B: Docker / Kubernetes (Full Control)
Use the provided `Dockerfile` (create if needed) to build the image.
Run two separate containers:
1. Web Container: `npm start`
2. Worker Container: `npm run worker` (requires configuring a custom script in package.json to run `workers/generation.worker.ts`).

## Environment Variables
Ensure the following are set in your production environment:
```env
# Server Config
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://veda.yourdomain.com

# Database & Redis
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/veda?retryWrites=true&w=majority
REDIS_URL=rediss://default:pass@endpoint.upstash.io:30000

# AI Provider
GROQ_API_KEY=gsk_...
GROQ_MODEL=openai/gpt-oss-120b # Optional, defaults to this
```

## Security Considerations
- **API Keys**: Ensure `GROQ_API_KEY` and `MONGODB_URI` are never exposed to the client.
- **Rate Limiting**: Implement rate limiting on the `/api/upload` and `/api/generate` endpoints to prevent abuse.
- **File Validation**: The upload API validates file types (`.pdf`, `.txt`) and sizes (10MB). Ensure the reverse proxy (e.g., Nginx) also enforces a `client_max_body_size`.
