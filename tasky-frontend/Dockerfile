FROM node:24-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/services/package.json ./packages/services/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile

FROM node:24-alpine AS build
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/services/node_modules ./packages/services/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY . .
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm run build

FROM node:24-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/services/package.json ./packages/services/
COPY packages/ui/package.json ./packages/ui/
COPY server.mjs ./
COPY --from=build /app/apps/web/dist ./dist
RUN pnpm install --prod --frozen-lockfile
ENV PORT=8088
ENV API_INTERNAL_URL=http://tasky-backend:9000
EXPOSE 8088
CMD ["node", "server.mjs"]
