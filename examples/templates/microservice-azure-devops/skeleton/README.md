# ${{ values.component_id }}

${{ values.description }}

## 📋 Overview

- **Language**: ${{ values.language }}
- **Framework**: ${{ values.framework }}
{%- if values.database != 'none' %}
- **Database**: ${{ values.database }}
{%- endif %}
- **Owner**: ${{ values.owner }}
- **System**: ${{ values.system or 'N/A' }}

## 🏗️ Architecture

This microservice follows the enterprise architecture pattern with:

- **Azure DevOps CI/CD**: Automated build, test, and deployment pipelines
- **Harbor Registry**: Container image storage with security scanning
- **Nexus Repository**: Artifact management
- **Multi-cluster Kubernetes**: Dev, Test, and Production environments
{%- if values.gitopsProvider == 'argocd' %}
- **ArgoCD**: GitOps-based continuous deployment
{%- elif values.gitopsProvider == 'flux' %}
- **FluxCD**: GitOps-based continuous deployment
{%- endif %}
{%- if values.enableTilt %}
- **Tilt**: Local development environment
{%- endif %}

## 🚀 Getting Started

### Prerequisites

{%- if values.language == 'java' %}
- Java 17+
- Maven 3.8+
{%- elif values.language == 'nodejs' %}
- Node.js 20+
- npm 10+
{%- elif values.language == 'dotnet' %}
- .NET 8 SDK
{%- elif values.language == 'python' %}
- Python 3.11+
- pip
{%- elif values.language == 'go' %}
- Go 1.22+
{%- endif %}
- Docker Desktop
{%- if values.enableTilt %}
- Tilt (for local development)
{%- endif %}
- kubectl
- Access to dev-cluster

### Local Development

{%- if values.enableTilt %}
#### With Tilt (Recommended)

```bash
# Start Tilt
tilt up

# Open Tilt UI
# Visit: http://localhost:10350

# Stop Tilt
tilt down
```

The service will be available at: `http://localhost:${{ values.containerPort }}`

{%- endif %}

#### Manual Development

{%- if values.language == 'java' %}
```bash
# Build
mvn clean package

# Run
java -jar target/*.jar

# Test
mvn test
```

{%- elif values.language == 'nodejs' %}
```bash
# Install dependencies
npm install

# Build
npm run build

# Run
npm start

# Test
npm test

# Watch mode
npm run dev
```

{%- elif values.language == 'dotnet' %}
```bash
# Build
dotnet build

# Run
dotnet run

# Test
dotnet test
```

{%- elif values.language == 'python' %}
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run
{%- if values.framework == 'fastapi' %}
uvicorn main:app --reload --port ${{ values.containerPort }}
{%- elif values.framework == 'django' %}
python manage.py runserver ${{ values.containerPort }}
{%- endif %}

# Test
pytest
```

{%- elif values.language == 'go' %}
```bash
# Download dependencies
go mod download

# Build
go build -o bin/${{ values.component_id }} ./cmd/main.go

# Run
./bin/${{ values.component_id }}

# Test
go test ./...

# Run with hot reload
air
```
{%- endif %}

### Docker

```bash
# Build image
docker build -t ${{ values.component_id }}:local .

# Run container
docker run -p ${{ values.containerPort }}:${{ values.containerPort }} ${{ values.component_id }}:local
```

## 🔄 CI/CD Pipelines

### Branch Strategy

- **`dev` branch**: Continuous deployment to Dev cluster
- **Pull Requests**: Deploy to Test cluster (ephemeral environment)
- **`prod` branch**: Manual approval → Production deployment

### Pipelines

1. **Dev Pipeline** (`pipelines/dev-pipeline.yml`)
   - Triggers: Push to `dev` branch
   - Steps: Build → Test → Image Build → Deploy to Dev
   - Auto-deploys to: `${{ values.namespace }}-dev` namespace

2. **Test Pipeline** (`pipelines/test-pipeline.yml`)
   - Triggers: Pull Request
   - Steps: Full tests → Security scan → Deploy to Test → Integration tests
   - Creates PR-specific namespace
   - Auto-cleanup on PR close

3. **Prod Pipeline** (`pipelines/prod-pipeline.yml`)
   - Triggers: Push to `prod` branch
   - Steps: Build → Security scan → **Manual Approval** → Blue-Green Deploy
   - Requires: Production approval
   - Gradual traffic switching

### Monitoring Pipelines

View pipeline status:
- Dev: https://dev.azure.com/${{ values.azureDevOpsOrg }}/${{ values.azureDevOpsProject }}/_build?definitionId=<dev-pipeline-id>
- Test: https://dev.azure.com/${{ values.azureDevOpsOrg }}/${{ values.azureDevOpsProject }}/_build?definitionId=<test-pipeline-id>
- Prod: https://dev.azure.com/${{ values.azureDevOpsOrg }}/${{ values.azureDevOpsProject }}/_build?definitionId=<prod-pipeline-id>

## ☸️ Kubernetes Deployment

### Environments

| Environment | Namespace | URL | Replicas |
|-------------|-----------|-----|----------|
| Dev | `${{ values.namespace }}-dev` | {%- if values.enableIngress %}https://${{ values.component_id }}-dev.company.com{%- else %}Internal{%- endif %} | 1 |
| Test | `${{ values.namespace }}-test` | {%- if values.enableIngress %}https://${{ values.component_id }}-test.company.com{%- else %}Internal{%- endif %} | 1 |
| Prod | `${{ values.namespace }}` | {%- if values.enableIngress %}https://${{ values.component_id }}.company.com{%- else %}Internal{%- endif %} | ${{ values.replicas }} |

### Manual Deployment

```bash
# Dev
kubectl apply -k k8s/overlays/dev

