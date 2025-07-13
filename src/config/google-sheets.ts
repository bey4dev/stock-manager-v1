// Google Sheets API Configuration
export const GOOGLE_CONFIG = {
  // TODO: Replace with your actual credentials from Google Cloud Console
  CLIENT_ID: '752419828170-o835j9j32gmcmc9sdhcajnqoaikoh8j8.apps.googleusercontent.com',
  API_KEY: 'AIzaSyBcYircHFrqPXVkwHfo9DX4v91fVz2MvBw',
  
  // Google Sheets API settings
  DISCOVERY_DOC: 'https://sheets.googleapis.com/$discovery/rest?version=v4',
  // Simplified scopes - hanya yang diperlukan
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
  
  // Spreadsheet configuration
  SPREADSHEET_ID: '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0', // Replace with your spreadsheet ID
  
  // Sheet names for different data types
  SHEETS: {
    PRODUCTS: 'Products',
    SALES: 'Sales',
    PURCHASES: 'Purchases',
    CONTACTS: 'Contacts',
    DEBTS: 'Debts',
    DEBT_PAYMENTS: 'DebtPayments',
    DASHBOARD: 'Dashboard',
    STATUS_HUTANG: 'StatusHutang'
  },
  
  // Column ranges for each sheet
  RANGES: {
    PRODUCTS: 'Products!A:H',       // ID, Name, Category, Price, Stock, Cost, Description, Status
    SALES: 'Sales!A:O',             // ID, Date, Product, Quantity, Price, FinalPrice, Total, Customer, CustomerType, DiscountType, DiscountValue, PromoCode, OriginalTotal, Savings, Notes
    PURCHASES: 'Purchases!A:G',     // ID, Date, Product, Quantity, Cost, Total, Supplier
    CONTACTS: 'Contacts!A:J',       // ID, Name, Type, Email, Phone, Address, Company, Notes, CreatedAt, UpdatedAt
    DEBTS: 'Debts!A:R',             // ID, ContactID, ContactName, ContactType, Type, Description, Amount, ProductID, ProductName, Quantity, Status, TotalAmount, PaidAmount, RemainingAmount, DueDate, CreatedAt, UpdatedAt, Notes
    DEBT_PAYMENTS: 'DebtPayments!A:H', // ID, DebtID, Type, Amount, Quantity, PaymentDate, Notes, CreatedAt
    DASHBOARD: 'Dashboard!A:B',      // Key, Value pairs for metrics
    STATUS_HUTANG: 'StatusHutang!A:K' // ContactID, ContactName, ContactType, TotalHutang, TotalBayar, SisaHutang, Status, TerakhirHutang, TerakhirBayar, CreatedAt, UpdatedAt
  }
};

// Instructions for setup
export const SETUP_INSTRUCTIONS = `
🔧 Setup Google Sheets Integration:

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create OAuth 2.0 credentials (Web application)
5. Create API key
6. Update GOOGLE_CONFIG above with your credentials
7. Create a Google Spreadsheet with these sheets:
   - Products (columns: ID, Name, Category, Price, Stock, Cost, Description, Status)
   - Sales (columns: ID, Date, Product, Quantity, Price, FinalPrice, Total, Customer, CustomerType, DiscountType, DiscountValue, PromoCode, OriginalTotal, Savings, Notes)
   - Purchases (columns: ID, Date, Product, Quantity, Cost, Total, Supplier)
   - Contacts (columns: ID, Name, Type, Email, Phone, Address, Company, Notes, CreatedAt, UpdatedAt)
   - Debts (columns: ID, ContactID, ContactName, ContactType, Type, Description, Amount, ProductID, ProductName, Quantity, Status, TotalAmount, PaidAmount, RemainingAmount, DueDate, CreatedAt, UpdatedAt, Notes)
   - DebtPayments (columns: ID, DebtID, Type, Amount, Quantity, ProductName, PaymentDate, Notes, CreatedAt)
   - Dashboard (columns: Key, Value)
8. Copy spreadsheet ID from URL and update SPREADSHEET_ID
9. Set DEMO_MODE to false

📋 Spreadsheet Template:
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit

🆕 New Features Added:
- Contact Management (Customer & Supplier data)
- Debt Management (Money & Product debts)
- Payment Tracking (Money payments & Product deliveries)
- Enhanced data structure for better organization
`;

export default GOOGLE_CONFIG;
