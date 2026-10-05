# MCJ Next.js apps (production, standalone)
# Build: docker build -f docker/next/Dockerfile --build-arg APP_NAME=customer-web \
#   --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.example.com -t mcj-customer-web .

ARG APP_NAME=customer-web

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

FROM base AS pruner
ARG APP_NAME
WORKDIR /app
COPY . .
RUN pnpm dlx turbo@2.9.6 prune "${APP_NAME}" --docker

FROM base AS builder
ARG APP_NAME
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_CUSTOMER_WEB_URL
ARG NEXT_PUBLIC_STUDENT_WEB_URL

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
# Legacy client paths (customer/student) still read NEXT_PUBLIC_API_URL at build time.
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_CUSTOMER_WEB_URL=${NEXT_PUBLIC_CUSTOMER_WEB_URL}
ENV NEXT_PUBLIC_STUDENT_WEB_URL=${NEXT_PUBLIC_STUDENT_WEB_URL}

COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

RUN case "${APP_NAME}" in \
      admin-web|branch-web|customer-web|student-web) ;; \
      *) echo "Invalid APP_NAME: ${APP_NAME}. Must be admin-web, branch-web, customer-web, or student-web." >&2; exit 1 ;; \
    esac

RUN pnpm turbo run build --filter="${APP_NAME}..."

FROM base AS runner
ARG APP_NAME

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV APP_NAME=${APP_NAME}

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs --ingroup nodejs

COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_NAME}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_NAME}/.next/static ./apps/${APP_NAME}/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_NAME}/public ./apps/${APP_NAME}/public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["sh", "-c", "node apps/$APP_NAME/server.js"]
