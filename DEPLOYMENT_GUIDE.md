# Bento Baitos - Production Deployment Guide

This guide will walk you through deploying the Bento Baitos application to production.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Backend Deployment (Cloudflare Workers)](#backend-deployment-cloudflare-workers)
- [Frontend Deployment](#frontend-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Testing the Deployment](#testing-the-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## Architecture Overview

**Bento Baitos** is a full-stack food ordering application with:

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **State Management**: React Context API
- **API Client**: Axios

### Backend
- **Platform**: Cloudflare Workers (Serverless)
- **Database**: Cloudflare D1 (SQLite)
- **File Storage**: Cloudflare R2 (for payment proofs)
- **Runtime**: V8 JavaScript Engine

---

## Prerequisites

Before deploying, ensure you have:

1. **Cloudflare Account** (Free tier is sufficient)
   - Sign up at https://dash.cloudflare.com/sign-up

2. **Wrangler CLI** (Cloudflare's deployment tool)
   \`\`\`bash
   npm install -g wrangler
   \`\`\`

3. **Node.js** (v18 or higher)
   - Check: \`node --version\`

4. **Git** (for version control)
   - Check: \`git --version\`

---

## Backend Deployment (Cloudflare Workers)

### Step 1: Authenticate with Cloudflare

\`\`\`bash
cd backend
wrangler login
\`\`\`

### Step 2: Create D1 Database

\`\`\`bash
wrangler d1 create bento-baitos-db
\`\`\`

**Important**: Copy the \`database_id\` and update in \`backend/wrangler.toml\`

### Step 3: Initialize Database Schema

\`\`\`bash
wrangler d1 execute bento-baitos-db --file=schema.sql
\`\`\`

### Step 4: Create R2 Bucket

\`\`\`bash
wrangler r2 bucket create bento-baitos-proofs
\`\`\`

### Step 5: Deploy Backend

\`\`\`bash
wrangler deploy --env production
\`\`\`

---

## Frontend Deployment

### Option 1: Cloudflare Pages (Recommended)

1. Build: \`npm run build\`
2. Deploy: \`wrangler pages deploy dist --project-name=bento-baitos\`

### Option 2: Vercel/Netlify

Follow their respective deployment guides.

---

## Environment Configuration

### Frontend (.env.production)
\`\`\`
VITE_API_BASE=https://bento-baitos-api-prod.your-subdomain.workers.dev
\`\`\`

---

## Deployment Checklist

- [ ] Backend deployed to Cloudflare Workers
- [ ] D1 database created and initialized
- [ ] R2 bucket created
- [ ] Frontend built and deployed
- [ ] Environment variables configured
- [ ] All endpoints tested
- [ ] User flow tested
- [ ] Monitoring set up

---

**For complete guide, see full documentation.**
