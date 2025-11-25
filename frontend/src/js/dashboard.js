import { showToast } from './toast.js';
import { BASE_API_URL } from './utils.js';

// import tinymce from 'tinymce/tinymce';  

const token = localStorage.getItem('auth_token');
if (!token) {
    window.location.href = '../auth/signup.html';
}

let bloggerId = null;
let currentEditingPost = null;

let postToDelete = null;


function showLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.remove('hidden');
    }
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}

// starts here 
// Initialize TinyMCE editor for the write textarea
// Initialize editor
/**
export function initializeTinyMCE() {
  return new Promise((resolve, reject) => {
    try {
      // Destroy existing instance
      if (tinymce.get("post-content-editor")) {
        tinymce.get("post-content-editor").remove();
      }

      tinymce.init({
        selector: "#post-content-editor",
        plugins: [
          "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
          "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
          "insertdatetime", "media", "table", "help", "wordcount"
        ],
        toolbar:
          "undo redo | formatselect | bold italic underline | " +
          "alignleft aligncenter alignright | bullist numlist outdent indent | " +
          "link image media | code | removeformat | help",
        menubar: false,
        height: 420,
        branding: false,
        content_style: `
          body { font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; line-height: 1.8; }
          h2 { font-size: 1.4rem; }
        `,
        setup: (editor) => {
          editor.on('init', () => {
            console.log('TinyMCE editor initialized');
            resolve(editor);
          });
        }
      });
    } catch (err) {
      console.error('TinyMCE init error:', err);
      reject(err);
    }
  });
}

function destroyTinyMCE() {
    try {
        const editor = tinymce.get('post-content-editor');
        if (editor) {
            editor.remove();
            console.log('TinyMCE editor destroyed');
        }
    } catch (err) {
        console.warn('TinyMCE destroy error:', err);
    }
}
*/
//ends here 
try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    bloggerId = payload.data.id;
} catch (e) {
    console.error("Invalid token format:", e);
    localStorage.removeItem('auth_token');
    window.location.href = '../auth/signup.html';
}

// State Management
const DASHBOARD_STATE_KEY = 'dashboard_active_view';

function saveActiveView(viewName) {
    try {
        localStorage.setItem(DASHBOARD_STATE_KEY, viewName);
    } catch (err) {
        console.warn('Failed to save active view:', err);
    }
}

function getActiveView() {
    try {
        const saved = localStorage.getItem(DASHBOARD_STATE_KEY);
        return saved || 'home'; // Default to 'home' if not found
    } catch (err) {
        console.warn('Failed to retrieve active view:', err);
        return 'home';
    }
}

