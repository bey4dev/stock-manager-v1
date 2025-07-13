// Force Clear Authentication Script
// Jalankan di browser console untuk memaksa logout dan clear semua data

console.log('🧹 [FORCE CLEAR] Starting force authentication clear...');

// 1. Clear localStorage
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key) keysToRemove.push(key);
}

keysToRemove.forEach(key => localStorage.removeItem(key));
console.log('✅ [FORCE CLEAR] LocalStorage cleared:', keysToRemove.length, 'items');

// 2. Clear sessionStorage
sessionStorage.clear();
console.log('✅ [FORCE CLEAR] SessionStorage cleared');

// 3. Clear Google Auth if available
if (window.gapi && window.gapi.auth2) {
  try {
    const authInstance = window.gapi.auth2.getAuthInstance();
    if (authInstance) {
      const currentUser = authInstance.currentUser.get();
      if (currentUser.isSignedIn()) {
        console.log('🔍 [FORCE CLEAR] User is signed in, signing out...');
        await authInstance.signOut();
        console.log('✅ [FORCE CLEAR] Google Auth signed out');
        
        await authInstance.disconnect();
        console.log('✅ [FORCE CLEAR] Google Auth disconnected');
      } else {
        console.log('🔍 [FORCE CLEAR] User already signed out');
      }
    }
  } catch (error) {
    console.error('❌ [FORCE CLEAR] Error clearing Google Auth:', error);
  }
}

// 4. Clear cookies (if any related to Google)
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ [FORCE CLEAR] Cookies cleared');

// 5. Force reload
console.log('🔄 [FORCE CLEAR] Force reloading page...');
setTimeout(() => {
  window.location.reload();
}, 1000);

console.log('🎉 [FORCE CLEAR] Complete! Page will reload in 1 second.');
