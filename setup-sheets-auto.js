import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalents
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - Update these values
const CONFIG = {
  SPREADSHEET_ID: '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0',
  // Service Account Key File (download from Google Cloud Console)
  SERVICE_ACCOUNT_KEY_FILE: 'service-account-key.json'
};

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

class GoogleSheetsAutoSetup {
  constructor() {
    this.auth = null;
    this.sheets = null;
  }

  // Initialize Google Sheets API with Service Account
  async initialize() {
    try {
      console.log('🔐 Initializing Google Sheets API...');
      
      // Check if service account key file exists
      const keyPath = path.join(__dirname, CONFIG.SERVICE_ACCOUNT_KEY_FILE);
      if (!fs.existsSync(keyPath)) {
        console.log('❌ Service account key file not found!');
        console.log('📝 Create service account key file first:');
        console.log('1. Go to Google Cloud Console > IAM & Admin > Service Accounts');
        console.log('2. Create new service account or select existing');
        console.log('3. Create key (JSON format)');
        console.log(`4. Save as: ${CONFIG.SERVICE_ACCOUNT_KEY_FILE}`);
        console.log('5. Share your spreadsheet with the service account email');
        return false;
      }

      // Load service account credentials
      const credentials = JSON.parse(fs.readFileSync(keyPath));
      
      // Initialize auth
      this.auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      // Initialize sheets API
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      console.log('✅ Google Sheets API initialized');
      return true;
    } catch (error) {
      console.error('❌ Initialization error:', error.message);
      return false;
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
      console.error('❌ Error getting spreadsheet info:', error.message);
      if (error.code === 403) {
        console.log('💡 Make sure to share your spreadsheet with the service account email');
      }
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

  // Get sheet ID by name
  async getSheetId(sheetName) {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: CONFIG.SPREADSHEET_ID,
    });
    
    const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
    return sheet ? sheet.properties.sheetId : null;
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
      const sheetId = await this.getSheetId(sheetName);
      if (sheetId !== null) {
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: CONFIG.SPREADSHEET_ID,
          requestBody: {
            requests: [{
              repeatCell: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: template.headers.length
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: true,
                      foregroundColor: {
                        red: 1,
                        green: 1,
                        blue: 1
                      }
                    },
                    backgroundColor: {
                      red: 0.2,
                      green: 0.4,
                      blue: 0.8
                    }
                  }
                },
                fields: 'userEnteredFormat(textFormat,backgroundColor)'
              }
            }]
          }
        });
      }

      console.log(`✅ Populated sheet: ${sheetName} (${values.length} rows)`);
    } catch (error) {
      console.error(`❌ Error populating sheet ${sheetName}:`, error.message);
    }
  }

  // Setup all sheets
  async setupAllSheets() {
    try {
      console.log('🚀 Starting Google Sheets auto-setup...\n');

      // Initialize API
      if (!await this.initialize()) {
        return;
      }

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

      if (!await this.initialize()) {
        return;
      }

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
        console.log('Run "node setup-sheets-auto.js setup" to create them.');
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
const setup = new GoogleSheetsAutoSetup();

switch (command) {
  case 'setup':
    setup.setupAllSheets();
    break;
  case 'verify':
    setup.verifySheets();
    break;
  case 'info':
    setup.initialize().then(() => setup.getSpreadsheetInfo());
    break;
  default:
    console.log(`
🚀 Google Sheets Auto-Setup Tool for StockManager

Usage:
  node setup-sheets-auto.js <command>

Commands:
  setup   - Create missing sheets and populate with template data
  verify  - Check which sheets exist and their data
  info    - Show spreadsheet information

Examples:
  node setup-sheets-auto.js setup
  node setup-sheets-auto.js verify
  node setup-sheets-auto.js info

Before running:
1. Install dependencies: npm install googleapis
2. Create service account key file (service-account-key.json)
3. Share your spreadsheet with the service account email
4. Update SPREADSHEET_ID in this file if needed

Setup Guide:
1. Go to Google Cloud Console > IAM & Admin > Service Accounts
2. Create new service account or select existing
3. Create key (JSON format) and save as 'service-account-key.json'
4. Share your spreadsheet with the service account email (found in the JSON file)
5. Run: node setup-sheets-auto.js setup
`);
    break;
}
