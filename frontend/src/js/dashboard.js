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
    // If token is invalid/malformed, redirect
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
            document.getElementById('page-title').textContent = view === 'posts' ? 'My Posts' : 'Profile';
            views.forEach(v => v.style.display = 'none');
            document.getElementById(`${view}-view`).style.display = 'block';
            navLinks.forEach(n => n.classList.remove('active'));
            link.classList.add('active');
            if (view === 'posts') loadPosts();
            if (view === 'profile') loadProfile();
        });
    });

    // Modal
    addPostBtn.addEventListener('click', () => openModal());
    closeBtn.addEventListener('click', () => closeModal());
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

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
    loadPosts();
    loadCategories();
});

async function loadPosts() {
    const list = document.getElementById('posts-list');
    list.innerHTML = '<p>Loading posts...</p>';
    try {
        const res = await fetch(`${BASE_API_URL}/posts?blogger_id=${bloggerId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // The endpoint returns an array directly, not an object with 'success'
        const posts = await res.json();
        
        if (!res.ok) {
            // Check if the response is an object with an error key
            throw new Error(posts.error || 'Failed to load posts');
        }

        list.innerHTML = posts.length ? '' : '<p>No posts yet. Create your first!</p>';
        
        posts.forEach(post => {
            const div = document.createElement('div');
            div.className = 'post-card';
            
            const postId = post.postid; 
            
            div.innerHTML = `
                <h3>${post.title}</h3>
                <p><small>Created: ${new Date(post.created_at).toLocaleDateString()}</small></p>
                <p><strong>Status:</strong> <span class="status ${post.ispublished ? 'published' : 'draft'}">
                    ${post.ispublished ? 'Published' : 'Draft'}
                </span></p>
                <div class="actions">
                    <button class="btn-edit" data-id="${postId}">Edit</button>
                    <button class="btn-delete" data-id="${postId}">Delete</button>
                </div>
            `;
            list.appendChild(div);
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editPost(btn.dataset.id));
        });
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deletePost(btn.dataset.id));
        });
    } catch (err) {
        list.innerHTML = `<p class="error">Error: ${err.message}</p>`;
    }
}

let allCategories = [];
async function loadCategories() {
    try {
        const res = await fetch(`${BASE_API_URL}/categories`);

        // The endpoint is likely returning a simple array of category objects: [{id: 1, name: 'All'}, ...]
        allCategories = await res.json(); 
        
        if (!res.ok) throw new Error('Failed to fetch categories');
        
    } catch (err) {
        console.error('Failed to load categories', err);
        showToast('Failed to load categories.', 'error');
    }
}

function openModal(post = null) {
    const modal = document.getElementById('post-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('post-form');
    form.reset();
    form.postid.value = ''; 
    document.querySelector('.btn-text').textContent = 'Save Post';

    // Categories Checkbox Logic
    const container = document.getElementById('categories-checkboxes');
    // When editing, the post object contains an array of category NAMES (strings)
    const postCategoryNames = post?.categories || []; 

    container.innerHTML = allCategories.map(cat => {
        const isChecked = postCategoryNames.includes(cat.name);
        
        return `
            <label>
                <input type="checkbox" name="categories" value="${cat.category_id}" 
                ${isChecked ? 'checked' : ''}>
                ${cat.name}
            </label>
        `;
    }).join('');
    
    // Fill in post data for editing
    if (post) {
        title.textContent = 'Edit Post';
        form.title.value = post.title;
        form.content.value = post.content;
        form.main_image_url.value = post.main_image_url || '';
        form.ispublished.checked = post.ispublished === 1; 
        form.postid.value = post.postid; 
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

    const data = {
        title: form.title.value,
        content: form.content.value,
        main_image_url: form.main_image_url.value,
        is_published: form.ispublished.checked ? 1 : 0, 
        categories: Array.from(form.querySelectorAll('input[name="categories"]:checked'))
            .map(cb => parseInt(cb.value)) 
    };

    const postId = form.postid.value; 
    
    const method = postId ? 'PUT' : 'POST';
    const url = postId 
        ? `${BASE_API_URL}/posts/${postId}` 
        : `${BASE_API_URL}/posts`;

    try {
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        // Check if status is in the success range (200s)
        if (!res.ok) throw new Error(result.error || 'Failed to save post');

        showToast(`Post ${postId ? 'updated' : 'created'} successfully!`, 'success');
        closeModal();
        loadPosts();
    } catch (err) {
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
        
        // The PostController::show returns the post object directly
        const post = await res.json(); 
        
        if (!res.ok) throw new Error(post.error || 'Failed to fetch post for edit');
        
        openModal(post); 
    } catch (err) {
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
        
        // The endpoint returns 200/204 on success, or an error object on failure
        if (!res.ok) {
             const result = await res.json();
             throw new Error(result.error || 'Failed to delete');
        }
        
        showToast('Post deleted.', 'success');
        loadPosts();
    } catch (err) {
        showToast(`Error: ${err.message}`, 'error');
    }
}

async function loadProfile() {
    try {
        const res = await fetch(`${BASE_API_URL}/blogger`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const user = await res.json();
        
        if (!res.ok) throw new Error(user.error || 'Failed to load profile');
        
        const form = document.getElementById('profile-form');
        form.full_name.value = user.full_name;
        form.email.value = user.email;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                full_name: form.full_name.value,
                email: form.email.value
            };
            const updateRes = await fetch(`${BASE_API_URL}/blogger`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (updateRes.ok) {
                showToast('Profile updated!', 'success');
            } else {
                const err = await updateRes.json();
                showToast(err.error || 'Update failed', 'error');
            }
        });
    } catch (err) {
        showToast('Failed to load profile: ' + err.message, 'error');
    }
}