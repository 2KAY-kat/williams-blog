const db = require('../../config/db');

class AuthRepository {
    async findByCredentials(email) {
        try {
            const [rows] = await db.execute('SELECT * FROM blogger WHERE email = ?', [email]);
            return rows[0] || false;
        } catch (error) {
            console.error("AuthRepository Error (findByCredentials):", error.message);
            return false;
        }
    }

    async createBlogger(username, email, passwordHash, fullName) {
        try {
            const sql = `INSERT INTO blogger (username, email, password_hash, full_name) 
                         VALUES (?, ?, ?, ?)`;
            const [result] = await db.execute(sql, [username, email, passwordHash, fullName]);
            return result.insertId;
        } catch (error) {
            console.error("AuthRepository Error (createBlogger):", error.message);
            return false;
        }
    }

    async findBloggerById(id) {
        try {
            const sql = "SELECT blogger_id, password_hash FROM blogger WHERE blogger_id = ? LIMIT 1";
            const [rows] = await db.execute(sql, [id]);
            return rows[0] || false;
        } catch (error) {
            console.error("AuthRepository Error (findBloggerById):", error.message);
            return false;
        }
    }

    async updatePassword(id, newPasswordHash) {
        try {
            const sql = "UPDATE blogger SET password_hash = ? WHERE blogger_id = ?";
            const [result] = await db.execute(sql, [newPasswordHash, id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Password update error:", error.message);
            return false;
        }
    }
}

module.exports = new AuthRepository();
