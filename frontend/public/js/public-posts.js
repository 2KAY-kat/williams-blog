import { showToast } from './toast.js';

const BASE_API_URL = 'http://williams-blog.test';

document.addEventListener('DOMContentLoaded', fetchPublicPosts);

/**
 * Fetches all published blog posts from the API and renders them.
 */
async function fetchPublicPosts() {
    const container = document.getElementById('posts-container');
    const loadingMessage = document.getElementById('loading-message');

    // Ensure container is empty before loading
    container.innerHTML = '';
    
    // Display loading state
    const loadingElement = document.createElement('p');
    loadingElement.id = 'loading-message';
    loadingElement.textContent = 'Loading latest articles...';
    loadingElement.className = 'text-center text-gray-500';
    container.appendChild(loadingElement);

    try {
        const response = await fetch(`${BASE_API_URL}/posts/public`);
        
        if (!response.ok) {
            throw new Error(`API returned status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
            
            // Remove loading message
            loadingElement.remove();
            
            result.data.forEach(post => {
                container.appendChild(createPostCard(post));
            });
            
        } else {
            // No posts found or empty response
            loadingElement.textContent = 'No blog posts published yet. Check back soon!';
        }

    } catch (error) {
        console.error('Error fetching posts:', error);
        loadingElement.textContent = 'Failed to load posts. Check server status.';
        showToast('Could not connect to the blog API.', 'error');
    }
}

/**
 * Creates a single post card DOM element.
 * @param {object} post - The post data object.
 */
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    // Placeholder image logic: use post's image or a default.
    const imageUrl = post.main_image_url || 'https://placehold.co/600x400/2A2A2A/DDDDDD?text=No+Image';
    const categories = post.categories ? post.categories.split(',').join(', ') : 'Uncategorized';
    
    // Formatting the date
    const date = new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    card.innerHTML = `
        <img src="${imageUrl}" alt="${post.title}" class="post-card-image" onerror="this.onerror=null; this.src='https://placehold.co/600x400/2A2A2A/DDDDDD?text=Image+Missing';">
        <div class="post-card-body">
            <h3><a href="#" class="text-accent">${post.title}</a></h3>
            <p>${post.content_preview}...</p>
            <div class="post-card-meta">
                <span class="author"><i class="fas fa-user"></i> ${post.author_name}</span>
                <span class="date"><i class="fas fa-calendar-alt"></i> ${date}</span>
            </div>
            <div class="post-card-meta mt-2">
                <span class="categories"><i class="fas fa-tags"></i> ${categories}</span>
            </div>
        </div>
    `;
    return card;
}