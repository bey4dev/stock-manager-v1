// Minimal reproduction test
// Run this in browser console after login

console.log('=== MINIMAL REPRODUCTION TEST ===');

// Step 1: Check what's actually in localStorage
console.log('1. Current localStorage:');
const authData = localStorage.getItem('stockmanager_auth');
const tokenData = localStorage.getItem('google_oauth_token');
console.log('  stockmanager_auth:', authData);
console.log('  google_oauth_token:', tokenData);

// Step 2: Parse the data
if (authData) {
    try {
        const auth = JSON.parse(authData);
        console.log('2. Parsed auth data:');
        console.log('  isAuthenticated:', auth.isAuthenticated);
        console.log('  user:', auth.user);
        
        // Step 3: Simulate the exact logic from getInitialAuthState
        const simulatedInitialState = {
            isAuthenticated: auth.isAuthenticated || false,
            user: auth.user || null
        };
        console.log('3. Simulated initial state:', simulatedInitialState);
        
        // Step 4: Test the App.tsx condition
        const shouldShowLogin = !simulatedInitialState.isAuthenticated || !simulatedInitialState.user;
        console.log('4. App.tsx condition (!isAuthenticated || !user):', shouldShowLogin);
        console.log('   !isAuthenticated:', !simulatedInitialState.isAuthenticated);
        console.log('   !user:', !simulatedInitialState.user);
        console.log('   Result: Will show', shouldShowLogin ? 'LOGIN' : 'DASHBOARD');
        
    } catch (e) {
        console.error('Error parsing auth data:', e);
    }
} else {
    console.log('2. No auth data found - will show login');
}

// Step 5: Test manual localStorage manipulation
console.log('5. Setting manual test data...');
const testAuth = {
    isAuthenticated: true,
    user: {
        name: 'Test User',
        email: 'test@example.com'
    }
};

localStorage.setItem('stockmanager_auth', JSON.stringify(testAuth));
console.log('   Set test auth data:', testAuth);

// Check if it persists
setTimeout(() => {
    const check = localStorage.getItem('stockmanager_auth');
    console.log('6. Test data persists:', !!check);
    if (check) {
        const parsed = JSON.parse(check);
        const condition = !parsed.isAuthenticated || !parsed.user;
        console.log('   Test condition result:', condition ? 'LOGIN' : 'DASHBOARD');
    }
    
    console.log('=== TEST COMPLETE ===');
    console.log('Now try reloading the page to see what happens...');
}, 1000);
