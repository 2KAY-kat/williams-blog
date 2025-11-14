/**
 * Displays a unified toast notification on the screen.
 * @param {string} message - The text content of the toast.
 * @param {string} [type='success'] - The type of toast ('success', 'error', 'info', or any other string).
 */
export function showToast(message, type = 'success') {
    // Remove any existing toasts first
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    
    // --- ICON LOGIC START ---
    const icon = document.createElement('i');
    icon.style.marginRight = '12px'; // Spacing between icon and text
    icon.style.fontSize = '1.2em';
    
    // Determine icon class and background color
    let bgColor = '#333'; // Default background
    let iconClass = 'fas fa-bell'; // Default icon
    
    switch(type) {
        case 'success':
            iconClass = 'fas fa-check-circle';
            bgColor = '#4CAF50';
            break;
        case 'error':
            iconClass = 'fas fa-exclamation-triangle';
            bgColor = '#f44336';
            break;
        case 'info':
            iconClass = 'fas fa-info-circle';
            bgColor = '#2196F3';
            break;
        default:
            iconClass = 'fas fa-bell';
            bgColor = '#333';
    }

    icon.className = iconClass;
    toast.appendChild(icon); // Prepend the icon
    toast.appendChild(document.createTextNode(message)); // Append the text content
    // --- ICON LOGIC END ---
    
    // Add styles inline to ensure they work
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        /* Increased padding to accommodate icon */
        padding: 16px 24px; 
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease-in-out;
        max-width: 350px;
        word-wrap: break-word;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        /* Flexbox for easy alignment of icon and text */
        display: flex; 
        align-items: center;
        background-color: ${bgColor}; /* Use the determined color */
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation (slide in)
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove toast after delay (slide out)
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300); // Wait for the transition to finish
    }, 4000); // Display time
}