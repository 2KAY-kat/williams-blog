import { showToast } from './toast.js';
import { isSigningUp } from './auth-validation.js';
import { BASE_API_URL } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('auth-form');
    const submitBtn = document.getElementById('auth-button');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        btnText.textContent = isSigningUp ? 'Signing up...' : 'Logging in...';
        btnSpinner.style.display = 'flex';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        let endpoint = isSigningUp
            ? `${BASE_API_URL}/auth/register`
            : `${BASE_API_URL}/auth/login`;

        if (isSigningUp && data.password !== data.confirm_password) {
            showToast('Passwords do not match.', 'error');
            resetButton();
            return;
        }

        if (!isSigningUp) {
            delete data.name;
            delete data.confirm_password;
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const text = await response.text();
            console.log('Raw response:', text);

            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                throw new Error('Invalid JSON from server.');
            }

            if (response.ok) {
                localStorage.setItem('auth_token', result.token);
                showToast('Success! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '../admin/dashboard.html';
                }, 1200);
            } else {
                showToast(result.error || result.message || 'Request failed.', 'error');
                resetButton();
            }
        } catch (err) {
            console.error('Auth error:', err);
            showToast(err.message || 'Network error.', 'error');
            resetButton();
        }

        function resetButton() {
            submitBtn.disabled = false;
            btnText.textContent = isSigningUp ? 'Sign up' : 'Sign in';
            btnSpinner.style.display = 'none';
        }
    });
});