# OpenShift Iterate Service Template – Kullanım (GitLab)

Bu şablon ile:

1. **GitLab’da yeni bir project** oluşturulur.
2. **Minimal Node.js servisi** (Express, `/health`, `/ready`) iskeleti kopyalanır.
3. **OpenShift manifest’leri** (`openshift/`: Namespace, Deployment, Service, Route) eklenir.
4. **GitLab CI/CD** (`.gitlab-ci.yml`) ile `main`’e her push’ta: image build → GitLab Container Registry push → OpenShift Iterate’e `oc apply`.
5. **Catalog’a** otomatik kayıt yapılır.

## Parametreler

| Parametre   | Zorunlu | Açıklama |
|------------|---------|----------|
| **name**   | Evet    | Servis adı (kebab-case). Aynı isim Deployment, Service, Route ve catalog’da kullanılır. |
| **namespace** | Hayır | OpenShift Iterate namespace (varsayılan: `iterate-dev`). |
| **repoUrl**| Evet    | GitLab RepoUrlPicker ile seçilen hedef project (yeni oluşturulacak). |
| **description** | Hayır | Servis açıklaması. |

## Ön Koşullar

- **Backstage**: `integrations.gitlab` ve `GITLAB_TOKEN` (Create project + API için) yapılandırılmış olmalı.
- **OpenShift Iterate**: `app-config`’te `kubernetes.clusterLocatorMethods.clusters` altında `iterate` tanımlı olmalı.
- **Oluşan GitLab project’te** CI/CD Variables (Settings > CI/CD > Variables, masked):
  - `OPENSHIFT_ITERATE_URL` — OpenShift API (örn. `https://api.iterate.openshift.example.com:6443`)
  - `OPENSHIFT_ITERATE_TOKEN` — ServiceAccount veya kullanıcı token’ı

## Akış

```
[Create → OpenShift Iterate Service] → [name, namespace, repoUrl gir] → [Create]
    → fetch:template (skeleton)
    → publish:gitlab (yeni project)
    → catalog:register
    → [main’e ilk push] → GitLab CI: build → push Registry → oc apply
```

## Skeleton İçeriği

- `src/index.js` — Express; `/`, `/health`, `/ready`
- `Dockerfile` — Node 20 Alpine, non-root
- `openshift/namespace.yaml`, `deployment.yaml`, `service.yaml`, `route.yaml`
- `.gitlab-ci.yml` — Build (Docker + GitLab Registry) + Deploy (oc apply)
- `catalog-info.yaml` — `backstage.io/kubernetes-id`, `backstage.io/kubernetes-namespace`

## Notlar

- **Image**: Deployment’ta `IMAGE_PLACEHOLDER` vardır; CI bunu `$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA` ile değiştirir.
- **Namespace**: `openshift/namespace.yaml` ile yoksa oluşturulur.
- **Self-hosted GitLab**: `app-config`’te `integrations.gitlab` altına `host` ve `apiBaseUrl` ekleyin; RepoUrlPicker’da `allowedHosts`’a bu host’u ekleyin (template’i fork edip değiştirebilirsiniz).
