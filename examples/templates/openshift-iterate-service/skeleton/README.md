# ${{ values.name }}

${{ values.description }}

## Gereksinimler

- Node.js 18+
- OpenShift Iterate cluster erişimi (CI için)

## Geliştirme

```bash
npm install
npm start
```

- `http://localhost:8080/` — Ana sayfa
- `http://localhost:8080/health` — Liveness
- `http://localhost:8080/ready` — Readiness

## OpenShift Iterate Deploy

`main` branch’e push tetikler:

1. Docker image build
2. Push to **GitLab Container Registry** (`$CI_REGISTRY_IMAGE`)
3. `oc apply` ile OpenShift Iterate’e deploy (namespace: `${{ values.namespace }}`)

### GitLab CI/CD değişkenleri (zorunlu)

Project/Group: **Settings > CI/CD > Variables** (masked işaretleyin):

| Değişken | Açıklama |
|----------|----------|
| `OPENSHIFT_ITERATE_URL` | OpenShift API URL (örn. `https://api.iterate.openshift.example.com:6443`) |
| `OPENSHIFT_ITERATE_TOKEN` | ServiceAccount veya kullanıcı token |

## Manifestler

- `openshift/namespace.yaml` — Namespace
- `openshift/deployment.yaml` — Deployment
- `openshift/service.yaml` — Service
- `openshift/route.yaml` — OpenShift Route (harici URL)
