// Test Script untuk Google Identity Services (GIS)
// Jalankan di browser console setelah login

console.log('🧪 [GIS TEST] Testing Google Identity Services...');

// 1. Check GAPI availability
console.log('🔍 [GIS TEST] GAPI available:', !!window.gapi);
console.log('🔍 [GIS TEST] GAPI client available:', !!window.gapi?.client);

// 2. Check token
const token = window.gapi?.client?.getToken();
console.log('🔍 [GIS TEST] Token available:', !!token);
if (token) {
  console.log('🔍 [GIS TEST] Token scope:', token.scope);
  console.log('🔍 [GIS TEST] Token expires at:', new Date(token.expires_at * 1000));
}

// 3. Test OAuth2 userinfo endpoint
if (token && token.access_token) {
  console.log('🧪 [GIS TEST] Testing OAuth2 userinfo...');
  
  fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${token.access_token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ [GIS TEST] OAuth2 userinfo success:', data);
    console.log('👤 [GIS TEST] Real name:', data.name);
    console.log('📧 [GIS TEST] Real email:', data.email);
    
    // Update localStorage with real profile
    const authData = {
      isAuthenticated: true,
      user: {
        name: data.name,
        email: data.email,
        picture: data.picture,
        id: data.id
      }
    };
    
    localStorage.setItem('stockmanager_auth', JSON.stringify(authData));
    console.log('💾 [GIS TEST] Updated localStorage with real profile');
    
    // Ask user if they want to reload
    if (confirm('Profile data updated! Reload page to see changes?')) {
      location.reload();
    }
  })
  .catch(error => {
    console.error('❌ [GIS TEST] OAuth2 userinfo error:', error);
  });
} else {
  console.error('❌ [GIS TEST] No access token available');
}

// 4. Test People API (if available)
if (window.gapi?.client?.people) {
  console.log('🧪 [GIS TEST] Testing People API...');
  
  window.gapi.client.people.people.get({
    resourceName: 'people/me',
    personFields: 'names,emailAddresses,photos'
  })
  .then(response => {
    const person = response.result;
    console.log('✅ [GIS TEST] People API success:', person);
    console.log('👤 [GIS TEST] People name:', person.names?.[0]?.displayName);
    console.log('📧 [GIS TEST] People email:', person.emailAddresses?.[0]?.value);
  })
  .catch(error => {
    console.error('❌ [GIS TEST] People API error:', error);
  });
} else {
  console.log('⚠️ [GIS TEST] People API not loaded, loading...');
  window.gapi.client.load('people', 'v1').then(() => {
    console.log('✅ [GIS TEST] People API loaded, try running this script again');
  });
}
