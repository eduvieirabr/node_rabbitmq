# Multi-stage Dockerfile for NestJS app with production runtime

FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (with dev deps) for building
COPY package*.json ./
COPY nest-cli.json tsconfig*.json ./
RUN npm ci

# Copy sources and build
COPY . .
RUN npm run build


FROM node:20-alpine AS runner
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=builder /app/dist ./dist

# Expose application port
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/main.js"]

