import { showToast } from './toast.js'; 
import { isSigningUp } from './auth-validation.js';

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
            endpoint = '/backend/api/auth/register.php'; 
        } else {
            delete data.name; 
            delete data.confirm_password; 
            endpoint = '/backend/api/auth/login'; 
        }
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                showToast('Action successful!', 'success');
                // TODO: Handle success redirect later nkazadzuka bwino
            } else {
                const error = await response.json();
                showToast(error.message || 'An error occurred during authentication.', 'error');
            }
        } catch (error) {
            showToast('Network error. Check your connection.', 'error');
        }
    });
});