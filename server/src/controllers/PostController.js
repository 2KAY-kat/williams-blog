const postRepository = require('../repositories/PostRepository');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class PostController {

    async index(req, res) {
        const bloggerId = req.query.blogger_id;
        const user = req.blogger;

        if (parseInt(bloggerId) !== user.id) {
            return res.status(403).json({ error: 'Unauthorized or invalid blogger ID requested.' });
        }

        try {
            const posts = await postRepository.findByBloggerId(parseInt(bloggerId));
            res.json(posts);
        } catch (error) {
            console.error("Post Index Error:", error);
            res.status(500).json({ error: 'Failed to load posts: ' + error.message });
        }
    }

    async show(req, res) {
        const postId = parseInt(req.params.id);
        const user = req.blogger;

        try {
            const post = await postRepository.findByIdAndBlogger(postId, user.id);
            if (!post) {
                return res.status(404).json({ error: 'Post not found or unauthorized' });
            }
            res.json(post);
        } catch (error) {
            console.error("Post Show Error:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async store(req, res) {
        const user = req.blogger;
        const bloggerId = user.id;
        
        // req.body contains text fields, req.file contains the file
        const data = req.body;

        if (!bloggerId) {
            return res.status(401).json({ error: 'Invalid or missing blogger ID in token' });
        }

        if (!data.title || !data.content) {
            return res.status(400).json({ error: 'Title and content required' });
        }

        try {
            const imageUrl = this.handleFileUpload(req);
            data.main_image_url = imageUrl;
            
            // In Node/Express with Multer, array fields might come differently.
            // If categories is sent as JSON string or individual fields.
            // Assuming standard FormData: categories might be '1,2' or array.
            // PostRepository handles parsing.

            const postId = await postRepository.create(data, bloggerId);
            res.status(201).json({ message: 'Post created', postid: postId });
        } catch (error) {
            console.error("Post Store Error:", error);
            res.status(500).json({ error: 'Failed to create post: ' + error.message });
        }
    }

    async update(req, res) {
        const postId = parseInt(req.params.id);
        const user = req.blogger;
        const data = req.body;

        if (!data.title || !data.content) {
            return res.status(400).json({ error: 'Title and content required' });
        }

        try {
            const imageUrl = this.handleFileUpload(req);
            data.main_image_url = imageUrl;

            const success = await postRepository.update(postId, data, user.id);
            
            if (!success) {
                return res.status(404).json({ error: 'Post not found or unauthorized' });
            }
            res.json({ message: 'Post updated' });
        } catch (error) {
            console.error("Post Update Error:", error);
            res.status(500).json({ error: 'Update failed: ' + error.message });
        }
    }

    async destroy(req, res) {
        const postId = parseInt(req.params.id);
        const user = req.blogger;

        try {
            const deleted = await postRepository.delete(postId, user.id);
            
            if (!deleted) {
                return res.status(404).json({ error: 'Post not found or unauthorized' });
            }
            res.json({ message: 'Post deleted successfully' });
        } catch (error) {
            console.error("Post Delete Error:", error);
            res.status(500).json({ error: 'Post deletion failed: ' + error.message });
        }
    }

    async publicIndex(req, res) {
        try {
            let limit = req.query.limit ? parseInt(req.query.limit) : 7;
            let offset = req.query.offset ? parseInt(req.query.offset) : 0;

            // Validation
            limit = Math.max(1, Math.min(limit, 100));
            offset = Math.max(0, offset);

            const posts = await postRepository.findPublishedPosts(limit, offset);
            const totalPosts = await postRepository.countPublishedPosts();
            const hasMore = (offset + limit) < totalPosts;

            res.json({
                success: true,
                data: posts,
                pagination: {
                    limit,
                    offset,
                    total: totalPosts,
                    hasMore
                }
            });
        } catch (error) {
            console.error("Public Index Error:", error);
            res.status(500).json({ success: false, error: 'Failed to retrieve posts: ' + error.message });
        }
    }

    async publicSinglePost(req, res) {
        try {
            const postId = req.params.id ? parseInt(req.params.id) : null;
            if (!postId) {
                return res.status(400).json({ success: false, error: 'Missing post ID.' });
            }

            const post = await postRepository.fetchSinglePost(postId);

            if (!post) {
                return res.status(404).json({ success: false, error: 'Post not found.' });
            }

            res.json({ success: true, data: post });
        } catch (error) {
            console.error("Public Single Post Error:", error);
            res.status(500).json({ success: false, error: 'Failed to retrieve the post.' });
        }
    }

    handleFileUpload(req) {
        if (req.file) {
            // Multer has already saved the file if configured, but here we might want to rename it or just return the path.
            // If we use multer.diskStorage, it's already there.
            // Let's assume we configure multer in the route to save to public/uploads
            // and req.file.filename gives us the name.
            return '/uploads/' + req.file.filename;
        }
        
        // If no new file, check if existing URL is provided
        if (req.body.main_image_url) {
            return req.body.main_image_url;
        }
        
        return null;
    }
}

module.exports = new PostController();
