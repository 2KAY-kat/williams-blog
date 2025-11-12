import { showToast } from './toast.js'; 
import { isSigningUp } from './auth-validation.js';

// Define the base URL for your API, based on your Laragon virtual host
// This MUST match the URL of your backend API
const BASE_API_URL = 'http://williams-blog.test'; 

document.addEventListener('DOMContentLoaded', function () {
    
    const form = document.getElementById('auth-form');

    if (!form) {
        console.error("Auth form not found!");
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        let endpoint = '';
        let isLogin = false;
        
        if (isSigningUp) { 
            // --- SIGN UP ---
            if (data.password !== data['confirm_password']) {
                showToast('Passwords do not match.', 'error');
                return;
            }
            // Use the correct Slim route
            endpoint = `${BASE_API_URL}/auth/register`; 
        } else {
            // --- LOGIN ---
            isLogin = true;
            delete data.name; // 'name' field from signup.html
            delete data.confirm_password; 
            // Use the correct Slim route
            endpoint = `${BASE_API_URL}/auth/login`; 
        }
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();

            if (response.ok) {
                // On success, show toast and handle token
                const message = result.message || 'Action successful!';
                showToast(message, 'success');
                
                // Also log in user immediately after registration
                if (result.token && result.blogger) { 
                    // Store token and user data in localStorage
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('blogger', JSON.stringify(result.blogger));
                    
                    // Redirect to the admin dashboard (we will create this later)
                    setTimeout(() => {
                        // We assume dashboard.html is in an 'admin' folder at the same level as 'auth'
                        // Adjust this path if your file structure is different
                        // Let's assume `signup.html` is in `frontend/public/`
                        window.location.href = '../admin/dashboard.html'; // Adjust this path
                    }, 1500); // Wait 1.5s for toast
                }
            } else {
                // Show backend error message
                showToast(result.error || 'An error occurred during authentication.', 'error');
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            showToast('Network error. Check your connection or API status.', 'error');
        }
    });
});