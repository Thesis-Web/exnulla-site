# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build
WORKDIR /repo
ENV CI=true

ARG GIT_SHA=unknown
ENV GIT_SHA=${GIT_SHA}

RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install deps with maximal layer caching
COPY package.json package-lock.json ./
COPY site/package.json site/package-lock.json ./site/
RUN npm ci --no-audit --no-fund
RUN npm --prefix site ci --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

# Artifact export stage (for CI/CD / local extraction)
FROM scratch AS artifacts
COPY --from=build /repo/site/dist /site-dist

# Runtime image (final stage, default runnable)
FROM nginx:1.27-alpine AS runtime
COPY --from=build /repo/site/dist /usr/share/nginx/html
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/meta/version.json >/dev/null || exit 1
