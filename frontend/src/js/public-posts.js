import { showToast } from './toast.js';
import { BASE_API_URL } from './utils.js';

document.addEventListener('DOMContentLoaded', fetchPublicPosts);

function renderFeaturedPost(post) {
    const container = document.getElementById('featured-story-container');
    const loadingMessage = document.getElementById('loading-featured');
    
    if (loadingMessage) loadingMessage.remove();

    if (!post) {
        container.innerHTML = '<p class="loading-featured">No featured story available.</p>';
        return;
    }

    let imageUrl = 'https://placehold.co/800x400/222222/DDDDDD?text=Featured+Story';
    
    if (post.main_image_url) {
        imageUrl = BASE_API_URL + post.main_image_url; 
    }
    
    const categories = post.categories.length > 0 ? post.categories[0] : 'General'; 
    
    const date = new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    container.innerHTML = `
        <div class="featured-image-wrapper">
            <img src="${imageUrl}" alt="${post.title}" class="featured-image" 
                onerror="this.onerror=null; this.src='https://placehold.co/800x400/222222/DDDDDD?text=Image+Missing';">
        </div>
        <div class="featured-content">
            <p class="featured-category">${categories}</p>
            <a href="./post/post.html?id=${post.postid}" class="featured-title">${post.title}</a>
            <p class="featured-excerpt">${post.content_preview}</p>
            <div class="featured-meta">
                <span class="author"><i class="fas fa-user"></i> ${post.author_name}</span>
                <span class="date"><i class="fas fa-calendar-alt"></i> ${date}</span>
            </div>
        </div>
    `;
}

function renderPostCards(posts) {
    const container = document.getElementById('posts-container');
    container.innerHTML = '';

    if (posts.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No other articles published yet.</p>';
        return;
    }
    
    posts.forEach(post => {
        container.appendChild(createPostCard(post));
    });
}

async function fetchPublicPosts() {
    const postsContainer = document.getElementById('posts-container');
    const loadMoreButton = document.getElementById('load-more-button');
    
    postsContainer.innerHTML = '<p id="grid-loading-status">Loading latest articles...</p>';
    
    try {
        const response = await fetch(`${BASE_API_URL}/public/posts`);
        
        if (!response.ok) {
            throw new Error(`API returned status: ${response.status}`);
        }

        const result = await response.json();
        
        const loadingGridMessage = document.getElementById('grid-loading-status');
        if (loadingGridMessage) loadingGridMessage.remove();

        if (result.success && result.data && result.data.length > 0) {
            const allPosts = result.data;
            const featuredPost = allPosts[0];
            const remainingPosts = allPosts.slice(1);

            renderFeaturedPost(featuredPost);
            renderPostCards(remainingPosts);
            
            if (loadMoreButton) loadMoreButton.style.display = 'block';

        } else {
            renderFeaturedPost(null);
            postsContainer.innerHTML = '<p class="text-center text-gray-500">No blog posts published yet. Check back soon!</p>';
            if (loadMoreButton) loadMoreButton.style.display = 'none';
        }

    } catch (error) {
        console.error('Error fetching posts:', error);
        
        const featuredLoading = document.getElementById('loading-featured');
        if (featuredLoading) featuredLoading.textContent = 'Failed to load featured story';
        
        const loadingGridMessage = document.getElementById('grid-loading-status');
        if (loadingGridMessage) loadingGridMessage.remove();
        
        postsContainer.innerHTML = 'Failed to load articles ...';
        if (loadMoreButton) loadMoreButton.style.display = 'none';
        
        showToast('Could not connect to the sever. Try reloading.', 'error');
    }
}

function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    let imageUrl = 'https://placehold.co/600x400/2A2A2A/DDDDDD?text=No+Image';

    if (post.thumbnail_url) {
        imageUrl = BASE_API_URL + post.thumbnail_url;
    } else if (post.main_image_url) {
        imageUrl = BASE_API_URL + post.main_image_url; 
    }
    
    const categories = post.categories && post.categories.length > 0 ? post.categories.join(', ') : 'Uncategorized';
    
    const date = new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    card.innerHTML = `
        <img src="${imageUrl}" alt="${post.title}" class="post-card-image" onerror="this.onerror=null; this.src='https://placehold.co/600x400/2A2A2A/DDDDDD?text=Image+Missing';"/>
        <div class="post-card-body">
            <h3><a href="./post/post.html?id=${post.postid}" class="text-accent">${post.title}</a></h3>
            <p>
                ${post.content_preview}
            </p>
        <div class="post-card-meta">
        <div class="author">
            
           <!-- // <i class="fas fa-user"></i> --> ${post.author_name}
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