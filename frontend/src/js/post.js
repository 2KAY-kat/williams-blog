import { showToast } from './toast.js'; 
import { BASE_API_URL } from './utils.js'; 

document.addEventListener('DOMContentLoaded', async function() {
    const loadingOverlay = document.getElementById('page-loading-overlay');
    const skeletonState = document.getElementById('skeleton-state');
    const errorState = document.getElementById('error-state');
    const postContainer = document.getElementById('post-container');
    const pageTitle = document.getElementById('page-title');

    const postTitleEl = document.getElementById('post-title'); 
    const postCategoryEl = document.getElementById('post-category');
    const postAuthorEl = document.getElementById('post-author');
    const postDateEl = document.getElementById('post-date');
    const postImageEl = document.getElementById('post-image');
    const postContentEl = document.getElementById('post-content');
    const errorMessageText = document.getElementById('error-message-text');
    
    // Helper function to show error state
    const displayError = (message) => {
        // Hide skeleton and loading overlay
        if (skeletonState) skeletonState.style.display = 'none';
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
        
        // Show error state
        if (errorState) errorState.style.display = 'block';
        errorMessageText.textContent = message;
        showToast(message, 'error');
    }

    // 1. Get the post ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        displayError('Error: No post ID provided in the URL.');
        return;
    }
    
    // API endpoint using the /api-v1 proxy prefix
    const endpoint = `${BASE_API_URL}/public/post/${postId}`;

    try {
        const response = await fetch(endpoint);

        if (!response.ok) {
            // Attempt to read the error message from the API response
            const error = await response.json().catch(() => ({ 
                message: 'Failed to parse error response.' 
            }));
            displayError(`Post not found (Status ${response.status}). ${error.message || 'Check the console for details.'}`);
            return;
        }

        const result = await response.json();
        const post = result.data || result; // support both {data: post} and direct post
        
        pageTitle.textContent = `${post.title || 'Post'} | Williams Kaphika`;
        postTitleEl.textContent = post.title || 'Untitled Post';
        // Show first category if available, else 'GENERAL'
        postCategoryEl.textContent = Array.isArray(post.categories) && post.categories.length > 0
            ? post.categories[0].toUpperCase()
            : 'GENERAL';
        postAuthorEl.innerHTML = `<i class="fas fa-user mr-2"></i> ${post.author_name || 'Anonymous Author'}`;
        postDateEl.innerHTML = `<i class="fas fa-calendar-alt mr-2"></i> ${post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}`;
        
        // Handle image: use placeholder if post.main_image_url is missing or invalid
        if (post.main_image_url) {
            postImageEl.src = BASE_API_URL + post.main_image_url;
        } else {
            postImageEl.src = `https://placehold.co/800x400/cccccc/333333?text=${encodeURIComponent(post.title || 'Article')}`;
        }
        
        // Content: use post_content or content
        postContentEl.innerHTML = post.post_content || post.content || '<p>No content available for this post.</p>';

        // Hide skeleton and loading overlay
        if (skeletonState) skeletonState.style.display = 'none';
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
        
        // Show post container
        postContainer.style.display = 'block';

    } catch (error) {
        console.error("Error fetching post:", error);
        displayError(`Network or server connection error: ${error.message}.`);
    }
});