const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Preparing deployment package...\n');

// Create deployment directory
const deployDir = 'deployment-package';
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true });
}
fs.mkdirSync(deployDir);

console.log('📁 Created deployment directory');

// Copy essential files
const filesToCopy = [
  'dist',
  'server.js',
  'package.json',
  '.htaccess',
  '.env.production'
];

filesToCopy.forEach(file => {
  const sourcePath = path.join('.', file);
  const destPath = path.join(deployDir, file);
  
  if (fs.existsSync(sourcePath)) {
    if (fs.lstatSync(sourcePath).isDirectory()) {
      fs.cpSync(sourcePath, destPath, { recursive: true });
      console.log(`📂 Copied directory: ${file}`);
    } else {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`📄 Copied file: ${file}`);
    }
  } else {
    console.log(`⚠️  Warning: ${file} not found`);
  }
});

// Create production package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const productionPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  description: "Stock Manager V1 - Production Build",
  main: "server.js",
  scripts: {
    start: "node server.js",
    install: "npm install --only=production"
  },
  dependencies: {
    "express": "^4.21.2",
    "compression": "^1.7.5",
    "helmet": "^8.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.5.1"
  },
  engines: {
    node: ">=16.0.0",
    npm: ">=8.0.0"
  }
};

fs.writeFileSync(
  path.join(deployDir, 'package.json'), 
  JSON.stringify(productionPackageJson, null, 2)
);

console.log('📦 Created production package.json');

// Create deployment README
const deploymentReadme = `# Stock Manager V1 - Production Deployment

## Quick Start

1. Upload all files to your cPanel public_html directory
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Update .env.production with your actual values
4. Start the application:
   \`\`\`bash
   npm start
   \`\`\`

## Files Included

- \`dist/\` - Built application files
- \`server.js\` - Express server
- \`package.json\` - Production dependencies
- \`.htaccess\` - Apache configuration
- \`.env.production\` - Environment variables template

## Important Notes

1. Update Google API credentials in .env.production
2. Configure your domain in OAuth settings
3. Ensure Node.js is enabled in cPanel
4. Set up SSL certificate for HTTPS

## Support

For deployment issues, check the CPANEL_DEPLOYMENT_GUIDE.md
`;

fs.writeFileSync(path.join(deployDir, 'README.md'), deploymentReadme);

console.log('📋 Created deployment README');

// Create zip file
try {
  execSync(`powershell Compress-Archive -Path "${deployDir}\\*" -DestinationPath "stock-manager-deployment.zip" -Force`);
  console.log('📦 Created deployment zip file: stock-manager-deployment.zip');
} catch (error) {
  console.log('⚠️  Could not create zip file automatically. Please zip the deployment-package folder manually.');
}

console.log('\n✅ Deployment package ready!');
console.log('\n📋 Next Steps:');
console.log('1. Upload stock-manager-deployment.zip to your cPanel');
console.log('2. Extract the files in your desired directory');
console.log('3. Follow the CPANEL_DEPLOYMENT_GUIDE.md instructions');
console.log('4. Update .env.production with your actual values');
console.log('5. Configure Node.js application in cPanel');

console.log('\n🎯 Deployment package location: ./deployment-package/');
console.log('🎯 Zip file: ./stock-manager-deployment.zip');
