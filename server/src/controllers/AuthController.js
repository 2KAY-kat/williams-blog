const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/AuthRepository');
const db = require('../../config/db'); // Needed for direct DB checks if not in repo (e.g. username check)

class AuthController {
    
    generateUsernameFromEmail(email) {
        const localPart = email.split('@')[0];
        // Remove special chars, keep letters, numbers, underscore, dots
        let username = localPart.replace(/[^A-Za-z0-9_.]/g, '');
        return (username || 'user').toLowerCase();
    }

    async register(req, res) {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields: name, email, or password.' });
        }

        try {
            // Check if email already exists
            const existingUser = await authRepository.findByCredentials(email);
            if (existingUser) {
                return res.status(409).json({ error: 'Email address is already registered.' });
            }

            // Auto-generate Username
            let username = this.generateUsernameFromEmail(email);

            // Check if generated username already exists (Direct DB query as per PHP logic)
            // Ideally this should be in repository, but following PHP structure
            const [userRows] = await db.execute("SELECT blogger_id FROM blogger WHERE username = ?", [username]);
            if (userRows.length > 0) {
                username = username + Math.floor(Math.random() * (999 - 100 + 1) + 100);
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const bloggerId = await authRepository.createBlogger(username, email, passwordHash, name);

            if (!bloggerId) {
                return res.status(500).json({ error: 'Registration failed. Please try again.' });
            }

            // Generate JWT
            const token = this.generateToken({
                id: bloggerId,
                username: username,
                full_name: name,
                email: email
            });

            res.status(201).json({
                message: 'Registration successful.',
                token: token,
                blogger: {
                    id: bloggerId,
                    username: username,
                    full_name: name,
                    email: email
                }
            });

        } catch (error) {
            console.error("Register Error:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async login(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing required fields: email or password.' });
        }

        try {
            const blogger = await authRepository.findByCredentials(email);

            if (!blogger || !(await bcrypt.compare(password, blogger.password_hash))) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }

            // Generate JWT
            const token = this.generateToken({
                id: blogger.blogger_id,
                username: blogger.username,
                full_name: blogger.full_name,
                email: blogger.email
            });

            res.status(200).json({
                message: 'Login successful.',
                token: token,
                blogger: {
                    id: blogger.blogger_id,
                    username: blogger.username,
                    full_name: blogger.full_name,
                    email: blogger.email
                }
            });

        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async changePassword(req, res) {
        const bloggerData = req.blogger; // From middleware
        const bloggerId = bloggerData ? bloggerData.id : null;

        if (!bloggerId) {
            return res.status(401).json({ error: 'Unauthorised. User ID not found in token.' });
        }

        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ error: 'Both current and new passwords are required.' });
        }

        if (new_password.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
        }

        try {
            const blogger = await authRepository.findBloggerById(bloggerId);

            if (!blogger || !(await bcrypt.compare(current_password, blogger.password_hash))) {
                return res.status(400).json({ error: 'The current password is incorect' });
            }

            const newHash = await bcrypt.hash(new_password, 10);
            const success = await authRepository.updatePassword(bloggerId, newHash);

            if (success) {
                res.status(200).json({ message: 'Password updated successfully' });
            } else {
                res.status(500).json({ error: 'Failed to update password.' });
            }

        } catch (error) {
            console.error("Change Password Error:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    generateToken(data) {
        const secretKey = process.env.JWT_SECRET || 'qxKKq7HbkDCEMCG2YffE6bzquzET7FqZ1SchXU93n3E';
        const issuer = process.env.JWT_ISSUER || 'williams-blog-api';
        
        return jwt.sign({
            iss: issuer,
            data: data
        }, secretKey, { expiresIn: '1h' });
    }
}

module.exports = new AuthController();
