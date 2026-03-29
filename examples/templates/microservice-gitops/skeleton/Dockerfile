# =============================================================================
# Multi-stage Dockerfile for ${{ values.name }}
# Base images pulled from Harbor mirror to avoid Docker Hub rate limits.
# Adjust FROM images and build commands to match your language: ${{ values.language }}
# =============================================================================

# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM harbor.ankacloud.com/library/eclipse-temurin:17-jdk-alpine AS builder
# FROM harbor.ankacloud.com/library/node:20-alpine AS builder     # Node.js
# FROM harbor.ankacloud.com/library/python:3.12-slim AS builder   # Python
# FROM harbor.ankacloud.com/library/golang:1.22-alpine AS builder # Go

WORKDIR /build

# Copy dependency manifests first for layer cache efficiency
COPY pom.xml ./
# COPY package*.json ./       # Node.js
# COPY requirements*.txt ./   # Python
# COPY go.mod go.sum ./       # Go

# Install dependencies (cached layer)
RUN mvn dependency:go-offline -q
# RUN npm ci                  # Node.js
# RUN pip install --no-cache-dir -r requirements.txt  # Python
# RUN go mod download         # Go

# Copy source and build
COPY src/ ./src/
RUN mvn package -DskipTests -q
# RUN npm run build           # Node.js
# RUN go build -o app .       # Go

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM harbor.ankacloud.com/library/eclipse-temurin:17-jre-alpine AS runtime
# FROM harbor.ankacloud.com/library/node:20-alpine AS runtime     # Node.js
# FROM harbor.ankacloud.com/library/python:3.12-slim AS runtime   # Python
# FROM harbor.ankacloud.com/library/distroless/static AS runtime  # Go

# Non-root user (required for OpenShift — OCP assigns random UIDs)
# OpenShift drops root and uses a random UID from the namespace range.
# Use group 0 (root group) with write permissions so OCP's random UID can write.
RUN addgroup -g 1001 appgroup && adduser -u 1001 -G appgroup -D appuser
USER 1001
WORKDIR /app

# Copy artifact from builder
COPY --from=builder --chown=1001:1001 /build/target/*.jar app.jar
# COPY --from=builder --chown=1001:1001 /build/dist ./dist/    # Node.js
# COPY --from=builder --chown=1001:1001 /build/app ./app       # Go

# Labels for traceability
ARG BUILD_ID=unknown
ARG BUILD_DATE=unknown
LABEL org.opencontainers.image.source="https://dev.azure.com/${{ values.azureDevOpsOrg }}/${{ values.azureDevOpsProject }}/_git/${{ values.name }}" \
      org.opencontainers.image.revision="${BUILD_ID}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      backstage.io/kubernetes-id="${{ values.name }}"

EXPOSE 8080

# Health check (Kubernetes liveness/readiness probes use httpGet, but this
# helps with local docker run testing)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
# ENTRYPOINT ["node", "dist/index.js"]   # Node.js
# ENTRYPOINT ["./app"]                   # Go
