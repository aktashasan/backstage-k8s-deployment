# Backstage on Kubernetes — Production-Grade Internal Developer Portal

> A self-hosted, production-ready [Backstage](https://backstage.io) deployment on Kubernetes (bare-metal + Azure AKS) with Kubernetes cluster visibility, service catalog, and software templates — built and maintained by a CKA-certified DevOps Engineer.

[![Backstage](https://img.shields.io/badge/Backstage-1.x-9BF0E1?logo=backstage)](https://backstage.io)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-1.29+-326CE5?logo=kubernetes)](https://kubernetes.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of Contents

- [Why Backstage?](#why-backstage)
- [Architecture](#architecture)
- [Features](#features)
- [Customizations](#customizations)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Installation](#detailed-installation)
- [Configuration](#configuration)
- [Kubernetes Plugin Setup](#kubernetes-plugin-setup)
- [Catalog & Service Registration](#catalog--service-registration)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)

---

## Why Backstage?

In a multi-cluster, multi-team environment, context-switching and knowledge fragmentation become real productivity killers. Engineers waste time hunting down: *"Which team owns this service? Where is it deployed? What version is running in prod right now?"*

Backstage solves this by acting as a **single pane of glass** for the entire software ecosystem. Here's what convinced me:

| Problem | Backstage Solution |
|---|---|
| Scattered docs across wikis, Confluence, GitHub | **TechDocs** — docs-as-code, rendered in the portal |
| No visibility into running Kubernetes workloads | **Kubernetes Plugin** — live pod status, logs, events per service |
| New service setup takes 2-3 days | **Software Templates** — scaffold a production-ready microservice in minutes |
| "Who owns this?" is a Slack hunt | **Service Catalog** — every component has an owner, lifecycle, and links |
| Onboarding a new engineer takes a week | One portal, everything discoverable |

I chose to self-host rather than use a SaaS alternative because:
- **Full control** over plugins, auth providers, and data residency
- **Deep Kubernetes integration** — service account tokens, multi-cluster support
- **Cost** — no per-seat pricing for a growing team
- **Customization** — custom scaffolder actions (Harbor registry, Azure DevOps pipelines)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│                  (Namespace: backstage)                      │
│                                                             │
│   ┌──────────────┐      ┌──────────────┐                   │
│   │  Frontend    │      │   Backend    │                    │
│   │  (React App) │◄────►│  (Node.js)  │                    │
│   │  Port: 8080  │      │  Port: 7007  │                    │
│   └──────────────┘      └──────┬───────┘                   │
│                                │                            │
│   ┌──────────────┐      ┌──────▼───────┐                   │
│   │    Ingress   │      │  PostgreSQL  │                    │
│   │  (nginx)     │      │  (StatefulSet│                    │
│   └──────────────┘      └──────────────┘                   │
└─────────────────────────────────────────────────────────────┘
         │
         │ Multi-cluster visibility
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│  Dev Cluster    │    │  Test Cluster   │    │  Prod Cluster    │
│  (Azure AKS)   │    │  (Bare-metal)   │    │  (Bare-metal)    │
└─────────────────┘    └─────────────────┘    └──────────────────┘
```

**Key components:**

- **Frontend** — Backstage React SPA, served as a static bundle inside the backend container (or as a separate deployment)
- **Backend** — Node.js service exposing REST/GraphQL APIs, plugin host, catalog engine
- **PostgreSQL** — Persistent store for catalog entities, scaffolder tasks, TechDocs metadata
- **NGINX Ingress** — TLS termination, routing `/api` to backend, `/` to frontend
- **Kubernetes RBAC** — Dedicated `ServiceAccount` per cluster with minimal required permissions

---

## Features

- **Multi-cluster Kubernetes visibility** — live workload status across dev, test, and prod clusters
- **Software Catalog** — 17+ microservices registered with ownership, lifecycle, and API links
- **Software Templates** — scaffold microservices with Azure DevOps pipeline, Harbor registry project, and Git repo in one flow
- **TechDocs** — rendered Markdown documentation per service
- **ArgoCD integration** — custom resources surfaced in the entity view
- **Harbor Registry plugin** — container image metadata per service
- **RBAC** — permission framework enabled, guest and GitHub OAuth providers
- **GitOps-ready** — all manifests compatible with ArgoCD / Flux

---

## Customizations

This is not a vanilla Backstage install. Below is a breakdown of everything that was added or changed on top of the default scaffold.

### Frontend

| Area | What changed |
|---|---|
| **Home page** | Replaced the default catalog redirect with a custom `HomePage.tsx` featuring a search bar and quick-access cards |
| **Sidebar** | Custom `Root.tsx` — reorganized navigation groups (Home, Catalog, APIs, Docs, Create), added Notifications section, custom SVG logo with `#7df3e1` accent |
| **Entity page** | `EntityPage.tsx` extended with a **Kubernetes tab** — shows live pod status, restart counts, resource usage, and events per component |
| **Search page** | Custom `SearchPage.tsx` with type filters (catalog, TechDocs) and result grouping |
| **TechDocs** | `ReportIssue` addon enabled — readers can open a GitHub issue directly from any documentation page |
| **Notifications** | `SignalsDisplay` + `NotificationsPage` wired into the app shell for real-time backend events |
| **Sign-in** | Auto sign-in with guest provider (`auto` mode) — no login prompt for internal use |

**Added frontend plugins (not in default install):**

| Plugin | Purpose |
|---|---|
| `@backstage/plugin-kubernetes` | Live Kubernetes workload view per entity |
| `@backstage/plugin-catalog-graph` | Interactive service dependency graph |
| `@backstage/plugin-notifications` | In-portal notification feed |
| `@backstage/plugin-signals` | WebSocket-based real-time updates |
| `@backstage/plugin-techdocs-module-addons-contrib` | `ReportIssue` addon for TechDocs |
| `@backstage/plugin-permission-react` | `RequirePermission` guard on catalog import route |

---

### Backend

| Area | What changed |
|---|---|
| **Custom scaffolder module** | `harbor:create-project` and `harbor:create-robot-account` actions — automatically provision a Harbor registry project and robot account as part of any software template |
| **Azure DevOps module** | Scaffolder wired to Azure DevOps for pipeline creation and repo scaffolding |
| **GitLab module** | Scaffolder support for GitLab-hosted repositories |
| **Notifications + Signals** | Real-time notification backend enabled alongside the frontend |
| **PostgreSQL search** | `plugin-search-backend-module-pg` — full-text search backed by PostgreSQL instead of the default in-memory index |
| **Kubernetes backend** | `plugin-kubernetes-backend` proxying API calls to multiple clusters via injected ServiceAccount tokens |
| **Permission framework** | `allow-all-policy` registered (framework enabled, policies ready to harden) |

**Custom scaffolder actions** (`packages/backend/src/plugins/scaffolder-custom/`):

```
harbor:create-project       — creates a new project in Harbor Registry via REST API
harbor:create-robot-account — creates a scoped robot account and returns the credentials
```

Both actions read `harbor.url`, `harbor.username`, and `harbor.password` from `app-config.yaml` and skip gracefully if config is absent.

---

### Software Templates

Four production-grade templates ship with this setup:

| Template | Description |
|---|---|
| `microservice-azure-devops` | Scaffolds a service repo + Azure DevOps CI pipeline + Harbor project |
| `regulated-microservice-azure-devops` | Same as above with compliance gates (SOC2/PCI annotations) |
| `microservice-gitops` | Helm chart + Dockerfile + Azure Pipelines, GitOps-ready |
| `openshift-iterate-service` | OpenShift manifests + GitLab CI pipeline for OpenShift Iterate |

---

## Prerequisites

| Tool | Version |
|---|---|
| `kubectl` | >= 1.26 |
| Kubernetes cluster | >= 1.26 |
| Helm | >= 3.12 |
| PostgreSQL | >= 14 |
| Node.js *(for local dev)* | 20 LTS |
| Docker / Podman | >= 24 |

You will also need:
- A GitHub Personal Access Token (catalog, scaffolder)
- An image registry (Docker Hub, Harbor, GHCR, etc.)
- An NGINX Ingress Controller in your cluster

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/aktashasan/backstage-k8s-portfolio.git
cd backstage-k8s-portfolio

# 2. Create namespace
kubectl apply -f deployments/kubernetes/namespace.yaml

# 3. Create secrets (edit the file first — replace all YOUR_X placeholders)
cp deployments/kubernetes/secret.example.yaml deployments/kubernetes/secret.yaml
# Edit secret.yaml with your values
kubectl apply -f deployments/kubernetes/secret.yaml

# 4. Deploy PostgreSQL (example using Bitnami Helm chart)
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install backstage-postgresql bitnami/postgresql \
  --namespace backstage \
  --set auth.username=backstage \
  --set auth.password=YOUR_POSTGRES_PASSWORD \
  --set auth.database=backstage_plugin_catalog

# 5. Apply Kubernetes manifests
kubectl apply -f deployments/kubernetes/

# 6. Check rollout
kubectl rollout status deployment/backstage-backend -n backstage
kubectl rollout status deployment/backstage-frontend -n backstage
```

---

## Detailed Installation

### 1. Build & Push the Container Image

```bash
# From the backstage app root (where package.json lives)
yarn install --frozen-lockfile
yarn tsc
yarn build:backend

docker build -t YOUR_REGISTRY/backstage:latest \
  -f packages/backend/Dockerfile .

docker push YOUR_REGISTRY/backstage:latest
```

### 2. Configure `app-config.yaml`

Copy the example config and fill in your values:

```bash
cp backstage/app-config.yaml backstage/app-config.local.yaml
# Edit backstage/app-config.local.yaml — do NOT commit this file
```

All sensitive values are injected via environment variables from the Kubernetes `Secret`. See [Configuration](#configuration) for the full list.

### 3. Set Up RBAC for Kubernetes Plugin

The Kubernetes plugin needs a `ServiceAccount` token per cluster. Apply the RBAC manifests on each target cluster:

```bash
# On each cluster you want to observe
kubectl apply -f deployments/kubernetes/rbac/
```

Then retrieve the token:

```bash
kubectl get secret backstage-sa-token -n backstage \
  -o jsonpath='{.data.token}' | base64 -d
```

Store the token in your Kubernetes `Secret` as `CLUSTER_NAME_TOKEN`.

### 4. Apply All Manifests

```bash
kubectl apply -f deployments/kubernetes/namespace.yaml
kubectl apply -f deployments/kubernetes/secret.yaml       # after filling in values
kubectl apply -f deployments/kubernetes/deployment.yaml
kubectl apply -f deployments/kubernetes/service.yaml
kubectl apply -f deployments/kubernetes/ingress.yaml
```

### 5. Verify

```bash
kubectl get pods -n backstage
kubectl get ingress -n backstage
kubectl logs -l app=backstage-backend -n backstage --tail=50
```

---

## Configuration

All configuration is driven by `backstage/app-config.yaml`. Sensitive values are injected as environment variables from the Kubernetes `Secret`:

| Environment Variable | Description |
|---|---|
| `GITHUB_TOKEN` | GitHub PAT for catalog and scaffolder |
| `AZURE_DEVOPS_TOKEN` | Azure DevOps PAT |
| `POSTGRES_HOST` | PostgreSQL hostname |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `DEV_CLUSTER_TOKEN` | ServiceAccount token for dev cluster |
| `TEST_CLUSTER_TOKEN` | ServiceAccount token for test cluster |
| `PROD_CLUSTER_TOKEN` | ServiceAccount token for prod cluster |
| `BACKEND_SECRET` | Shared secret for backend-to-plugin auth |

---

## Kubernetes Plugin Setup

The `@backstage/plugin-kubernetes` plugin is configured in `app-config.yaml` under the `kubernetes:` key. It uses `multiTenant` service locator and `config`-based cluster locator — meaning clusters are statically defined and tokens are injected at runtime.

Each component in the catalog is linked to its Kubernetes workloads via annotations:

```yaml
# In your catalog-info.yaml
annotations:
  backstage.io/kubernetes-id: your-service-name
  backstage.io/kubernetes-namespace: your-namespace
```

The plugin surfaces:
- Pod status (Running / Pending / CrashLoopBackOff)
- Container restart counts
- Live resource requests & limits
- Recent Kubernetes events
- Custom resources (e.g., ArgoCD `Application` CRDs)

---

## Catalog & Service Registration

Services register themselves by including a `catalog-info.yaml` file at the root of their repository. Backstage continuously polls these files via `url` locations.

Example registration:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: user-management
  description: Handles user lifecycle, roles, and group membership
  annotations:
    backstage.io/kubernetes-id: user-management
    backstage.io/techdocs-ref: dir:.
    github.com/project-slug: YOUR_GITHUB_ORG/user-management
spec:
  type: service
  lifecycle: production
  owner: platform-team
  system: core-platform
```

---

## Screenshots

> *Screenshots will be added once the public demo environment is available.*

| View | Preview |
|---|---|
| Service Catalog | ![catalog](docs/screenshots/catalog.png) |
| Kubernetes Workloads | ![k8s](docs/screenshots/kubernetes-plugin.png) |
| Software Templates | ![templates](docs/screenshots/templates.png) |
| TechDocs | ![techdocs](docs/screenshots/techdocs.png) |
| Component Overview | ![component](docs/screenshots/component-overview.png) |

---

## Project Structure

```
backstage-k8s-portfolio/
├── backstage/
│   └── app-config.yaml          # Main Backstage configuration (placeholders only)
├── deployments/
│   └── kubernetes/
│       ├── namespace.yaml        # backstage namespace
│       ├── deployment.yaml       # Backend + Frontend Deployments
│       ├── service.yaml          # ClusterIP Services
│       └── ingress.yaml          # NGINX Ingress with TLS
├── docs/
│   └── screenshots/             # UI screenshots (populated after demo deploy)
├── catalog-info.yaml            # This repo's own catalog registration
└── README.md
```

---

## Roadmap

- [ ] GitHub OAuth integration (replace guest auth)
- [ ] Azure Blob Storage for TechDocs (replace local publisher)
- [ ] Prometheus metrics surfaced in entity pages
- [ ] Scaffolder action for automatic Harbor robot account creation
- [ ] Helm chart for one-command deployment
- [ ] ArgoCD `Application` auto-sync via Backstage scaffolder

---

## About

Built by a **CKA-certified DevOps Engineer** with 3+ years of experience in Kubernetes, platform engineering, and developer tooling.

This project is part of my public portfolio demonstrating real-world, production-grade Kubernetes deployments. The configuration is sanitized — all credentials and endpoints use `YOUR_X` placeholder format.

---

*If you have questions or want to discuss the architecture, feel free to open an issue or reach out on [LinkedIn](https://linkedin.com/in/aktashasan).*
