# ---- Build stage ----
FROM node:20-alpine AS builder

# Enable pnpm via corepack (version pinned by package.json `packageManager`)
RUN corepack enable

WORKDIR /app

# Copy manifests first for a cache-friendly install layer
COPY package.json pnpm-lock.yaml .npmrc ./

RUN pnpm install --frozen-lockfile

# Build-time API URL (runtime injection is a future improvement)
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

COPY . .

RUN pnpm build

# ---- Runner stage ----
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
