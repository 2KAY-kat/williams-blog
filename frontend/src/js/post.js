import { showToast } from './toast.js'; 
import { BASE_API_URL } from './utils.js'; 

// Calculate reading time based on word count
function calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
}

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
    const postReadingTimeEl = document.getElementById('post-reading-time');
    const postImageEl = document.getElementById('post-image');
    const postContentEl = document.getElementById('post-content');
    const errorMessageText = document.getElementById('error-message-text');
    
    // Helper function to show error state
    const displayError = (message) => {
        if (skeletonState) skeletonState.style.display = 'none';
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
        
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
    
    const endpoint = `${BASE_API_URL}/public/post/${postId}`;

    try {
        const response = await fetch(endpoint);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ 
                message: 'Failed to parse error response.' 
            }));
            displayError(`Post not found (Status ${response.status}). ${error.message || 'Check the console for details.'}`);
            return;
        }

        const result = await response.json();
        const post = result.data || result;
        
        pageTitle.textContent = `${post.title || 'Post'} | Williams Kaphika`;
        postTitleEl.textContent = post.title || 'Untitled Post';
        
        // Category
        postCategoryEl.textContent = Array.isArray(post.categories) && post.categories.length > 0
            ? post.categories[0].toUpperCase()
            : 'GENERAL';
        
        // Author
        postAuthorEl.innerHTML = `<i class="fas fa-user"></i> ${post.author_name || 'Anonymous Author'}`;
        
        // Date
        const formattedDate = post.created_at 
            ? new Date(post.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
            : 'N/A';
        postDateEl.innerHTML = `<i class="fas fa-calendar-alt"></i> ${formattedDate}`;
        
        // Content - inject first to calculate reading time
        const contentHtml = post.post_content || post.content || '<p>No content available for this post.</p>';
        postContentEl.innerHTML = contentHtml;
        
        // Calculate and display reading time
        const readingTime = calculateReadingTime(contentHtml);
        postReadingTimeEl.innerHTML = `<i class="fas fa-clock"></i> ${readingTime} min read`;
        
        // Image
        if (post.main_image_url) {
            postImageEl.src = BASE_API_URL + post.main_image_url;
        } else {
            postImageEl.src = `${BASE_API_URL}uploadsplaceholder.png`;
            //postImageEl.style.display = 'none'; //src = `https://placehold.co/800x400/cccccc/333333?text=${encodeURIComponent(post.title || 'Article')}`;
        }

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