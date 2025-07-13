// Test reload behavior
console.log('=== RELOAD TEST SCRIPT ===');

// Function to simulate page reload and check auth persistence
function testReloadBehavior() {
    console.log('🧪 Starting reload behavior test...');
    
    // Check initial state
    const authData = localStorage.getItem('stockmanager_auth');
    const tokenData = localStorage.getItem('google_oauth_token');
    
    console.log('📊 Initial state:');
    console.log('  - Auth data:', authData ? 'Present' : 'Missing');
    console.log('  - Token data:', tokenData ? 'Present' : 'Missing');
    
    if (authData) {
        try {
            const auth = JSON.parse(authData);
            console.log('  - User authenticated:', auth.isAuthenticated);
            console.log('  - User name:', auth.user?.name);
            console.log('  - User email:', auth.user?.email);
        } catch (e) {
            console.error('  - Error parsing auth data:', e);
        }
    }
    
    if (tokenData) {
        try {
            const token = JSON.parse(tokenData);
            console.log('  - Token present:', !!token.access_token);
            console.log('  - Token timestamp:', token.timestamp);
            console.log('  - Token expires_in:', token.expires_in);
            
            if (token.timestamp) {
                const age = Date.now() - token.timestamp;
                const ageMinutes = Math.round(age / 1000 / 60);
                console.log('  - Token age:', ageMinutes, 'minutes');
                
                // Check expiry
                const maxAge = 60 * 60 * 1000; // 1 hour
                const isExpired = age > maxAge;
                console.log('  - Token expired:', isExpired);
            }
        } catch (e) {
            console.error('  - Error parsing token data:', e);
        }
    }
    
    // Check window.gapi state
    console.log('📊 Google API state:');
    console.log('  - window.gapi:', !!window.gapi);
    console.log('  - window.google:', !!window.google);
    console.log('  - gapi.client:', !!window.gapi?.client);
    
    if (window.gapi?.client) {
        try {
            const gapiToken = window.gapi.client.getToken();
            console.log('  - gapi token:', !!gapiToken?.access_token);
        } catch (e) {
            console.log('  - gapi token error:', e.message);
        }
    }
}

// Run test when script loads
testReloadBehavior();

// Also run when page is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testReloadBehavior, 2000); // Wait 2 seconds after DOM ready
    });
} else {
    setTimeout(testReloadBehavior, 2000); // Wait 2 seconds
}

// Add button to manually trigger test
function addTestButton() {
    const button = document.createElement('button');
    button.textContent = '🧪 Test Reload Behavior';
    button.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 10000;
        padding: 8px 12px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
    `;
    button.onclick = testReloadBehavior;
    document.body.appendChild(button);
}

// Add button when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addTestButton);
} else {
    addTestButton();
}
