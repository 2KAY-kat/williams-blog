// src/js/dashboard.js
import { showToast } from './toast.js';
import { BASE_API_URL } from './utils.js';

const token = localStorage.getItem('auth_token');
if (!token) {
  window.location.href = '../auth/signup.html';
}

const bloggerId = JSON.parse(atob(token.split('.')[1])).data.id;

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
      headers: { Authorization: `Bearer ${token}` 
    }
    });
    const posts = await res.json();
    if (!res.ok) throw new Error(posts.error || 'Failed to load posts');

    list.innerHTML = posts.length ? '' : '<p>No posts yet. Create your first!</p>';
    posts.forEach(post => {
      const div = document.createElement('div');
      div.className = 'post-card';
      div.innerHTML = `
        <h3>${post.title}</h3>
        <p><small>Created: ${new Date(post.created_at).toLocaleDateString()}</small></p>
        <p><strong>Status:</strong> <span class="status ${post.ispublished ? 'published' : 'draft'}">
          ${post.ispublished ? 'Published' : 'Draft'}
        </span></p>
        <div class="actions">
          <button class="btn-edit" data-id="${post.post_id}">Edit</button>
          <button class="btn-delete" data-id="${post.post_id}">Delete</button>
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

    allCategories = await res.json();
  } catch (err) {
    console.error('Failed to load categories');
  }
}

function openModal(post = null) {
  const modal = document.getElementById('post-modal');
  const title = document.getElementById('modal-title');
  const form = document.getElementById('post-form');
  form.reset();
  form.postid.value = '';
  document.querySelector('.btn-text').textContent = 'Save Post';

  if (post) {
    title.textContent = 'Edit Post';
    form.title.value = post.title;
    form.content.value = post.content;
    form.main_image_url.value = post.main_image_url || '';
    form.is_published.checked = post.is_published === 1;
    form.post_id.value = post.post_id;
  } else {
    title.textContent = 'Add New Post';
  }

//   // Categories
  const container = document.getElementById('categories-checkboxes');
  container.innerHTML = allCategories.map(cat => `
    <label><input type="checkbox" name="categories" value="${cat.name}"
      ${post?.categories?.includes(cat.name) ? 'checked' : ''}>
      ${cat.name}
    </label>
  `).join('');

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
    ispublished: form.ispublished.checked ? 1 : 0,
    categories: Array.from(form.querySelectorAll('input[name="categories"]:checked'))
      .map(cb => cb.value)
  };

  const method = form.post_id.value ? 'PUT' : 'POST';
  const url = form.post_id.value 
    ? `${BASE_API_URL}/posts/${form.post_id.value}` 
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
    if (!res.ok) throw new Error(result.error || 'Failed to save post');

    showToast(`Post ${form.post_id.value ? 'updated' : 'created'} successfully!`, 'success');
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

async function editPost(post_id) {
  try {
    const res = await fetch(`${BASE_API_URL}/posts${post_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const post = await res.json();
    if (!res.ok) throw new Error(post.error);
    openModal(post);
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

async function deletePost(post_id) {
  if (!confirm('Delete this post?')) return;
  try {
    const res = await fetch(`${BASE_API_URL}/posts/${post_id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete');
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
    const form = document.getElementById('profile-form');
    form.full_name.value = user.full_name;
    form.email.value = user.email;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        full_name: form.full_name.value,
        email: form.email.value
      };
      const res = await fetch(`${BASE_API_URL}/blogger`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application' +
          '/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showToast('Profile updated!', 'success');
      } else {
        const err = await res.json();
        showToast(err.error || 'Update failed', 'error');
      }
    });
  } catch (err) {
    showToast('Failed to load profile', 'error');
  }
}