#!/bin/bash

# GCP Cloud Run Deployment Script for ADIT Questionnaire
# Prerequisites: gcloud CLI installed and authenticated

set -e

# Configuration - UPDATE THESE VALUES
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-us-central1}"
DB_INSTANCE_NAME="adit-postgres"
DB_NAME="adit_questionnaire"
DB_USER="postgres"

# Service names
BACKEND_SERVICE="adit-backend"
FRONTEND_SERVICE="adit-frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ADIT Questionnaire - GCP Deployment  ${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${YELLOW}Please authenticate with GCP:${NC}"
    gcloud auth login
fi

# Set project
echo -e "\n${YELLOW}Setting GCP project to: ${PROJECT_ID}${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "\n${YELLOW}Enabling required GCP APIs...${NC}"
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com \
    artifactregistry.googleapis.com

# Create Artifact Registry repository (if not exists)
echo -e "\n${YELLOW}Creating Artifact Registry repository...${NC}"
gcloud artifacts repositories create adit-repo \
    --repository-format=docker \
    --location=$REGION \
    --description="ADIT Questionnaire Docker images" \
    2>/dev/null || echo "Repository already exists"

# Configure Docker for Artifact Registry
echo -e "\n${YELLOW}Configuring Docker authentication...${NC}"
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

# Build and push Backend image
echo -e "\n${GREEN}Building and pushing Backend image...${NC}"
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/adit-repo/${BACKEND_SERVICE}:latest ./backend
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/adit-repo/${BACKEND_SERVICE}:latest

# Build and push Frontend image
echo -e "\n${GREEN}Building and pushing Frontend image...${NC}"
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/adit-repo/${FRONTEND_SERVICE}:latest ./frontend
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/adit-repo/${FRONTEND_SERVICE}:latest

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Images pushed successfully!          ${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Create Cloud SQL PostgreSQL instance (if not already done):"
echo "   gcloud sql instances create $DB_INSTANCE_NAME --database-version=POSTGRES_15 --tier=db-f1-micro --region=$REGION"
echo ""
echo "2. Create database:"
echo "   gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE_NAME"
echo ""
echo "3. Set database password:"
echo "   gcloud sql users set-password $DB_USER --instance=$DB_INSTANCE_NAME --password=YOUR_SECURE_PASSWORD"
echo ""
echo "4. Deploy backend to Cloud Run:"
echo "   gcloud run deploy $BACKEND_SERVICE \\"
echo "     --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/adit-repo/${BACKEND_SERVICE}:latest \\"
echo "     --platform=managed \\"
echo "     --region=$REGION \\"
echo "     --allow-unauthenticated \\"
echo "     --add-cloudsql-instances=${PROJECT_ID}:${REGION}:${DB_INSTANCE_NAME} \\"
echo "     --set-env-vars=\"NODE_ENV=production,DB_HOST=/cloudsql/${PROJECT_ID}:${REGION}:${DB_INSTANCE_NAME},DB_NAME=${DB_NAME},DB_USER=${DB_USER},DB_PORT=5432\" \\"
echo "     --set-secrets=\"DB_PASSWORD=adit-db-password:latest\""
echo ""
echo "5. Get backend URL and deploy frontend:"
echo "   BACKEND_URL=\$(gcloud run services describe $BACKEND_SERVICE --region=$REGION --format='value(status.url)')"
echo "   # Update frontend nginx.conf to proxy to this URL, then redeploy"
echo ""
echo -e "${GREEN}For detailed instructions, see DEPLOYMENT.md${NC}"
