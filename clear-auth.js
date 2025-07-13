// Script untuk membersihkan data autentikasi lama
// Jalankan di browser console: http://localhost:5176

console.log('🧹 Membersihkan data autentikasi lama...');

// Clear localStorage
localStorage.removeItem('stockmanager_auth');
console.log('✅ LocalStorage cleared');

// Clear Google Auth state if available
if (window.gapi && window.gapi.auth2) {
  const authInstance = window.gapi.auth2.getAuthInstance();
  if (authInstance) {
    authInstance.signOut().then(() => {
      console.log('✅ Google Auth signed out');
      authInstance.disconnect().then(() => {
        console.log('✅ Google Auth disconnected');
      });
    });
  }
}

// Clear any remaining session data
sessionStorage.clear();
console.log('✅ SessionStorage cleared');

console.log('🎉 Cleanup complete! Silakan refresh halaman dan login ulang.');
console.log('Dengan scope baru, aplikasi akan dapat mengambil nama asli dari profile Google Anda.');
