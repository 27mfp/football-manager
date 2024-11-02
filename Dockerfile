# Builder stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies needed for Prisma
RUN apk add --no-cache libc6-compat openssl

# Copy package files
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy rest of the application
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Final stage
FROM node:18-alpine

WORKDIR /app

# Install necessary system dependencies
RUN apk add --no-cache libc6-compat openssl

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./

# Ensure Prisma client is available
ENV PRISMA_GENERATE_SKIP=true
ENV NODE_ENV=production

EXPOSE 7000

CMD ["npm", "start"]
