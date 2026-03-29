#!/bin/bash
# Backstage Docker Images Build and Push Script

# Simple coloring (falls back gracefully if tput is unavailable)
color_blue=$(tput setaf 4 2>/dev/null || echo "")
color_green=$(tput setaf 2 2>/dev/null || echo "")
color_yellow=$(tput setaf 3 2>/dev/null || echo "")
color_red=$(tput setaf 1 2>/dev/null || echo "")
color_reset=$(tput sgr0 2>/dev/null || echo "")

# Don't exit on error for yarn install (isolated-vm may fail locally but will build in Docker)
set +e

REGISTRY="${REGISTRY:-YOUR_HARBOR_HOST}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
BACKEND_BUILD_NO_CACHE="${BACKEND_BUILD_NO_CACHE:-0}"
BACKEND_IMAGE="${REGISTRY}/backstage/backstage-backend:${IMAGE_TAG}"
FRONTEND_IMAGE="${REGISTRY}/backstage/backstage-frontend:${IMAGE_TAG}"

echo "${color_blue}Building Backstage images...${color_reset}"
echo "Registry: ${REGISTRY}"
echo "Tag: ${IMAGE_TAG}"

# Find yarn (only needed when not SKIP_LOCAL_BUILD)
YARN_CMD=""
if [ "${SKIP_LOCAL_BUILD:-0}" != "1" ]; then
  if command -v yarn &> /dev/null; then
    YARN_CMD="yarn"
  elif command -v corepack &> /dev/null && corepack enable 2>/dev/null; then
    YARN_CMD="yarn"
  else
    echo "Error: yarn not found."
    exit 1
  fi
fi

# Backend
echo "${color_blue}Building backend...${color_reset}"
cd "$(dirname "$0")/../.."

if [ "${SKIP_LOCAL_BUILD:-0}" = "1" ]; then
  echo "${color_yellow}SKIP_LOCAL_BUILD=1:${color_reset} Skipping yarn install, tsc, build:backend."
  echo "Expecting packages/backend/dist/{bundle,skeleton}.tar.gz from another machine."
  if [ ! -f packages/backend/dist/bundle.tar.gz ] || [ ! -f packages/backend/dist/skeleton.tar.gz ]; then
    echo "${color_red}Error:${color_reset} bundle.tar.gz and skeleton.tar.gz not found."
    echo "Build them on a machine with working yarn (yarn install, yarn tsc, yarn build:backend)"
    echo "Then copy packages/backend/dist/ to this host."
    exit 1
  fi
else
  # Install dependencies (ignore isolated-vm build errors - will be built in Docker)
  echo "Installing dependencies..."
  ${YARN_CMD} install --immutable
  INSTALL_EXIT=$?

  if [ $INSTALL_EXIT -ne 0 ]; then
    echo "${color_yellow}Warning:${color_reset} yarn install had errors (likely isolated-vm native module)."
    echo "${color_yellow}Note:${color_reset} native modules will be built inside the Docker image."
    echo "Checking if we can continue..."
  fi

  set -e

  echo "Compiling TypeScript..."
  ${YARN_CMD} tsc

  echo "Building backend bundle..."
  ${YARN_CMD} build:backend
fi

set -e

# Select container build engine
BUILD_ENGINE=""
if command -v docker &> /dev/null && docker buildx version &> /dev/null; then
  BUILD_ENGINE="docker-buildx"
elif command -v podman &> /dev/null; then
  BUILD_ENGINE="podman"
else
  echo "${color_red}Error:${color_reset} neither docker buildx nor podman is available."
  exit 1
fi

echo "Using build engine: ${BUILD_ENGINE}"

# Setup buildx for multi-platform builds when docker buildx is available
if [ "${BUILD_ENGINE}" = "docker-buildx" ]; then
  echo "Setting up buildx..."
  docker buildx create --use --name backstage-builder 2>/dev/null || docker buildx use backstage-builder || true
fi

# Build backend for linux/amd64 (Kubernetes cluster architecture)
echo "Building backend for linux/amd64..."
if [ "${BUILD_ENGINE}" = "docker-buildx" ]; then
  docker buildx build --platform linux/amd64 \
    -f packages/backend/Dockerfile \
    -t "${BACKEND_IMAGE}" \
    --push \
    --load=false \
    .
else
  BACKEND_BUILD_OPTS="--network host --platform linux/amd64 -f packages/backend/Dockerfile -t ${BACKEND_IMAGE}"
  [ "${BACKEND_BUILD_NO_CACHE}" = "1" ] && BACKEND_BUILD_OPTS="--no-cache ${BACKEND_BUILD_OPTS}"
  podman build ${BACKEND_BUILD_OPTS} .
  podman push "${BACKEND_IMAGE}"
fi

echo "${color_green}Pushed${color_reset} ${BACKEND_IMAGE}"

# Frontend
echo "Building frontend for linux/amd64..."
# Get APP_BASE_URL and BACKEND_BASE_URL from environment or use defaults
APP_BASE_URL="${APP_BASE_URL:-http://YOUR_BACKSTAGE_DOMAIN}"
BACKEND_BASE_URL="${BACKEND_BASE_URL:-http://YOUR_BACKSTAGE_DOMAIN}"

if [ "${BUILD_ENGINE}" = "docker-buildx" ]; then
  docker buildx build --platform linux/amd64 \
    -f packages/app/Dockerfile \
    --build-arg APP_BASE_URL="${APP_BASE_URL}" \
    --build-arg BACKEND_BASE_URL="${BACKEND_BASE_URL}" \
    -t "${FRONTEND_IMAGE}" \
    --push \
    --load=false \
    .
else
  podman build --platform linux/amd64 \
    -f packages/app/Dockerfile \
    --build-arg APP_BASE_URL="${APP_BASE_URL}" \
    --build-arg BACKEND_BASE_URL="${BACKEND_BASE_URL}" \
    -t "${FRONTEND_IMAGE}" \
    .
  podman push "${FRONTEND_IMAGE}"
fi

echo "${color_green}Pushed${color_reset} ${FRONTEND_IMAGE}"

echo "Done! Images pushed:"
echo "  - ${BACKEND_IMAGE}"
echo "  - ${FRONTEND_IMAGE}"
