# Custom base image: python3, g++, build-essential, sqlite3, mkdocs
# Build this on a machine WITH internet access, then push to Harbor.
# Node 20 required for toSorted() (ES2023) used by @backstage/backend-app-api
# Usage:
#   podman build -f deployments/kubernetes/node-build-base.Dockerfile -t harbor.ankacloud.com/backstage/node-build-base:20 .
#   podman push harbor.ankacloud.com/backstage/node-build-base:20

FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 g++ build-essential libsqlite3-dev python3-pip \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache-dir mkdocs mkdocs-techdocs-core
