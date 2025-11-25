import { showToast } from './toast.js';
import { BASE_API_URL } from './utils.js';

const POSTS_PER_PAGE = 7;
let currentOffset = 0;
let hasMorePosts = true;
let allLoadedPosts = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchPublicPosts();
    setupLoadMoreListener();
});

function setupLoadMoreListener() {
    const loadMoreButton = document.getElementById('load-more-button');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', loadMorePosts);
    }
}

function renderFeaturedPost(post) {
    const container = document.getElementById('featured-story-container');

    if (!post) {
        container.innerHTML = '<p class="loading-featured">No featured story available.</p>';
        return;
    }

    let imageUrl = `${BASE_API_URL}/uploads/placeholder.png`;
    
    if (post.main_image_url) {
        imageUrl = BASE_API_URL + post.main_image_url; 
    }
    
    const categories = post.categories && post.categories.length > 0 
        ? post.categories[0] 
        : 'General'; 
    
    const date = new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const excerpt = post.content_preview || 'Discover what\'s new in this featured article.';

    container.innerHTML = `
        <div class="featured-image-wrapper">
            <img 
                src="${imageUrl}" 
                alt="${post.title}" 
                class="featured-image"
                onerror="this.onerror=null; this.src='${BASE_API_URL}/uploads/placeholder.png';"
            />
        </div>
        <div class="featured-content">
            <span class="featured-category"><i class="fas fa-tag"></i>${categories}</span>
            <h1 class="featured-title">
                <a href="./post/post.html?id=${post.postid}" title="${post.title}">
                    ${post.title}
                </a>
            </h1>
            <p class="featured-excerpt">${excerpt}</p>
            <div class="featured-meta">
                <span class="author">
                    <i class="fas fa-user"></i> 
                    ${post.author_name}
                </span>
                <span class="date">
                    <i class="fas fa-calendar-alt"></i> 
                    ${date}
                </span>
            </div>
            <a href="./post/post.html?id=${post.postid}" class="featured-btn">
                <i class="fas fa-arrow-right"></i> Read Full Article
            </a>
        </div>
    `;
}

function renderPostCards(posts, append = false) {
    const container = document.getElementById('posts-container');
    
    if (!append) {
        container.innerHTML = '';
    }

    if (posts.length === 0 && !append) {
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
    const loadingOverlay = document.getElementById('page-loading-overlay');
    
    try {
        const response = await fetch(`${BASE_API_URL}/public/posts?limit=${POSTS_PER_PAGE}&offset=0`);
        
        if (!response.ok) {
            throw new Error(`API returned status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
            allLoadedPosts = result.data;
            const featuredPost = allLoadedPosts[0];
            const remainingPosts = allLoadedPosts.slice(1);

            renderFeaturedPost(featuredPost);
            renderPostCards(remainingPosts);
            
            // Update pagination state
            hasMorePosts = result.pagination.hasMore;
            currentOffset = POSTS_PER_PAGE;
            
            // Show/hide load more button based on hasMore flag
            if (loadMoreButton) {
                loadMoreButton.style.display = hasMorePosts ? 'inline-flex' : 'none';
            }
        } else {
            renderFeaturedPost(null);
            postsContainer.innerHTML = '<p class="text-center text-gray-500">No blog posts published yet. Check back soon!</p>';
            if (loadMoreButton) loadMoreButton.style.display = 'none';
        }

    } catch (error) {
        console.error('Error fetching posts:', error);
        
        postsContainer.innerHTML = '<p class="text-center text-gray-500">Failed to load articles. Please try reloading the page.</p>';
        if (loadMoreButton) loadMoreButton.style.display = 'none';
        
        showToast('Could not connect to the server. Try reloading.', 'error');
    } finally {
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }
}

async function loadMorePosts() {
    const loadMoreButton = document.getElementById('load-more-button');
    
    if (!hasMorePosts) {
        showToast('No more articles to load', 'info');
        return;
    }

    // Disable button while loading
    if (loadMoreButton) {
        loadMoreButton.disabled = true;
        loadMoreButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>  Loading...';
    }

    try {
        const response = await fetch(
            `${BASE_API_URL}/public/posts?limit=${POSTS_PER_PAGE}&offset=${currentOffset}`
        );
        
        if (!response.ok) {
            throw new Error(`API returned status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
            // Append new posts to existing ones
            allLoadedPosts = [...allLoadedPosts, ...result.data];
            renderPostCards(result.data, true); // true = append mode
            
            // Update pagination state
            hasMorePosts = result.pagination.hasMore;
            currentOffset += result.data.length;
            
            // Update button visibility
            if (loadMoreButton) {
                if (hasMorePosts) {
                    loadMoreButton.disabled = false;
                    loadMoreButton.innerHTML = 'Load more';
                    loadMoreButton.style.display = 'inline-flex';
                } else {
                    loadMoreButton.style.display = 'none';
                    showToast('All articles have been loaded', 'success');
                }
            }
        } else {
            hasMorePosts = false;
            if (loadMoreButton) {
                loadMoreButton.style.display = 'none';
                loadMoreButton.disabled = false;
                loadMoreButton.innerHTML = 'Load more';
            }
            showToast('No more articles to load', 'info');
        }

    } catch (error) {
        console.error('Error loading more posts:', error);
        showToast('Failed to load more articles. Please try again.', 'error');
        
        // Re-enable button
        if (loadMoreButton) {
            loadMoreButton.disabled = false;
            loadMoreButton.innerHTML = 'Load more';
        }
    }
}

function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    let imageUrl = `${BASE_API_URL}/uploads/placeholder.png`;

    if (post.thumbnail_url) {
        imageUrl = BASE_API_URL + post.thumbnail_url;
    } else if (post.main_image_url) {
        imageUrl = BASE_API_URL + post.main_image_url; 
    }
    
    const categories = post.categories && post.categories.length > 0 
        ? post.categories.join(', ') 
        : 'Uncategorized';
    
    const date = new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const excerpt = post.content_preview || 'No preview available';

    card.innerHTML = `
        <img 
            src="${imageUrl}" 
            alt="${post.title}" 
            class="post-card-image" 
            onerror="this.onerror=null; this.src='${BASE_API_URL}/uploads/placeholder.png'"  
        />
        <div class="post-card-body">
            <h3>
                <a href="./post/post.html?id=${post.postid}" title="${post.title}">
                    ${post.title}
                </a>
            </h3>
            <p>${excerpt}</p>
            <div class="post-card-meta">
                <span class="author">${post.author_name}</span>
                <span class="date">
                    <i class="fas fa-calendar-alt"></i> 
                    ${date}
                </span>
                <span class="category">
                    <i class="fas fa-tag"></i> 
                    ${categories}
                </span>
            </div>
        </div>
    `;
    
    return card;
}