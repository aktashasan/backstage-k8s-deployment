# Cluster Management

Kubernetes cluster management mikroservisi (Go).

## Açıklama

Kubernetes cluster'larını Helm chart'ları üzerinden eklemek, silmek ve yönetmek için kullanılan mikroservis.

## Teknoloji

- **Language**: Go
- **API**: REST
- **Database**: PostgreSQL

## Özellikler

- Cluster ekleme/silme
- Helm chart yönetimi
- Cluster bağlantı testi
- Git entegrasyonu
- ArgoCD entegrasyonu

## API Endpoints

- `POST /cluster/add` - Yeni cluster ekle
- `POST /cluster/delete` - Cluster sil
- `POST /cluster/test` - Cluster bağlantısını test et
- `GET /clusters` - Tüm cluster'ları listele
- `GET /health` - Health check

## Bağlantılar

- **Source Code**: [GitHub](https://YOUR_GITHUB_ORG/k8s-orchestration/tree/main/cmd/cluster-mgmt)
- **Kubernetes Namespace**: `crystal`
- **Port**: 8080
