const GOOGLE_CONFIG = {
  SPREADSHEET_ID: '1rrHmqlzGFsOBIWJ_8KIzWoixQjKY4QIoRfyTQeVNnZg', // Updated spreadsheet ID
  API_KEY: 'AIzaSyBBqF5Kni3-NcZLhd9oCHHEGfNp-b6sDSQ',
  CLIENT_ID: '765513447018-oun2lnnjrcnlcb82qhfdvj9n1r2uo5c8.apps.googleusercontent.com',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
  DISCOVERY_DOC: 'https://sheets.googleapis.com/$discovery/rest?version=v4'
};

class SheetInitializer {
  constructor() {
    this.init();
  }

  async init() {
    // Wait for Google APIs to load
    await this.loadGoogleAPIs();
    await this.initializeGAPI();
  }

  async loadGoogleAPIs() {
    if (!window.gapi) {
      await this.loadScript('https://apis.google.com/js/api.js');
    }
    if (!window.google) {
      await this.loadScript('https://accounts.google.com/gsi/client');
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async initializeGAPI() {
    return new Promise((resolve, reject) => {
      window.gapi.load('client', {
        callback: async () => {
          try {
            await window.gapi.client.init({
              apiKey: GOOGLE_CONFIG.API_KEY,
              discoveryDocs: [GOOGLE_CONFIG.DISCOVERY_DOC],
            });
            console.log('GAPI initialized');
            resolve();
          } catch (error) {
            console.error('GAPI initialization failed:', error);
            reject(error);
          }
        },
        onerror: reject
      });
    });
  }

  async initializeSheets() {
    console.log('🚀 Initializing new sheets...');
    
    try {
      // Check existing sheets
      const spreadsheet = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID
      });

      const existingSheets = spreadsheet.result.sheets.map(sheet => sheet.properties.title);
      console.log('📋 Existing sheets:', existingSheets);

      const sheetsToCreate = [
        {
          name: 'Contacts',
          headers: ['ID', 'Name', 'Type', 'Email', 'Phone', 'Address', 'Company', 'Notes', 'CreatedAt', 'UpdatedAt']
        },
        {
          name: 'Debts',
          headers: ['ID', 'ContactID', 'ContactName', 'ContactType', 'Type', 'Description', 'Amount', 'ProductID', 'ProductName', 'Quantity', 'Status', 'TotalAmount', 'PaidAmount', 'RemainingAmount', 'DueDate', 'CreatedAt', 'UpdatedAt', 'Notes']
        },
        {
          name: 'DebtPayments',
          headers: ['ID', 'DebtID', 'Type', 'Amount', 'Quantity', 'PaymentDate', 'Notes', 'CreatedAt']
        }
      ];

      const requests = [];

      for (const sheet of sheetsToCreate) {
        if (!existingSheets.includes(sheet.name)) {
          console.log(`📝 Creating sheet: ${sheet.name}`);
          
          // Add sheet creation request
          requests.push({
            addSheet: {
              properties: {
                title: sheet.name
              }
            }
          });
        }
      }

      // Create new sheets if needed
      if (requests.length > 0) {
        const response = await window.gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
          resource: {
            requests: requests
          }
        });
        console.log('✅ New sheets created:', response);
      }

      // Add headers to new sheets
      for (const sheet of sheetsToCreate) {
        if (!existingSheets.includes(sheet.name)) {
          console.log(`📋 Adding headers to ${sheet.name}`);
          
          await window.gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
            range: `${sheet.name}!A1:Z1`,
            valueInputOption: 'RAW',
            resource: {
              values: [sheet.headers]
            }
          });
        }
      }

      console.log('✅ All sheets initialized successfully!');
      
      // Display success message
      const resultDiv = document.getElementById('result');
      if (resultDiv) {
        resultDiv.innerHTML = `
          <div class="alert alert-success">
            <h3>✅ Sheets Initialized Successfully!</h3>
            <p>The following sheets are now ready:</p>
            <ul>
              <li><strong>Contacts</strong> - For storing customer and supplier information</li>
              <li><strong>Debts</strong> - For tracking debt and credit records</li>
              <li><strong>DebtPayments</strong> - For recording payments and receipts</li>
            </ul>
            <p>You can now use the new Contact and Debt management features in your application!</p>
          </div>
        `;
      }

    } catch (error) {
      console.error('❌ Error initializing sheets:', error);
      
      const resultDiv = document.getElementById('result');
      if (resultDiv) {
        resultDiv.innerHTML = `
          <div class="alert alert-error">
            <h3>❌ Error Initializing Sheets</h3>
            <p>Error: ${error.message}</p>
            <p>Please check your credentials and try again.</p>
          </div>
        `;
      }
    }
  }

  async authenticate() {
    return new Promise((resolve, reject) => {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.CLIENT_ID,
        scope: GOOGLE_CONFIG.SCOPES,
        callback: (response) => {
          if (response.error) {
            reject(response);
          } else {
            console.log('✅ Authentication successful');
            resolve(response);
          }
        }
      });

      tokenClient.requestAccessToken();
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const initializer = new SheetInitializer();
  
  // Add click handler for authenticate button
  const authButton = document.getElementById('authenticateBtn');
  if (authButton) {
    authButton.addEventListener('click', async () => {
      try {
        authButton.textContent = 'Authenticating...';
        authButton.disabled = true;
        
        await initializer.authenticate();
        await initializer.initializeSheets();
        
        authButton.textContent = 'Authenticated ✅';
      } catch (error) {
        console.error('Authentication failed:', error);
        authButton.textContent = 'Authentication Failed ❌';
        authButton.disabled = false;
      }
    });
  }
});
