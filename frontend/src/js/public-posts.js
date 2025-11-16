import { showToast } from './toast.js';
import { BASE_API_URL } from './utils.js';

document.addEventListener('DOMContentLoaded', fetchPublicPosts);

/**
 * Renders the featured story into the dedicated section.
 * @param {object} post - The featured post data object.
 */
function renderFeaturedPost(post) {
    const container = document.getElementById('featured-story-container');
    const loadingMessage = document.getElementById('loading-featured');
    
    // Remove loading message
    if (loadingMessage) loadingMessage.remove();

    if (!post) {
        container.innerHTML = '<p class="loading-featured">No featured story available.</p>';
        return;
    }

    // Use main_image_url for the large featured image
    const imageUrl = post.main_image_url || 'https://placehold.co/800x400/222222/DDDDDD?text=Featured+Story';
    
    // FIX: Using the first category ID for display, as your backend returns IDs
    const categories = post.categories.length > 0 ? post.categories[0] : 'General'; 
    
    const date = new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    // FIX: Uses post.author_name and post.content_preview provided by the backend
    container.innerHTML = `
        <div class="featured-image-wrapper">
            <img src="${imageUrl}" alt="${post.title}" class="featured-image" 
                 onerror="this.onerror=null; this.src='https://placehold.co/800x400/222222/DDDDDD?text=Image+Missing';">
        </div>
        <div class="featured-content">
            <p class="featured-category">${categories}</p>
            <a href="#" class="featured-title">${post.title}</a>
            <p class="featured-excerpt">${post.content_preview}</p>
            <div class="featured-meta">
                <span class="author"><i class="fas fa-user"></i> ${post.author_name}</span>
                <span class="date"><i class="fas fa-calendar-alt"></i> ${date}</span>
            </div>
        </div>
    `;
}

/**
 * Renders a list of posts into the main grid.
 * @param {Array<object>} posts - Array of post data objects.
 */
function renderPostCards(posts) {
    const container = document.getElementById('posts-container');
    container.innerHTML = ''; // Clear existing content

    if (posts.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No other articles published yet.</p>';
        return;
    }
    
    posts.forEach(post => {
        container.appendChild(createPostCard(post));
    });
}


/**
 * Fetches all published blog posts from the API, sets the featured one, and renders the rest.
 */
async function fetchPublicPosts() {
    const postsContainer = document.getElementById('posts-container');
    const loadMoreButton = document.getElementById('load-more-button');
    
    // FIX: Use a unique ID for the temporary grid loading message
    postsContainer.innerHTML = '<p id="grid-loading-status">Loading latest articles...</p>';
    
    try {
        const response = await fetch(`${BASE_API_URL}/public/posts`);
        
        if (!response.ok) {
            throw new Error(`API returned status: ${response.status}`);
        }

        const result = await response.json();
        
        // FIX: Target the unique temporary loading ID for removal
        const loadingGridMessage = document.getElementById('grid-loading-status');
        if (loadingGridMessage) loadingGridMessage.remove();

        if (result.success && result.data && result.data.length > 0) {
            const allPosts = result.data;
            const featuredPost = allPosts[0]; // Assume the first post is the featured one
            const remainingPosts = allPosts.slice(1); // The rest of the posts

            // 1. Render the featured story
            renderFeaturedPost(featuredPost);

            // 2. Render the remaining posts in the grid
            renderPostCards(remainingPosts);
            
            // Show the load more button if there are more than 1 posts
            if (loadMoreButton) loadMoreButton.style.display = 'block';

        } else {
            // No posts found or empty response
            renderFeaturedPost(null); // Show no featured story
            postsContainer.innerHTML = '<p class="text-center text-gray-500">No blog posts published yet. Check back soon!</p>';
            if (loadMoreButton) loadMoreButton.style.display = 'none';
        }

    } catch (error) {
        console.error('Error fetching posts:', error);
        
        // Ensure UI reflects error state for both sections
        const featuredLoading = document.getElementById('loading-featured');
        if (featuredLoading) featuredLoading.textContent = 'Failed to load featured story. Check API.';
        
        // Ensure the temporary loading message is removed before displaying the error
        const loadingGridMessage = document.getElementById('grid-loading-status');
        if (loadingGridMessage) loadingGridMessage.remove();
        
        postsContainer.innerHTML = 'Failed to load articles. Check server status.';
        if (loadMoreButton) loadMoreButton.style.display = 'none';
        
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
    
    // Use main_image_url as a fallback since thumbnail_url is not in the schema
    const imageUrl = post.thumbnail_url || post.main_image_url || 'https://placehold.co/600x400/2A2A2A/DDDDDD?text=No+Image';
    
    // FIX: Show categories as comma-separated IDs (or names if implemented)
    const categories = post.categories && post.categories.length > 0 ? post.categories.join(', ') : 'Uncategorized';
    
    // Formatting the date
    const date = new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    // FIX: Uses post.author_name and post.content_preview
    card.innerHTML = `
        <img src="${imageUrl}" alt="${post.title}" class="post-card-image" onerror="this.onerror=null; this.src='https://placehold.co/600x400/2A2A2A/DDDDDD?text=Image+Missing';"/>
        <div class="post-card-body">
            <h3><a href="#" class="text-accent">${post.title}</a></h3>
            <p>
                ${post.content_preview}
            </p>
        <div class="post-card-meta">
        <div class="author">
            <i class="fas fa-user"></i> 
            ${post.author_name}
        </div>
            <span class="date">
            <i class="fas fa-calendar-alt"></i> 
            ${date}</span>
        <div class="category">
            <i class="fas fa-tags"></i> 
            ${categories}
        </div>
        </div>
        </div>
    `;
    return card;
}