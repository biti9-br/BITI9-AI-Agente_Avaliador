# Multi-stage Dockerfile for Biti9 Cubo App
# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files and build production bundle
COPY . .
RUN npm run build

# Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built artifacts
COPY --from=builder /app/dist ./dist

# Expose port 8080
EXPOSE 8080

# Start the application
CMD ["node", "dist/server.cjs"]
