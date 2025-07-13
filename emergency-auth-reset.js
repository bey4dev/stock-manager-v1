// Emergency Auth Reset
console.log('🚨 Emergency Auth Reset Script');

// Clear all authentication related localStorage
const authKeys = [
  'stockmanager_auth',
  'gapi_token',
  'google_oauth_token'
];

authKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    console.log(`🗑️ Removing ${key} from localStorage`);
    localStorage.removeItem(key);
  }
});

// Clear sessionStorage
sessionStorage.clear();
console.log('🗑️ Cleared sessionStorage');

// Revoke Google tokens if available
if (window.gapi && window.gapi.client) {
  try {
    const token = window.gapi.client.getToken();
    if (token) {
      console.log('🔄 Revoking Google token...');
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');
      console.log('✅ Google token revoked');
    }
  } catch (error) {
    console.log('⚠️ Error revoking token:', error);
  }
}

console.log('✅ Emergency auth reset completed. Please refresh the page.');
alert('Emergency auth reset completed. The page will now reload.');

// Reload page
window.location.reload();
