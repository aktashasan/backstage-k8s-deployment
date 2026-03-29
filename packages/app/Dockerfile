# Frontend Dockerfile - Backstage App
# This Dockerfile should be run from the repo root, not from packages/app
FROM node:20-bullseye-slim AS builder

# Install build dependencies for native modules
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get install -y --no-install-recommends python3 g++ build-essential && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root package files (yarn workspace)
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Copy all workspace package.json files (needed for yarn workspaces resolution)
COPY packages/backend/package.json ./packages/backend/
COPY packages/app/package.json ./packages/app/

# Install dependencies (workspace-aware)
# Note: Some native modules may fail to build, but we continue anyway
RUN yarn install --frozen-lockfile || yarn install

# Build-time environment variables for frontend baseUrl
# These will be substituted during build
ARG APP_BASE_URL=http://backstage.ankacloud.com
ARG BACKEND_BASE_URL=http://backstage.ankacloud.com
ENV APP_BASE_URL=${APP_BASE_URL}
ENV BACKEND_BASE_URL=${BACKEND_BASE_URL}

# Copy app-config files (required by Backstage build)
# Backstage CLI looks for app-config.yaml in packages/backend or root
COPY app-config.yaml ./
COPY tsconfig.json ./
COPY backstage.json ./

# Override backend.baseUrl in app-config.yaml for production build
# This ensures the correct backend URL is embedded in the JavaScript bundle
RUN sed -i "s|baseUrl: http://localhost:7007|baseUrl: ${BACKEND_BASE_URL}|g" app-config.yaml && \
    sed -i "s|baseUrl: http://localhost:3000|baseUrl: ${APP_BASE_URL}|g" app-config.yaml

# Create app-config.production.yaml with substituted values
# Backstage build reads this file and merges it with app-config.yaml
# Production config overrides normal config
RUN cat > app-config.production.yaml <<EOF
app:
  baseUrl: ${APP_BASE_URL}

backend:
  baseUrl: ${BACKEND_BASE_URL}
  listen: ':7007'
  database:
    client: pg
    connection:
      host: \${POSTGRES_HOST}
      port: \${POSTGRES_PORT}
      user: \${POSTGRES_USER}
      password: \${POSTGRES_PASSWORD}

auth:
  providers:
    guest: {}

catalog:
  locations:
    - type: file
      target: ./examples/entities.yaml
    - type: file
      target: ./examples/template/template.yaml
      rules:
        - allow: [Template]
    - type: file
      target: ./examples/org.yaml
      rules:
        - allow: [User, Group]
EOF

# Copy all source files needed for build (including config files)
# Copy app directory recursively
COPY packages/app/ ./packages/app/

# Build from app directory (Backstage CLI package build expects to be in package dir)
WORKDIR /app/packages/app
ENV NODE_ENV=production

# Build the app (backstage-cli package build)
# This should find src/index.tsx automatically
RUN yarn build

# Production stage
FROM nginx:alpine

# Create nginx cache/run dirs with open permissions so non-root works too
RUN mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp \
    && chmod -R 777 /var/cache/nginx \
    && chmod -R 777 /var/run \
    && chmod -R 777 /var/log/nginx \
    && sed -i 's/^user .*;//' /etc/nginx/nginx.conf

# Copy built app
COPY --from=builder /app/packages/app/dist /usr/share/nginx/html

# Copy nginx config
COPY packages/app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
