# 🚀 Sonraki Adımlar - Backstage Kurulum Rehberi

## ✅ Tamamlananlar

- ✅ Azure DevOps Microservice Template
- ✅ System & Component Catalog yapısı
- ✅ Kubernetes Cluster Resource tanımları
- ✅ API tanımları
- ✅ Team & User yapısı
- ✅ Domain organizasyonu

## 📋 Yapılması Gerekenler (Öncelik Sırasına Göre)

### 🔴 Yüksek Öncelik (Hemen Yapılmalı)

#### 1. **Kubernetes Plugin Yapılandırması**

Backstage'in Kubernetes cluster'larınızı görmesi için:

**app-config.yaml'a ekleyin:**

```yaml
kubernetes:
  serviceLocatorMethod:
    type: 'multiTenant'
  clusterLocatorMethods:
    - type: 'config'
      clusters:
        - url: https://api.dev-cluster.company.com
          name: dev-cluster
          authProvider: 'serviceAccount'
          serviceAccountToken: ${DEV_CLUSTER_TOKEN}
          skipTLSVerify: false
          skipMetricsLookup: false
        - url: https://api.test-cluster.company.com
          name: test-cluster
          authProvider: 'serviceAccount'
          serviceAccountToken: ${TEST_CLUSTER_TOKEN}
        - url: https://api.prod-cluster.company.com
          name: prod-cluster
          authProvider: 'serviceAccount'
          serviceAccountToken: ${PROD_CLUSTER_TOKEN}
          skipTLSVerify: false
```

**Kubernetes Service Account oluşturun:**

```bash
# Her cluster'da çalıştırın
kubectl create namespace backstage
kubectl create serviceaccount backstage -n backstage
kubectl create clusterrolebinding backstage-read-only \
  --clusterrole=view \
  --serviceaccount=backstage:backstage
kubectl get secret $(kubectl get sa backstage -n backstage -o jsonpath='{.secrets[0].name}') \
  -n backstage -o jsonpath='{.data.token}' | base64 -d
```

#### 2. **Azure DevOps Scaffolder Actions**

Template'in Azure DevOps'a repo oluşturması için:

**Backend'e Azure DevOps scaffolder action ekleyin:**

```bash
cd backstage-demo
yarn workspace backend add @backstage/plugin-scaffolder-backend-module-azure
```

**app-config.yaml'a ekleyin:**

```yaml
integrations:
  azure:
    - host: dev.azure.com
      token: ${AZURE_DEVOPS_TOKEN}
      # veya
      # credentials:
      #   clientId: ${AZURE_CLIENT_ID}
      #   clientSecret: ${AZURE_CLIENT_SECRET}
      #   tenantId: ${AZURE_TENANT_ID}
```

**Backend index.ts'e ekleyin:**

```typescript
backend.add(import('@backstage/plugin-scaffolder-backend-module-azure'));
```

#### 3. **Environment Variables (.env)**

`.env` dosyası oluşturun:

```bash
# GitHub (mevcut)
GITHUB_TOKEN=your_github_token

# Azure DevOps
AZURE_DEVOPS_TOKEN=your_azure_devops_pat
AZURE_DEVOPS_ORG=your-org
AZURE_DEVOPS_PROJECT=your-project

# Kubernetes Tokens
DEV_CLUSTER_TOKEN=your_dev_cluster_token
TEST_CLUSTER_TOKEN=your_test_cluster_token
PROD_CLUSTER_TOKEN=your_prod_cluster_token

# Harbor Registry
HARBOR_USERNAME=your_harbor_username
HARBOR_PASSWORD=your_harbor_password

# SonarQube (opsiyonel)
SONARQUBE_TOKEN=your_sonarqube_token

# ArgoCD (opsiyonel)
ARGOCD_TOKEN=your_argocd_token
ARGOCD_SERVER=argocd.company.com
```

### 🟡 Orta Öncelik (Yakında Yapılmalı)

#### 4. **TechDocs Yapılandırması**

**Production için TechDocs:**

```yaml
techdocs:
  builder: 'external' # CI/CD'de build edilecek
  generator:
    runIn: 'docker'
  publisher:
    type: 'awsS3' # veya 'googleGcs'
    awsS3:
      bucketName: backstage-techdocs
      region: us-east-1
      s3ForcePathStyle: false
      credentials:
        accessKeyId: ${AWS_ACCESS_KEY_ID}
        secretAccessKey: ${AWS_SECRET_ACCESS_KEY}
```

**Template'e TechDocs ekleyin:**

