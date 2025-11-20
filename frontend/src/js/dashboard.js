import { showToast } from './toast.js';
import { BASE_API_URL } from './utils.js';

const token = localStorage.getItem('auth_token');
if (!token) {
    window.location.href = '../auth/signup.html';
}

let bloggerId = null;
try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    bloggerId = payload.data.id;
} catch (e) {
    console.error("Invalid token format:", e);
    localStorage.removeItem('auth_token');
    window.location.href = '../auth/signup.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const views = document.querySelectorAll('.view');
    const navLinks = document.querySelectorAll('.nav-link');
    const modal = document.getElementById('post-modal');
    const closeBtn = document.querySelector('.close');
    const postForm = document.getElementById('post-form');
    const addPostBtn = document.getElementById('add-post-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.id === 'logout-btn') return;
            e.preventDefault();
            
            const view = link.dataset.view;
            const viewTitle = view === 'posts' ? 'My Posts' : view.charAt(0).toUpperCase() + view.slice(1);
            document.getElementById('page-title').textContent = viewTitle;
            
            // Hide all views
            views.forEach(v => {
                v.classList.remove('active');
            });
            
            // Show selected view
            const targetView = document.getElementById(`${view}-view`);
            if (targetView) {
                targetView.classList.add('active');
            }
            
            // Update active nav link
            navLinks.forEach(n => n.classList.remove('active'));
            link.classList.add('active');
            
            // Load data based on view
            if (view === 'posts') {
                loadPosts();
            } else if (view === 'profile') {
                loadProfile();
            }
        });
    });

    // Modal
    addPostBtn.addEventListener('click', () => openModal());
    closeBtn.addEventListener('click', () => closeModal());
    window.addEventListener('click', (e) => { 
        if (e.target === modal) closeModal(); 
    });

    // Forms
    postForm.addEventListener('submit', handlePostSubmit);

    // Logout
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('auth_token');
        showToast('Logged out successfully.', 'success');
        setTimeout(() => window.location.href = '../auth/signup.html', 1000);
    });

    // Initial load
    loadCategories();
    loadPosts();
});

