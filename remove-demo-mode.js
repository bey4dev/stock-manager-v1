// Script to remove all DEMO_MODE blocks from GoogleSheetsService.ts
console.log('🧹 Removing all DEMO_MODE blocks from GoogleSheetsService.ts');

// Read the file content
async function removeDemoModeBlocks() {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    const filePath = path.join(__dirname, 'src', 'services', 'GoogleSheetsService.ts');
    let content = await fs.readFile(filePath, 'utf8');
    
    console.log('📄 Original file size:', content.length);
    
    // Remove import of DEMO_MODE
    content = content.replace(
      /import { GOOGLE_CONFIG, DEMO_MODE } from/,
      'import { GOOGLE_CONFIG } from'
    );
    
    // Remove all if (DEMO_MODE) blocks
    // Pattern to match: if (DEMO_MODE) { ... } and the corresponding else/return
    const demoBlocks = [
      // Constructor block
      /if \(!DEMO_MODE\) {\s*this\.initGoogleAPI\(\);\s*} else {\s*console\.log\('Running in Demo Mode[^']*'\);\s*}/g,
      
      // Simple DEMO_MODE blocks with return
      /if \(DEMO_MODE\) {\s*console\.log\([^)]*\);\s*return[^;]*;\s*}/g,
      
      // DEMO_MODE blocks with console.log and return true
      /if \(DEMO_MODE\) {\s*console\.log\([^)]*\);\s*return true;\s*}/g,
      
      // getUserProfile demo block
      /if \(DEMO_MODE\) {\s*console\.log\([^)]*\);\s*return { name: 'Demo User', email: 'demo@example\.com' };\s*}/g,
    ];
    
    demoBlocks.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        console.log(`🔍 Found ${matches.length} matches for pattern ${index + 1}`);
        content = content.replace(pattern, '');
      }
    });
    
    // Remove getDemoProducts method entirely
    content = content.replace(
      /private getDemoProducts\(\): Product\[\] {[\s\S]*?}\s*$/m,
      ''
    );
    
    // Clean up multiple empty lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    console.log('📄 New file size:', content.length);
    
    // Write back to file
    await fs.writeFile(filePath, content, 'utf8');
    console.log('✅ DEMO_MODE blocks removed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run if this is Node.js
if (typeof module !== 'undefined' && module.exports) {
  removeDemoModeBlocks();
}

// For browser console
window.removeDemoModeBlocks = removeDemoModeBlocks;
