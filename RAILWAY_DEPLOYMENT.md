# Railway Deployment Guide for Beeboard API

## 🚂 Railway Setup Steps

### 1. Create Railway Project
1. Go to [Railway](https://railway.app)
2. Create new project
3. Connect your GitHub repository (`HassanAlkuheli/beeboard`, branch: `backend`)

### 2. Add MySQL Database
1. In Railway dashboard, click "Add Service"
2. Choose "Database" → "MySQL"
3. Railway will automatically create MySQL instance with environment variables

### 3. Configure Environment Variables
Railway will automatically set these MySQL variables:
- `MYSQLHOST`
- `MYSQLDATABASE` 
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQLPORT`
- `MYSQL_URL`

Manual variables to set:
- `ENVIRONMENT=production`

### 4. Deploy Application
1. Railway will automatically build using the Dockerfile
2. Application will be available at: `https://beeboard-production-b072.up.railway.app`

### 5. Initialize Database
After deployment, make ONE POST request to initialize the database:

```bash
curl -X POST https://beeboard-production-b072.up.railway.app/api/system/init-database
```

This will:
- ✅ Create all 11 database tables
- ✅ Insert sample data
- ✅ Create admin user: `admin@beeboard.com` / `password`

### 6. Test API
Use the provided Postman collection:
- Import: `Beeboard-API-Complete.postman_collection.json`
- Use `base_url` variable: `https://beeboard-production-b072.up.railway.app/api`
- Test health check: GET `/system/health`

### 7. Security (Important!)
After successful deployment and database initialization:
1. Remove the system routes file: `api/routes/system.php`
2. Remove the init-database controller: `api/controllers/system/init-database.php`
3. Redeploy to production

## 🔄 Local vs Production Mode

### Local Development (Docker)
```bash
# Set environment
export ENVIRONMENT=local

# Use local database connection:
# - Host: mysql (Docker service)
# - Database: beeboard_db
# - User: beeboard_user
# - Password: beeboard_password
```

### Production (Railway)
```bash
# Set environment  
export ENVIRONMENT=production

# Uses Railway MySQL environment variables automatically
```

## 📊 Database Schema

The API includes 11 tables:
1. `users` - User accounts and authentication
2. `projects` - Project management
3. `project_users` - Project membership and roles
4. `invitations` - Project invitation system
5. `main_bar_cards` - Board columns
6. `sub_bars` - Sub-columns within main columns
7. `cards` - Task cards
8. `tags` - Project tags
9. `card_tags` - Card-tag assignments
10. `card_users` - Card-user assignments
11. `comments` - Card comments

## 🧪 Testing

All 54 API endpoints are documented in the Postman collection:
- Authentication endpoints (signup, login)
- Project management (CRUD operations)
- Board management (columns, cards)
- User assignments and tags
- Comments system

## 🔐 Sample Credentials

After database initialization:
- **Email**: `admin@beeboard.com`
- **Password**: `password`

Use these credentials to login and get JWT token for API testing.