function switchView(viewName, navLinks) {
    const views = document.querySelectorAll('.view');
    const targetView = document.getElementById(`${viewName}-view`);
    
    if (!targetView) {
        console.error(`View ${viewName}-view not found`);
        return;
    }
    /*
    // Destroy TinyMCE before switching away from write view
    if (viewName !== 'write') {
        destroyTinyMCE();
    }
    */
    // Hide all views
    views.forEach(v => {
        v.classList.remove('active');
    });
    
    // Show selected view
    targetView.classList.add('active');
    
    // Update active nav link
    navLinks.forEach(link => {
        if (link.dataset.view === viewName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Update page title
    let viewTitle = 'Home';
    if (viewName === 'posts') viewTitle = 'My Posts';
    else if (viewName === 'write') viewTitle = 'Write';
    else if (viewName === 'profile') viewTitle = 'Profile';
    else if (viewName === 'subscribers') viewTitle = 'Subscribers';
    document.getElementById('page-title').textContent = viewTitle;
    
    // Save state
    saveActiveView(viewName);
    
    // Load data based on view
    if (viewName === 'posts') {
        loadPosts();
    } else if (viewName === 'profile') {
        loadProfile();
    } else if (viewName === 'write') {
        // Use currentEditingPost if available, otherwise null for new post
        initializeWriteView(currentEditingPost);
        currentEditingPost = null; // Clear after use
    }
}

document.addEventListener('DOMContentLoaded', () => {
 // Hide spinner after page loads
    hideLoadingSpinner();
    
    const navLinks = document.querySelectorAll('.nav-link');
    const postForm = document.getElementById('post-form');
    const addPostBtn = document.getElementById('add-post-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const closeWriteBtn = document.getElementById('close-write-btn');
    const cancelPostBtn = document.getElementById('cancel-post-btn');


    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.id === 'logout-btn') return;
            e.preventDefault();
            
            const view = link.dataset.view;
            switchView(view, navLinks);
        });
    });

    // Add Post Button
    addPostBtn.addEventListener('click', () => {
        switchView('write', navLinks);
    });

    // Close Write View
    closeWriteBtn.addEventListener('click', () => {
        switchView('posts', navLinks);
    });

    cancelPostBtn.addEventListener('click', () => {
        switchView('posts', navLinks);
    });

    // Forms
    postForm.addEventListener('submit', handlePostSubmit);

    // Event delegation for post actions (edit/delete) - SINGLE listener
    document.addEventListener('click', (e) => {
        // Handle edit button clicks
        if (e.target.closest('.btn-edit')) {
            e.preventDefault();
            const postCard = e.target.closest('.post-card');
            const postIdAttr = postCard?.dataset.postId;
            
            if (postIdAttr) {
                editPost(parseInt(postIdAttr));
            }
        }
        
        // Handle delete button clicks
        if (e.target.closest('.btn-delete')) {
            e.preventDefault();
            const postCard = e.target.closest('.post-card');
            const postIdAttr = postCard?.dataset.postId;
            
            if (postIdAttr) {
                deletePost(parseInt(postIdAttr));
            }
        }
    });
    
    // Logout
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('auth_token');
        localStorage.removeItem(DASHBOARD_STATE_KEY);
        showToast('Logged out successfully.', 'success');
        setTimeout(() => window.location.href = '../auth/signup.html', 1000);
    });

    // Initial load
    loadCategories();
    
    loadBloggerGreeting();
    
    // Load dashboard stats
    loadDashboardStats();
    
    // Onboarding card button handlers
    document.querySelectorAll('.onboarding-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            switchView(action, navLinks);
        });
    });
    // Restore previous active view or default to home
    const savedView = getActiveView();
    switchView(savedView, navLinks);

    // Delete modal handlers
    const deleteModal = document.getElementById('delete-modal');
    const deleteCancelBtn = document.getElementById('delete-cancel-btn');
    const deleteConfirmBtn = document.getElementById('delete-confirm-btn');

    if (deleteCancelBtn) {
        deleteCancelBtn.addEventListener('click', hideDeleteModal);
    }

    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                hideDeleteModal();
            }
        });
    }

    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', async () => {
            if (!postToDelete) return;

            const originalHTML = deleteConfirmBtn.innerHTML;
            deleteConfirmBtn.disabled = true;
            deleteConfirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            try {
                const res = await fetch(`${BASE_API_URL}/posts/${postToDelete}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Delete failed');
                }

                showToast('Post deleted successfully!', 'success');
                hideDeleteModal();
                loadPosts(); // Reload posts list
            } catch (err) {
                console.error('Error deleting post:', err);
                showToast(`Error: ${err.message}`, 'error');
            } finally {
                deleteConfirmBtn.disabled = false;
                deleteConfirmBtn.innerHTML = originalHTML;
            }
        });
    }

    // REMOVED: Duplicate event delegation for delete buttons

    // ...existing code...
});

function initializeWriteView(post = null) {
    const form = document.getElementById('post-form');
    const writeTitle = document.getElementById('write-title');
    const writeSubtitle = document.getElementById('write-subtitle');
    
    // Reset form
    form.reset();
    form.postid.value = '';
    document.querySelector('.btn-text').textContent = 'Save Post';

    if (post) {
        writeTitle.textContent = 'Edit Post';
        writeSubtitle.textContent = 'Update your post';
        form.title.value = post.title || '';
        form.content.value = post.content || '';
        form.ispublished.checked = post.ispublished === 1 || post.ispublished === true;
        form.postid.value = post.postid;

        const imageUrl = post.main_image_url;
        if (imageUrl) {
            document.getElementById('current-image-url').value = imageUrl;
            document.getElementById('image-preview-text').textContent = `Current: ${imageUrl.split('/').pop()}`;
            document.getElementById('image-preview-text').style.display = 'block';
        }
    } else {
        writeTitle.textContent = 'New Post';
        writeSubtitle.textContent = 'Share your thoughts with the world';
        document.getElementById('image-preview-text').style.display = 'none';
    }

    // Categories
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

    // Ensure DOM is ready before initializing TinyMCE
    const editorElement = document.getElementById('post-content-editor');
    if (!editorElement) {
        console.error('Editor element not found in DOM');
        showToast('Editor failed to load', 'error');
        return;
    }
/*
    // Initialize TinyMCE editor with proper async handling
    initializeTinyMCE()
        .then((editor) => {
            // Always set content after init, whether new or edit
            const contentToSet = post?.content || '';
            if (contentToSet) {
                editor.setContent(contentToSet);
                console.log('Post content loaded into editor');
            } else {
                editor.setContent('');
            }
        })
        .catch((err) => {
            console.error('Failed to initialize TinyMCE:', err);
            showToast('Editor failed to load. Using plain text mode.', 'warning');
            // Fallback: ensure textarea is visible
            if (editorElement) {
                editorElement.style.display = 'block';
            }
        }); */
}

async function loadPosts() {
    showLoadingSpinner();
    const list = document.getElementById('posts-container');
    
    try {
        const res = await fetch(`${BASE_API_URL}/posts?blogger_id=${bloggerId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to load posts');
        }
        
        const posts = await res.json();
        
        if (!Array.isArray(posts)) {
            throw new Error('Invalid posts data');
        }
        // Clear loading message
        list.innerHTML = '';
        
        if (posts.length === 0) {
            list.innerHTML = `
            <a href="#" class="addpost-card" onclick="document.getElementById(\'add-post-btn\').click(); return false;"> <div class="onboarding-card">
                <div class="card-icon write-icon">
                  <i class="fas fa-pen-fancy"></i>
                </div>
                <h3>Create Your First Post</h3>
                <!-- <p>Share your thoughts, ideas, and expertise with your audience</p>
                <button class="onboarding-btn" data-action="write">
                  Start Writing
                  <i class="fas fa-arrow-right"></i>
                </button> -->
              </div>
              </a>`;
            // '<p style="padding: 32px; text-align: center; grid-column: 1/-1;">No posts yet. <a href="#" onclick="document.getElementById(\'add-post-btn\').click(); return false;" style="color: var(--accent-color); text-decoration: none; font-weight: 600;">Create your first post</a></p>';
            hideLoadingSpinner();
            return;
        }

        const postsHTML = posts.map(post => `
            <div class="post-card" data-post-id="${post.postid}">
                <div class="post-card-header">
                    <h4 class="posts-heading-prev">${post.title}</h4>
                </div>
                <div class="post-card-body">
                    <p class="posts-content-prev">${post.content_preview || post.content}</p>
                </div>
                <div class="post-card-footer">
                    <div class="details-meta">
                        <small><i class="fas fa-calendar"></i> ${new Date(post.created_at).toLocaleDateString()}</small>
                        <span class="status ${post.ispublished ? 'published' : 'draft'}">
                            <i class="fas"></i> ${post.ispublished ? 'Published' : 'Draft'}
                        </span>
                    </div>
                    <div class="actions">
                        <button class="btn-edit" type="button" title="Edit post">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-delete" type="button" title="Delete post">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        list.innerHTML = postsHTML;
    } catch (err) {
        console.error('Error loading posts:', err);
        list.innerHTML = `<p style="padding: 32px; text-align: center; grid-column: 1/-1; color: #d32f2f;">Error loading posts: ${err.message}</p>`;
    } finally {
        hideLoadingSpinner();
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
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!submitBtn) {
        console.error('Submit button not found');
        return;
    }

    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.btn-spinner');

    // Set busy state
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Saving...';
    if (spinner) spinner.style.display = 'inline-block';

    try {
        // Get content from TinyMCE if available, otherwise from the textarea
        let contentValue = '';
        try {
            const editor = tinymce.get('post-content-editor');
            if (editor) {
                contentValue = editor.getContent();
                console.log('Content from TinyMCE editor');
            } else {
                contentValue = form.content.value || '';
                console.log('Content from textarea fallback');
            }
        } catch (err) {
            console.warn('Error getting TinyMCE content:', err);
            contentValue = form.content.value || '';
        }

        // Validate content: remove HTML tags and whitespace to ensure there is actual text
        const plain = contentValue.replace(/<[^>]+>/g, '').replace(/&nbsp;|\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
        if (!plain) {
            showToast('Post content cannot be empty.', 'error');
            // Restore button state and abort
            submitBtn.disabled = false;
            if (btnText) btnText.textContent = 'Save Post';
            if (spinner) spinner.style.display = 'none';
            return;
        }

        const formData = new FormData();

        // 1. Gather text and checkbox data
        formData.append('title', form.title.value.trim());
        formData.append('content', contentValue);
        formData.append('is_published', form.ispublished.checked ? 1 : 0);

        // 2. Add categories (as IDs)
        const selectedCategories = Array.from(form.querySelectorAll('input[name="categories"]:checked'))
            .map(cb => parseInt(cb.value));
        selectedCategories.forEach(catId => formData.append('categories[]', catId));

        // 3. Handle Image Upload or Existing URL
        const fileInput = document.getElementById('image-file-input');
        const currentImageUrl = document.getElementById('current-image-url');
        const imageUrl = currentImageUrl ? currentImageUrl.value : '';

        if (fileInput && fileInput.files.length > 0) {
            formData.append('image_file', fileInput.files[0]);
        } else if (imageUrl) {
            formData.append('main_image_url', imageUrl);
        }

        const postId = form.postid.value;
        const url = postId ? `${BASE_API_URL}/posts/${postId}` : `${BASE_API_URL}/posts`;

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

        // Destroy editor before switching views
        //destroyTinyMCE();

        // Reset form and return to posts
        form.reset();
        const navLinks = document.querySelectorAll('.nav-link');
        switchView('posts', navLinks);
        loadPosts();
    } catch (err) {
        console.error('Error submitting post:', err);
        showToast(`Error: ${err.message}`, 'error');
    } finally {
        // Always restore the submit button state
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Save Post';
        if (spinner) spinner.style.display = 'none';
    }
}

async function editPost(postId) {
    showLoadingSpinner();
    try {
        const res = await fetch(`${BASE_API_URL}/posts/${postId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to fetch post');
        }
        
        const post = await res.json();
        console.log('Editing post:', post);
        
        // Store the post globally before switching view
        currentEditingPost = post;
        
        // Switch to write view
        const navLinks = document.querySelectorAll('.nav-link');
        switchView('write', navLinks);
    } catch (err) {
        console.error('Error editing post:', err);
        showToast(`Error: ${err.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

async function deletePost(postId) {
    postToDelete = postId;
    
    try {
        const res = await fetch(`${BASE_API_URL}/posts/${postId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch post');
        
        const post = await res.json();
        
        // Populate modal with post info
        document.getElementById('delete-post-title').textContent = post.title;
        document.getElementById('delete-post-date').textContent = 
            `Created on ${new Date(post.created_at).toLocaleDateString()}`;
        
        // Show modal
        showDeleteModal();
    } catch (err) {
        console.error('Error fetching post:', err);
        showToast('Error loading post details', 'error');
    }
}

function showDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function hideDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    postToDelete = null;
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
        
        // Update profile header
        const displayName = document.getElementById('profile-display-name');
        const displayEmail = document.getElementById('profile-display-email');
        if (displayName) displayName.textContent = user.full_name || 'Blogger';
        if (displayEmail) displayEmail.textContent = user.email || '';
        
        // Fill account form
        const accountForm = document.getElementById('account-form');
        if (accountForm) {
            accountForm.full_name.value = user.full_name || '';
            accountForm.email.value = user.email || '';
            accountForm.username.value = user.username || '';
            accountForm.phone.value = user.phone || '';
            accountForm.bio.value = user.bio || '';
            accountForm.website.value = user.website || '';
            
            // Update char count
            updateBioCharCount();
        }

        // Setup event listeners for account form
        setupAccountFormListeners();
        setupSecurityFormListeners();
        setupPreferencesListeners();
        setupTabListeners();
        // setupAvatarUpload();

    } catch (err) {
        console.error('Error loading profile:', err);
        showToast(`Error: ${err.message}`, 'error');
    }
}

function setupTabListeners() {
    const tabButtons = document.querySelectorAll('.profile-tab-btn');
    const tabContents = document.querySelectorAll('.profile-tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Update active button
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

function setupAccountFormListeners() {
    const form = document.getElementById('account-form');
    if (!form) return;

    // Bio character counter
    const bioInput = form.bio;
    if (bioInput) {
        bioInput.addEventListener('input', updateBioCharCount);
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        try {
            const data = {
                full_name: form.full_name.value.trim(),
                email: form.email.value.trim(),
                username: form.username.value.trim(),
                phone: form.phone.value.trim() || null,
                bio: form.bio.value.trim() || null,
                website: form.website.value.trim() || null
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
            loadProfile(); // Reload profile data
        } catch (err) {
            console.error('Error updating profile:', err);
            showToast(`Error: ${err.message}`, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });

    // Reset button
    const resetBtn = document.getElementById('reset-account-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            loadProfile();
        });
    }
}

function setupSecurityFormListeners() {
    const toggleBtn = document.getElementById('toggle-password-form');
    const passwordForm = document.getElementById('password-form');
    const cancelBtn = document.getElementById('cancel-password-btn');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            passwordForm.classList.toggle('hidden');
            toggleBtn.textContent = passwordForm.classList.contains('hidden') 
                ? 'Change Password' 
                : 'Hide';
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            passwordForm.classList.add('hidden');
            if (toggleBtn) toggleBtn.textContent = 'Change Password';
            passwordForm.reset();
        });
    }

    // Password visibility toggles
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            const isPassword = input.type === 'password';
            
            input.type = isPassword ? 'text' : 'password';
            btn.innerHTML = isPassword 
                ? '<i class="fas fa-eye-slash"></i>' 
                : '<i class="fas fa-eye"></i>';
        });
    });

    // Password strength indicator
    const newPasswordInput = document.getElementById('new-password');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', updatePasswordStrength);
    }

    // Password form submission
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }

        const submitBtn = passwordForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

        try {
            const res = await fetch(`${BASE_API_URL}/admin/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Password update failed');
            }

            showToast('Password updated successfully!', 'success');
            passwordForm.reset();
            passwordForm.classList.add('hidden');
            document.getElementById('toggle-password-form').textContent = 'Change Password';
        } catch (err) {
            console.error('Error updating password:', err);
            showToast(`Error: ${err.message}`, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });

    // 2FA button
    const enable2faBtn = document.getElementById('enable-2fa-btn');
    if (enable2faBtn) {
        enable2faBtn.addEventListener('click', () => {
            showToast('Two-factor authentication is coming soon!', 'info');
        });
    }
}

function setupPreferencesListeners() {
    const preferencesForm = document.getElementById('preferences-form');
    if (preferencesForm) {
        preferencesForm.addEventListener('click', () => {
            showToast('Preference settings comming soon!', 'info');
        });
    }
   // if (!preferencesForm) return;

    // preferencesForm.addEventListener('submit', async (e) => {
    //     e.preventDefault();
        
    //     const preferences = {
    //         notify_comments: document.getElementById('notify-comments').checked,
    //         notify_subscribers: document.getElementById('notify-subscribers').checked,
    //         notify_weekly: document.getElementById('notify-weekly').checked,
    //         public_profile: document.getElementById('public-profile').checked,
    //         show_email: document.getElementById('show-email').checked
    //     };

    //     const submitBtn = preferencesForm.querySelector('button[type="submit"]');
    //     const originalText = submitBtn.innerHTML;
    //     submitBtn.disabled = true;
    //     submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    //     try {
    //         const res = await fetch(`${BASE_API_URL}/blogger/preferences`, {
    //             method: 'PUT',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 Authorization: `Bearer ${token}`
    //             },
    //             body: JSON.stringify(preferences)
    //         });

    //         if (!res.ok) {
    //             throw new Error('Failed to update preferences');
    //         }

    //         showToast('Preferences saved successfully!', 'success');
    //     } catch (err) {
    //         console.error('Error updating preferences:', err);
    //         showToast(`Error: ${err.message}`, 'error');
    //     } finally {
    //         submitBtn.disabled = false;
    //         submitBtn.innerHTML = originalText;
    //     }
    // });

    // Delete account button
    const deleteBtn = document.getElementById('delete-account-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {

            showToast('Account deletion is coming soon', 'info');

            // if (confirm('Are you absolutely sure? This action cannot be undone. All your posts and data will be permanently deleted.')) {
            //     if (confirm('Type your email to confirm deletion: ' + localStorage.getItem('blogger_email'))) {
            //         deleteAccountPermanently();
            //     }
            // }
        });
    }
}


/**
 * avatar upload id in place but am thinking of using gravatar like he does it on his wordpress powered blog
 */
// function setupAvatarUpload() {
//     const uploadBtn = document.getElementById('avatar-upload-btn');
//     const fileInput = document.getElementById('avatar-file-input');
    
//     if (uploadBtn) {
//         uploadBtn.addEventListener('click', () => fileInput.click());
//     }

//     if (fileInput) {
//         fileInput.addEventListener('change', async (e) => {
//             const file = e.target.files[0];
//             if (!file) return;

//             const formData = new FormData();
//             formData.append('avatar', file);

//             try {
//                 const res = await fetch(`${BASE_API_URL}/blogger/avatar`, {
//                     method: 'POST',
//                     headers: {
//                         Authorization: `Bearer ${token}`
//                     },
//                     body: formData
//                 });

//                 if (!res.ok) throw new Error('Failed to upload avatar');

//                 const data = await res.json();
//                 document.getElementById('profile-avatar-img').src = data.avatar_url;
//                 showToast('Avatar updated successfully!', 'success');
//             } catch (err) {
//                 console.error('Error uploading avatar:', err);
//                 showToast('Failed to upload avatar', 'error');
//             }
//         });
//     }
// }

function updateBioCharCount() {
    const bioInput = document.getElementById('profile-bio');
    const charCount = document.getElementById('bio-char-count');
    if (bioInput && charCount) {
        charCount.textContent = bioInput.value.length;
    }
}

function updatePasswordStrength() {
    const password = document.getElementById('new-password').value;
    const indicator = document.getElementById('strength-indicator');
    const text = document.getElementById('strength-text');

    let strength = 'Weak';
    let strengthClass = 'weak';

    if (password.length >= 8) {
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*]/.test(password);

        const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

        if (score >= 3) {
            strength = 'Strong';
            strengthClass = 'strong';
        } else if (score >= 2) {
            strength = 'Medium';
            strengthClass = 'medium';
        }
    }

    indicator.className = `strength-indicator ${strengthClass}`;
    text.textContent = `Password strength: ${strength}`;
}

// async function deleteAccountPermanently() {
    
//     // try {
//     //     const res = await fetch(`${BASE_API_URL}/blogger`, {
//     //         method: 'DELETE',
//     //         headers: {
//     //             Authorization: `Bearer ${token}`
//     //         }
//     //     });

//     //     if (!res.ok) throw new Error('Failed to delete account');

//     //     showToast('Account deleted successfully', 'success');
//     //     setTimeout(() => {
//     //         localStorage.removeItem('auth_token');
//     //         window.location.href = '../auth/signup.html';
//     //     }, 1500);
//     // } catch (err) {
//     //     console.error('Error deleting account:', err);
//     //     showToast('Failed to delete account', 'error');
//     // }
// }

async function loadBloggerGreeting() {
    try {
        const res = await fetch(`${BASE_API_URL}/blogger`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) return;
        
        const user = await res.json();
        const nameElement = document.getElementById('blogger-name');
        if (nameElement && user.full_name) {
            nameElement.textContent = user.full_name.split(' ')[0]; // First name only
        }
    } catch (err) {
        console.error('Error loading blogger name:', err);
    }
}


async function loadDashboardStats() {
    try {
        const res = await fetch(`${BASE_API_URL}/posts?blogger_id=${bloggerId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) return;
        
        const posts = await res.json();
        
        if (!Array.isArray(posts)) return;
        
        const totalPosts = posts.length;
        const publishedPosts = posts.filter(p => p.ispublished === 1 || p.ispublished === true).length;
        
        // Update stat elements
        const statsPostsEl = document.getElementById('stat-posts');
        const statsPublishedEl = document.getElementById('stat-published');
        
        if (statsPostsEl) statsPostsEl.textContent = totalPosts;
        if (statsPublishedEl) statsPublishedEl.textContent = publishedPosts;
        
        // Load subscriber count
        loadSubscriberCount();
    } catch (err) {
        console.error('Error loading dashboard stats:', err);
    }
}

async function loadSubscriberCount() {
    try {
        const res = await fetch(`${BASE_API_URL}/subscribers?blogger_id=${bloggerId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) return;
        
        const subscribers = await res.json();
        const count = Array.isArray(subscribers) ? subscribers.length : 0;
        
        const statsSubscribersEl = document.getElementById('stat-subscribers');
        if (statsSubscribersEl) statsSubscribersEl.textContent = count;
    } catch (err) {
        console.log('Note: Subscriber endpoint may not be available yet');
		showToast('Note: Subscriber endpoint may not be available yet', 'info');
    }
}