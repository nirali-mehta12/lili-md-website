# syntax=docker/dockerfile:1
# Multi-stage build for the LiLi M.D. Next.js 16 site → Cloud Run.
# Uses Next's `output: "standalone"` (see next.config.ts) for a small image.
# Debian "slim" (glibc) base so sharp's prebuilt image-optimization binaries work.

# ---- 1. Install dependencies ----
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- 2. Build ----
FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- 3. Runtime ----
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0

# Run as a non-root user.
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# Standalone server + the static/public assets it serves (not copied by default).
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080

# Cloud Run sets PORT (defaults to 8080); the standalone server respects it.
CMD ["node", "server.js"]
