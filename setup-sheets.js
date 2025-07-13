const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration (update with your actual values)
const CONFIG = {
  CLIENT_ID: '752419828170-o835j9j32gmcmc9sdhcajnqoaikoh8j8.apps.googleusercontent.com',
  CLIENT_SECRET: 'your-client-secret-here', // You need to get this from Google Cloud Console
  REDIRECT_URI: 'http://localhost:3000/auth/callback',
  SPREADSHEET_ID: '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0'
};

// OAuth2 Setup
const oauth2Client = new google.auth.OAuth2(
  CONFIG.CLIENT_ID,
  CONFIG.CLIENT_SECRET,
  CONFIG.REDIRECT_URI
);

// Scopes needed for Google Sheets
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Template data for each sheet
const SHEET_TEMPLATES = {
  Products: {
    range: 'A:H',
    headers: ['ID', 'Name', 'Category', 'Price', 'Stock', 'Cost', 'Description', 'Status'],
    data: [
      ['PRD_001', 'E-Book Premium', 'Digital Books', 150000, 50, 75000, 'Buku digital premium tentang teknologi', 'Active'],
      ['PRD_002', 'Online Course', 'Education', 500000, 30, 200000, 'Kursus online programming', 'Active'],
      ['PRD_003', 'Software License', 'Software', 1000000, 10, 400000, 'Lisensi software development', 'Active'],
      ['PRD_004', 'Digital Template', 'Design', 75000, 100, 25000, 'Template desain website', 'Active'],
      ['PRD_005', 'Mobile App', 'Software', 200000, 25, 80000, 'Aplikasi mobile premium', 'Active']
    ]
  },
  Sales: {
    range: 'A:G',
    headers: ['ID', 'Date', 'Product', 'Quantity', 'Price', 'Total', 'Customer'],
    data: [
      ['SAL_001', '2025-07-01', 'E-Book Premium', 5, 150000, 750000, 'John Doe'],
      ['SAL_002', '2025-07-02', 'Online Course', 2, 500000, 1000000, 'Jane Smith'],
      ['SAL_003', '2025-07-03', 'Digital Template', 10, 75000, 750000, 'Bob Wilson'],
      ['SAL_004', '2025-07-04', 'Software License', 1, 1000000, 1000000, 'Alice Brown']
    ]
  },
  Purchases: {
    range: 'A:G',
    headers: ['ID', 'Date', 'Product', 'Quantity', 'Cost', 'Total', 'Supplier'],
    data: [
      ['PUR_001', '2025-07-01', 'E-Book Premium', 20, 75000, 1500000, 'Content Creator A'],
      ['PUR_002', '2025-07-02', 'Online Course', 10, 200000, 2000000, 'Education Provider B'],
      ['PUR_003', '2025-07-03', 'Digital Template', 50, 25000, 1250000, 'Design Studio C']
    ]
  },
  Dashboard: {
    range: 'A:B',
    headers: ['Key', 'Value'],
    data: [
      ['totalProducts', 5],
      ['totalSales', 4],
      ['totalRevenue', 3500000],
      ['totalPurchases', 3],
      ['totalCost', 4750000],
      ['profit', -1250000]
    ]
  }
};

class GoogleSheetsSetup {
  constructor() {
    this.sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    this.drive = google.drive({ version: 'v3', auth: oauth2Client });
  }

  // Authenticate with Google
  async authenticate() {
    try {
      console.log('🔐 Starting authentication...');
      
      // Check if we have saved credentials
      const tokenPath = path.join(__dirname, 'token.json');
      if (fs.existsSync(tokenPath)) {
        const tokens = JSON.parse(fs.readFileSync(tokenPath));
        oauth2Client.setCredentials(tokens);
        console.log('✅ Using saved credentials');
        return true;
      }

      // Generate auth URL
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });

