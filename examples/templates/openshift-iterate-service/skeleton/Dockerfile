# OpenShift Iterate Service: ${{ values.name }}
FROM node:20-alpine

WORKDIR /app

# Non-root user
RUN addgroup -g 1001 appuser && adduser -D -u 1001 -G appuser appuser

COPY package*.json ./
RUN npm ci --omit=dev

COPY --chown=appuser:appuser src ./src

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["node", "src/index.js"]
