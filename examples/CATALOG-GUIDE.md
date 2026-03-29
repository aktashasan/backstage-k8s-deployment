# Backstage Catalog Yapısı - Kullanım Kılavuzu

## 📚 İçerik

Bu klasörde, mimarinize uygun **tam organizasyonel Backstage catalog yapısı** bulunmaktadır.

## 📁 Catalog Dosyaları

### 1. **domains.yaml** - İş Alanları (5 Domain)

En üst seviye organizasyonel yapı:

- **platform**: Platform mühendisliği, araçlar, DevOps
- **infrastructure**: Kubernetes, networking, altyapı
- **applications**: İş uygulamaları, microservices
- **security**: Güvenlik, compliance, tarama
- **data**: Veri platformu, analytics

```yaml
Domain
  ├── System
  │   ├── Component
  │   │   ├── API
  │   └── Resource
```

### 2. **systems.yaml** - Sistemler (9 System)

Domain'lere bağlı ana sistemler:

1. **azure-devops-cicd** - CI/CD platform
2. **artifact-management** - Nexus & Harbor
3. **kubernetes-infrastructure** - K8s clusters
4. **gitops-platform** - ArgoCD/Flux
5. **observability** - Prometheus, Grafana
6. **microservices-platform** - Microservice'ler
7. **api-gateway** - Kong/NGINX
8. **security-compliance** - SonarQube, Trivy
9. **developer-platform** - Backstage IDP

### 3. **resources.yaml** - Kaynaklar (16 Resource)

Altyapı kaynakları:

#### Kubernetes Clusters
- ✅ **kubernetes-dev-cluster** - Dev ortamı
- ✅ **kubernetes-test-cluster** - Test ortamı
- ✅ **kubernetes-prod-cluster** - Production (HA)

#### Container & Artifact Registries
- ✅ **harbor-dev-registry** - Dev container registry
- ✅ **harbor-prod-registry** - Prod container registry
- ✅ **nexus-artifact-repository** - Maven, npm artifacts

#### GitOps
- ✅ **argocd-dev** - Dev GitOps controller
- ✅ **argocd-prod** - Prod GitOps controller

#### Databases & Cache
- ✅ **postgresql-shared** - PostgreSQL cluster
- ✅ **mongodb-shared** - MongoDB cluster
- ✅ **redis-cache-cluster** - Redis cache

#### Messaging & Monitoring
- ✅ **kafka-message-bus** - Event streaming
- ✅ **prometheus-monitoring** - Metrics
- ✅ **grafana-dashboards** - Visualization

#### Security
- ✅ **sonarqube-scanner** - Code quality
- ✅ **trivy-container-scanner** - Container scanning

### 4. **components.yaml** - Uygulamalar (9 Component)

Microservice ve platform bileşenleri:

#### Platform Components
- 🏗️ **backstage-idp** - Internal Developer Platform
- 🛠️ **tilt-dev-environment** - Local development

#### Example Microservices
- 👤 **user-service** - User authentication (Java/Spring Boot)
- 📦 **order-service** - Order management (Node.js/Express)
- 💳 **payment-service** - Payment processing (.NET)
- 📧 **notification-service** - Notifications (Python/FastAPI)

#### Gateway & Frontend
- 🚪 **api-gateway** - Kong/NGINX gateway
- 🌐 **web-portal** - React web app
- 📱 **mobile-bff** - Mobile Backend for Frontend

### 5. **apis.yaml** - API Tanımları (8 API)

Microservice API'leri:

- 🔐 **user-api** - User & Auth API (REST)
- 📦 **order-api** - Order Management API (REST)
- 💳 **payment-api** - Payment Processing API (REST)
- 📧 **notification-api** - Notification API (REST)
- 📊 **inventory-api** - Inventory API (REST)
- 🔑 **auth-api** - OAuth2/OIDC API
- 📱 **mobile-graphql-api** - Mobile GraphQL API
- 📈 **prometheus-metrics-api** - Metrics API

### 6. **teams.yaml** - Organizasyon (8 Team, 5 User)

Takımlar ve kullanıcılar:

#### Teams
- 🏗️ **platform-team** - Platform mühendisliği
- 💻 **development-team** - Geliştirme (parent)
  - **backend-team** - Backend development
  - **frontend-team** - Frontend development
  - **mobile-team** - Mobile development
- 💳 **payment-team** - Payment services
- 🔒 **security-team** - Security & compliance
- 📊 **data-team** - Data engineering

#### Example Users
- Ali Yılmaz (Platform Engineer)
- Ayşe Demir (Backend Developer)
- Mehmet Kaya (Frontend Developer)
- Zeynep Arslan (Security Engineer)
- Can Öztürk (Tech Lead)

## 🏗️ Catalog Hiyerarşisi

```
Domain (İş Alanı)
  └── System (Ana Sistem)
      ├── Component (Uygulama/Servis)
      │   ├── provides API
      │   ├── consumes API
      │   └── depends on Resource
      └── Resource (Altyapı Kaynağı)

Group (Takım)
  └── User (Kullanıcı)
      └── owns Component/System
```

## 🎯 Backstage'de Görünüm

### Catalog Ana Sayfa

Backstage UI'da göreceğiniz yapı:

```
📁 Domains (5)
   ├── Platform
   ├── Infrastructure
   ├── Applications
   ├── Security
   └── Data

📁 Systems (9)
   ├── Azure DevOps CI/CD
   ├── Artifact Management
   ├── Kubernetes Infrastructure
   └── ...

📁 Components (9)
   ├── Backstage IDP
   ├── User Service
   ├── Order Service
   └── ...

📁 Resources (16)
   ├── Dev Cluster
   ├── Test Cluster
   ├── Prod Cluster
   ├── Harbor Registry
   └── ...

📁 APIs (8)
   ├── User API
   ├── Order API
   └── ...

👥 Groups (8)
   ├── Platform Team
   ├── Development Team
   └── ...
```

