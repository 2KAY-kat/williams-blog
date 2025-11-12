import { showToast } from './toast.js'; 
import { isSigningUp } from './auth-validation.js';

// Defining the base URL for API, based on your Laragon virtual host
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
        
        if (isSigningUp) { 
            // --- SIGN UP ---
            if (data.password !== data['confirm_password']) {
                showToast('Passwords do not match.', 'error');
                return;
            }
            // url Slim route on the virtual host
            endpoint = `${BASE_API_URL}/auth/register`; 
        } else {
            // --- LOGIN ---
            delete data.name; // 'name' field from signup.html
            delete data.confirm_password; 
            // url Slim route on the virtual host
            endpoint = `${BASE_API_URL}/auth/login`; 
        }
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            // Check for CORS or network issues first
            if (!response.ok && response.status === 0) {
                throw new Error('CORS or Network issue. Check Laragon server status and API virtual host.');
            }

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
                    
                    // Redirect to the admin dashboard
                    setTimeout(() => {
                        window.location.href = '../admin/dashboard.html'; 
                    }, 1500); 
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