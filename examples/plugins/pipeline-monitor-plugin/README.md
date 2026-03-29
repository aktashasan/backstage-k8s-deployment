# Pipeline Monitor Plugin

Custom Backstage plugin for real-time pipeline monitoring and deployment feedback.

## Features

- Real-time Azure DevOps pipeline status
- Kubernetes deployment monitoring
- Security scan results integration
- Deployment approval workflow
- Error reporting and troubleshooting

## Installation

```bash
cd backstage-demo
yarn workspace app add @internal/plugin-pipeline-monitor
yarn workspace backend add @internal/plugin-pipeline-monitor-backend
```

## Configuration

Add to `app-config.yaml`:

```yaml
pipelineMonitor:
  azureDevOps:
    organization: ${AZURE_DEVOPS_ORG}
    project: ${AZURE_DEVOPS_PROJECT}
    token: ${AZURE_DEVOPS_TOKEN}
    
  kubernetes:
    clusters:
      - name: dev-cluster
        url: ${DEV_CLUSTER_URL}
      - name: test-cluster
        url: ${TEST_CLUSTER_URL}
      - name: prod-cluster
        url: ${PROD_CLUSTER_URL}
        
  notifications:
    enabled: true
    channels:
      - email
      - slack
      - teams
```

## Usage

The plugin provides:

1. **Pipeline Status Page**: View all pipeline executions
2. **Deployment Timeline**: Track deployment progress
3. **Security Scan Results**: View Fortify, SonarQube, Trivy results
4. **Approval Workflow**: Approve/reject deployments
5. **Error Reporting**: Detailed error messages and troubleshooting

## UI Components

- `<PipelineStatusCard />` - Pipeline status overview
- `<DeploymentTimeline />` - Deployment progress
- `<SecurityScanResults />` - Security scan results
- `<ApprovalWorkflow />` - Approval interface
- `<ErrorReport />` - Error details and troubleshooting
