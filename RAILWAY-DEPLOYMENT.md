# Railway Deployment Guide for Beeboard API

## 🚀 Railway Deployment Steps

### 1. Prerequisites
- Railway account: https://railway.app
- GitHub repository with your code
- MySQL database service on Railway

### 2. Create Railway Project
1. Go to Railway dashboard
2. Click "New Project"
3. Connect your GitHub repository
4. Choose "Deploy from GitHub repo"

### 3. Add MySQL Database
1. In your Railway project, click "New Service"
2. Choose "Database" → "MySQL"
3. Railway will provision a MySQL instance with connection details

### 4. Configure Environment Variables
In Railway dashboard, go to your service → Variables and add:

```
ENVIRONMENT=production
MYSQLHOST=${{MySQL.MYSQLHOST}}
MYSQLDATABASE=${{MySQL.MYSQLDATABASE}}
MYSQLUSER=${{MySQL.MYSQLUSER}}
MYSQLPASSWORD=${{MySQL.MYSQLPASSWORD}}
MYSQLPORT=${{MySQL.MYSQLPORT}}
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 5. Set Up Database Schema
1. Connect to your Railway MySQL database using the provided credentials
2. Run the SQL script from `railway-schema.sql` to create all tables
3. Alternatively, use Railway's built-in database tool or connect via MySQL client

### 6. Deploy
1. Railway will automatically deploy when you push to your connected branch
2. Your API will be available at: `https://beeboard-production-b072.up.railway.app`

## 🗄️ Database Setup Commands

```sql
-- Connect to Railway MySQL and run:
source railway-schema.sql

-- Or copy/paste the contents of railway-schema.sql
```

## 🔧 Configuration Details

### Database Configuration
- **Production Mode**: Uses Railway MySQL environment variables
- **Local Mode**: Uses Docker MySQL (set ENVIRONMENT=local)
- **Auto-detection**: Defaults to production for Railway deployment

### API Endpoints
- **Production**: `https://beeboard-production-b072.up.railway.app/api/`
- **Local**: `http://localhost:8080/api/`

### Postman Testing
- Import `Beeboard-API-Complete.postman_collection.json`
- Use `base_url` variable for production
- Use `base_url_local` variable for local testing

## 📋 Deployment Checklist

- [ ] Railway project created
- [ ] GitHub repository connected
- [ ] MySQL service added
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] API endpoints tested
- [ ] Postman collection updated

## 🔍 Troubleshooting

### Database Connection Issues
1. Check environment variables in Railway dashboard
2. Verify MySQL service is running
3. Check database credentials match Railway MySQL service

### API Not Responding
1. Check Railway service logs
2. Verify Dockerfile builds successfully
3. Ensure PORT environment variable is set by Railway

### CORS Issues
1. Update CORS settings in your API if needed
2. Verify frontend domain is allowed

## 🏗️ Current Configuration

Your API is now configured for:
- ✅ **Production mode** (Railway with MySQL)
- ✅ **Environment-based configuration**
- ✅ **Railway MySQL integration**
- ✅ **Updated Postman collection**
- ✅ **Complete database schema**
