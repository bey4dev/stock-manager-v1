console.log('🧹 [FORCE CLEAR] Starting force authentication clear...');

// 1. Clear localStorage
console.log('🔄 [FORCE CLEAR] Clearing localStorage...');
localStorage.removeItem('stockmanager_auth');
localStorage.removeItem('gapi.load.callback.3');
localStorage.removeItem('gapi.load.callback.4');
// Clear any other Google-related localStorage keys
Object.keys(localStorage).forEach(key => {
  if (key.includes('google') || key.includes('gapi') || key.includes('auth') || key.includes('token')) {
    localStorage.removeItem(key);
    console.log('✅ [FORCE CLEAR] Removed localStorage key:', key);
  }
});

// 2. Clear sessionStorage
console.log('🔄 [FORCE CLEAR] Clearing sessionStorage...');
sessionStorage.clear();

// 3. Clear Google Auth if available
console.log('🔄 [FORCE CLEAR] Checking Google Auth...');
if (window.gapi) {
  console.log('✅ [FORCE CLEAR] GAPI available');
  
  if (window.gapi.auth2) {
    console.log('✅ [FORCE CLEAR] Auth2 available');
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance) {
        console.log('✅ [FORCE CLEAR] Auth instance found');
        const currentUser = authInstance.currentUser.get();
        if (currentUser && currentUser.isSignedIn()) {
          console.log('🔍 [FORCE CLEAR] User is signed in, signing out...');
          authInstance.signOut().then(() => {
            console.log('✅ [FORCE CLEAR] Google Auth signed out');
            authInstance.disconnect().then(() => {
              console.log('✅ [FORCE CLEAR] Google Auth disconnected');
            });
          });
        } else {
          console.log('🔍 [FORCE CLEAR] User already signed out');
        }
      } else {
        console.log('⚠️ [FORCE CLEAR] No auth instance available');
      }
    } catch (error) {
      console.error('❌ [FORCE CLEAR] Error with auth2:', error);
    }
  } else {
    console.log('⚠️ [FORCE CLEAR] Auth2 not available');
  }
  
  // Clear GAPI token if available
  if (window.gapi.client) {
    const token = window.gapi.client.getToken();
    if (token) {
      console.log('🔍 [FORCE CLEAR] Found GAPI token, clearing...');
      window.gapi.client.setToken('');
      console.log('✅ [FORCE CLEAR] GAPI token cleared');
    }
  }
} else {
  console.log('⚠️ [FORCE CLEAR] GAPI not available');
}

// 4. Clear Google OAuth tokens if available
if (window.google && window.google.accounts && window.google.accounts.oauth2) {
  console.log('🔍 [FORCE CLEAR] Checking Google OAuth2...');
  try {
    // Try to revoke any existing tokens
    const token = window.gapi?.client?.getToken();
    if (token && token.access_token) {
      window.google.accounts.oauth2.revoke(token.access_token);
      console.log('✅ [FORCE CLEAR] OAuth token revoked');
    }
  } catch (error) {
    console.error('❌ [FORCE CLEAR] Error revoking OAuth token:', error);
  }
}

// 5. Clear any Google-related cookies
console.log('🔄 [FORCE CLEAR] Clearing cookies...');
document.cookie.split(";").forEach(function(c) { 
  const cookie = c.replace(/^ +/, "");
  if (cookie.includes('google') || cookie.includes('auth') || cookie.includes('session')) {
    document.cookie = cookie.replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    console.log('✅ [FORCE CLEAR] Cleared cookie:', cookie.split('=')[0]);
  }
});

console.log('🎉 [FORCE CLEAR] Force clear completed!');
console.log('🔄 [FORCE CLEAR] Reloading page in 2 seconds...');

// 6. Force reload after a short delay
setTimeout(() => {
  console.log('🔄 [FORCE CLEAR] Reloading page now...');
  window.location.reload();
}, 2000);
