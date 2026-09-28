# MCJ API — NestJS + Prisma (production)
# Build: docker build -f docker/api/Dockerfile -t mcj-api .

FROM node:22-bookworm-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

FROM base AS pruner
WORKDIR /app
COPY . .
RUN pnpm dlx turbo@2.9.6 prune mcj --docker

FROM base AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

RUN pnpm --filter @mcj/shared-constants run build \
  && pnpm --filter mcj exec prisma generate \
  && pnpm turbo run build --filter=mcj...

RUN pnpm deploy --filter mcj --prod /prod/api \
  && cp -r apps/api/dist /prod/api/dist \
  && rm -rf /prod/api/src /prod/api/test

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs --ingroup nodejs

COPY --from=builder --chown=nestjs:nodejs /prod/api ./
COPY --chown=nestjs:nodejs docker/api/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nestjs

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/courses?take=1').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/entrypoint.sh"]
