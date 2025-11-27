const db = require('../../config/db');

class PostRepository {
    
    async findByBloggerId(bloggerId) {
        const sql = `
            SELECT 
                p.post_id,
                p.blogger_id,
                p.title,
                p.content,
                p.main_image_url,
                p.created_at,
                p.updated_at,
                p.is_published,
                b.full_name AS author_name,
                GROUP_CONCAT(c.name) AS category_names
            FROM posts p
            JOIN blogger b ON p.blogger_id = b.blogger_id
            LEFT JOIN post_categories pc ON p.post_id = pc.post_id
            LEFT JOIN categories c ON pc.category_id = c.category_id
            WHERE p.blogger_id = ?
            GROUP BY p.post_id
            ORDER BY p.created_at DESC
        `;
        
        const [posts] = await db.execute(sql, [bloggerId]);
        
        return posts.map(post => this.processPost(post));
    }

    async findByIdAndBlogger(postId, bloggerId) {
        const sql = `
            SELECT 
                p.post_id, p.blogger_id, p.title, p.content, p.main_image_url, 
                p.created_at, p.updated_at, p.is_published,
                b.full_name AS author_name, 
                GROUP_CONCAT(c.name) AS category_names 
            FROM posts p
            JOIN blogger b ON p.blogger_id = b.blogger_id
            LEFT JOIN post_categories pc ON p.post_id = pc.post_id
            LEFT JOIN categories c ON pc.category_id = c.category_id
            WHERE p.post_id = ? AND p.blogger_id = ?
            GROUP BY p.post_id
        `;
        
        const [rows] = await db.execute(sql, [postId, bloggerId]);
        if (rows.length === 0) return null;
        
        return this.processPost(rows[0]);
    }

    async create(data, bloggerId) {
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            const sql = `
                INSERT INTO posts (blogger_id, title, content, main_image_url, is_published, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            `;
            
            const [result] = await connection.execute(sql, [
                bloggerId,
                data.title,
                data.content,
                data.main_image_url || null,
                data.is_published ? 1 : 0
            ]);
            
            const postId = result.insertId;
            
            await this.syncCategories(connection, postId, data.categories || []);
            
            await connection.commit();
            return postId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async update(postId, data, bloggerId) {
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            const sql = `
                UPDATE posts SET 
                    title = ?,
                    content = ?,
                    main_image_url = ?, 
                    is_published = ?, 
                    updated_at = NOW()
                WHERE post_id = ? AND blogger_id = ?
            `;
            
            const [result] = await connection.execute(sql, [
                data.title,
                data.content,
                data.main_image_url || null,
                data.is_published ? 1 : 0,
                postId,
                bloggerId
            ]);
            
            if (result.affectedRows === 0) {
                // Check if it failed because it doesn't exist or unauthorized
                // But for now just rollback and return false
                await connection.rollback();
                return false;
            }
            
            await this.syncCategories(connection, postId, data.categories || []);
            
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async delete(postId, bloggerId) {
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            await connection.execute("DELETE FROM post_categories WHERE post_id = ?", [postId]);
            
            const [result] = await connection.execute("DELETE FROM posts WHERE post_id = ? AND blogger_id = ?", [postId, bloggerId]);
            
            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async findPublishedPosts(limit = 7, offset = 0) {
        // limit and offset must be integers
        limit = parseInt(limit);
        offset = parseInt(offset);

        const sql = `
            SELECT 
                p.post_id, p.blogger_id, p.title, p.content, p.main_image_url, 
                p.created_at, p.updated_at, p.is_published,
                b.full_name AS author_name, 
                GROUP_CONCAT(c.name) AS category_names
            FROM posts p
            JOIN blogger b ON p.blogger_id = b.blogger_id
            LEFT JOIN post_categories pc ON p.post_id = pc.post_id
            LEFT JOIN categories c ON pc.category_id = c.category_id
            WHERE p.is_published = 1                      
            GROUP BY p.post_id
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        // Use db.query instead of db.execute to avoid potential issues with LIMIT parameters in prepared statements
        const [posts] = await db.query(sql, [limit, offset]);
        return posts.map(post => this.processPost(post));
    }

    async countPublishedPosts() {
        const [rows] = await db.execute("SELECT COUNT(*) as total FROM posts WHERE is_published = 1");
        return rows[0].total;
    }

    async fetchSinglePost(postId) {
        const sql = `
            SELECT 
                p.post_id, p.blogger_id, p.title, p.content, p.main_image_url, 
                p.created_at, p.updated_at, p.is_published,
                b.full_name AS author_name, 
                GROUP_CONCAT(c.name) AS category_names
            FROM posts p
            JOIN blogger b ON p.blogger_id = b.blogger_id
            LEFT JOIN post_categories pc ON p.post_id = pc.post_id
            LEFT JOIN categories c ON pc.category_id = c.category_id
            WHERE p.post_id = ? AND p.is_published = 1
            GROUP BY p.post_id
        `;
        
        const [rows] = await db.execute(sql, [postId]);
        if (rows.length === 0) return null;
        
        const post = this.processPost(rows[0]);
        // Specific format for single post view in PHP:
        // $post['post_content'] = $post['content'];
        post.post_content = post.content;
        delete post.content;
        return post;
    }

    // Helper to sync categories
    async syncCategories(connection, postId, categoryIds) {
        // Ensure categoryIds is an array
        if (!Array.isArray(categoryIds)) {
             // If it's a string (e.g. "1,2"), split it
             if (typeof categoryIds === 'string') {
                 categoryIds = categoryIds.split(',').map(id => id.trim()).filter(id => id);
             } else {
                 categoryIds = [];
             }
        }

        await connection.execute("DELETE FROM post_categories WHERE post_id = ?", [postId]);
        
        for (const catId of categoryIds) {
            await connection.execute("INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)", [postId, catId]);
        }
    }

    // Helper to format post object to match PHP output
    processPost(post) {
        const processed = {
            ...post,
            postid: post.post_id,
            bloggerid: post.blogger_id,
            ispublished: post.is_published,
            categories: post.category_names ? post.category_names.split(',') : [],
            content_preview: post.content.substring(0, 150) + '...'
        };

        // Remove old keys
        delete processed.post_id;
        delete processed.blogger_id;
        delete processed.is_published;
        delete processed.category_names;
        
        return processed;
    }
}

module.exports = new PostRepository();
