#!/bin/bash

# =============================================================================
# ADIT Questionnaire - Google Cloud Run Deployment Script
# =============================================================================
#
# Prerequisites:
#   1. Google Cloud SDK (gcloud) installed: https://cloud.google.com/sdk/docs/install
#   2. Docker installed and running
#   3. A GCP project with billing enabled
#
# Usage:
#   export GCP_PROJECT_ID=your-project-id
#   export DB_PASSWORD=your-secure-password
#   ./deploy-cloudrun.sh
#
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:?Please set GCP_PROJECT_ID environment variable}"
REGION="${GCP_REGION:-africa-south1}"
DB_PASSWORD="${DB_PASSWORD:?Please set DB_PASSWORD environment variable}"

# Resource names
DB_INSTANCE="adit-db"
DB_NAME="adit_questionnaire"
DB_USER="postgres"
BACKEND_SERVICE="adit-backend"
FRONTEND_SERVICE="adit-frontend"
REPO_NAME="adit-repo"

echo -e "${GREEN}"
echo "=============================================="
echo "  ADIT Questionnaire - Cloud Run Deployment  "
echo "=============================================="
echo -e "${NC}"
echo -e "Project:  ${BLUE}${PROJECT_ID}${NC}"
echo -e "Region:   ${BLUE}${REGION}${NC}"
echo ""

# -----------------------------------------------------------------------------
# Step 1: Authenticate and configure
# -----------------------------------------------------------------------------
echo -e "${YELLOW}[1/8] Checking GCP authentication...${NC}"

if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | grep -q .; then
    echo "Please authenticate with GCP:"
    gcloud auth login
fi

gcloud config set project $PROJECT_ID

# -----------------------------------------------------------------------------
# Step 2: Enable APIs
# -----------------------------------------------------------------------------
echo -e "${YELLOW}[2/8] Enabling required GCP APIs...${NC}"

gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com \
    artifactregistry.googleapis.com \
    --quiet

# -----------------------------------------------------------------------------
# Step 3: Create Artifact Registry
# -----------------------------------------------------------------------------
echo -e "${YELLOW}[3/8] Setting up Artifact Registry...${NC}"

gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="ADIT Questionnaire images" \
    2>/dev/null || echo "  Repository already exists"

gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

# -----------------------------------------------------------------------------
# Step 4: Create Cloud SQL instance (if not exists)
# -----------------------------------------------------------------------------
echo -e "${YELLOW}[4/8] Setting up Cloud SQL PostgreSQL...${NC}"

if ! gcloud sql instances describe $DB_INSTANCE --quiet 2>/dev/null; then
    echo "  Creating Cloud SQL instance (this may take a few minutes)..."
    gcloud sql instances create $DB_INSTANCE \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=$REGION \
        --storage-auto-increase \
        --backup-start-time=03:00 \
        --quiet

    echo "  Creating database..."
    gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE --quiet

    echo "  Setting database password..."
    gcloud sql users set-password $DB_USER \
        --instance=$DB_INSTANCE \
        --password="$DB_PASSWORD" \
        --quiet
else
    echo "  Cloud SQL instance already exists"
fi

# Store DB password in Secret Manager
echo -e "${YELLOW}[5/8] Configuring secrets...${NC}"

echo -n "$DB_PASSWORD" | gcloud secrets create adit-db-password --data-file=- 2>/dev/null || \
    echo -n "$DB_PASSWORD" | gcloud secrets versions add adit-db-password --data-file=-

# Grant Cloud Run access to the secret
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding adit-db-password \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet 2>/dev/null || true

# -----------------------------------------------------------------------------
# Step 5: Build and push images
# -----------------------------------------------------------------------------
echo -e "${YELLOW}[6/8] Building and pushing Docker images...${NC}"

IMAGE_PREFIX="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}"

echo "  Building backend..."
docker build -t ${IMAGE_PREFIX}/${BACKEND_SERVICE}:latest \
    -f backend/Dockerfile.cloudrun ./backend

echo "  Pushing backend..."
docker push ${IMAGE_PREFIX}/${BACKEND_SERVICE}:latest

echo "  Building frontend..."
docker build -t ${IMAGE_PREFIX}/${FRONTEND_SERVICE}:latest \
    -f frontend/Dockerfile.cloudrun ./frontend

echo "  Pushing frontend..."
docker push ${IMAGE_PREFIX}/${FRONTEND_SERVICE}:latest

# -----------------------------------------------------------------------------
# Step 6: Deploy Backend to Cloud Run
# -----------------------------------------------------------------------------
echo -e "${YELLOW}[7/8] Deploying backend to Cloud Run...${NC}"

DB_CONNECTION="${PROJECT_ID}:${REGION}:${DB_INSTANCE}"

gcloud run deploy $BACKEND_SERVICE \
    --image=${IMAGE_PREFIX}/${BACKEND_SERVICE}:latest \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --add-cloudsql-instances=$DB_CONNECTION \
    --set-env-vars="NODE_ENV=production,DB_HOST=/cloudsql/${DB_CONNECTION},DB_NAME=${DB_NAME},DB_USER=${DB_USER},DB_PORT=5432,CORS_ORIGIN=*" \
    --set-secrets="DB_PASSWORD=adit-db-password:latest" \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --quiet

BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region=$REGION --format='value(status.url)')
echo -e "  Backend deployed at: ${GREEN}${BACKEND_URL}${NC}"

# -----------------------------------------------------------------------------
# Step 7: Deploy Frontend to Cloud Run
# -----------------------------------------------------------------------------
echo -e "${YELLOW}[8/8] Deploying frontend to Cloud Run...${NC}"

gcloud run deploy $FRONTEND_SERVICE \
    --image=${IMAGE_PREFIX}/${FRONTEND_SERVICE}:latest \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --set-env-vars="BACKEND_URL=${BACKEND_URL}" \
    --memory=256Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --quiet

FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region=$REGION --format='value(status.url)')

# -----------------------------------------------------------------------------
# Done!
# -----------------------------------------------------------------------------
echo ""
echo -e "${GREEN}=============================================="
echo "  Deployment Complete!"
echo "==============================================${NC}"
echo ""
echo -e "Frontend URL: ${BLUE}${FRONTEND_URL}${NC}"
echo -e "Backend URL:  ${BLUE}${BACKEND_URL}${NC}"
echo ""
echo -e "${YELLOW}Note: The database tables will be created automatically on first request.${NC}"
echo ""
echo "To view logs:"
echo "  gcloud run logs read $FRONTEND_SERVICE --region=$REGION"
echo "  gcloud run logs read $BACKEND_SERVICE --region=$REGION"
echo ""
echo "To update CORS for production, run:"
echo "  gcloud run services update $BACKEND_SERVICE --region=$REGION --set-env-vars=\"CORS_ORIGIN=${FRONTEND_URL}\""