Her microservice için `docs/` klasörü ve `mkdocs.yml` ekleyin.

#### 5. **ArgoCD Plugin (Opsiyonel)**

ArgoCD uygulamalarını görmek için:

```bash
yarn workspace backend add @roadiehq/backstage-plugin-argocd-backend
```

#### 6. **Harbor Integration**

Container image'ları görmek için:

```bash
yarn workspace backend add @immobiliarelabs/backstage-plugin-harbor
```

#### 7. **SonarQube Integration**

Code quality metriklerini görmek için:

```bash
yarn workspace backend add @backstage/plugin-sonarqube-backend
```

### 🟢 Düşük Öncelik (İyileştirmeler)

#### 8. **Cost Insights Plugin**

Maliyet takibi için:

```bash
yarn workspace backend add @backstage/plugin-cost-insights
```

#### 9. **GitHub Actions Template**

Azure DevOps'a alternatif:

```bash
# GitHub Actions için ayrı template oluşturun
examples/templates/microservice-github-actions/
```

#### 10. **Monitoring Dashboards**

Grafana dashboard linklerini otomatikleştirin.

## 🛠️ Hemen Yapılacaklar Checklist

### Backend Yapılandırması

- [ ] Kubernetes plugin yapılandırması
- [ ] Azure DevOps scaffolder action ekleme
- [ ] Environment variables (.env) oluşturma
- [ ] Service account token'ları alma

### Template İyileştirmeleri

- [ ] Azure DevOps action'larını template'e ekleme
- [ ] Harbor action ekleme (opsiyonel)
- [ ] TechDocs template ekleme
- [ ] Test dosyaları ekleme

### Catalog İyileştirmeleri

- [ ] Gerçek cluster URL'lerini güncelleme
- [ ] Gerçek team email'lerini güncelleme
- [ ] Gerçek API endpoint'lerini ekleme
- [ ] Production component'leri ekleme

## 📚 Dokümantasyon

### Oluşturulacak Dokümanlar

1. **SETUP-GUIDE.md** - İlk kurulum rehberi
2. **KUBERNETES-SETUP.md** - K8s plugin kurulumu
3. **AZURE-DEVOPS-SETUP.md** - Azure DevOps entegrasyonu
4. **PRODUCTION-DEPLOYMENT.md** - Production deployment
5. **TROUBLESHOOTING.md** - Sorun giderme

## 🔧 Hızlı Başlangıç

### 1. Kubernetes Plugin'i Aktifleştir

```bash
# app-config.yaml'ı düzenle
# Kubernetes cluster bilgilerini ekle
# Service account token'ları al
```

### 2. Azure DevOps Entegrasyonu

```bash
# Azure DevOps PAT oluştur
# app-config.yaml'a ekle
# Backend'e plugin ekle
yarn workspace backend add @backstage/plugin-scaffolder-backend-module-azure
```

### 3. Test Et

```bash
cd backstage-demo
yarn dev

# Backstage UI'da:
# 1. Catalog'u kontrol et
# 2. Kubernetes tab'ını test et
# 3. Template'i kullan
```

## 🎯 Öncelik Matrisi

| Özellik | Öncelik | Süre | Etki |
|---------|---------|------|------|
| Kubernetes Plugin | 🔴 Yüksek | 2 saat | ⭐⭐⭐⭐⭐ |
| Azure DevOps Actions | 🔴 Yüksek | 3 saat | ⭐⭐⭐⭐⭐ |
| TechDocs | 🟡 Orta | 4 saat | ⭐⭐⭐⭐ |
| ArgoCD Plugin | 🟡 Orta | 2 saat | ⭐⭐⭐ |
| Harbor Integration | 🟢 Düşük | 2 saat | ⭐⭐⭐ |
| Cost Insights | 🟢 Düşük | 4 saat | ⭐⭐ |

## 💡 İpuçları

1. **Önce Kubernetes Plugin'i yapın** - En çok değer katacak
2. **Azure DevOps entegrasyonu kritik** - Template'in çalışması için gerekli
3. **TechDocs'i sonra ekleyin** - İlk önce temel özellikler
4. **Production'a geçmeden önce test edin** - Local'de her şeyi doğrulayın

## 🆘 Yardım

Sorun yaşarsanız:
1. Backstage dokümantasyonuna bakın
2. Plugin'in GitHub repo'sunu kontrol edin
3. Backstage Discord community'ye sorun

---

**Sonraki adım:** Kubernetes plugin yapılandırması ile başlayın! 🚀
