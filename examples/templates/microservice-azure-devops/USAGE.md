# Azure DevOps Microservice Template - Kullanım Kılavuzu

## 🎯 Template Özellikleri

Bu template, mimarinize uygun enterprise-grade microservice oluşturmanızı sağlar:

### ✅ İçerdikleri

1. **Multi-Language Support**
   - Java (Spring Boot 3.x)
   - Node.js (Express/NestJS)
   - .NET 8
   - Python (FastAPI/Django)
   - Go

2. **Azure DevOps CI/CD**
   - Dev Pipeline (otomatik deploy)
   - Test Pipeline (PR bazlı)
   - Prod Pipeline (approval ile)
   - Code Build, Test, Security Scan
   - Image Build & Scan (Trivy)
   - Nexus artifact push
   - Harbor container registry

3. **Kubernetes Multi-Cluster**
   - Dev, Test, Prod overlays
   - Kustomize bazlı konfigürasyon
   - HPA (Horizontal Pod Autoscaling)
   - PodDisruptionBudget
   - Security best practices

4. **GitOps Support**
   - ArgoCD entegrasyonu
   - FluxCD desteği
   - Manuel deployment opsiyonu

5. **Local Development**
   - Tilt entegrasyonu
   - Hot reload
   - Local Kubernetes desteği

6. **Observability**
   - Prometheus metrics
   - Health/Readiness probes
   - Distributed tracing
   - Structured logging

## 🚀 Template'i Kullanma

### Adım 1: Backstage'i Başlatın

```bash
cd backstage-demo
yarn install
yarn dev
```

Backstage UI: http://localhost:3000

### Adım 2: Template'e Erişin

1. Backstage UI'da sol menüden **"Create"** seçeneğine tıklayın
2. Template listesinde **"Azure DevOps Microservice Template"** 'i bulun
3. **"Choose"** butonuna tıklayın

### Adım 3: Form Alanlarını Doldurun

#### 1️⃣ Microservice Bilgileri
- **Microservice Adı**: `user-service` (kebab-case)
- **Açıklama**: Microservice'in ne yaptığını açıklayın
- **Owner**: Takım veya kişi
- **System**: Bağlı olduğu sistem (opsiyonel)

#### 2️⃣ Teknoloji Stack
- **Dil**: Java, Node.js, .NET, Python, Go
- **Framework**: Spring Boot, Express, FastAPI, vb.
- **Database**: PostgreSQL, MongoDB, Redis, MySQL, vb.
- **Observability**: Prometheus metrics aktif mi?

#### 3️⃣ Azure DevOps
- **Organization**: Azure DevOps organization adı
- **Project**: Proje adı
- **Repository**: Repo adı (boş bırakılırsa component_id kullanılır)
- **SonarQube**: Code quality scan aktif mi?

#### 4️⃣ Container & Registry
- **Harbor Project**: `microservices-dev` veya `microservices-prod`
- **Nexus Repository**: `maven-releases`
- **Container Port**: `8080`
- **Image Scan**: Trivy security scan

#### 5️⃣ Kubernetes Deployment
- **Deploy to Dev**: Dev cluster'a otomatik deploy
- **Deploy to Test**: PR'da test cluster'a deploy
- **Deploy to Prod**: Production deployment
- **Cluster Type**: OpenShift veya Kubernetes
- **Namespace**: Kubernetes namespace
- **Replicas**: Pod sayısı
- **HPA**: Horizontal Pod Autoscaling
- **Ingress**: External erişim

#### 6️⃣ GitOps & Local Dev
- **GitOps Provider**: ArgoCD, Flux, Manuel
- **Tilt**: Local development desteği

### Adım 4: Template'i Oluşturun

1. Tüm bilgileri doldurun
2. **"Review"** butonuna tıklayın
3. Özeti kontrol edin
4. **"Create"** butonuna tıklayın

### Adım 5: Oluşturulan Kaynaklar

Template oluşturulduktan sonra:

✅ Azure DevOps repository oluşturuldu
✅ 3 adet pipeline oluşturuldu (dev, test, prod)
✅ Harbor project oluşturuldu
✅ Kubernetes namespace'ler oluşturuldu
✅ ArgoCD application oluşturuldu (eğer seçildiyse)
✅ Backstage catalog'a kaydedildi

## 📁 Oluşturulan Proje Yapısı

```
microservice/
├── .github/
├── .gitignore
├── README.md
├── Dockerfile                    # Multi-stage Docker build
├── Tiltfile                      # Local development
├── catalog-info.yaml             # Backstage component tanımı
├── azure-pipelines.yml           # Ana pipeline
├── pipelines/
│   ├── dev-pipeline.yml          # Dev cluster deploy
│   ├── test-pipeline.yml         # PR test deploy
│   └── prod-pipeline.yml         # Production deploy
├── k8s/
│   ├── base/                     # Base Kubernetes manifests
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── hpa.yaml
│   │   ├── pdb.yaml
│   │   └── kustomization.yaml
│   └── overlays/
│       ├── dev/                  # Dev environment
│       ├── test/                 # Test environment
│       └── prod/                 # Production environment
├── argocd/
│   └── application.yaml          # ArgoCD apps
├── src/                          # Uygulama kodu
│   ├── main/
│   └── test/
└── pom.xml / package.json        # Dependency management
```

