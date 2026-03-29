# Backstage Kubernetes Deployment - Hızlı Başlangıç

## 1. Docker Image'ları Build ve Push

```bash
cd backstage-demo

# Backend
yarn install --immutable
yarn tsc
yarn build:backend
docker build -f packages/backend/Dockerfile -t your-registry/backstage-backend:latest .
docker push your-registry/backstage-backend:latest

# Frontend
cd packages/app
docker build -t your-registry/backstage-frontend:latest .
docker push your-registry/backstage-frontend:latest
```

Veya `build-and-push.sh` script'ini kullanın:

```bash
export REGISTRY=your-registry.com
export IMAGE_TAG=latest
./deployments/kubernetes/build-and-push.sh
```

## 2. Secrets Oluştur

### PostgreSQL Secret

```bash
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_USER=backstage \
  --from-literal=POSTGRES_PASSWORD=your-secure-password \
  --from-literal=POSTGRES_DB=backstage_plugin_catalog \
  -n backstage
```

### Backstage Secrets

`backend/secret.yaml` dosyasını düzenleyip gerçek token'ları ekleyin, sonra:

```bash
kubectl apply -f deployments/kubernetes/backend/secret.yaml
```

### Image Pull Secret (Private Registry için)

```bash
kubectl create secret docker-registry registry-secret \
  --docker-server=your-registry.com \
  --docker-username=your-username \
  --docker-password=your-password \
  --docker-email=your-email@example.com \
  -n backstage
```

## 3. ConfigMap ve Deployment Image'larını Güncelle

### ConfigMap

`backend/configmap.yaml` içindeki:
- `APP_BASE_URL` ve `BACKEND_BASE_URL` değerlerini Ingress/Route URL'inizle değiştirin
- Cluster URL'lerini güncelleyin

### Deployment Image'ları

`backend/deployment.yaml` ve `frontend/deployment.yaml` içindeki:
- `image: backstage-backend:latest` → `image: your-registry/backstage-backend:latest`
- `image: backstage-frontend:latest` → `image: your-registry/backstage-frontend:latest`

## 4. Deploy

### Kustomize ile (önerilen)

```bash
kubectl apply -k deployments/kubernetes/
```

### Veya tek tek

```bash
kubectl apply -f deployments/kubernetes/namespace.yaml
kubectl apply -f deployments/kubernetes/postgresql/
kubectl apply -f deployments/kubernetes/backend/
kubectl apply -f deployments/kubernetes/frontend/
kubectl apply -f deployments/kubernetes/ingress.yaml
# veya OpenShift için:
# oc apply -f deployments/kubernetes/route.yaml
```

## 5. Ingress/Route Yapılandırması

### Kubernetes Ingress

`ingress.yaml` içindeki `host: backstage.example.com` değerini gerçek domain'inizle değiştirin.

### OpenShift Route

`route.yaml` içindeki `host` değerini ayarlayın veya OpenShift'in otomatik hostname atamasını kullanın.

## 6. Kontrol

```bash
# Pod'ları kontrol et
kubectl get pods -n backstage

# Service'leri kontrol et
kubectl get svc -n backstage

# Log'ları kontrol et
kubectl logs -f deployment/backstage-backend -n backstage
kubectl logs -f deployment/backstage-frontend -n backstage

# PostgreSQL bağlantısını test et
kubectl exec -it deployment/postgres -n backstage -- psql -U backstage -d backstage_plugin_catalog
```

## Troubleshooting

### Backend başlamıyor

1. PostgreSQL bağlantısını kontrol edin:
   ```bash
   kubectl logs deployment/backstage-backend -n backstage
   ```

2. Secret'ların doğru olduğundan emin olun:
   ```bash
   kubectl get secret backstage-secrets -n backstage -o yaml
   ```

### Frontend backend'e bağlanamıyor

1. Service'lerin çalıştığını kontrol edin:
   ```bash
   kubectl get svc -n backstage
   ```

2. nginx config'i kontrol edin (`packages/app/nginx.conf`).

### PostgreSQL verisi kayboluyor

PVC'nin doğru mount edildiğini kontrol edin:
```bash
kubectl describe pvc postgres-pvc -n backstage
```
