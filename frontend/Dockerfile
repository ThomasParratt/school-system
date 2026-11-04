# Built from the repository root (the compose files set `context: .`), so the
# workspace packages in packages/ are in reach. Vite reads them from their source.
FROM node:22-slim AS base
RUN npm install -g pnpm@12.16.1
WORKDIR /repo
# Every workspace manifest, so the lockfile matches the workspace it was written for.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY packages/contracts/package.json packages/contracts/
COPY packages/domain/package.json packages/domain/
RUN pnpm install --frozen-lockfile --filter "frontend..."

FROM base AS development
COPY packages packages
COPY frontend frontend
WORKDIR /repo/frontend
EXPOSE 5173
CMD ["pnpm", "run", "dev", "--host"]

FROM base AS builder
COPY packages packages
COPY frontend frontend
RUN pnpm --filter frontend run build

FROM nginx:alpine AS production
COPY --from=builder /repo/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
