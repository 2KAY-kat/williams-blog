# Node.js Backend Migration Walkthrough

I have successfully converted your PHP/Slim backend to a Node.js/Express backend. The new backend is located in the `server` directory at the project root.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed
- MySQL running (Laragon's MySQL is fine)

### 2. Setup
The project is already set up with dependencies installed.

```bash
cd server
npm install # (Already done)
```

### 3. Configuration
The `.env` file has been created with your database settings:
- **DB_HOST**: localhost
- **DB_USER**: root
- **DB_PASSWORD**: (empty)
- **DB_NAME**: williams_blog_db
- **JWT_SECRET**: (Same as PHP version)
- **PORT**: 3000

### 4. Running the Server
To start the server in development mode (with auto-reload):

```bash
npm run dev
```

To start in production mode:

```bash
npm start
```

The server will run on `http://localhost:3000`.

## 🔄 Switching Backends

### Frontend Configuration
To switch your frontend to use the Node.js backend, update your frontend's API base URL.

**Current (PHP):**
`http://williams-blog.test` (or similar)

**New (Node.js):**
`http://localhost:3000`

### API Endpoints
The API endpoints have been replicated to match the PHP version:

| Feature | Method | Endpoint |
|---------|--------|----------|
| **Auth** | POST | `/auth/register` |
| | POST | `/auth/login` |
| | POST | `/admin/change-password` |
| | GET | `/blogger` |
| | PUT | `/blogger` |
| **Posts** | GET | `/public/posts` |
| | GET | `/public/post/:id` |
| | GET | `/posts` (Protected) |
| | GET | `/posts/:id` (Protected) |
| | POST | `/posts` (Protected) |
| | PUT | `/posts/:id` (Protected) |
| | DELETE | `/posts/:id` (Protected) |
| **Other** | GET | `/categories` |

## 🛠 Implementation Details
- **Framework**: Express.js
- **Database**: mysql2 (using connection pool)
- **Authentication**: jsonwebtoken (JWT) + bcryptjs
- **File Uploads**: Multer (saves to `../public/uploads` to share with PHP if needed)
- **CORS**: Configured to allow your frontend origins.

## ✅ Verification
The server is currently running and connected to the database. You can test it using Postman or your frontend application.
