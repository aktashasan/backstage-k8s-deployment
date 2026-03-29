# ${{ values.component_id | capitalize }} — Overview

Briefly describe what this service does, its main responsibilities, and the key owners.

- **Owner:** ${{ values.owner }}
- **System:** ${{ values.system or 'N/A' }}
- **Language/Framework:** ${{ values.language }}/{{ values.framework }}
- **Domain:** ${{ values.namespace }}

## Getting Started
- Source: `https://dev.azure.com/${{ values.azureDevOpsOrg }}/${{ values.azureDevOpsProject }}/_git/${{ values.repoName }}`
- Dev endpoint: (fill when available)
- Health: `/health`

## Quick Links
- Pipelines: `https://dev.azure.com/${{ values.azureDevOpsOrg }}/${{ values.azureDevOpsProject }}/_build`
- Harbor: `https://harbor.company.com/harbor/projects/${{ values.harborProject }}/repositories/${{ values.component_id }}`
- K8s Namespace: `${{ values.namespace }}`