## 🚀 Nasıl Kullanılır?

### 1. Backstage'i Başlatın

```bash
cd backstage-demo
yarn install
yarn dev
```

Backstage UI: **http://localhost:3000**

### 2. Catalog'u İnceleyin

1. Sol menüden **"Catalog"** seçin
2. Filtreleri kullanın:
   - **Kind**: Domain, System, Component, Resource, API
   - **Type**: service, website, library
   - **Lifecycle**: experimental, production
   - **Tags**: kubernetes, java, nodejs, etc.

### 3. Bağımlılıkları Görüntüleyin

Her component sayfasında:
- **Relations** sekmesi: Bağımlılıklar
- **API** sekmesi: Sağlanan/kullanılan API'ler
- **Dependencies** grafiği: Görsel bağımlılık haritası

### 4. Arama Yapın

Üst çubuktaki arama ile:
- Component adı
- Owner takım
- Tag'ler
- Teknoloji stack

## 📊 Örnek Kullanım Senaryoları

### Senaryo 1: Yeni Microservice Oluşturma

1. Template'den yeni service oluştur
2. Otomatik olarak:
   - System'e bağlanır
   - Resource'lara depends eder
   - API'leri provide/consume eder
   - Team ownership atar

### Senaryo 2: Bağımlılık Analizi

```bash
# User Service bağımlılıkları:
User Service
  ├── consumes: auth-api
  ├── provides: user-api
  ├── depends on:
  │   ├── postgresql-shared
  │   └── redis-cache-cluster
  ├── deployed to:
  │   ├── kubernetes-dev-cluster
  │   ├── kubernetes-test-cluster
  │   └── kubernetes-prod-cluster
  └── owned by: backend-team
```

### Senaryo 3: Cluster Resource Görünümü

Dev Cluster sayfasında:
- Cluster özellikleri
- Deploy edilmiş component'ler
- Resource kullanımı
- Bağlı ArgoCD uygulamaları

## 🔍 Catalog Graph (Görsel Harita)

Backstage'in "Catalog Graph" plugin'i ile:

```
                    Platform Domain
                          |
        +----------------+----------------+
        |                |                |
   Azure DevOps    Kubernetes Infra   GitOps
        |                |                |
   +----+----+      +----+----+      +----+----+
   |         |      |         |      |         |
Dev Pipeline  Prod   Dev      Test    ArgoCD   ArgoCD
              Pipeline Cluster Cluster  Dev     Prod
                     |         |
                +----+----+----+----+
                |         |         |
           User Service  Order   Payment
                         Service  Service
```

## 📈 Metrics & Monitoring

Her component için:

```yaml
annotations:
  backstage.io/kubernetes-id: user-service
  backstage.io/kubernetes-namespace: users
  prometheus.io/scrape: 'true'
  harbor.io/repository: user-service
  argocd/app-name: user-service
```

Bu annotation'lar sayesinde:
- Kubernetes pod'ları görüntülenir
- Prometheus metrics'leri çekilir
- Harbor image'ları listelenir
- ArgoCD sync durumu gösterilir

## 🎨 Özelleştirme

### Yeni System Eklemek

```yaml
apiVersion: backstage.io/v1alpha1
kind: System
metadata:
  name: my-new-system
  title: My New System
spec:
  owner: my-team
  domain: applications
```

### Yeni Resource Eklemek

```yaml
apiVersion: backstage.io/v1alpha1
kind: Resource
metadata:
  name: my-database
  title: My Database
spec:
  type: database
  owner: platform-team
  system: microservices-platform
```

### Yeni API Eklemek

```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: my-api
spec:
  type: openapi
  owner: backend-team
  system: microservices-platform
  definition: |
    openapi: 3.0.0
    ...
```

## 🔗 İlişkiler (Relations)

Backstage otomatik olarak şu ilişkileri oluşturur:

- **ownerOf**: Team → Component
- **ownedBy**: Component → Team
- **partOf**: Component → System
- **hasPart**: System → Component
- **dependsOn**: Component → Resource
- **dependencyOf**: Resource → Component
- **providesApi**: Component → API
- **consumesApi**: Component → API
- **apiProvidedBy**: API → Component
- **apiConsumedBy**: API → Component

## 💡 Best Practices

1. **Naming Convention**: kebab-case kullanın
2. **Tags**: Teknoloji stack'i tag'leyin
3. **Links**: Önemli URL'leri ekleyin
4. **Annotations**: Entegrasyonlar için annotation kullanın
5. **Ownership**: Her entity'e owner atayın
6. **Dependencies**: Bağımlılıkları açıkça tanımlayın
7. **Documentation**: README ve techdocs ekleyin

## 📚 Referanslar

- [Backstage Catalog Model](https://backstage.io/docs/features/software-catalog/descriptor-format)
- [System Model](https://backstage.io/docs/features/software-catalog/system-model)
- [Well-known Annotations](https://backstage.io/docs/features/software-catalog/well-known-annotations)

## 🎉 Sonuç

Artık mimarinize uygun **tam organizasyonel catalog yapınız** hazır!

- ✅ 5 Domain
- ✅ 9 System
- ✅ 16 Resource (3 K8s cluster dahil)
- ✅ 9 Component
- ✅ 8 API
- ✅ 8 Team
- ✅ 5 User örneği
- ✅ 1 Enterprise Microservice Template

Backstage'i başlatın ve catalog'u keşfedin! 🚀
