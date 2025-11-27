# Aiven Database Setup Guide

## Step 1: Import Your Database Schema

You need to import your existing database schema and data into Aiven.

### Option A: Using MySQL Workbench

1. Open MySQL Workbench
2. Create a new connection with these settings:

   - **Connection Name**: Aiven Williams Blog
   - **Hostname**: `williams-blog-db-williams-blog-db.g.aivencloud.com`
   - **Port**: `22182`
   - **Username**: `avnadmin`
   - **Password**: ***REDACTED***
   - **Default Schema**: `defaultdb`
   - **SSL**: Use SSL (Required)
3. Connect to the database
4. Go to **Server** → **Data Import**
5. Select your local SQL file (`backend/sql/williams_blog_db.sql`)
6. Import into `defaultdb`

### Option B: Using Command Line

```bash
# Navigate to your backend SQL directory
cd backend/sql

# Import the schema
mysql -h williams-blog-db-williams-blog-db.g.aivencloud.com \
      -P 22182 \
      -u avnadmin \
      -p'***REDACTED***' \
      --ssl-mode=REQUIRED \
      defaultdb < williams_blog_db.sql
```

### Option C: Using Aiven Console

1. Go to your Aiven dashboard
2. Select your MySQL service
3. Click on "Tools" or "Import"
4. Upload your SQL file

## Step 2: Verify the Import

Test the connection locally first:

```bash
# Update your local .env temporarily to test Aiven connection
# (Make a backup of your current .env first!)

# In server/.env, change to:
DB_HOST=williams-blog-db-williams-blog-db.g.aivencloud.com
DB_PORT=22182
DB_USER=avnadmin
DB_PASSWORD=***REDACTED***
DB_NAME=defaultdb
DB_SSL=true

# Restart your local server
npm run dev

# Test the connection
curl http://localhost:3000/test-db
```

If you see `{"success":true,"result":2}`, the connection works!

## Step 3: Deploy to Vercel

Once your database is set up and tested:

```bash
# Make sure you're in the server directory
cd server

# Deploy to Vercel
vercel

# Or if you prefer the dashboard, push to GitHub and deploy from there
```

### Environment Variables in Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

```
DB_HOST=williams-blog-db-williams-blog-db.g.aivencloud.com
DB_PORT=22182
DB_USER=avnadmin
DB_PASSWORD=***REDACTED***
DB_NAME=defaultdb
DB_SSL=true
JWT_SECRET=qxKKq7HbkDCEMCG2YffE6bzquzET7FqZ1SchXU93n3E
JWT_ISSUER=williams-blog-api
PORT=3000
```

## Troubleshooting

### SSL Connection Issues

If you get SSL errors, try:

1. Make sure `DB_SSL=true` is set
2. Check that your Aiven service is running
3. Verify the hostname and port are correct

### Import Errors

If the import fails:

1. Check if your SQL file has `CREATE DATABASE` statements - remove them
2. Make sure you're importing into `defaultdb`
3. Check for any MySQL version compatibility issues

### Connection Timeout

Aiven free tier may have connection limits. If you get timeouts:

1. Reduce `connectionLimit` in `config/db.js` to 5
2. Check Aiven dashboard for service status
3. Verify your IP isn't blocked

## Next Steps

After successful deployment:

1. Update your frontend's API URL to your Vercel backend URL
2. Test all endpoints (auth, posts, etc.)
3. Monitor Vercel logs for any errors
4. Set up proper error tracking (optional: Sentry, LogRocket)
