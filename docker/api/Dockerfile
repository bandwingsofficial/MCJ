# MCJ API — NestJS + Prisma (production)
# Build: docker build -f docker/api/Dockerfile -t mcj-api .

FROM node:22-bookworm-slim AS base

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate


# ============================================================
# PRUNER
# ============================================================

FROM base AS pruner

WORKDIR /app

COPY . .

RUN pnpm dlx turbo@2.9.6 prune mcj --docker

# Fail the build if turbo prune drops any Prisma migration.
# This check is the whole migrations directory, not a single migration name.
RUN set -eu \
  && src=$(find apps/api/prisma/migrations -name migration.sql | wc -l | tr -d ' ') \
  && pruned=$(find out/full/apps/api/prisma/migrations -name migration.sql | wc -l | tr -d ' ') \
  && echo "Pruned Prisma migration SQL files: repo=${src} pruned=${pruned}" \
  && test -f apps/api/prisma/schema.prisma \
  && test -f out/full/apps/api/prisma/schema.prisma \
  && test "$src" -gt 0 \
  && test "$src" = "$pruned"


# ============================================================
# BUILDER
# ============================================================

FROM base AS builder

WORKDIR /app

COPY --from=pruner /app/out/json/ .

RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .


# Build shared constants
# Generate Prisma Client for the workspace
# Build NestJS API

RUN pnpm --filter @mcj/shared-constants run build \
  && pnpm --filter mcj exec prisma generate \
  && pnpm turbo run build --filter=mcj...


# Create production deployment
# Copy compiled API
# IMPORTANT:
# Generate Prisma Client AGAIN using the production
# /prod/api Prisma schema so the generated client exists
# inside the actual production node_modules.

RUN pnpm deploy --filter mcj --prod /prod/api \
  && cp -r apps/api/dist /prod/api/dist \
  && cp -r apps/api/prisma /prod/api/prisma \
  && pnpm --filter mcj exec prisma generate --schema /prod/api/prisma/schema.prisma \
  && rm -rf /prod/api/src /prod/api/test

# pnpm deploy does not define the migration set. The copy above does.
# Fail the image build unless every migration.sql was packaged.
RUN set -eu \
  && test -f /prod/api/prisma/schema.prisma \
  && test -d /prod/api/prisma/migrations \
  && src=$(find apps/api/prisma/migrations -name migration.sql | wc -l | tr -d ' ') \
  && dst=$(find /prod/api/prisma/migrations -name migration.sql | wc -l | tr -d ' ') \
  && echo "Packaged Prisma migration SQL files: source=${src} image=${dst}" \
  && test "$src" -gt 0 \
  && test "$src" = "$dst"


# ============================================================
# RUNNER
# ============================================================

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs --ingroup nodejs

COPY --from=builder --chown=nestjs:nodejs /prod/api ./

COPY --chown=nestjs:nodejs docker/api/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh \
  && test -f /app/prisma/schema.prisma \
  && test -d /app/prisma/migrations \
  && sql_count=$(find /app/prisma/migrations -name migration.sql | wc -l | tr -d ' ') \
  && echo "Final image Prisma migration SQL files: ${sql_count}" \
  && test "$sql_count" -gt 0

USER nestjs

EXPOSE 4000


# ============================================================
# HEALTHCHECK
# ============================================================

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/courses?take=1').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"


# ============================================================
# START
# ============================================================

ENTRYPOINT ["/entrypoint.sh"]