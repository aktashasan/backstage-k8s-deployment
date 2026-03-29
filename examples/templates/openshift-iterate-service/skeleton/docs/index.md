# ${{ values.component_id | capitalize }} — Overview

Bu servis OpenShift Iterate demo’su için oluşturuldu. Aşağıyı kendi bilgilerinizle güncelleyin.

- **Owner:** ${{ values.owner }}
- **Namespace:** ${{ values.namespace }}
- **Image:** ${{ values.component_id }}:${{ values.imageTag or 'latest' }}

## Deploy
- OpenShift template: `openshift/deployment.yaml`, `service.yaml`, `route.yaml`
- Route host: güncel ortamda verilen hostname

## Sağlık
- Health endpoint: `/health` (uygun şekilde ekleyin)
- Loglar: `oc logs -n ${{ values.namespace }} deploy/${{ values.component_id }}`
