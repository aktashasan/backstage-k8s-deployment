# k8s-orchestration Microservices - Backstage Catalog

Bu klasör, `k8s-orchestration` projesindeki `*-mgmt` mikroservislerinin Backstage catalog tanımlarını içerir.

## 📁 Dosyalar

Tüm mikroservislerin `catalog-info.yaml` dosyaları burada toplanmıştır:

- `cas-k8s-mgmt.yaml` - CAS Kubernetes Management
- `cloud-account-mgmt.yaml` - Cloud Account Management  
- `vsphere-mgmt.yaml` - vSphere Management
- `mongodb-mgmt.yaml` - MongoDB Management
- `minio-mgmt.yaml` - MinIO Management
- `postgresql-mgmt.yaml` - PostgreSQL Management
- `mysql-mgmt.yaml` - MySQL Management
- `cluster-mgmt.yaml` - Cluster Management (Go)

## 🔄 Neden Burada?

Bu dosyalar **Backstage projesinde** toplanmıştır çünkü:

1. ✅ **k8s-orchestration projesi temiz kalır** - Backstage'e özel dosyalar ayrı tutulur
2. ✅ **Merkezi yönetim** - Tüm catalog tanımları tek yerde
3. ✅ **Kolay güncelleme** - Backstage tarafında değişiklik yapmak daha kolay

## 📝 Güncelleme

Bir mikroservis güncellendiğinde:

1. Bu klasördeki ilgili `.yaml` dosyasını güncelleyin
2. Backstage'i yeniden başlatın: `yarn dev`

## 🔗 Yapılandırma

`app-config.yaml` dosyasında bu dosyalara referans verilmiştir:

```yaml
catalog:
  locations:
    - type: file
      target: ../../examples/k8s-orchestration/cas-k8s-mgmt.yaml
    # ... diğer mikroservisler
```

---

**Not:** Eğer ileride her mikroservisin kendi `catalog-info.yaml` dosyasını yönetmesini isterseniz, bu dosyaları tekrar `k8s-orchestration` klasörüne taşıyabilirsiniz.
