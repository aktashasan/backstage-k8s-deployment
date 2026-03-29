# 🛠️ Tiltfile Yapılandırma Rehberi

Template'de oluşturulan Tiltfile'ın nasıl kullanılacağı ve yapılandırılacağı.

## 📋 Tiltfile Nedir?

Tiltfile, Tilt aracı için yapılandırma dosyasıdır. Tilt, local Kubernetes development için kullanılan bir araçtır. Kod değişikliklerini otomatik olarak build eder ve Kubernetes cluster'a deploy eder.

## ✅ Template'de Oluşturulan Tiltfile

Template'den microservice oluşturduğunuzda, projenin root dizininde bir `Tiltfile` oluşturulur. Bu dosya:

- ✅ Multi-language desteği (Java, Node.js, .NET, Python, Go)
- ✅ Hot reload desteği
- ✅ Database auto-provisioning (PostgreSQL, MongoDB, Redis)
- ✅ Kubernetes deployment
- ✅ Port forwarding
- ✅ Log viewing

## 🚀 Kullanım

### 1. Tilt'i Kurun

```bash
# macOS
brew install tilt-dev/tap/tilt

# Linux
curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash

# Windows
choco install tilt
```

### 2. Kubernetes Context'i Ayarlayın

```bash
# Dev cluster'a bağlan
kubectl config use-context dev-cluster

# Context'i kontrol et
kubectl config current-context
```

### 3. Tilt'i Başlatın

```bash
cd your-microservice
tilt up
```

Tilt otomatik olarak:
- Tarayıcıda Tilt UI'ı açar (http://localhost:10350)
- Kodu build eder
- Container image'ı oluşturur
- Kubernetes'e deploy eder
- Port forward yapar

### 4. Tilt UI'da İzleyin

Tilt UI'da göreceğiniz:
- **Resources**: Tüm servisler ve durumları
- **Logs**: Real-time log'lar
- **Build Status**: Build durumları
- **Deploy Status**: Deployment durumları

## ⚙️ Yapılandırma

### Namespace Ayarlama

```bash
# Tiltfile'da namespace'i değiştirin veya
tilt up -- --namespace=my-custom-namespace
```

### Cluster Seçimi

Tiltfile'da `allow_k8s_contexts` ile hangi cluster'ların kullanılabileceğini belirleyin:

```python
# Sadece dev cluster
allow_k8s_contexts('dev-cluster')

# Birden fazla cluster
allow_k8s_contexts('dev-cluster', 'local-cluster')
```

### Database Yapılandırması

Tiltfile otomatik olarak database'i ayağa kaldırır. Database tipini değiştirmek için:

```python
# PostgreSQL için
helm_remote(
  'postgresql',
  repo_name='bitnami',
  # ...
)

# MongoDB için
helm_remote(
  'mongodb',
  repo_name='bitnami',
  # ...
)
```

## 🔧 Özelleştirme

### Custom Build Commands

```python
# Java için custom build
local_resource(
  'my-service-compile',
  'mvn clean compile -DskipTests',
  deps=['src', 'pom.xml'],
  ignore=['src/test']
)
```

### Custom Environment Variables

```python
# Tiltfile'da env vars ekleyin
k8s_resource(
  'my-service',
  env_vars={
    'LOG_LEVEL': 'DEBUG',
    'DATABASE_URL': 'postgresql://localhost:5432/mydb'
  }
)
```

### Custom Port Forwarding

```python
k8s_resource(
  'my-service',
  port_forwards='8080:8080,5432:5432'  # service:local
)
```

## 📊 Tiltfile Yapısı (Template'den)

Template'den oluşturulan Tiltfile şu yapıya sahiptir:

```python
# 1. Extensions
load('ext://restart_process', 'docker_build_with_restart')
load('ext://helm_remote', 'helm_remote')

# 2. Configuration
config.define_string('namespace', ...)
default_registry('harbor.company.com/...')

# 3. Language-specific build
# Java, Node.js, Python, Go, .NET için özel build

# 4. Docker build
docker_build(...)

# 5. Kubernetes resources
k8s_yaml(kustomize('./k8s/overlays/dev'))
k8s_resource(...)

# 6. Database (if selected)
helm_remote('postgresql', ...)

# 7. Helpers
local_resource('logs', ...)
local_resource('test', ...)
```

## 🧪 Test Etme

### Health Check

```bash
# Service'in sağlığını kontrol et
curl http://localhost:8080/health

# Tilt UI'da logs'a bak
# Resources → your-service → Logs
```

### Hot Reload Testi

1. Kodunuzu değiştirin
2. Tilt otomatik olarak:
   - Değişikliği algılar
   - Rebuild eder
   - Redeploy eder
3. Tilt UI'da build durumunu izleyin

## 🐛 Troubleshooting

### Tilt başlamıyor

```bash
# Kubernetes context'i kontrol et
kubectl config current-context

# Tilt version kontrol et
tilt version

# Tilt loglarına bak
tilt logs
```

### Build başarısız

```bash
# Tilt UI'da build loglarına bak
# Resources → build-job → Logs

# Manuel build dene
docker build -t my-service .
```

### Deployment başarısız

```bash
# Kubernetes pod'larını kontrol et
kubectl get pods -n your-namespace

# Pod loglarına bak
kubectl logs -f deployment/your-service -n your-namespace

# Events'e bak
kubectl get events -n your-namespace
```

### Port forward çalışmıyor

```bash
# Port'un kullanımda olup olmadığını kontrol et
lsof -i :8080

# Farklı port kullan
tilt up -- --port=8081
```

## 📚 Tiltfile Komutları

### Tilt Komutları

```bash
# Tilt'i başlat
tilt up

# Tilt'i durdur
tilt down

# Tilt'i restart et
tilt down && tilt up

# CI mode (headless)
tilt ci

# Logları göster
tilt logs

# Version kontrol
tilt version
```

### Tiltfile İçinde Kullanılan Fonksiyonlar

- `local_resource()`: Local command çalıştırma
- `docker_build()`: Docker image build
- `k8s_yaml()`: Kubernetes manifest'leri yükleme
- `k8s_resource()`: Kubernetes resource yönetimi
- `helm_remote()`: Helm chart yükleme
- `port_forward()`: Port forwarding

## 🎯 Best Practices

1. **Namespace Kullanın**: Her developer için ayrı namespace
2. **Resource Limits**: Tiltfile'da resource limit'leri belirleyin
3. **Hot Reload**: Sadece gerekli dosyaları watch edin
4. **Database**: Development için in-memory veya local database kullanın
5. **Logs**: Tilt UI'da log'ları takip edin

## 🔗 Referanslar

- [Tilt Documentation](https://docs.tilt.dev/)
- [Tiltfile API Reference](https://docs.tilt.dev/api.html)
- [Tilt Examples](https://github.com/tilt-dev/tilt-examples)

## ✅ Checklist

- [ ] Tilt kuruldu
- [ ] Kubernetes context ayarlandı
- [ ] Tiltfile oluşturuldu (template'den)
- [ ] `tilt up` çalıştı
- [ ] Service deploy edildi
- [ ] Port forward çalışıyor
- [ ] Hot reload test edildi
- [ ] Database (varsa) çalışıyor

---

**Başarılı kurulumdan sonra:** Local development ortamınız hazır! 🎉
