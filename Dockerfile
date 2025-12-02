# Railway Production Dockerfile - Updated v2
FROM php:8.2-apache

# Install required system packages and PHP extensions
RUN apt-get update && apt-get install -y \
    curl \
    default-mysql-client \
    libzip-dev \
    unzip \
    && docker-php-ext-install pdo pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Copy application files
COPY ./api /var/www/html/

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Create .htaccess for clean URLs
RUN echo 'RewriteEngine On\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule ^(.*)$ index.php [QSA,L]' > /var/www/html/.htaccess

# Set environment to production
ENV ENVIRONMENT=production

# Expose port 80 for Railway
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]