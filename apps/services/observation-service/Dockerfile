FROM php:8.3-cli
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN docker-php-ext-install pdo_mysql pdo_sqlite
WORKDIR /var/www/html
COPY . .
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader
RUN mkdir -p storage/app/keys && chmod -R 775 storage bootstrap/cache
EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
