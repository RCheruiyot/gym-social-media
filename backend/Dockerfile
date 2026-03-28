FROM php:8.3-cli

WORKDIR /app

# Enable Postgres PDO driver
RUN apt-get update \
  && apt-get install -y --no-install-recommends libpq-dev \
  && rm -rf /var/lib/apt/lists/* \
  && docker-php-ext-install pdo pdo_pgsql

COPY . .

EXPOSE 5000

CMD ["php", "-S", "0.0.0.0:5000", "-t", "public"]
