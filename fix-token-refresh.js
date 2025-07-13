// Script untuk fix token refresh dalam GoogleSheetsService.ts
// Mengganti retryWithFreshToken dengan makeAPICallWithAutoRefresh

import fs from 'fs';
import path from 'path';

const filePath = 'd:\\Programing\\Web-Aplication\\Stock ManagerV1\\src\\services\\GoogleSheetsService.ts';

console.log('🔧 Fixing token refresh method calls...');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all retryWithFreshToken calls with makeAPICallWithAutoRefresh
  const originalCount = (content.match(/retryWithFreshToken/g) || []).length;
  content = content.replace(/retryWithFreshToken/g, 'makeAPICallWithAutoRefresh');
  
  fs.writeFileSync(filePath, content);
  
  console.log(`✅ Successfully replaced ${originalCount} occurrences of retryWithFreshToken with makeAPICallWithAutoRefresh`);
  console.log('🎉 Token refresh method fix completed!');
  
} catch (error) {
  console.error('❌ Error fixing token refresh methods:', error);
}
