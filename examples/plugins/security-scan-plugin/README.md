# Security Scan Plugin

Custom Backstage plugin for security scanning integration (Fortify, SonarQube, Trivy).

## Features

- Fortify SAST integration
- SonarQube code quality gates
- Trivy container scanning
- Security policy enforcement
- Compliance reporting

## Installation

```bash
cd backstage-demo
yarn workspace app add @internal/plugin-security-scan
yarn workspace backend add @internal/plugin-security-scan-backend
```

## Configuration

Add to `app-config.yaml`:

```yaml
securityScan:
  fortify:
    url: ${FORTIFY_URL}
    apiKey: ${FORTIFY_API_KEY}
    
  sonarqube:
    url: ${SONARQUBE_URL}
    token: ${SONARQUBE_TOKEN}
    
  trivy:
    url: ${TRIVY_URL}
    apiKey: ${TRIVY_API_KEY}
```

## Usage

The plugin provides:

1. **Security Dashboard**: Overview of all security scans
2. **Scan Results**: Detailed vulnerability reports
3. **Policy Enforcement**: Block deployments on policy violations
4. **Compliance Reports**: SOC 2, PCI-DSS, GDPR compliance

## UI Components

- `<SecurityDashboard />` - Security overview
- `<VulnerabilityReport />` - Detailed vulnerability list
- `<PolicyEnforcement />` - Policy status
- `<ComplianceReport />` - Compliance dashboard
