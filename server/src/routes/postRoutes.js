const express = require('express');
const router = express.Router();
const postController = require('../controllers/PostController');
const authMiddleware = require('../middleware/AuthMiddleware');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/uploads'));
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);
        const basename = crypto.randomBytes(8).toString('hex');
        cb(null, basename + extension);
    }
});

const upload = multer({ storage: storage });

// Public Routes
router.get('/public/posts', (req, res) => postController.publicIndex(req, res));
router.get('/public/post/:id', (req, res) => postController.publicSinglePost(req, res));

// Protected Routes
router.get('/posts', authMiddleware, (req, res) => postController.index(req, res));
router.get('/posts/:id', authMiddleware, (req, res) => postController.show(req, res));
router.post('/posts', authMiddleware, upload.single('image_file'), (req, res) => postController.store(req, res));
router.put('/posts/:id', authMiddleware, upload.single('image_file'), (req, res) => postController.update(req, res));
router.delete('/posts/:id', authMiddleware, (req, res) => postController.destroy(req, res));

// Categories Route (Simple enough to be here or in a separate controller, putting here for now as per PHP index.php)
router.get('/categories', async (req, res) => {
    const db = require('../../config/db');
    try {
        const [rows] = await db.query("SELECT category_id, name FROM categories ORDER BY name");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

module.exports = router;
