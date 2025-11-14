import { showToast } from './toast.js'; 
import { isSigningUp } from './auth-validation.js';
import { BASE_API_URL } from './utils.js'; // Import the new utility

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
            
            if (data.password !== data['confirm_password']) {
                showToast('Passwords do not match.', 'error');
                return;
            }
            // Use the globally defined BASE_API_URL
            endpoint = `${BASE_API_URL}/auth/register`; 
        } else {
            delete data.name; 
            delete data.confirm_password; 
            // Use the globally defined BASE_API_URL
            endpoint = `${BASE_API_URL}/auth/login`; 
        }
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Save the JWT token to local storage
                localStorage.setItem('auth_token', result.token);
                
                showToast('Action successful! Redirecting to dashboard...', 'success');
                
                // Redirect to the dashboard page (relative path from /src/auth/ to /src/admin/)
                window.location.href = '../admin/dashboard.html';

            } else {
                const error = await response.json();
                showToast(error.message || 'An error occurred during authentication.', 'error');
            }
        } catch (error) {
            // Note: This often happens if the API URL is wrong or the server is offline.
            showToast('Network error. Check your API domain and connection.', 'error');
        }
    });
});