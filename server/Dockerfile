# Build stage: Compile TypeScript to JavaScript
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Production stage: Run compiled JavaScript with minimal image size
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# I am utilizing a multi-stage Docker build to keep the final image size minimal by discarding the TypeScript compiler and source files.
COPY --from=builder /app/dist ./dist
COPY .env.example .env

EXPOSE 3000

CMD ["node", "dist/index.js"]
