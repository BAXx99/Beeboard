# Beeboard API

A simplified PHP API application with MySQL database using Docker.

## Services

- **App**: PHP 8.2 application running on port 8080
- **MySQL**: Database server running on port 3307
- **PHPMyAdmin**: Database management interface on port 8081

## Quick Start

1. **Start the application:**
   ```bash
   docker-compose up --build -d
   ```

2. **Access the services:**
   - **Application**: http://localhost:8080
   - **PHPMyAdmin**: http://localhost:8081
   - **MySQL**: localhost:3307

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

## Database Configuration

- **Host**: mysql (or localhost:3307 from outside Docker)
- **Database**: beeboard
- **Username**: root
- **Password**: password

## Development

The application files are mounted as volumes, so any changes to the PHP files will be reflected immediately without rebuilding the container.

## API Endpoints

- `GET /` - Main application endpoint
- `GET /testing` - Testing endpoint

## Files Structure

```
Beeboard/
├── dockerfile          # Simple PHP container setup
├── docker-compose.yml  # Services configuration
└── api/                # PHP application files
    ├── index.php       # Main application file
    └── testing.php     # Testing file
```
