#!/bin/bash
# Backstage Kubernetes Deployment Script

# Simple coloring (falls back gracefully if tput is unavailable)
color_blue=$(tput setaf 4 2>/dev/null || echo "")
color_green=$(tput setaf 2 2>/dev/null || echo "")
color_yellow=$(tput setaf 3 2>/dev/null || echo "")
color_red=$(tput setaf 1 2>/dev/null || echo "")
color_reset=$(tput sgr0 2>/dev/null || echo "")

set -e

REGISTRY="${REGISTRY:-YOUR_HARBOR_HOST}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
NAMESPACE="${NAMESPACE:-backstage}"
BACKEND_IMAGE="${REGISTRY}/backstage/backstage-backend:${IMAGE_TAG}"
FRONTEND_IMAGE="${REGISTRY}/backstage/backstage-frontend:${IMAGE_TAG}"

echo "${color_blue}Deploying Backstage to Kubernetes...${color_reset}"
echo "Registry: ${REGISTRY}"
echo "Namespace: ${NAMESPACE}"
echo "Backend Image: ${BACKEND_IMAGE}"
echo "Frontend Image: ${FRONTEND_IMAGE}"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
  echo "${color_red}Error:${color_reset} kubectl not found. Please install kubectl."
  exit 1
fi

# Check if namespace exists, create if not
if ! kubectl get namespace "${NAMESPACE}" &> /dev/null; then
  echo "Creating namespace ${NAMESPACE}..."
  kubectl create namespace "${NAMESPACE}"
fi

# 1. Create PostgreSQL Secret
echo "Creating PostgreSQL secret..."
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_USER=backstage \
  --from-literal=POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-backstage}" \
  --from-literal=POSTGRES_DB=backstage \
  --namespace="${NAMESPACE}" \
  --dry-run=client -o yaml | kubectl apply -f -

# 2. Create Backstage Secrets (if not exists)
if ! kubectl get secret backstage-secrets -n "${NAMESPACE}" &> /dev/null; then
  echo "Creating Backstage secrets..."
  echo "${color_yellow}Warning:${color_reset} Please update backend/secret.yaml with real tokens before deploying!"
  kubectl apply -f "$(dirname "$0")/backend/secret.yaml"
else
  echo "${color_green}Backstage secrets already exist${color_reset}"
fi

# 3. Create Image Pull Secret (if using private registry)
if [ -n "${REGISTRY_USERNAME}" ] && [ -n "${REGISTRY_PASSWORD}" ]; then
  echo "Creating registry pull secret..."
  kubectl create secret docker-registry harbor-registry-secret \
    --docker-server="${REGISTRY}" \
    --docker-username="${REGISTRY_USERNAME}" \
    --docker-password="${REGISTRY_PASSWORD}" \
    --docker-email="${REGISTRY_EMAIL:-YOUR_REGISTRY_EMAIL}" \
    --namespace="${NAMESPACE}" \
    --dry-run=client -o yaml | kubectl apply -f -
else
  echo "${color_yellow}Skipping registry secret${color_reset} (set REGISTRY_USERNAME and REGISTRY_PASSWORD to use private registry)"
fi

# 4. Update deployment images
echo "Updating deployment images..."
cd "$(dirname "$0")"

# Update backend deployment
sed -i.bak "s|image:.*backstage-backend.*|image: ${BACKEND_IMAGE}|g" backend/deployment.yaml
rm -f backend/deployment.yaml.bak

# Update frontend deployment
sed -i.bak "s|image:.*backstage-frontend.*|image: ${FRONTEND_IMAGE}|g" frontend/deployment.yaml
rm -f frontend/deployment.yaml.bak

# 5. Deploy RBAC (ServiceAccount + ClusterRole)
echo "${color_blue}Applying RBAC manifests...${color_reset}"
kubectl apply -f rbac/

# 6. Deploy all resources
echo "${color_blue}Deploying Backstage components...${color_reset}"

# Namespace
kubectl apply -f namespace.yaml

# PostgreSQL
echo "Deploying PostgreSQL..."
kubectl apply -f postgresql/

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n "${NAMESPACE}" --timeout=300s || true

# Backend (configmap-argocd dahil)
echo "Deploying Backend..."
kubectl apply -f backend/

# Frontend
echo "Deploying Frontend..."
kubectl apply -f frontend/

# Ingress/Route
if kubectl get crd routes.route.openshift.io &> /dev/null; then
  echo "Deploying OpenShift Route..."
  kubectl apply -f route.yaml

  # Route hostname'ini al ve URL'leri güncelle
  echo "Waiting for Route to get a hostname..."
  sleep 5
  ROUTE_HOST=$(kubectl get route backstage-route -n "${NAMESPACE}" -o jsonpath='{.spec.host}' 2>/dev/null || echo "")

  if [ -n "${ROUTE_HOST}" ]; then
    PUBLIC_URL="https://${ROUTE_HOST}"
    echo "${color_green}Route hostname: ${ROUTE_HOST}${color_reset}"

    # Backend deployment'ındaki APP_BASE_URL ve BACKEND_BASE_URL'yi patch et
    kubectl set env deployment/backstage-backend \
      APP_BASE_URL="${PUBLIC_URL}" \
      BACKEND_BASE_URL="${PUBLIC_URL}" \
      -n "${NAMESPACE}" 2>/dev/null || true

    kubectl set env deployment/backstage-frontend \
      APP_BASE_URL="${PUBLIC_URL}" \
      BACKEND_BASE_URL="${PUBLIC_URL}" \
      -n "${NAMESPACE}" 2>/dev/null || true
  else
    echo "${color_yellow}Route hostname henüz atanmadı.${color_reset}"
    echo "Manuel olarak güncelleyin:"
    echo "  ROUTE=\$(oc get route backstage-route -n ${NAMESPACE} -o jsonpath='{.spec.host}')"
    echo "  oc set env deployment/backstage-backend APP_BASE_URL=https://\$ROUTE BACKEND_BASE_URL=https://\$ROUTE -n ${NAMESPACE}"
    echo "  oc set env deployment/backstage-frontend APP_BASE_URL=https://\$ROUTE BACKEND_BASE_URL=https://\$ROUTE -n ${NAMESPACE}"
  fi
else
  echo "Deploying Kubernetes Ingress..."
  kubectl apply -f ingress.yaml
fi

echo ""
echo "${color_green}Deployment complete!${color_reset}"
echo ""
echo "Pod durumu:"
echo "  kubectl get pods -n ${NAMESPACE}"
echo ""
echo "Loglar:"
echo "  kubectl logs -f deployment/backstage-backend -n ${NAMESPACE}"
echo "  kubectl logs -f deployment/backstage-frontend -n ${NAMESPACE}"
echo ""
echo "Backstage URL:"
if kubectl get crd routes.route.openshift.io &> /dev/null; then
  FINAL_HOST=$(kubectl get route backstage-route -n "${NAMESPACE}" -o jsonpath='{.spec.host}' 2>/dev/null || echo "<henüz atanmadı>")
  echo "  https://${FINAL_HOST}"
else
  echo "  kubectl get ingress backstage-ingress -n ${NAMESPACE} -o jsonpath='{.spec.rules[0].host}'"
fi
