# Backstage Kubernetes Deployment - Hızlı Başlangıç

## Ön Koşullar

1. **Kubernetes/OpenShift cluster** erişimi
2. **kubectl** veya **oc** CLI kurulu
3. **Docker images** Harbor'a push edilmiş olmalı

## Adım 1: Image'ları Build ve Push

```bash
cd backstage-demo

# Harbor registry bilgilerini ayarla
export REGISTRY=YOUR_HARBOR_HOST
export IMAGE_TAG=latest
export REGISTRY_USERNAME=your-harbor-username
export REGISTRY_PASSWORD=your-harbor-password

# Build ve push
./deployments/kubernetes/build-and-push.sh
```

## Adım 2: Secrets'ları Hazırla

### PostgreSQL Secret

```bash
export POSTGRES_PASSWORD=your-secure-password
```

### Backstage Secrets

`backend/secret.yaml` dosyasını düzenleyip gerçek token'ları ekleyin:
- `GITHUB_TOKEN`
- `AZURE_DEVOPS_TOKEN`
- `GITLAB_TOKEN`
- `HARBOR_USERNAME` / `HARBOR_PASSWORD`
- Cluster token'ları (opsiyonel)

## Adım 3: ConfigMap'i Güncelle

`backend/configmap.yaml` içindeki:
- `APP_BASE_URL` ve `BACKEND_BASE_URL` değerlerini Ingress/Route URL'inizle değiştirin
- Cluster URL'lerini güncelleyin (varsa)

## Adım 4: Deploy

### Otomatik Deploy (Önerilen)

```bash
cd backstage-demo/deployments/kubernetes

# Environment variables
export REGISTRY=YOUR_HARBOR_HOST
export IMAGE_TAG=latest
export POSTGRES_PASSWORD=your-secure-password
export REGISTRY_USERNAME=your-harbor-username
export REGISTRY_PASSWORD=your-harbor-password

# Deploy
./deploy.sh
```

### Manuel Deploy

```bash
# 1. Namespace
kubectl apply -f deployments/kubernetes/namespace.yaml

# 2. PostgreSQL Secret
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_USER=backstage \
  --from-literal=POSTGRES_PASSWORD=your-secure-password \
  --from-literal=POSTGRES_DB=backstage_plugin_catalog \
  -n backstage

# 3. Backstage Secrets
kubectl apply -f deployments/kubernetes/backend/secret.yaml

# 4. Registry Secret (Harbor için)
kubectl create secret docker-registry registry-secret \
  --docker-server=YOUR_HARBOR_HOST \
  --docker-username=your-harbor-username \
  --docker-password=your-harbor-password \
  --docker-email=YOUR_REGISTRY_EMAIL \
  -n backstage

# 5. PostgreSQL
kubectl apply -f deployments/kubernetes/postgresql/

# 6. Backend
kubectl apply -f deployments/kubernetes/backend/

# 7. Frontend
kubectl apply -f deployments/kubernetes/frontend/

# 8. Ingress/Route
# Kubernetes için:
kubectl apply -f deployments/kubernetes/ingress.yaml
# OpenShift için:
# oc apply -f deployments/kubernetes/route.yaml
```

## Adım 5: Ingress/Route Yapılandırması

### Kubernetes Ingress

`ingress.yaml` içindeki `host: backstage.example.com` değerini gerçek domain'inizle değiştirin.

### OpenShift Route

`route.yaml` içindeki `host` değerini ayarlayın veya OpenShift'in otomatik hostname atamasını kullanın.

## Kontrol

```bash
# Pod'ları kontrol et
kubectl get pods -n backstage

# Service'leri kontrol et
kubectl get svc -n backstage

# Log'ları kontrol et
kubectl logs -f deployment/backstage-backend -n backstage
kubectl logs -f deployment/backstage-frontend -n backstage

# Ingress/Route URL'ini al
# Kubernetes:
kubectl get ingress backstage-ingress -n backstage -o jsonpath='{.spec.rules[0].host}'
# OpenShift:
oc get route backstage-route -n backstage -o jsonpath='{.spec.host}'
```

## Troubleshooting

### Pod'lar başlamıyor

```bash
# Pod durumunu kontrol et
kubectl describe pod <pod-name> -n backstage

# Log'ları kontrol et
kubectl logs <pod-name> -n backstage
```

### Image pull hatası

```bash
# Registry secret'ı kontrol et
kubectl get secret registry-secret -n backstage

# Image pull secret'ı pod'a ekle
kubectl patch deployment backstage-backend -n backstage -p '{"spec":{"template":{"spec":{"imagePullSecrets":[{"name":"registry-secret"}]}}}}'
```

### PostgreSQL bağlantı hatası

```bash
# PostgreSQL pod'unu kontrol et
kubectl get pods -l app=postgres -n backstage

# PostgreSQL log'larını kontrol et
kubectl logs -l app=postgres -n backstage

# Secret'ı kontrol et
kubectl get secret postgres-secret -n backstage -o yaml
```
