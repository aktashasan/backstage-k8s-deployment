# Backstage Kubernetes Deployment

Bu dizin Backstage'i Kubernetes/OpenShift cluster'a deploy etmek için gerekli tüm manifest'leri içerir.

## Yapı

```
deployments/kubernetes/
├── namespace.yaml              # backstage namespace
├── postgresql/
│   ├── secret.yaml            # DB credentials
│   ├── pvc.yaml               # PersistentVolumeClaim
│   ├── deployment.yaml        # PostgreSQL Deployment
│   └── service.yaml           # PostgreSQL Service
├── backend/
│   ├── secret.yaml            # Backstage secrets (tokens, etc.)
│   ├── configmap.yaml         # app-config.yaml
│   ├── deployment.yaml        # Backend Deployment
│   └── service.yaml           # Backend Service
├── frontend/
│   ├── deployment.yaml        # Frontend Deployment
│   └── service.yaml           # Frontend Service
├── ingress.yaml               # Kubernetes Ingress
├── route.yaml                 # OpenShift Route (alternative)
├── kustomization.yaml         # Kustomize config
└── README.md                  # Bu dosya
```

## Ön Koşullar

1. **Kubernetes/OpenShift cluster** erişimi
2. **kubectl** veya **oc** CLI
3. **Docker images** build edilmiş ve registry'ye push edilmiş olmalı:
   - `backstage-backend:latest`
   - `backstage-frontend:latest`

## Adım 1: Docker Image'ları Build ve Push

### Backend

```bash
cd backstage-demo

# Build
yarn install --immutable
yarn tsc
yarn build:backend

# Build image
docker build -f packages/backend/Dockerfile -t your-registry/backstage-backend:latest .

# Push
docker push your-registry/backstage-backend:latest
```

### Frontend

```bash
cd backstage-demo/packages/app

# Build image
docker build -t your-registry/backstage-frontend:latest .

# Push
docker push your-registry/backstage-frontend:latest
```

## Adım 2: Secrets ve ConfigMap'i Güncelle

### 1. PostgreSQL Secret

```bash
# postgresql/secret.yaml içindeki POSTGRES_PASSWORD'ı değiştirin
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_USER=backstage \
  --from-literal=POSTGRES_PASSWORD=your-secure-password \
  --from-literal=POSTGRES_DB=backstage_plugin_catalog \
  -n backstage
```

### 2. Backstage Secrets

`backend/secret.yaml` dosyasını düzenleyin ve gerçek token'ları ekleyin:

- `GITHUB_TOKEN`
- `AZURE_DEVOPS_TOKEN`
- `GITLAB_TOKEN`
- `HARBOR_USERNAME` / `HARBOR_PASSWORD`
- Cluster token'ları (opsiyonel)

Sonra:

```bash
kubectl apply -f backend/secret.yaml
```

### 3. ConfigMap

`backend/configmap.yaml` içindeki `app-config.yaml`'ı ihtiyacınıza göre güncelleyin (cluster URL'leri, catalog locations, vb.).

## Adım 3: Image Pull Secret (Private Registry için)

Eğer private registry kullanıyorsanız:

```bash
kubectl create secret docker-registry registry-secret \
  --docker-server=your-registry.com \
  --docker-username=your-username \
  --docker-password=your-password \
  --docker-email=your-email@example.com \
  -n backstage
```

## Adım 4: Deploy

### Kustomize ile (önerilen)

```bash
kubectl apply -k deployments/kubernetes/
```

### Veya tek tek

```bash
# Namespace
kubectl apply -f namespace.yaml

# PostgreSQL
kubectl apply -f postgresql/

# Backend
kubectl apply -f backend/

# Frontend
kubectl apply -f frontend/

# Ingress/Route
kubectl apply -f ingress.yaml
# veya OpenShift için:
# oc apply -f route.yaml
```

## Adım 5: Ingress/Route Yapılandırması

### Kubernetes Ingress

`ingress.yaml` içindeki `host: backstage.example.com` değerini gerçek domain'inizle değiştirin.

Ingress controller'ınızın yüklü olduğundan emin olun (örn. NGINX Ingress Controller).

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

# PostgreSQL bağlantısını test et
kubectl exec -it deployment/postgres -n backstage -- psql -U backstage -d backstage_plugin_catalog
```

## Ölçeklendirme

```bash
# Backend replica sayısını artır
kubectl scale deployment backstage-backend --replicas=3 -n backstage

# Frontend replica sayısını artır
kubectl scale deployment backstage-frontend --replicas=3 -n backstage
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

2. nginx config'i kontrol edin (frontend Dockerfile içinde).

### PostgreSQL verisi kayboluyor

PVC'nin doğru mount edildiğini kontrol edin:
```bash
kubectl describe pvc postgres-pvc -n backstage
```

## Production İyileştirmeleri

1. **Resource Limits**: Deployment'lardaki `resources` değerlerini workload'unuza göre ayarlayın.

2. **HPA (Horizontal Pod Autoscaler)**: Otomatik ölçeklendirme için HPA ekleyin.

3. **Network Policies**: Namespace izolasyonu için NetworkPolicy ekleyin.

4. **Backup**: PostgreSQL için düzenli backup stratejisi oluşturun.

5. **Monitoring**: Prometheus/Grafana ile monitoring ekleyin.

6. **TLS/HTTPS**: Ingress/Route için TLS sertifikası ekleyin (Let's Encrypt, cert-manager).

7. **ConfigMap/Secret Management**: External Secrets Operator veya Sealed Secrets kullanın.
