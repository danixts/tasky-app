FROM node:24-bookworm-slim AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/services/package.json ./packages/services/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile

COPY apps/web ./apps/web
COPY packages ./packages
COPY tsconfig.base.json turbo.json ./

ENV NODE_ENV=production
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm exec turbo run build --filter=web

FROM node:24-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/packages ./packages
COPY server.mjs ./
COPY --from=builder /app/apps/web/dist ./dist

RUN pnpm install --prod --frozen-lockfile

ENV PORT=8088
ENV API_INTERNAL_URL=http://tasky-backend:9000
ENV NODE_ENV=production
EXPOSE 8088

CMD ["node", "server.mjs"]
