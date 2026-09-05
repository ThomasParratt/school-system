FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./

FROM base as development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "npm run dev:docker"]

FROM base as builder
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm install tsx
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/openapi.yaml ./openapi.yaml
EXPOSE 3000
CMD ["npm", "start"]

