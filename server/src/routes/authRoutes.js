const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/AuthMiddleware');

router.post('/auth/register', (req, res) => authController.register(req, res));
router.post('/auth/login', (req, res) => authController.login(req, res));

// Admin routes protected by auth middleware
router.get('/admin/test-auth', authMiddleware, (req, res) => {
    res.json({ message: 'Auth OK', user: req.blogger });
});

router.post('/admin/change-password', authMiddleware, (req, res) => authController.changePassword(req, res));

// Blogger profile routes (from PHP group '')
router.get('/blogger', authMiddleware, (req, res) => {
    const user = req.blogger;
    res.json({
        full_name: user.full_name,
        email: user.email,
        username: user.username
    });
});

router.put('/blogger', authMiddleware, async (req, res) => {
    const db = require('../../config/db');
    const user = req.blogger;
    const { full_name, email } = req.body;

    if (!full_name || !email) {
        return res.status(400).json({ error: 'Name and email required' });
    }

    try {
        await db.execute("UPDATE blogger SET full_name = ?, email = ? WHERE blogger_id = ?", [full_name, email, user.id]);
        res.json({ message: 'Profile updated' });
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
