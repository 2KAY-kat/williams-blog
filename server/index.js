const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./src/routes/authRoutes');
const postRoutes = require('./src/routes/postRoutes');
const db = require('./config/db');

const app = express();

// CORS Configuration
const allowedOrigins = [
    "http://localhost:5173",
    "http://williams-blog.test",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://williamskaphika.vercel.app",
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.replit.dev') || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Accept", "Origin"],
    credentials: false
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('method-override')('_method'));

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1+1 AS result');
        res.json({ success: true, result: rows[0].result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Mount routes
// Note: PHP had /auth/register, /auth/login, /admin/..., /posts
// We need to map them correctly.

// Auth routes (handles /register, /login, /admin/..., /blogger)
// In PHP: $app->group('/auth', ...) -> /auth/register
// In PHP: $app->group('/admin', ...) -> /admin/change-password
// In PHP: $app->group('', ...) -> /blogger

// To match PHP structure exactly, we might need to be specific in mounting or adjust the route files.
// My authRoutes.js has:
// /register
// /login
// /admin/test-auth
// /admin/change-password
// /blogger

// So if I mount it at /, it will be:
// /register (Wait, PHP was /auth/register)
// /login (Wait, PHP was /auth/login)

// I need to adjust authRoutes.js or mount it multiple times/ways.
// Let's adjust app.js to mount carefully.

// Actually, let's just mount them at root and ensure the paths in route files are correct.
// I'll update authRoutes.js to include /auth prefix for register/login if I didn't already.
// I checked authRoutes.js content I just wrote:
// router.post('/register', ...) -> This would be /register if mounted at /
// router.post('/login', ...) -> This would be /login if mounted at /

// PHP: /auth/register
// So I should mount authRoutes at /auth?
// But authRoutes also has /admin/... and /blogger.

// Better approach: Define exact paths in the router files to match PHP.
// I will rewrite authRoutes.js to have full paths or use multiple routers.
// For now, I will use a prefix in app.js for the auth specific ones if possible, but they are mixed.

// Let's just use the router as a root router and define full paths in it.
// I will update authRoutes.js in the next step to fix the paths to match PHP exactly.
// Wait, I can't edit it immediately after writing it in the same turn easily without confusion.
// I will write app.js now, and then do a quick fix on authRoutes.js if needed.
// Actually, I can just mount the same router at / and have the router define /auth/register.

app.use('/', authRoutes);
app.use('/', postRoutes);

const PORT = process.env.PORT || 10000;

// Only start server if not in serverless environment (Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel serverless
module.exports = app;
