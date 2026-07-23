# PHP API image for users who build from the repository root.
# For the complete local stack, use `docker compose up --build`.
FROM php:8.3-cli

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends libpq-dev \
  && rm -rf /var/lib/apt/lists/* \
  && docker-php-ext-install pdo pdo_pgsql

COPY backend/ .

EXPOSE 5000

CMD ["php", "-S", "0.0.0.0:5000", "-t", "public"]
