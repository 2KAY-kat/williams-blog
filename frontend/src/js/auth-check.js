import { showToast } from './toast.js';
// import { BASE_API_URL } from './utils.js';

const signupPageUrl = '/auth/signup';

document.addEventListener('DOMContentLoaded', function() { 
    const addArticleLink = document.getElementById('add-article-link');
    const addArticlePageUrl = '/admin/dashboard.html';

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

/**  
// let bloggerId = null;
// try {
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     bloggerId = payload.data.id;
// } catch (e) {
//     // If token is invalid/malformed, redirect
//     console.error("Invalid token format:", e);
//     localStorage.removeItem('auth_token');
//     window.location.href = '../auth/signup.html';
// }
// document.addEventListener("DOMContentLoaded", async () => {    
    
//     const token = localStorage.getItem('auth_token');

//     if (!token) return redirectWithToast();

//     try {
//         const res = await fetch(`${BASE_API_URL}/posts?blogger_id=${bloggerId}`, {
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//     }

//     const dashboardPage = document.getElementById('dashboard'); 

// if (!dashboardPage) return;

//     dashboardPage.addEventListener('load', function(e) {
//         e.preventDefault(); 
        
//         const token = localStorage.getItem('auth_token');

//         if(token) {
//             window.location.href = dashboardPage;
//         } else {
//             showToast('Please sign in to view your dashboard', 'info');

//             setTimeout(() => {
//                 window.location.href = signupPageUrl;
//             }, 500);
//         }
//     })
// })
// **/