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

FROM node:20-slim AS runtime
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm install tsx
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/openapi.yaml ./openapi.yaml
EXPOSE 3000
CMD ["npm", "start"]

