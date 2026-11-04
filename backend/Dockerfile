# Built from the repository root (the compose files set `context: .`), so the
# workspace packages in packages/ are in reach.
FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@12.16.1
WORKDIR /repo
# Every workspace manifest, so the lockfile matches the workspace it was written for.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY packages/contracts/package.json packages/contracts/
COPY packages/domain/package.json packages/domain/
RUN pnpm install --frozen-lockfile --filter "backend..."

FROM base AS development
COPY packages packages
COPY backend backend
WORKDIR /repo/backend
EXPOSE 3000
# The dev server reads the packages from their source (tsx --conditions=source).
CMD ["pnpm", "run", "dev:docker"]

FROM base AS builder
COPY packages packages
COPY backend backend
# The packages first (production reads their dist/), then the backend.
RUN pnpm --filter "backend^..." run build
RUN pnpm --filter backend exec prisma generate && pnpm --filter backend run build

FROM builder AS production
ENV NODE_ENV=production
WORKDIR /repo/backend
EXPOSE 3000
CMD ["node", "dist/index.js"]
