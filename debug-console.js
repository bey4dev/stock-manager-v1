// Quick debug script - paste this in browser console
console.log('=== DEBUGGING RELOAD ISSUE ===');

// Check current localStorage state
function debugCurrentState() {
    console.log('1. Checking localStorage...');
    const authData = localStorage.getItem('stockmanager_auth');
    const tokenData = localStorage.getItem('google_oauth_token');
    
    console.log('Auth data raw:', authData);
    console.log('Token data raw:', tokenData);
    
    if (authData) {
        try {
            const auth = JSON.parse(authData);
            console.log('Auth parsed:', auth);
            console.log('- isAuthenticated:', auth.isAuthenticated);
            console.log('- user:', auth.user);
        } catch (e) {
            console.error('Auth parse error:', e);
        }
    }
    
    if (tokenData) {
        try {
            const token = JSON.parse(tokenData);
            console.log('Token parsed:', token);
            console.log('- has access_token:', !!token.access_token);
            console.log('- timestamp:', token.timestamp);
            
            if (token.timestamp) {
                const age = Date.now() - token.timestamp;
                const ageMinutes = Math.round(age / 1000 / 60);
                console.log('- age minutes:', ageMinutes);
                console.log('- is old (>60min):', ageMinutes > 60);
            }
        } catch (e) {
            console.error('Token parse error:', e);
        }
    }
    
    // Check Google API state
    console.log('2. Checking Google API state...');
    console.log('- window.gapi:', !!window.gapi);
    console.log('- window.google:', !!window.google);
    console.log('- gapi.client:', !!window.gapi?.client);
    
    if (window.gapi?.client) {
        try {
            const gapiToken = window.gapi.client.getToken();
            console.log('- gapi token:', !!gapiToken?.access_token);
        } catch (e) {
            console.log('- gapi token error:', e.message);
        }
    }
}

// Simulate what happens during app initialization
async function simulateInitialization() {
    console.log('3. Simulating app initialization...');
    
    // This is what getInitialAuthState does
    const savedAuth = localStorage.getItem('stockmanager_auth');
    let initialState = { isAuthenticated: false, user: null };
    
    if (savedAuth) {
        try {
            const authData = JSON.parse(savedAuth);
            initialState = {
                isAuthenticated: authData.isAuthenticated || false,
                user: authData.user || null
            };
            console.log('- Initial state from localStorage:', initialState);
        } catch (e) {
            console.error('- Error parsing initial auth:', e);
        }
    } else {
        console.log('- No saved auth, using default state');
    }
    
    // Check App.tsx render condition
    const shouldShowAuth = !initialState.isAuthenticated || !initialState.user;
    console.log('- Should show auth page:', shouldShowAuth);
    console.log('  - !isAuthenticated:', !initialState.isAuthenticated);
    console.log('  - !user:', !initialState.user);
    
    return initialState;
}

// Run all checks
debugCurrentState();
simulateInitialization();

// Provide helper functions
window.debugAuth = debugCurrentState;
window.simulateInit = simulateInitialization;

console.log('=== DEBUG COMPLETE ===');
console.log('Available functions: debugAuth(), simulateInit()');