      console.log('📝 Authorize this app by visiting this URL:');
      console.log(authUrl);

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve, reject) => {
        rl.question('Enter the code from that page here: ', async (code) => {
          rl.close();
          try {
            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);
            
            // Save credentials
            fs.writeFileSync(tokenPath, JSON.stringify(tokens));
            console.log('✅ Authentication successful!');
            resolve(true);
          } catch (error) {
            console.error('❌ Error retrieving access token:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('❌ Authentication error:', error);
      throw error;
    }
  }

  // Get spreadsheet info
  async getSpreadsheetInfo() {
    try {
      console.log('📋 Getting spreadsheet info...');
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
      });

      const spreadsheet = response.data;
      const existingSheets = spreadsheet.sheets.map(sheet => sheet.properties.title);
      
      console.log(`📊 Spreadsheet: "${spreadsheet.properties.title}"`);
      console.log(`🔗 URL: https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit`);
      console.log(`📝 Existing sheets: ${existingSheets.join(', ')}`);
      
      return { spreadsheet, existingSheets };
    } catch (error) {
      console.error('❌ Error getting spreadsheet info:', error);
      throw error;
    }
  }

  // Create missing sheets
  async createMissingSheets(existingSheets) {
    const requiredSheets = Object.keys(SHEET_TEMPLATES);
    const missingSheets = requiredSheets.filter(sheet => !existingSheets.includes(sheet));
    
    if (missingSheets.length === 0) {
      console.log('✅ All required sheets already exist');
      return;
    }

    console.log(`📝 Creating missing sheets: ${missingSheets.join(', ')}`);

    for (const sheetName of missingSheets) {
      try {
        console.log(`➕ Creating sheet: ${sheetName}`);
        
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: CONFIG.SPREADSHEET_ID,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: sheetName,
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: sheetName === 'Dashboard' ? 2 : 8
                  }
                }
              }
            }]
          }
        });
        
        console.log(`✅ Created sheet: ${sheetName}`);
      } catch (error) {
        console.error(`❌ Error creating sheet ${sheetName}:`, error.message);
      }
    }
  }

  // Populate sheet with template data
  async populateSheet(sheetName) {
    try {
      const template = SHEET_TEMPLATES[sheetName];
      if (!template) {
        console.log(`⚠️ No template found for sheet: ${sheetName}`);
        return;
      }

      console.log(`📝 Populating sheet: ${sheetName}`);

      // Prepare data (headers + data)
      const values = [template.headers, ...template.data];

      // Clear existing data
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        range: `${sheetName}!${template.range}`,
      });

      // Insert new data
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: values
        }
      });

      // Format headers (bold, background color)
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        requestBody: {
          requests: [{
            repeatCell: {
              range: {
                sheetId: await this.getSheetId(sheetName),
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: template.headers.length
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    bold: true
                  },
                  backgroundColor: {
                    red: 0.2,
                    green: 0.4,
                    blue: 0.8,
                    alpha: 1
                  }
                }
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor)'
            }
          }]
        }
      });

      console.log(`✅ Populated sheet: ${sheetName} (${values.length} rows)`);
    } catch (error) {
      console.error(`❌ Error populating sheet ${sheetName}:`, error.message);
    }
  }

  // Get sheet ID by name
  async getSheetId(sheetName) {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: CONFIG.SPREADSHEET_ID,
    });
    
    const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
    return sheet ? sheet.properties.sheetId : null;
  }

  // Setup all sheets
  async setupAllSheets() {
    try {
      console.log('🚀 Starting Google Sheets setup...\n');

      // Authenticate
      await this.authenticate();

      // Get spreadsheet info
      const { existingSheets } = await this.getSpreadsheetInfo();

      // Create missing sheets
      await this.createMissingSheets(existingSheets);

      // Populate all sheets with template data
      console.log('\n📝 Populating sheets with template data...');
      for (const sheetName of Object.keys(SHEET_TEMPLATES)) {
        await this.populateSheet(sheetName);
      }

      console.log('\n🎉 Setup completed successfully!');
      console.log(`🔗 Open your spreadsheet: https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit`);
      console.log('📱 Test in your app: http://localhost:5174');
      
    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  // Verify existing sheets
  async verifySheets() {
    try {
      console.log('🔍 Verifying sheets...\n');

      await this.authenticate();
      const { existingSheets } = await this.getSpreadsheetInfo();

      const requiredSheets = Object.keys(SHEET_TEMPLATES);
      const missingSheets = requiredSheets.filter(sheet => !existingSheets.includes(sheet));

      console.log('\n📊 Verification Results:');
      requiredSheets.forEach(sheet => {
        const status = existingSheets.includes(sheet) ? '✅' : '❌';
        console.log(`${status} ${sheet}`);
      });

      if (missingSheets.length > 0) {
        console.log(`\n⚠️ Missing sheets: ${missingSheets.join(', ')}`);
        console.log('Run "npm run setup-sheets" to create them.');
      } else {
        console.log('\n🎉 All sheets are present!');
      }

      // Check data in each sheet
      console.log('\n📋 Checking data in sheets...');
      for (const sheetName of existingSheets.filter(s => requiredSheets.includes(s))) {
        try {
          const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: `${sheetName}!A:Z`,
          });
          
          const rows = response.data.values || [];
          console.log(`📄 ${sheetName}: ${rows.length} rows (${rows.length > 0 ? rows.length - 1 : 0} data rows)`);
        } catch (error) {
          console.log(`❌ ${sheetName}: Error reading data`);
        }
      }

    } catch (error) {
      console.error('❌ Verification failed:', error.message);
    }
  }
}

// CLI Commands
const command = process.argv[2];
const setup = new GoogleSheetsSetup();

switch (command) {
  case 'setup':
    setup.setupAllSheets();
    break;
  case 'verify':
    setup.verifySheets();
    break;
  case 'info':
    setup.authenticate().then(() => setup.getSpreadsheetInfo());
    break;
  default:
    console.log(`
🚀 Google Sheets Setup Tool for StockManager

Usage:
  node setup-sheets.js <command>

Commands:
  setup   - Create missing sheets and populate with template data
  verify  - Check which sheets exist and their data
  info    - Show spreadsheet information

Examples:
  node setup-sheets.js setup
  node setup-sheets.js verify
  node setup-sheets.js info

Before running:
1. Install dependencies: npm install googleapis
2. Update CLIENT_SECRET in this file (get from Google Cloud Console)
3. Update SPREADSHEET_ID if needed
`);
    break;
}
