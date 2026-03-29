# ${{ values.title }}

${{ values.description }}

## Overview

| Field | Value |
|-------|-------|
| **Owner** | ${{ values.owner }} |
| **System** | ${{ values.system }} |
| **Lifecycle** | ${{ values.lifecycle }} |
| **Language** | ${{ values.language }} |
| **Namespace** | ${{ values.namespace }} |

## Architecture

This service is part of the **${{ values.system }}** system and follows the standard ANKASOFT microservice pattern:

```
Azure DevOps CI → Harbor Registry → ArgoCD → OpenShift (${{ values.namespace }})
```

## CI/CD Pipeline

| Stage | Tool | Description |
|-------|------|-------------|
| Build & Test | Azure DevOps | Compiles code and runs unit tests |
| Code Quality | SonarQube | Static code analysis and coverage |
| Security Scan | Fortify | SAST vulnerability detection |
| Image Build | Docker | Multi-stage build, pushed to Harbor |
| Image Scan | Trivy | Container vulnerability scan |
| Deploy | ArgoCD | GitOps sync to OpenShift |

## Getting Started

### Local Development (Tilt)

```bash
# Prerequisites: tilt, docker, kubectl/oc pointing to your dev cluster
tilt up
```

### Running Tests

```bash
# Add language-specific test commands here
```

## API Reference

<!-- Add API documentation here or link to OpenAPI spec -->

## Configuration

Environment variables consumed by this service:

| Variable | Description | Required |
|----------|-------------|----------|
| `SERVER_PORT` | HTTP listen port (default: 8080) | No |

## Runbook

### Health Check

```bash
curl https://<route>/actuator/health
```

### Logs

```bash
oc logs -l backstage.io/kubernetes-id=${{ values.name }} -n ${{ values.namespace }} --tail=100
```
