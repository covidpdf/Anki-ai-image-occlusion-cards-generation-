# Deployment Guide

This guide covers deploying the Anki Image Occlusion Cards Generation application to production environments.

## Overview

- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Render or Fly.io
- **Database**: SQLite (local) or PostgreSQL (production)

## Frontend Deployment (Vercel)

### Prerequisites

- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel
- Node.js 18+ installed locally

### Deployment Steps

#### 1. Prepare Your Code

```bash
cd frontend
pnpm install
pnpm build
```

Ensure the build completes without errors.

#### 2. Set Environment Variables

Create environment variables in Vercel dashboard:

```
VITE_API_URL=https://your-backend-url.com
```

#### 3. Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
npm install -g vercel
vercel
```

Follow the prompts to connect your project.

**Option B: GitHub Integration**

1. Push your code to GitHub
2. Import project in Vercel Dashboard
3. Select the `frontend` root directory
4. Configure environment variables
5. Deploy

#### 4. Configure Custom Domain (Optional)

In Vercel Dashboard:
1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration steps

### Monitoring & Updates

- Vercel provides built-in analytics at https://vercel.com/dashboard
- View deployment logs in Vercel Dashboard
- Set up notifications for deployment events

## Backend Deployment

### Option 1: Render

#### Prerequisites

- Render account (https://render.com)
- GitHub repository connected

#### Deployment Steps

1. **Create a new Web Service**
   - Login to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the Service**
   - **Name**: `anki-occlusion-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3.11`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0`

3. **Set Environment Variables**
   - Go to "Environment"
   - Add the following:
     ```
     CORS_ORIGINS=["https://your-frontend-url.vercel.app"]
     DATABASE_URL=postgresql://user:password@host/dbname
     LOG_LEVEL=INFO
     PYTHON_VERSION=3.11.0
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy on every push to main

#### Post-Deployment

- Verify deployment at `https://your-service.onrender.com/docs`
- Check health endpoint: `https://your-service.onrender.com/health`
- Review logs in Render Dashboard

### Option 2: Fly.io

#### Prerequisites

- Fly.io account (https://fly.io)
- Fly CLI installed (`curl -L https://fly.io/install.sh | sh`)

#### Deployment Steps

1. **Initialize Fly Application**

```bash
cd backend
flyctl apps create anki-occlusion-api
```

2. **Create `fly.toml` Configuration**

```toml
app = "anki-occlusion-api"
primary_region = "sea"

[build]
  image = "flyio/postgres:15"

[[services]]
  protocol = "tcp"
  internal_port = 8000
  processes = ["app"]

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[env]
  CORS_ORIGINS = '["https://your-frontend-url.vercel.app"]'
  DATABASE_URL = "postgresql://..."
  LOG_LEVEL = "INFO"
```

3. **Deploy**

```bash
flyctl deploy
```

4. **Monitor**

```bash
flyctl logs
flyctl status
```

## Database Setup

### SQLite (Development/MVP)

Default configuration uses SQLite:
```
DATABASE_URL=sqlite:///./test.db
```

### PostgreSQL (Production)

For production, use PostgreSQL:

1. **Create Database**
   - Render: Attached PostgreSQL database automatically
   - Fly.io: Use Fly Postgres add-on

2. **Update Connection String**
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

3. **Run Migrations** (when implemented)
   ```bash
   alembic upgrade head
   ```

## Environment Variables

### Frontend (.env)

```
VITE_API_URL=https://your-backend-url.com
```

### Backend (.env)

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
LOG_LEVEL=INFO
CORS_ORIGINS=["https://your-frontend-url.vercel.app"]
```

## CI/CD Integration

The repository includes GitHub Actions workflows:

- **frontend-ci.yml**: Runs on frontend changes
  - Lint check (ESLint)
  - Type check (TypeScript)
  - Build test
  - Unit tests

- **backend-ci.yml**: Runs on backend changes
  - Lint check (Ruff)
  - Format check (Black)
  - Unit tests (pytest)

These workflows ensure code quality before deployment.

## Monitoring & Logging

### Vercel (Frontend)
- Real-time analytics
- Error tracking
- Performance metrics

### Render/Fly.io (Backend)
- Application logs
- CPU/Memory usage
- Deployment history

## Scaling & Performance

### Frontend (Vercel)
- Automatic scaling
- CDN distribution
- Edge caching

### Backend (Render/Fly.io)
- Scale with more instances if needed
- Configure resource limits in dashboard
- Monitor database connections

## Troubleshooting

### Frontend Issues

**Build fails:**
- Check Node version: `node --version` (should be 18+)
- Clear cache: `pnpm store prune`
- Rebuild: `pnpm install && pnpm build`

**API calls fail:**
- Verify `VITE_API_URL` environment variable
- Check CORS configuration on backend
- Verify backend is running and accessible

### Backend Issues

**Service won't start:**
- Check Python version: `python --version` (should be 3.11+)
- Verify dependencies: `pip install -r requirements.txt`
- Check for errors: `uvicorn app.main:app --reload`

**Database connection fails:**
- Verify `DATABASE_URL` format
- Test connection string locally
- Check database permissions

## Rollback

### Vercel
- Go to Deployments → Click previous deployment → Redeploy

### Render
- Go to Deploys → Select previous deployment → Redeploy

### Fly.io
```bash
flyctl releases
flyctl releases rollback <VERSION>
```

## SSL/TLS Certificates

- **Vercel**: Automatic for all custom domains
- **Render**: Automatic with `*.onrender.com` domain
- **Fly.io**: Automatic with `*.fly.dev` domain

Custom domains on Render/Fly.io require DNS configuration.

## Backup & Recovery

### Database Backups
- **Render PostgreSQL**: Automatic daily backups
- **Fly.io**: Configure Fly Postgres backup settings

### Application Files
- All stored in GitHub repository
- Rebuild from any commit if needed

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use platform's secret management
   - Rotate secrets regularly

2. **API Keys**
   - Store in environment variables only
   - Use short expiration times
   - Rotate regularly

3. **CORS Configuration**
   - Only allow frontend domain
   - Review and update for each environment

4. **Database**
   - Use strong passwords
   - Enable SSL/TLS connections
   - Restrict network access

## Support & Additional Resources

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Fly.io Docs: https://fly.io/docs
- FastAPI Docs: https://fastapi.tiangolo.com/deployment/
- React/Vite Docs: https://vitejs.dev/guide/ssr.html