## 🔄 CI/CD Pipeline Akışı

### Dev Branch Pipeline

```
Commit to dev → Build → Test → Docker Build → 
Harbor Push → Deploy to Dev Cluster → Health Check
```

**Otomatik çalışır**, manuel approval gerekmez.

### Test Branch (PR) Pipeline

```
Create PR → Build → Full Tests → Security Scan → 
Docker Build → Deploy to Test Cluster → Integration Tests → 
PR Comment → (PR kapanınca cleanup)
```

**PR oluşturulunca otomatik çalışır**, PR-specific namespace oluşturur.

### Production Pipeline

```
Merge to prod → Build → Security Scan → 
🔒 MANUAL APPROVAL → Blue-Green Deploy → 
Gradual Traffic Switch → Monitor → Cleanup Blue
```

**Manuel approval gerektirir**, production deploy öncesi onay ister.

## 🛠️ Local Development

### Tilt ile Çalışma

```bash
# Projeye gidin
cd user-service

# Tilt'i başlatın
tilt up

# Tilt UI'ı açın (otomatik açılır)
# http://localhost:10350

# Servisiniz hazır
# http://localhost:8080
```

Tilt otomatik olarak:
- Kodu watch eder
- Değişikliklerde rebuild eder
- Hot reload yapar
- Kubernetes'e deploy eder
- Database'i ayağa kaldırır (eğer seçildiyse)

### Manuel Development

```bash
# Java
mvn spring-boot:run

# Node.js
npm run dev

# .NET
dotnet run

# Python
uvicorn main:app --reload

# Go
air  # veya go run cmd/main.go
```

## 🧪 Testing

```bash
# Unit tests
mvn test                 # Java
npm test                 # Node.js
dotnet test             # .NET
pytest                  # Python
go test ./...           # Go

# Integration tests
mvn verify              # Java
npm run test:integration # Node.js

# E2E tests (Tilt ile)
tilt trigger test
```

## 🚀 Deployment

### Dev'e Deploy

```bash
git checkout dev
git add .
git commit -m "feat: new feature"
git push origin dev

# Pipeline otomatik çalışır
# https://dev.azure.com/<org>/<project>/_build
```

### Test'e Deploy (PR)

```bash
git checkout -b feature/new-feature
git add .
git commit -m "feat: new feature"
git push origin feature/new-feature

# PR oluşturun
# Pipeline otomatik çalışır ve PR'a yorum ekler
```

### Production'a Deploy

```bash
# Dev'den prod'a merge edin
git checkout prod
git merge dev
git push origin prod

# Pipeline başlar
# MANUAL APPROVAL bekler
# Azure DevOps'ta approve edin
# Blue-Green deployment başlar
```

## 📊 Monitoring

### Grafana Dashboard
https://grafana.company.com/d/<component-id>

### ArgoCD
https://argocd.company.com/applications/<component-id>

### Azure DevOps Pipelines
https://dev.azure.com/<org>/<project>/_build

### Harbor Registry
https://harbor.company.com/harbor/projects/<project>/repositories

## 🔒 Security

- ✅ Container security scan (Trivy)
- ✅ SonarQube code analysis
- ✅ Dependency vulnerability check
- ✅ Non-root container user
- ✅ Read-only filesystem
- ✅ Network policies
- ✅ Pod security standards

## 🐛 Troubleshooting

### Pipeline başlamıyor
```bash
# Azure DevOps'ta pipeline'ı kontrol edin
# Service connections'ları doğrulayın
# Variable groups'ları kontrol edin
```

### Tilt çalışmıyor
```bash
# Kubernetes context'i kontrol edin
kubectl config current-context

# Namespace'i kontrol edin
kubectl get ns

# Tilt loglarına bakın
tilt logs
```

### Deploy başarısız
```bash
# Pod loglarına bakın
kubectl logs -f deployment/<component-id> -n <namespace>

# Events'leri kontrol edin
kubectl get events -n <namespace>

# Pipeline loglarını inceleyin
```

## 📚 Daha Fazla Bilgi

- Backstage Docs: https://backstage.io/docs
- Azure DevOps: https://dev.azure.com
- Kubernetes: https://kubernetes.io/docs
- Tilt: https://tilt.dev
- ArgoCD: https://argo-cd.readthedocs.io

## 🤝 Destek

Sorunlarınız için:
- Platform Team: platform-team@company.com
- Slack: #microservices-support
- Azure DevOps Boards: Ticket açın

---

**Başarılar! 🚀**
