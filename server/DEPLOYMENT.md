# Deploying to Vercel

Your Node.js backend is now configured to deploy to Vercel as a serverless application.

## Prerequisites

1. **Database**: You need a hosted MySQL database. Free options:
   - **Aiven** (https://aiven.io) - Free MySQL tier
   - **PlanetScale** (https://planetscale.com) - Free MySQL-compatible database
   - **Railway** (https://railway.app) - Free MySQL with $5 monthly credit

2. **Vercel Account**: Sign up at https://vercel.com (free)

## Deployment Steps

### 1. Set Up Your Database

Choose one of the database providers above and create a free MySQL database. Note down:
- Host
- Port
- Database name
- Username
- Password

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to the server directory
cd server

# Deploy
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set up environment variables (see below)
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Set the **Root Directory** to `server`
4. Add environment variables (see below)
5. Click **Deploy**

### 3. Configure Environment Variables

In Vercel Dashboard (Settings → Environment Variables), add:

```
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
JWT_SECRET=your-jwt-secret-key
JWT_ISSUER=williams-blog-api
PORT=3000
```

**Important**: Use the same `JWT_SECRET` from your local `.env` file to ensure tokens work across environments.

### 4. Update Frontend

Once deployed, Vercel will give you a URL like `https://your-backend.vercel.app`.

Update your frontend's API base URL to point to this new backend URL.

### 5. Update CORS (if needed)

If your frontend is at a specific Vercel URL (not using wildcard), add it to the `allowedOrigins` array in `index.js`:

```javascript
const allowedOrigins = [
    "http://localhost:5173",
    "https://your-frontend.vercel.app", // Add your frontend URL
    // ...
];
```

## File Uploads Note

⚠️ **Important**: Vercel's serverless functions have a **read-only filesystem**. 

Your current file upload implementation saves files to `public/uploads`, which **won't work on Vercel**.

### Solutions:

1. **Use a Cloud Storage Service** (Recommended):
   - **Cloudinary** (free tier) - Image hosting with transformations
   - **AWS S3** - Object storage
   - **Vercel Blob** - Vercel's own storage solution

2. **Alternative**: Deploy to a platform with persistent storage:
   - **Render** (https://render.com) - Free tier with persistent disk
   - **Railway** (https://railway.app) - Free tier with persistent storage

## Testing

After deployment, test your endpoints:

```bash
# Test database connection
curl https://your-backend.vercel.app/test-db

# Test public posts
curl https://your-backend.vercel.app/public/posts
```

## Troubleshooting

- **Database connection errors**: Check your environment variables
- **CORS errors**: Verify your frontend URL is in the allowed origins
- **File upload errors**: See "File Uploads Note" above
- **Function timeout**: Vercel has a 10-second timeout on free tier

## Alternative: Render Deployment

If you need file uploads or prefer a traditional server, consider **Render**:

1. Go to https://render.com
2. Create a new "Web Service"
3. Connect your Git repository
4. Set root directory to `server`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables
8. Deploy

Render's free tier includes:
- Persistent disk storage (file uploads work)
- No function timeouts
- Auto-sleep after 15 minutes of inactivity
