# Multi-stage Dockerfile for ${{ values.component_id }}
# Language: ${{ values.language }}
# Framework: ${{ values.framework }}

{%- if values.language == 'java' %}
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

# Copy pom.xml and download dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Add non-root user
RUN addgroup -g 1001 appuser && \
    adduser -D -u 1001 -G appuser appuser

# Copy jar from builder
COPY --from=builder /build/target/*.jar app.jar

# Security: Run as non-root
USER appuser

# Expose port
EXPOSE ${{ values.containerPort }}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${{ values.containerPort }}/actuator/health || exit 1

# JVM options for container
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

{%- elif values.language == 'nodejs' %}
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /build

# Install dependencies
COPY package*.json ./
RUN npm ci --production=false

# Copy source and build
COPY . .
RUN npm run build && \
    npm prune --production

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

# Add non-root user
RUN addgroup -g 1001 appuser && \
    adduser -D -u 1001 -G appuser appuser

# Copy from builder
COPY --from=builder --chown=appuser:appuser /build/node_modules ./node_modules
COPY --from=builder --chown=appuser:appuser /build/dist ./dist
COPY --from=builder --chown=appuser:appuser /build/package*.json ./

# Security: Run as non-root
USER appuser

# Expose port
EXPOSE ${{ values.containerPort }}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node healthcheck.js || exit 1

# Run application
CMD ["node", "dist/main.js"]

{%- elif values.language == 'dotnet' %}
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder
WORKDIR /build

# Copy csproj and restore
COPY *.csproj ./
RUN dotnet restore

# Copy source and publish
COPY . .
RUN dotnet publish -c Release -o out

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine
WORKDIR /app

# Add non-root user
RUN addgroup -g 1001 appuser && \
    adduser -D -u 1001 -G appuser appuser

# Copy from builder
COPY --from=builder --chown=appuser:appuser /build/out .

# Security: Run as non-root
USER appuser

# Expose port
EXPOSE ${{ values.containerPort }}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${{ values.containerPort }}/health || exit 1

# Run application
ENTRYPOINT ["dotnet", "${{ values.component_id }}.dll"]

{%- elif values.language == 'python' %}
# Stage 1: Build
FROM python:3.11-slim AS builder
WORKDIR /build

# Install dependencies
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim
WORKDIR /app

# Add non-root user
RUN addgroup --gid 1001 appuser && \
    adduser --uid 1001 --gid 1001 --disabled-password appuser

# Copy dependencies from builder
COPY --from=builder --chown=appuser:appuser /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH

# Copy application
COPY --chown=appuser:appuser . .

# Security: Run as non-root
USER appuser

# Expose port
EXPOSE ${{ values.containerPort }}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD python healthcheck.py || exit 1

# Run application
{%- if values.framework == 'fastapi' %}
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "${{ values.containerPort }}"]
{%- elif values.framework == 'django' %}
CMD ["gunicorn", "--bind", "0.0.0.0:${{ values.containerPort }}", "config.wsgi:application"]
{%- endif %}

{%- elif values.language == 'go' %}
# Stage 1: Build
FROM golang:1.22-alpine AS builder
WORKDIR /build

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo \
    -ldflags='-w -s -extldflags "-static"' \
    -o app ./cmd/main.go

# Stage 2: Runtime (scratch for minimal size)
FROM alpine:latest
WORKDIR /app

# Add non-root user
RUN addgroup -g 1001 appuser && \
    adduser -D -u 1001 -G appuser appuser

# Copy binary
COPY --from=builder --chown=appuser:appuser /build/app .

# Security: Run as non-root
USER appuser

# Expose port
EXPOSE ${{ values.containerPort }}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${{ values.containerPort }}/health || exit 1

# Run application
CMD ["./app"]
{%- endif %}

# Labels (OCI annotations)
LABEL org.opencontainers.image.title="${{ values.component_id }}" \
      org.opencontainers.image.description="${{ values.description }}" \
      org.opencontainers.image.vendor="Company" \
      org.opencontainers.image.source="https://dev.azure.com/${{ values.azureDevOpsOrg }}/${{ values.azureDevOpsProject }}"
