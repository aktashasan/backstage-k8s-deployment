# k8s-orchestration Microservices

Bu dokümantasyon, k8s-orchestration projesindeki yönetim mikroservislerini açıklar.

## Mikroservisler

### Infrastructure Management
- **[CAS Kubernetes Management](cas-k8s-mgmt.md)** - CAS (Container as a Service) Kubernetes cluster management
- **[Cluster Management](cluster-mgmt.md)** - Kubernetes cluster management via Helm charts
- **[vSphere Management](vsphere-mgmt.md)** - vSphere infrastructure management

### Cloud & Storage Management
- **[Cloud Account Management](cloud-account-mgmt.md)** - Cloud account management (AWS, Azure, GCP)
- **[MinIO Management](minio-mgmt.md)** - MinIO object storage management

### Database Management
- **[MongoDB Management](mongodb-mgmt.md)** - MongoDB database management
- **[PostgreSQL Management](postgresql-mgmt.md)** - PostgreSQL database management
- **[MySQL Management](mysql-mgmt.md)** - MySQL database management

## Genel Özellikler

Tüm mikroservisler:
- **NestJS** framework kullanır (Go ile yazılmış cluster-mgmt hariç)
- **GraphQL** API sağlar
- **Kubernetes** üzerinde çalışır
- **PostgreSQL** veya **MongoDB** kullanır
- **Prometheus** metrics sağlar

## Teknoloji Stack

- **Backend**: Node.js (NestJS), Go
- **Database**: PostgreSQL, MongoDB
- **Message Queue**: RabbitMQ
- **Container Registry**: Harbor
- **Orchestration**: Kubernetes
- **GitOps**: ArgoCD
