import { showToast } from './toast.js';

document.addEventListener('DOMContentLoaded', function() {
    const addArticleLink = document.getElementById('add-article-link');
    const signupPageUrl = '/auth/signup';
    const addArticlePageUrl = '/admin/dashboard';

    if (!addArticleLink) return;

    addArticleLink.addEventListener('click', function(e) {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');

        if(token) {
            window.location.href = addArticlePageUrl;
        } else {
            showToast('Please sign in to add new articles', 'info');

            setTimeout(() => {
                window.location.href = signupPageUrl;
            }, 500);
        }
    })
})