async function loadPosts() {
    const list = document.getElementById('posts-container');
    list.innerHTML = '<p style="padding: 2rem; text-align: center;">Loading posts...</p>';
    
    try {
        const res = await fetch(`${BASE_API_URL}/posts?blogger_id=${bloggerId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || `HTTP Error: ${res.status}`);
        }
        
        const posts = await res.json();
        
        if (!Array.isArray(posts)) {
            throw new Error('Invalid response format: expected array');
        }

        // Clear loading message
        list.innerHTML = '';
        
        if (posts.length === 0) {
            list.innerHTML = '<p style="padding: 2rem; text-align: center; grid-column: 1/-1;">No posts yet. Create your first post!</p>';
            return;
        }
        
        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'post-card';
            
            const postId = post.postid;
            const title = post.title || 'Untitled';
            const preview = post.content_preview || 'No preview available';
            const createdDate = new Date(post.created_at).toLocaleDateString();
            const isPublished = post.ispublished === 1 || post.ispublished === true;
            
            card.innerHTML = `
                <h3 class="posts-heading-prev">${title}</h3> 
                <p class="posts-content-prev">${preview}</p>
                <div class="details-meta">
                  <small>${createdDate}</small>
                  <span class="status ${isPublished ? 'published' : 'draft'}">
                    ${isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div class="actions">
                    <button class="btn-edit" data-id="${postId}">Edit</button>
                    <button class="btn-delete" data-id="${postId}">Delete</button>
                </div>
            `;
            list.appendChild(card);
        });

        // Add event listeners to buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editPost(btn.dataset.id));
        });
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deletePost(btn.dataset.id));
        });
        
        console.log(`Successfully loaded ${posts.length} posts`);
    } catch (err) {
        console.error('Error loading posts:', err);
        list.innerHTML = `<p style="padding: 2rem; text-align: center; grid-column: 1/-1; color: #dc3545;">Error: ${err.message}</p>`;
    }
}

let allCategories = [];
async function loadCategories() {
    try {
        const res = await fetch(`${BASE_API_URL}/categories`);

        if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
        
        allCategories = await res.json();
        
        if (!Array.isArray(allCategories)) {
            throw new Error('Categories response is not an array');
        }
        
        console.log(`Successfully loaded ${allCategories.length} categories`);
    } catch (err) {
        console.error('Failed to load categories:', err);
        showToast('Failed to load categories.', 'error');
    }
}

function openModal(post = null) {
    const modal = document.getElementById('post-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('post-form');
    
    // Reset form
    form.reset();
    form.postid.value = ''; 
    document.querySelector('.btn-text').textContent = 'Save Post';

    // Categories Checkbox Logic
    const container = document.getElementById('categories-checkboxes');
    const postCategoryNames = post?.categories || []; 

    container.innerHTML = allCategories.map(cat => {
        const isChecked = postCategoryNames.includes(cat.name);
        
        return `
            <label>
                <input type="checkbox" class="category-checkbox" name="categories" value="${cat.category_id}" 
                ${isChecked ? 'checked' : ''}>
                ${cat.name}
            </label>
        `;
    }).join('');
    
    const currentImageUrlInput = document.getElementById('current-image-url');
    const imageFileInput = document.getElementById('image-file-input');
    const previewText = document.getElementById('image-preview-text');

    // Reset file input and preview text
    imageFileInput.value = '';
    previewText.style.display = 'none';
    currentImageUrlInput.value = '';

    // Fill in post data for editing
    if (post) {
        title.textContent = 'Edit Post';
        form.title.value = post.title || '';
        form.content.value = post.content || '';
        form.ispublished.checked = post.ispublished === 1 || post.ispublished === true; 
        form.postid.value = post.postid;

        const imageUrl = post.main_image_url;
        if (imageUrl) {
            currentImageUrlInput.value = imageUrl;
            previewText.textContent = `Current image: ${imageUrl.split('/').pop()}`;
            previewText.style.display = 'block';
        }
    } else {
        title.textContent = 'Add New Post';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('post-modal').style.display = 'none';
}

async function handlePostSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.btn-spinner');

    submitBtn.disabled = true;
    btnText.textContent = 'Saving...';
    spinner.style.display = 'inline-block';

    try {
        const formData = new FormData();

        // 1. Gather text and checkbox data
        formData.append('title', form.title.value.trim());
        formData.append('content', form.content.value.trim());
        formData.append('is_published', form.ispublished.checked ? 1 : 0);
        
        // 2. Add categories (as IDs)
        const selectedCategories = Array.from(form.querySelectorAll('input[name="categories"]:checked'))
            .map(cb => parseInt(cb.value));
        selectedCategories.forEach(catId => formData.append('categories[]', catId));

        // 3. Handle Image Upload or Existing URL
        const fileInput = document.getElementById('image-file-input');
        const currentImageUrl = document.getElementById('current-image-url').value;

        if (fileInput.files.length > 0) {
            formData.append('image_file', fileInput.files[0]);
        } else if (currentImageUrl) {
            formData.append('main_image_url', currentImageUrl);
        }
        
        const postId = form.postid.value;
        const url = postId 
            ? `${BASE_API_URL}/posts/${postId}` 
            : `${BASE_API_URL}/posts`;

        if (postId) {
            formData.append('_method', 'PUT');
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const result = await res.json();
        
        if (!res.ok) {
            throw new Error(result.error || 'Failed to save post');
        }

        showToast(`Post ${postId ? 'updated' : 'created'} successfully!`, 'success');
        closeModal();
        loadPosts();
    } catch (err) {
        console.error('Error submitting post:', err);
        showToast(`Error: ${err.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        btnText.textContent = 'Save Post';
        spinner.style.display = 'none';
    }
}

async function editPost(postId) {
    try {
        const res = await fetch(`${BASE_API_URL}/posts/${postId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to fetch post');
        }
        
        const post = await res.json();
        openModal(post);
    } catch (err) {
        console.error('Error editing post:', err);
        showToast(`Error: ${err.message}`, 'error');
    }
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
        const res = await fetch(`${BASE_API_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to delete post');
        }
        
        showToast('Post deleted successfully.', 'success');
        loadPosts();
    } catch (err) {
        console.error('Error deleting post:', err);
        showToast(`Error: ${err.message}`, 'error');
    }
}

async function loadProfile() {
    try {
        const res = await fetch(`${BASE_API_URL}/blogger`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to load profile');
        }
        
        const user = await res.json();
        
        const form = document.getElementById('profile-form');
        form.full_name.value = user.full_name || '';
        form.email.value = user.email || '';
        
        // Remove any existing submit listeners to prevent duplicates
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // Add single submit listener
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const data = {
                    full_name: newForm.full_name.value.trim(),
                    email: newForm.email.value.trim()
                };
                
                const updateRes = await fetch(`${BASE_API_URL}/blogger`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json', 
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });
                
                if (!updateRes.ok) {
                    const err = await updateRes.json();
                    throw new Error(err.error || 'Update failed');
                }
                
                showToast('Profile updated successfully!', 'success');
            } catch (err) {
                console.error('Error updating profile:', err);
                showToast(`Error: ${err.message}`, 'error');
            }
        });
    } catch (err) {
        console.error('Error loading profile:', err);
        showToast(`Error: ${err.message}`, 'error');
    }
}