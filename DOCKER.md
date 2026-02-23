# Docker Setup Guide

This guide explains how to run the ICPAC Drought Impact Tracker application using Docker.

## Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)

## Quick Start

### Production Build

Build and start all services:

```bash
docker-compose up -d
```

This will:

- Start PostgreSQL database
- Start backend API on port 3003
- Start frontend on port 80

Access the application:

- Frontend: http://localhost
- Backend API: http://localhost:3003
- API Health: http://localhost:3003/health

### Development Build

For development with hot reload:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This will:

- Start PostgreSQL database
- Start backend API with nodemon (hot reload) on port 3003
- Start frontend with hot reload on port 3000

Access the application:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3003
- API Health: http://localhost:3003/health

## Docker Commands

### Start Services

```bash
# Production
docker-compose up -d

# Development
docker-compose -f docker-compose.dev.yml up -d
```

### Stop Services

```bash
# Production
docker-compose down

# Development
docker-compose -f docker-compose.dev.yml down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Development
docker-compose -f docker-compose.dev.yml logs -f
```

### Rebuild Services

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild without cache
docker-compose build --no-cache
```

### Access Container Shell

```bash
# Backend container
docker-compose exec backend sh

# Frontend container
docker-compose exec frontend sh

# PostgreSQL container
docker-compose exec postgres psql -U postgres -d adit_questionnaire
```

### Remove Everything (including volumes)

```bash
# Production
docker-compose down -v

# Development
docker-compose -f docker-compose.dev.yml down -v
```

## Service Details

### PostgreSQL

- **Image**: postgres:15-alpine
- **Port**: 5432
- **Database**: adit_questionnaire
- **User**: postgres
- **Password**: postgres
- **Data Volume**: postgres_data (persistent)

### Backend API

- **Base Image**: node:18-alpine
- **Port**: 3003
- **Health Check**: /health endpoint
- **Environment**: Configured via docker-compose.yml

### Frontend

- **Production**: nginx:alpine (serves built React app)
- **Development**: node:18-alpine (runs React dev server)
- **Port**: 80 (production) or 3000 (development)
- **Health Check**: /health endpoint

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend/` directory or set in `docker-compose.yml`:

```env
NODE_ENV=production
PORT=3003
DB_HOST=postgres
DB_PORT=5432
DB_NAME=adit_questionnaire
DB_USER=postgres
DB_PASSWORD=postgres
CORS_ORIGIN=http://localhost
```

### Frontend Environment Variables (Development)

Set in `docker-compose.dev.yml`:

```yaml
environment:
  - REACT_APP_API_URL=http://localhost:3003
```

## Volumes

### Development Volumes

- `./backend:/app` - Backend code mounted for hot reload
- `./frontend:/app` - Frontend code mounted for hot reload
- `/app/node_modules` - Anonymous volume to preserve node_modules

### Production Volumes

- `postgres_data` - PostgreSQL data persistence

## Networking

All services are connected via a Docker bridge network:

- **Production**: `adit_network`
- **Development**: `adit_network_dev`

Services can communicate using service names:

- Backend → PostgreSQL: `postgres:5432`
- Frontend → Backend: `backend:3003`

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is healthy
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection from backend container
docker-compose exec backend sh
# Then: node -e "require('./src/config/database').query('SELECT NOW()').then(console.log)"
```

### Port Already in Use

If ports 3003, 3000, or 5432 are already in use:

1. Change ports in `docker-compose.yml`:

   ```yaml
   ports:
     - "3004:3003" # Backend
     - "3001:3000" # Frontend (dev)
     - "5433:5432" # PostgreSQL
   ```

2. Update environment variables accordingly

### Clean Rebuild

```bash
# Stop and remove everything
docker-compose down -v

# Remove all images
docker-compose rm -f

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

### Database Reset

```bash
# Stop services
docker-compose down

# Remove database volume
docker volume rm adit-questionnaire_postgres_data

# Start services (database will be recreated)
docker-compose up -d
```

## Production Deployment

For production deployment:

1. Update environment variables in `docker-compose.yml`
2. Use strong database passwords
3. Set proper CORS origins
4. Enable SSL/TLS (use nginx reverse proxy)
5. Set up proper backup strategy for PostgreSQL volumes
6. Use Docker secrets for sensitive data
7. Configure proper resource limits

Example production `docker-compose.yml` updates:

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD} # Use secrets
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 1G

  backend:
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
```

## Health Checks

All services include health checks:

- **PostgreSQL**: `pg_isready` command
- **Backend**: HTTP GET to `/health` endpoint
- **Frontend**: HTTP GET to `/health` endpoint

Check health status:

```bash
docker-compose ps
```

## Monitoring

View resource usage:

```bash
docker stats
```

View detailed service information:

```bash
docker-compose ps -a
docker inspect adit_backend
```
