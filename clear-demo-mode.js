// Clear Demo Mode - Clean localStorage Script
console.log('🧹 Clearing demo mode data from localStorage...');

// Clear all demo-related data
const keysToRemove = [
  'stockmanager_auth',
  'stockmanager_user',
  'stockmanager_products',
  'stockmanager_sales', 
  'stockmanager_purchases',
  'demo_products',
  'demo_sales',
  'demo_purchases'
];

keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed: ${key}`);
  }
});

// Also clear any session storage
keysToRemove.forEach(key => {
  if (sessionStorage.getItem(key)) {
    sessionStorage.removeItem(key);
    console.log(`🗑️ Removed from session: ${key}`);
  }
});

console.log('✅ Demo mode data cleared successfully!');
console.log('🔄 Please refresh the page to start fresh with Google Sheets data only.');

// Optional: Auto-refresh after 2 seconds
setTimeout(() => {
  console.log('🔄 Auto-refreshing page...');
  window.location.reload();
}, 2000);
