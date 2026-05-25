export PROTOCOL_HEADER=x-forwarded-proto
export HOST_HEADER=x-forwarded-host
export DATABASE_URL="file:/usr/src/app/data/db/prod.db"
export UPLOAD_PATH="/usr/src/app/data/uploads"
export PUBLIC_DEFAULT_CURRENCY=${DEFAULT_CURRENCY}
export BODY_SIZE_LIMIT=${MAX_IMAGE_SIZE:-5000000}

mkdir -p /usr/src/app/data/db /usr/src/app/data/uploads

caddy start --config /usr/src/app/Caddyfile

pnpm prisma migrate deploy && \
pnpm prisma db seed && \
pnpm db:patch && \
pnpm start