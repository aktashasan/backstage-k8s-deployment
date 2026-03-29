# Runbook

## Deploy
- Pipeline: `${{ values.component_id }}-pipeline` in Azure DevOps
- Image: `harbor.company.com/${{ values.harborProject }}/${{ values.component_id }}`
- Namespace: `${{ values.namespace }}`

## Operate
- Health: `GET /health`
- Logs: `kubectl logs -n ${{ values.namespace }} deployment/${{ values.component_id }}`
- Rollout status: `kubectl rollout status deployment/${{ values.component_id }} -n ${{ values.namespace }}`

## Troubleshoot
- Check recent deploy: `kubectl describe deploy/${{ values.component_id }} -n ${{ values.namespace }}`
- Pods: `kubectl get pods -n ${{ values.namespace }} -l app=${{ values.component_id }}`
- Metrics: verify Prometheus scrape and Grafana dashboard.