# Test
kubectl apply -k k8s/overlays/test

# Prod
kubectl apply -k k8s/overlays/prod
```

### Verify Deployment

```bash
# Check pods
kubectl get pods -n ${{ values.namespace }}-dev -l app=${{ values.component_id }}

# Check logs
kubectl logs -f deployment/${{ values.component_id }}-dev -n ${{ values.namespace }}-dev

# Port forward (for testing)
kubectl port-forward svc/${{ values.component_id }}-dev ${{ values.containerPort }}:80 -n ${{ values.namespace }}-dev
```

## 🧪 Testing

### Unit Tests

{%- if values.language == 'java' %}
```bash
mvn test
```
{%- elif values.language == 'nodejs' %}
```bash
npm test
```
{%- elif values.language == 'go' %}
```bash
go test ./...
```
{%- endif %}

### Integration Tests

{%- if values.language == 'java' %}
```bash
mvn verify
```
{%- elif values.language == 'nodejs' %}
```bash
npm run test:integration
```
{%- endif %}

### API Tests

```bash
# Health check
curl http://localhost:${{ values.containerPort }}/health

# Readiness check
curl http://localhost:${{ values.containerPort }}/ready

{%- if values.enableObservability %}
# Metrics
curl http://localhost:${{ values.containerPort }}/metrics
{%- endif %}
```

## 📊 Monitoring & Observability

{%- if values.enableObservability %}
### Metrics

Prometheus metrics endpoint: `/metrics`

### Logs

View logs in:
- Kibana/Elasticsearch
- Grafana Loki
- Azure Log Analytics

### Traces

Distributed tracing with:
- Jaeger
- Azure Application Insights

### Dashboards

- Grafana: https://grafana.company.com/d/${{ values.component_id }}
{%- if values.gitopsProvider == 'argocd' %}
- ArgoCD: https://argocd.company.com/applications/${{ values.component_id }}
{%- endif %}
{%- endif %}

## 🔒 Security

- **Container Scanning**: Trivy security scan in CI/CD
{%- if values.enableSonarQube %}
- **Code Quality**: SonarQube analysis
{%- endif %}
- **Dependency Check**: Automated vulnerability scanning
- **Non-root User**: Container runs as user 1001
- **Read-only Filesystem**: Enforced in production
- **Network Policies**: Configured per environment

## 📖 API Documentation

{%- if values.language == 'java' %}
- Swagger UI: http://localhost:${{ values.containerPort }}/swagger-ui.html
- OpenAPI Spec: http://localhost:${{ values.containerPort }}/v3/api-docs
{%- elif values.language == 'nodejs' %}
- API Docs: http://localhost:${{ values.containerPort }}/api-docs
{%- elif values.language == 'python' and values.framework == 'fastapi' %}
- Swagger UI: http://localhost:${{ values.containerPort }}/docs
- ReDoc: http://localhost:${{ values.containerPort }}/redoc
{%- endif %}

## 🤝 Contributing

1. Create feature branch from `dev`
2. Make changes
3. Run tests locally
4. Create Pull Request
5. Wait for CI/CD checks
6. Get review and approval
7. Merge to `dev`

## 📝 License

Copyright © {{ "now" | date: "%Y" }} Company. All rights reserved.

## 📧 Support

- **Owner**: ${{ values.owner }}
- **Team**: Platform Team
- **Slack**: #microservices-support
- **Email**: platform-team@company.com

---

Generated by Backstage on {{ "now" | date: "%Y-%m-%d" }}
