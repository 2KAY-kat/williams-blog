// Vite automatically loads the correct VITE_API_BASE_URL from the environment files (.env.development or .env.production).
// This variable is CRITICAL for API calls.
export const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Utility function to get the authentication token from local storage.
 * @returns {string | null} The JWT token or null.
 */
export const getAuthToken = () => {
    return localStorage.getItem('auth_token');
};

// CRITICAL CHECK: This logs the error you are seeing if the .env file is missing or misnamed.
if (!BASE_API_URL) {
    console.error("VITE_API_BASE_URL is undefined! Please ensure you have a 'frontend/.env.development' file with 'VITE_API_BASE_URL=...' defined inside the ROOT frontend directory.");
}