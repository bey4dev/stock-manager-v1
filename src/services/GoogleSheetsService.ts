import { GOOGLE_CONFIG } from '../config/google-sheets';

// Types
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  cost: number;
  description: string;
  status: string;
}

export interface Sale {
  id: string;
  date: string;
  product: string;
  quantity: number;
  price: number;
  finalPrice?: number;
  total: number;
  customer: string;
  customerType?: string;
  discountType?: string;
  discountValue?: string;
  promoCode?: string;
  originalTotal?: number;
  savings?: number;
  notes?: string;
}

export interface Purchase {
  id: string;
  date: string;
  product: string;
  quantity: number;
  cost: number;
  total: number;
  supplier: string;
}

export interface Contact {
  id: string;
  name: string;
  type: 'customer' | 'supplier';
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlySales {
  month: string;
  amount: number;
}

export interface TopProduct {
  name: string;
  sales: number;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalRevenue: number;
  totalSales: number;
  totalPurchases: number;
  lowStockProducts: number;
  totalCost: number;
  profit: number;
  totalCustomers: number;
  monthlySales: MonthlySales[];
  topProducts: TopProduct[];
}

export interface UserProfile {
  name: string;
  email: string;
}

// Service implementation
class GoogleSheetsService {
  private tokenClient: any = null;
  private isAuthenticated = false;
  private tokenRefreshTimer: number | null = null;
  private readonly TOKEN_REFRESH_BUFFER = 10 * 60 * 1000; // 10 minutes before expiry

  constructor() {
    this.initGoogleAPI();
  }

  private async initGoogleAPI() {
    try {
      console.log('🔧 Initializing Google API...');
      console.log('🌐 Current URL:', window.location.href);
      console.log('🌐 Current Origin:', window.location.origin);
      
      // Check if scripts are already loaded
      if (!window.gapi) {
        console.log('📥 Loading Google API script...');
        await this.loadScript('https://apis.google.com/js/api.js');
      }
      
      if (!window.google) {
        console.log('📥 Loading Google Identity script...');
        await this.loadScript('https://accounts.google.com/gsi/client');
      }

      // Initialize GAPI
      console.log('🔧 Initializing GAPI client...');
      await new Promise((resolve, reject) => {
        window.gapi.load('client', {
          callback: () => {
            console.log('✅ GAPI client loaded');
            resolve(true);
          },
          onerror: (error: any) => {
            console.error('❌ GAPI client load error:', error);
            reject(error);
          }
        });
      });

      // Initialize client with API key and discovery docs
      console.log('🔧 Initializing GAPI client with API key...');
      console.log('🔑 Using API Key:', GOOGLE_CONFIG.API_KEY ? 'Set (hidden)' : 'NOT SET');
      await window.gapi.client.init({
        apiKey: GOOGLE_CONFIG.API_KEY,
        discoveryDocs: [GOOGLE_CONFIG.DISCOVERY_DOC],
      });
      console.log('✅ GAPI client initialized');

      // Initialize token client for OAuth
      console.log('🔧 Initializing OAuth token client...');
      console.log('🔑 Using Client ID:', GOOGLE_CONFIG.CLIENT_ID);
      console.log('🔐 Using Scopes:', GOOGLE_CONFIG.SCOPES);
      
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.CLIENT_ID,
        scope: GOOGLE_CONFIG.SCOPES,
        callback: '', // Will be set dynamically in authenticate method
        error_callback: (error: any) => {
          console.error('❌ OAuth initialization error:', error);
        }
      });

      console.log('✅ Google API initialization completed successfully');
    } catch (error) {
      console.error('❌ Error initializing Google API:', error);
      throw error;
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  // Check if user is already authenticated (for page reload)
  async checkAuthenticationStatus(): Promise<boolean> {
    console.log('🔍 Checking authentication status...');
    
    try {
      // Initialize Google API if not already done
      if (!window.gapi) {
        console.log('⏳ Google API not loaded, initializing...');
        await this.initGoogleAPI();
      }

      // Wait for gapi client to be ready with multiple retries
      let retries = 0;
      const maxRetries = 5;
      while ((!window.gapi?.client) && retries < maxRetries) {
        console.log(`⏳ GAPI client not ready, waiting... (attempt ${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
        retries++;
      }

      if (!window.gapi?.client) {
        console.warn('⚠️ GAPI client failed to initialize after retries');
        return false;
      }

      // First, try to get token from localStorage
      const savedToken = localStorage.getItem('google_oauth_token');
      if (savedToken) {
        try {
          const tokenData = JSON.parse(savedToken);
          console.log('🔍 Found saved token in localStorage');
          console.log('🔍 Token data:', { 
            hasAccessToken: !!tokenData.access_token,
            timestamp: tokenData.timestamp,
            expiresIn: tokenData.expires_in 
          });
          
          // Check if token is expired
          if (this.isTokenExpired(tokenData)) {
            console.log('⏰ Saved token is expired, removing from localStorage');
            localStorage.removeItem('google_oauth_token');
          } else {
            // Set the token in gapi client
            try {
              window.gapi.client.setToken(tokenData);
              this.isAuthenticated = true;
              console.log('✅ Token restored from localStorage');
              
              // Test the token by making a simple API call
              try {
                const testResponse = await window.gapi.client.request({
                  'path': 'https://www.googleapis.com/oauth2/v2/userinfo'
                });
                if (testResponse.status === 200) {
                  console.log('✅ Token validation successful');
                  
                  // Schedule auto-refresh for existing valid token
                  this.scheduleTokenRefresh(tokenData);
                  
                  return true;
                } else {
                  console.warn('⚠️ Token validation failed, status:', testResponse.status);
                  throw new Error('Invalid token');
                }
              } catch (testError) {
                console.warn('⚠️ Token test failed:', testError);
                localStorage.removeItem('google_oauth_token');
                this.isAuthenticated = false;
                return false;
              }
            } catch (setTokenError) {
              console.warn('⚠️ Error setting token:', setTokenError);
              localStorage.removeItem('google_oauth_token');
            }
          }
        } catch (parseError) {
          console.warn('⚠️ Error parsing saved token:', parseError);
          localStorage.removeItem('google_oauth_token');
        }
      }

      // Fallback: Check if we have a valid token in gapi client
      try {
        const token = window.gapi.client.getToken();
        if (token && token.access_token) {
          console.log('✅ Found existing access token in gapi client');
          
          // Simple validation - just check if token exists and has reasonable length
          if (token.access_token.length > 50) {
            console.log('✅ Token appears valid (length check passed)');
            this.isAuthenticated = true;
            return true;
          }
        }
      } catch (tokenError) {
        console.warn('⚠️ Error getting token from gapi client:', tokenError);
      }
      
      console.log('❌ No valid authentication found');
      this.isAuthenticated = false;
      return false;
      
    } catch (error) {
      console.error('❌ Error checking authentication status:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  // Authentication
  async authenticate(): Promise<boolean> {
    console.log('🔐 Starting Google authentication...');

    try {
      // Pastikan Google API sudah terinisialisasi
      if (!window.gapi) {
        console.log('⏳ Google API not loaded yet, initializing...');
        await this.initGoogleAPI();
      }

      if (!this.tokenClient) {
        console.log('⏳ Token client not ready, initializing...');
        await this.initGoogleAPI();
      }

      if (!this.tokenClient) {
        throw new Error('Token client still not initialized after retry');
      }

      console.log('🔑 Requesting access token...');

      return new Promise((resolve) => {
        // Set callback for this specific authentication attempt
        this.tokenClient.callback = (tokenResponse: any) => {
          console.log('📋 Token response received:', tokenResponse);
          console.log('📋 Token response type:', typeof tokenResponse);
          console.log('📋 Token response keys:', Object.keys(tokenResponse || {}));
          
          if (tokenResponse.error) {
            console.error('❌ OAuth error:', tokenResponse.error);
            console.error('❌ Error description:', tokenResponse.error_description);
            alert(`OAuth Error: ${tokenResponse.error}\n${tokenResponse.error_description || ''}`);
            resolve(false);
            return;
          }
          
          if (tokenResponse.access_token) {
            console.log('✅ Access token received successfully');
            console.log('🔑 Token length:', tokenResponse.access_token.length);
            
            // Set the token in gapi client
            try {
              window.gapi.client.setToken(tokenResponse);
              this.isAuthenticated = true;
              console.log('✅ Token set in gapi client');
              
              // Add timestamp for expiry calculation
              const tokenWithTimestamp = {
                ...tokenResponse,
                timestamp: Date.now()
              };
              
              // Save token to localStorage for persistence across reloads
              localStorage.setItem('google_oauth_token', JSON.stringify(tokenWithTimestamp));
              console.log('💾 Token saved to localStorage with timestamp');
              
              // Setup sheets structure after successful authentication
              this.validateAndSetupSheets().then((setupSuccess) => {
                if (setupSuccess) {
                  console.log('✅ Sheets setup completed after authentication');
                } else {
                  console.warn('⚠️ Sheets setup failed, but authentication was successful');
                }
              }).catch((setupError) => {
                console.error('❌ Error during sheets setup:', setupError);
              });
              
              // Schedule automatic token refresh
              this.scheduleTokenRefresh(tokenWithTimestamp);
              
              console.log('✅ Authentication successful');
              resolve(true);
            } catch (tokenSetError) {
              console.error('❌ Error setting token in gapi client:', tokenSetError);
              resolve(false);
            }
          } else {
            console.error('❌ Authentication failed - no access token in response');
            console.error('❌ Full token response:', JSON.stringify(tokenResponse, null, 2));
            alert('Authentication failed: No access token received');
            resolve(false);
          }
        };
        
        // Set error callback
        this.tokenClient.error_callback = (error: any) => {
          console.error('❌ OAuth error callback:', error);
          alert(`OAuth Error: ${error.type || 'Unknown error'}`);
          resolve(false);
        };
        
        // Request access token
        console.log('🚀 Launching OAuth flow...');
        console.log('🔧 Using client_id:', GOOGLE_CONFIG.CLIENT_ID);
        console.log('🔧 Using scopes:', GOOGLE_CONFIG.SCOPES);
        
        try {
          this.tokenClient.requestAccessToken({ 
            prompt: 'consent',
            hint: '',
            enable_granular_consent: false
          });
          console.log('✅ OAuth flow launched successfully');
        } catch (requestError) {
          console.error('❌ Error launching OAuth flow:', requestError);
          const errorMessage = requestError instanceof Error ? requestError.message : String(requestError);
          alert(`Error launching OAuth: ${errorMessage}`);
          resolve(false);
        }
      });
    } catch (error) {
      console.error('❌ Authentication error:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    console.log('🚪 Signing out...');
    this.isAuthenticated = false;
    
    // Clear auto-refresh timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
      console.log('⏰ Cleared token refresh timer');
    }
    
    try {
      const token = window.gapi.client.getToken();
      if (token) {
        window.google.accounts.oauth2.revoke(token.access_token);
        window.gapi.client.setToken('');
      }
      
      // Clear saved token from localStorage
      localStorage.removeItem('google_oauth_token');
      console.log('🗑️ Cleared token from localStorage');
      
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Error during sign out:', error);
    }
  }

  async getUserProfile(): Promise<UserProfile> {
    console.log('👤 Fetching user profile...');
    
    try {
      // Enhanced method with multiple fallbacks
      let userInfo = null;
      
      // Method 1: Try OAuth2 userinfo v2
      try {
        console.log('🔍 [DEBUG] Trying OAuth2 v2 userinfo...');
        const response = await window.gapi.client.request({
          'path': 'https://www.googleapis.com/oauth2/v2/userinfo'
        });
        
        console.log('📋 [DEBUG] OAuth2 v2 response:', response);
        console.log('📋 [DEBUG] Response status:', response.status);
        console.log('📋 [DEBUG] Response result:', response.result);
        
        if (response.result && response.status === 200) {
          userInfo = response.result;
          console.log('✅ [DEBUG] Got userinfo from OAuth2 v2:', userInfo);
        }
      } catch (v2Error) {
        console.warn('⚠️ OAuth2 v2 failed:', v2Error);
      }
      
      // Method 2: Try direct fetch with access token
      if (!userInfo) {
        try {
          console.log('🔍 [DEBUG] Trying direct fetch...');
          const token = window.gapi.client.getToken();
          if (token?.access_token) {
            console.log('🔑 [DEBUG] Using access token:', token.access_token.substring(0, 20) + '...');
            const fetchResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: {
                'Authorization': `Bearer ${token.access_token}`
              }
            });
            
            console.log('📋 [DEBUG] Fetch response status:', fetchResponse.status);
            
            if (fetchResponse.ok) {
              userInfo = await fetchResponse.json();
              console.log('✅ [DEBUG] Got userinfo from fetch:', userInfo);
            } else {
              console.warn('⚠️ Fetch failed with status:', fetchResponse.status);
            }
          } else {
            console.warn('⚠️ No access token available for fetch');
          }
        } catch (fetchError) {
          console.warn('⚠️ Direct fetch failed:', fetchError);
        }
      }
      
      if (userInfo) {
        console.log('📋 [DEBUG] Processing user info:', userInfo);
        const { name, email, given_name, family_name } = userInfo;
        
        // Build full name from available data
        let fullName = name;
        if (!fullName && (given_name || family_name)) {
          fullName = `${given_name || ''} ${family_name || ''}`.trim();
        }
        if (!fullName) {
          console.warn('⚠️ No name found in user info, using fallback');
          fullName = 'Google User';
        }
        
        const userEmail = email || 'user@gmail.com';
        
        const profile = { 
          name: fullName, 
          email: userEmail 
        };
        
        console.log('✅ Final profile constructed:', profile);
        return profile;
      }
      
      // Final fallback
      console.log('⚠️ No profile data from any method, using fallback');
      return {
        name: 'Google User',
        email: 'user@gmail.com'
      };
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      
      // Return fallback profile instead of throwing error
      console.log('🔄 Using fallback profile due to error');
      return {
        name: 'Google User',
        email: 'user@gmail.com'
      };
    }
  }

  // Products CRUD
  async getProducts(): Promise<Product[]> {
    console.log('📊 Fetching products from Google Sheets...');

    try {
      return await this.retryWithFreshToken(async () => {
        if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
          console.error('❌ Google Sheets API not initialized');
          throw new Error('Google Sheets API not initialized');
        }

        const response = await window.gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
          range: GOOGLE_CONFIG.RANGES.PRODUCTS,
        });

        const rows = response.result.values || [];
        if (rows.length <= 1) {
          console.log('📦 No products found');
          return [];
        }

        const products = rows.slice(1).map((row: any[]) => ({
          id: row[0] || '',
          name: row[1] || '',
          category: row[2] || '',
          price: parseFloat(row[3]) || 0,
          stock: parseInt(row[4]) || 0,
          cost: parseFloat(row[5]) || 0,
          description: row[6] || '',
          status: row[7] || 'Active',
        }));
        
        console.log(`📦 Processed ${products.length} products`);
        return products;
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<boolean> {
    console.log('➕ Adding product to Google Sheets:', product);

    try {
      if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
        console.error('Google Sheets API not initialized');
        return false;
      }

      const id = 'PRD_' + Date.now();
      const values = [[
        id,
        product.name,
        product.category,
        product.price,
        product.stock,
        product.cost,
        product.description,
        product.status || 'Active'
      ]];

      const response = await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
        range: GOOGLE_CONFIG.RANGES.PRODUCTS,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values }
      });

      console.log('✅ Product added successfully', response);
      return true;
    } catch (error) {
      console.error('❌ Error adding product:', error);
      return false;
    }
  }

  async updateProduct(product: Product): Promise<boolean> {
    console.log('🔄 Updating product:', product);

    try {
      // Get all products to find the row index
      const products = await this.getProducts();
      const productIndex = products.findIndex(p => p.id === product.id);
      
      if (productIndex === -1) {
        console.error('❌ Product not found');
        return false;
      }

      const rowIndex = productIndex + 2; // +1 for header, +1 for 1-based indexing
      const range = `Products!A${rowIndex}:H${rowIndex}`;
      
      const values = [[
        product.id,
        product.name,
        product.category,
        product.price,
        product.stock,
        product.cost,
        product.description,
        product.status
      ]];

      const response = await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        resource: { values }
      });

      console.log('✅ Product updated successfully', response);
      return true;
    } catch (error) {
      console.error('❌ Error updating product:', error);
      return false;
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    console.log('🗑️ Deleting product:', productId);

    try {
      // Get all products to find the row index
      const products = await this.getProducts();
      const productIndex = products.findIndex(p => p.id === productId);
      
      if (productIndex === -1) {
        console.error('❌ Product not found');
        return false;
      }

      const rowIndex = productIndex + 1; // +1 for header row (0-based for delete operation)
      
      // Get sheet ID
      const spreadsheetResponse = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
      });
      
      const sheets = spreadsheetResponse.result.sheets || [];
      const productsSheet = sheets.find((sheet: any) => sheet.properties.title === 'Products');
      
      if (!productsSheet) {
        console.error('❌ Products sheet not found');
        return false;
      }
      
      const sheetId = productsSheet.properties.sheetId;

      // Delete the row
      const response = await window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
        resource: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1
              }
            }
          }]
        }
      });

      console.log('✅ Product deleted successfully', response);
      return true;
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      return false;
    }
  }

  // Sales CRUD
  async getSales(): Promise<Sale[]> {
    console.log('📈 Fetching sales from Google Sheets...');

    try {
      return await this.retryWithFreshToken(async () => {
        const response = await window.gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
          range: GOOGLE_CONFIG.RANGES.SALES,
        });

        const rows = response.result.values || [];
        if (rows.length <= 1) {
          console.log('📈 No sales found');
          return [];
        }

        const sales = rows.slice(1).map((row: any[]) => ({
          id: row[0] || '',
          date: row[1] || '',
          product: row[2] || '',
          quantity: parseInt(row[3]) || 0,
          price: parseFloat(row[4]) || 0,
          finalPrice: parseFloat(row[5]) || parseFloat(row[6]) || 0,
          total: parseFloat(row[6]) || parseFloat(row[5]) || 0,
          customer: row[7] || '',
          customerType: row[8] || 'regular',
          discountType: row[9] || 'none',
          discountValue: row[10] || '',
          promoCode: row[11] || '',
          originalTotal: parseFloat(row[12]) || parseFloat(row[6]) || parseFloat(row[5]) || 0,
          savings: parseFloat(row[13]) || 0,
          notes: row[14] || ''
        }));

        console.log(`📈 Processed ${sales.length} sales`);
        return sales;
      });
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  }

  async addSale(sale: Omit<Sale, 'id'>): Promise<boolean> {
    console.log('➕ Adding sale to Google Sheets:', sale);

    try {
      // 1. Add sale record
      const id = 'SAL_' + Date.now();
      const values = [[
        id,
        sale.date,
        sale.product,
        sale.quantity,
        sale.price,
        sale.finalPrice || sale.total,
        sale.total,
        sale.customer,
        sale.customerType || 'regular',
        sale.discountType || 'none',
        sale.discountValue || '',
        sale.promoCode || '',
        sale.originalTotal || sale.total,
        sale.savings || 0,
        sale.notes || ''
      ]];

      const response = await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
        range: GOOGLE_CONFIG.RANGES.SALES,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values }
      });

      console.log('✅ Sale added successfully', response);

      // 2. Update product stock (reduce stock)
      console.log('🔄 Reducing product stock for:', sale.product);
      
      // Get current products to find the product
      const products = await this.getProducts();
      const productToUpdate = products.find(p => p.name === sale.product);
      
      if (productToUpdate) {
        console.log(`📦 Current stock for ${sale.product}: ${productToUpdate.stock}`);
        const newStock = productToUpdate.stock - sale.quantity;
        console.log(`📦 New stock for ${sale.product}: ${newStock}`);
        
        // Update the product with new stock
        const updatedProduct = { ...productToUpdate, stock: newStock };
        const stockUpdateSuccess = await this.updateProduct(updatedProduct);
        
        if (stockUpdateSuccess) {
          console.log('✅ Product stock reduced successfully');
        } else {
          console.error('❌ Failed to reduce product stock');
          // Don't fail the entire sale if stock update fails
        }
      } else {
        console.error('❌ Product not found for stock update:', sale.product);
      }

      return true;
    } catch (error) {
      console.error('❌ Error adding sale:', error);
      return false;
    }
  }

  // Purchases CRUD
  async getPurchases(): Promise<Purchase[]> {
    console.log('🛒 Fetching purchases from Google Sheets...');

    try {
      return await this.retryWithFreshToken(async () => {
        const response = await window.gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
          range: GOOGLE_CONFIG.RANGES.PURCHASES,
        });

        const rows = response.result.values || [];
        if (rows.length <= 1) {
          console.log('🛒 No purchases found');
          return [];
        }

        const purchases = rows.slice(1).map((row: any[]) => ({
          id: row[0] || '',
          date: row[1] || '',
          product: row[2] || '',
          quantity: parseInt(row[3]) || 0,
          cost: parseFloat(row[4]) || 0,
          total: parseFloat(row[5]) || 0,
          supplier: row[6] || '',
        }));

        console.log(`🛒 Processed ${purchases.length} purchases`);
        return purchases;
      });
    } catch (error) {
      console.error('Error fetching purchases:', error);
      throw error;
    }
  }

  async addPurchase(purchase: Omit<Purchase, 'id'>): Promise<boolean> {
    console.log('➕ Adding purchase to Google Sheets:', purchase);

    try {
      // 1. Add purchase record
      const id = 'PUR_' + Date.now();
      const values = [[
        id,
        purchase.date,
        purchase.product,
        purchase.quantity,
        purchase.cost,
        purchase.total,
        purchase.supplier
      ]];

      const response = await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
        range: GOOGLE_CONFIG.RANGES.PURCHASES,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values }
      });

      console.log('✅ Purchase added successfully', response);

      // 2. Update product stock
      console.log('🔄 Updating product stock for:', purchase.product);
      
      // Get current products to find the product
      const products = await this.getProducts();
      const productToUpdate = products.find(p => p.name === purchase.product);
      
      if (productToUpdate) {
        console.log(`📦 Current stock for ${purchase.product}: ${productToUpdate.stock}`);
        const newStock = productToUpdate.stock + purchase.quantity;
        console.log(`📦 New stock for ${purchase.product}: ${newStock}`);
        
        // Update the product with new stock
        const updatedProduct = { ...productToUpdate, stock: newStock };
        const stockUpdateSuccess = await this.updateProduct(updatedProduct);
        
        if (stockUpdateSuccess) {
          console.log('✅ Product stock updated successfully');
        } else {
          console.error('❌ Failed to update product stock');
          // Don't fail the entire purchase if stock update fails
        }
      } else {
        console.error('❌ Product not found for stock update:', purchase.product);
      }

      return true;
    } catch (error) {
      console.error('❌ Error adding purchase:', error);
      return false;
    }
  }

  async addContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
    console.log('➕ Adding contact to Google Sheets:', contact);

    try {
      const id = 'CONTACT_' + Date.now();
      const timestamp = new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/(\d+)\/(\d+)\/(\d+),?\s*(\d+):(\d+):(\d+)/, '$3-$2-$1 $4:$5:$6 WIB');

      const values = [[
        id,
        contact.name,
        contact.type,
        contact.email || '',
        contact.phone || '',
        contact.address || '',
        contact.company || '',
        contact.notes || '',
        timestamp, // createdAt
        timestamp  // updatedAt
      ]];

      const response = await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
        range: GOOGLE_CONFIG.RANGES.CONTACTS,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values }
      });

      console.log('✅ Contact added successfully', response);
      return true;
    } catch (error) {
      console.error('❌ Error adding contact:', error);
      return false;
    }
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    console.log('📊 Calculating dashboard metrics...');

    try {
      const [products, sales, purchases] = await Promise.all([
        this.getProducts(),
        this.getSales(),
        this.getPurchases()
      ]);

      const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
      const totalCost = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
      const lowStockProducts = products.filter(p => p.stock <= 10).length;
      const totalCustomers = new Set(sales.map(sale => sale.customer)).size;

      // Calculate monthly sales
      const monthlySalesMap: { [key: string]: number } = {};
      if (sales.length > 0) {
        sales.forEach(sale => {
          try {
            const saleDate = new Date(sale.date);
            if (!isNaN(saleDate.getTime())) {
              const monthKey = saleDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
              monthlySalesMap[monthKey] = (monthlySalesMap[monthKey] || 0) + sale.total;
            }
          } catch (error) {
            console.warn('⚠️ Invalid date format for sale:', sale.date);
          }
        });
      }

      const monthlySales: MonthlySales[] = Object.entries(monthlySalesMap)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => {
          // Sort by date properly
          try {
            const dateA = new Date(a.month + ' 1');
            const dateB = new Date(b.month + ' 1');
            return dateA.getTime() - dateB.getTime();
          } catch {
            return 0;
          }
        })
        .slice(-6); // Last 6 months

      // Calculate top products
      const productSalesMap: { [key: string]: number } = {};
      if (sales.length > 0) {
        sales.forEach(sale => {
          productSalesMap[sale.product] = (productSalesMap[sale.product] || 0) + sale.quantity;
        });
      }

      const topProducts: TopProduct[] = Object.entries(productSalesMap)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5); // Top 5 products

      const metrics: DashboardMetrics = {
        totalProducts: products.length,
        totalRevenue,
        totalSales: sales.length,
        totalPurchases: purchases.length,
        lowStockProducts,
        totalCost,
        profit: totalRevenue - totalCost,
        totalCustomers,
        monthlySales,
        topProducts
      };

      console.log('📊 Dashboard metrics calculated:', metrics);
      return metrics;
    } catch (error) {
      console.error('❌ Error calculating dashboard metrics:', error);
      throw error;
    }
  }

  // Connection status
  getConnectionStatus(): boolean {
    return this.isAuthenticated && !!window.gapi?.client?.sheets;
  }

  // Update stock after sale
  async updateStockAfterSale(productName: string, quantity: number): Promise<boolean> {
    try {
      const products = await this.getProducts();
      const product = products.find(p => p.name === productName);
      
      if (!product) {
        console.error('❌ Product not found for stock update:', productName);
        return false;
      }

      const updatedProduct = {
        ...product,
        stock: Math.max(0, product.stock - quantity)
      };

      console.log(`📦 Updating stock for ${productName}: ${product.stock} -> ${updatedProduct.stock}`);
      
      return await this.updateProduct(updatedProduct);
    } catch (error) {
      console.error('❌ Error updating stock after sale:', error);
      return false;
    }
  }

  // Update stock after purchase
  async updateStockAfterPurchase(productName: string, quantity: number): Promise<boolean> {
    try {
      const products = await this.getProducts();
      const product = products.find(p => p.name === productName);
      
      if (!product) {
        console.error('❌ Product not found for stock update:', productName);
        return false;
      }

      const updatedProduct = {
        ...product,
        stock: product.stock + quantity
      };

      console.log(`📦 Updating stock for ${productName}: ${product.stock} -> ${updatedProduct.stock}`);
      
      return await this.updateProduct(updatedProduct);
    } catch (error) {
      console.error('❌ Error updating stock after purchase:', error);
      return false;
    }
  }

  // Generic sheet data methods
  async getSheetData(sheetName: string): Promise<{ success: boolean; data?: any[][] }> {
    console.log(`📊 Fetching data from sheet: ${sheetName}`);

    try {
      return await this.retryWithFreshToken(async () => {
        if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
          console.error('❌ Google Sheets API not initialized');
          throw new Error('Google Sheets API not initialized');
        }

        const response = await window.gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
          range: `${sheetName}!A:Z`,
        });

        const rows = response.result.values || [];
        if (rows.length <= 1) {
          console.log(`📦 No data found in ${sheetName}`);
          return { success: true, data: [] };
        }

        console.log(`✅ Fetched ${rows.length - 1} rows from ${sheetName}`);
        return { success: true, data: rows.slice(1) }; // Skip header row
      });
    } catch (error) {
      console.error(`❌ Error fetching ${sheetName} data:`, error);
      return { success: false };
    }
  }

  async appendToSheet(sheetName: string, rows: any[][]): Promise<{ success: boolean }> {
    console.log(`📝 Appending ${rows.length} rows to ${sheetName}`);

    try {
      return await this.retryWithFreshToken(async () => {
        if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
          console.error('❌ Google Sheets API not initialized');
          throw new Error('Google Sheets API not initialized');
        }

        const response = await window.gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
          range: `${sheetName}!A:Z`,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: rows
          }
        });

        console.log(`✅ Successfully appended to ${sheetName}:`, response);
        return { success: true };
      });
    } catch (error) {
      console.error(`❌ Error appending to ${sheetName}:`, error);
      return { success: false };
    }
  }

  async updateSheetRow(sheetName: string, rowIndex: number, rowData: any[]): Promise<{ success: boolean }> {
    console.log(`📝 Updating row ${rowIndex} in ${sheetName}`);

    try {
      return await this.retryWithFreshToken(async () => {
        if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
          console.error('❌ Google Sheets API not initialized');
          throw new Error('Google Sheets API not initialized');
        }

        const range = `${sheetName}!A${rowIndex}:Z${rowIndex}`;
        const response = await window.gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
          range: range,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [rowData]
          }
        });

        console.log(`✅ Successfully updated row ${rowIndex} in ${sheetName}:`, response);
        return { success: true };
      });
    } catch (error) {
      console.error(`❌ Error updating row ${rowIndex} in ${sheetName}:`, error);
      return { success: false };
    }
  }

  async deleteSheetRow(sheetName: string, rowIndex: number): Promise<{ success: boolean }> {
    console.log(`🗑️ Deleting row ${rowIndex} from ${sheetName}`);

    try {
      return await this.retryWithFreshToken(async () => {
        if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
          console.error('❌ Google Sheets API not initialized');
          throw new Error('Google Sheets API not initialized');
        }

        // Get sheet ID first
        const spreadsheet = await window.gapi.client.sheets.spreadsheets.get({
          spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID
        });

        const sheet = spreadsheet.result.sheets?.find((s: any) => s.properties.title === sheetName);
        if (!sheet) {
          throw new Error(`Sheet ${sheetName} not found`);
        }

        const sheetId = sheet.properties.sheetId;

        // Delete the row (rowIndex is 1-based, but API uses 0-based)
        const response = await window.gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
          resource: {
            requests: [{
              deleteDimension: {
                range: {
                  sheetId: sheetId,
                  dimension: 'ROWS',
                  startIndex: rowIndex - 1,
                  endIndex: rowIndex
                }
              }
            }]
          }
        });

        console.log(`✅ Successfully deleted row ${rowIndex} from ${sheetName}:`, response);
        return { success: true };
      });
    } catch (error) {
      console.error(`❌ Error deleting row ${rowIndex} from ${sheetName}:`, error);
      return { success: false };
    }
  }

  // Setup and validation methods
  async validateAndSetupSheets(): Promise<boolean> {
    console.log('🔧 Validating and setting up Google Sheets structure...');
    
    try {
      // Get spreadsheet metadata to check existing sheets
      const response = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
      });
      
      const existingSheets = response.result.sheets?.map((sheet: any) => sheet.properties.title) || [];
      console.log('📋 Existing sheets:', existingSheets);
      
      const requiredSheets = Object.values(GOOGLE_CONFIG.SHEETS);
      const missingSheets = requiredSheets.filter(sheet => !existingSheets.includes(sheet));
      
      if (missingSheets.length > 0) {
        console.log('⚠️ Missing sheets:', missingSheets);
        await this.createMissingSheets(missingSheets);
      }
      
      // Setup headers for each sheet
      await this.setupSheetHeaders();
      
      console.log('✅ Sheets validation and setup completed');
      return true;
    } catch (error) {
      console.error('❌ Error validating/setting up sheets:', error);
      return false;
    }
  }

  private async createMissingSheets(missingSheets: string[]): Promise<void> {
    console.log('📝 Creating missing sheets:', missingSheets);
    
    const requests = missingSheets.map(sheetName => ({
      addSheet: {
        properties: {
          title: sheetName
        }
      }
    }));

    try {
      await window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
        resource: {
          requests: requests
        }
      });
      console.log('✅ Missing sheets created successfully');
    } catch (error) {
      console.error('❌ Error creating missing sheets:', error);
      throw error;
    }
  }

  private async setupSheetHeaders(): Promise<void> {
    console.log('📋 Setting up sheet headers...');
    
    const sheetHeaders = {
      [GOOGLE_CONFIG.SHEETS.PRODUCTS]: ['ID', 'Name', 'Category', 'Price', 'Stock', 'Cost', 'Description', 'Status'],
      [GOOGLE_CONFIG.SHEETS.SALES]: ['ID', 'Date', 'Product', 'Quantity', 'Price', 'Total', 'Customer'],
      [GOOGLE_CONFIG.SHEETS.PURCHASES]: ['ID', 'Date', 'Product', 'Quantity', 'Cost', 'Total', 'Supplier'],
      [GOOGLE_CONFIG.SHEETS.CONTACTS]: ['ID', 'Name', 'Type', 'Email', 'Phone', 'Address', 'Company', 'Notes', 'CreatedAt', 'UpdatedAt'],
      [GOOGLE_CONFIG.SHEETS.DEBTS]: ['ID', 'ContactID', 'ContactName', 'ContactType', 'Type', 'Description', 'Amount', 'ProductID', 'ProductName', 'Quantity', 'Status', 'TotalAmount', 'PaidAmount', 'RemainingAmount', 'DueDate', 'CreatedAt', 'UpdatedAt', 'Notes'],
      [GOOGLE_CONFIG.SHEETS.DEBT_PAYMENTS]: ['ID', 'DebtID', 'Type', 'Amount', 'Quantity', 'PaymentDate', 'Notes', 'CreatedAt'],
      [GOOGLE_CONFIG.SHEETS.DASHBOARD]: ['Key', 'Value'],
      [GOOGLE_CONFIG.SHEETS.STATUS_HUTANG]: ['ContactID', 'ContactName', 'ContactType', 'TotalHutang', 'TotalTerbayar', 'SisaHutang', 'SaldoBersih', 'Status', 'TerakhirHutang', 'TerakhirBayar', 'CreatedAt', 'UpdatedAt']
    };

    for (const [sheetName, headers] of Object.entries(sheetHeaders)) {
      try {
        // Check if headers already exist (row 1 is not empty)
        const checkResponse = await window.gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
          range: `${sheetName}!A1:Z1`,
        });

        const existingHeaders = checkResponse.result.values?.[0] || [];
        
        if (existingHeaders.length === 0) {
          // Add headers
          await window.gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: GOOGLE_CONFIG.SPREADSHEET_ID,
            range: `${sheetName}!A1`,
            valueInputOption: 'RAW',
            resource: {
              values: [headers]
            }
          });
          console.log(`✅ Headers added to ${sheetName} sheet`);
        } else {
          console.log(`ℹ️ Headers already exist in ${sheetName} sheet`);
        }
      } catch (error) {
        console.error(`❌ Error setting up headers for ${sheetName}:`, error);
      }
    }
  }

  // Helper method to retry API calls with fresh token
  private async retryWithFreshToken<T>(apiCall: () => Promise<T>, maxRetries: number = 1): Promise<T> {
    try {
      return await apiCall();
    } catch (error: any) {
      console.log('🔄 API call failed, checking if retry is needed:', error);
      
      // Check if it's a 403 or authentication error
      if (maxRetries > 0 && (error.status === 403 || error.status === 401)) {
        console.log('🔄 Authentication error detected, attempting auto-refresh...');
        
        try {
          // Try automatic token refresh
          const refreshed = await this.refreshTokenAutomatically();
          
          if (refreshed) {
            console.log('✅ Token refreshed successfully, retrying API call...');
            return await apiCall();
          } else {
            console.log('❌ Auto-refresh failed, clearing auth state');
            this.isAuthenticated = false;
            localStorage.removeItem('google_oauth_token');
            throw new Error('Authentication failed - please login again');
          }
        } catch (retryError) {
          console.log('❌ Retry failed:', retryError);
          throw error; // Return original error
        }
      } else {
        throw error;
      }
    }
  }

  // Helper method to check if token is expired
  private isTokenExpired(token: any): boolean {
    if (!token) {
      console.log('🔍 Token expiry check: No token provided');
      return true;
    }
    
    const now = Date.now();
    let expiresAt = 0;
    
    // Handle different token formats
    if (token.expires_at) {
      // Unix timestamp in seconds
      expiresAt = parseInt(token.expires_at) * 1000;
    } else if (token.expires_in && token.created_at) {
      // expires_in (seconds) + created_at
      expiresAt = parseInt(token.created_at) + (parseInt(token.expires_in) * 1000);
    } else if (token.expires_in) {
      // Assume created_at is now if not provided
      const createdAt = token.timestamp || now;
      expiresAt = createdAt + (parseInt(token.expires_in) * 1000);
    } else {
      // No expiry info, check if token is recent (less than 1 hour old)
      const tokenAge = now - (token.timestamp || 0);
      const maxAge = 60 * 60 * 1000; // 1 hour
      const isOld = tokenAge > maxAge;
      console.log(`🔍 Token age check: age=${tokenAge}ms, maxAge=${maxAge}ms, isOld=${isOld}`);
      return isOld;
    }
    
    const isExpired = now >= expiresAt;
    const timeLeft = Math.max(0, expiresAt - now);
    
    console.log(`🔍 Token expiry check: now=${now}, expires=${expiresAt}, expired=${isExpired}, timeLeft=${Math.round(timeLeft/1000/60)}min`);
    return isExpired;
  }

  // Auto-refresh token before it expires
  private async refreshTokenAutomatically(): Promise<boolean> {
    try {
      console.log('🔄 Attempting automatic token refresh...');
      
      if (!this.tokenClient) {
        console.log('⚠️ Token client not available for refresh');
        return false;
      }
      
      return new Promise((resolve) => {
        // Save original callback
        const originalCallback = this.tokenClient.callback;
        
        // Set temporary callback for refresh
        this.tokenClient.callback = (response: any) => {
          if (response.access_token) {
            const tokenWithTimestamp = {
              ...response,
              timestamp: Date.now()
            };
            
            // Update localStorage
            localStorage.setItem('google_oauth_token', JSON.stringify(tokenWithTimestamp));
            
            // Update gapi client
            window.gapi.client.setToken(response);
            this.isAuthenticated = true;
            
            console.log('✅ Token auto-refreshed successfully');
            
            // Schedule next refresh
            this.scheduleTokenRefresh(tokenWithTimestamp);
            
            resolve(true);
          } else {
            console.log('❌ Auto-refresh failed - no token received');
            resolve(false);
          }
          
          // Restore original callback
          this.tokenClient.callback = originalCallback;
        };
        
        // Request new token silently (without user interaction)
        try {
          this.tokenClient.requestAccessToken({ prompt: '' });
        } catch (error) {
          console.error('❌ Error requesting token refresh:', error);
          this.tokenClient.callback = originalCallback;
          resolve(false);
        }
      });
    } catch (error) {
      console.error('❌ Auto-refresh error:', error);
      return false;
    }
  }

  // Schedule automatic token refresh
  private scheduleTokenRefresh(token: any): void {
    // Clear existing timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }

    if (!token) return;

    const now = Date.now();
    let refreshTime = 0;

    // Calculate when to refresh (with buffer)
    if (token.expires_in) {
      const expiryTime = (token.timestamp || now) + (parseInt(token.expires_in) * 1000);
      refreshTime = expiryTime - this.TOKEN_REFRESH_BUFFER;
    } else {
      // Default: refresh after 50 minutes
      refreshTime = now + (50 * 60 * 1000);
    }

    const delay = Math.max(0, refreshTime - now);
    const delayMinutes = Math.round(delay / 1000 / 60);

    console.log(`⏰ Scheduling token refresh in ${delayMinutes} minutes`);

    this.tokenRefreshTimer = window.setTimeout(async () => {
      console.log('⏰ Auto-refresh timer triggered');
      const success = await this.refreshTokenAutomatically();
      
      if (!success) {
        console.log('⚠️ Auto-refresh failed, user will need to re-authenticate');
        // Clear authentication state
        this.isAuthenticated = false;
        localStorage.removeItem('google_oauth_token');
      }
    }, delay);
  }

  // Enhanced token validation with auto-refresh
  // private async ensureValidToken(): Promise<boolean> {
  //   const savedToken = localStorage.getItem('google_oauth_token');
    
  //   if (!savedToken) {
  //     console.log('🔍 No token found, need authentication');
  //     return false;
  //   }

  //   try {
  //     const token = JSON.parse(savedToken);
      
  //     if (!token.access_token) {
  //       console.log('🔍 Invalid token format, need authentication');
  //       return false;
  //     }

  //     // Check if token will expire soon
  //     const now = Date.now();
  //     const tokenAge = now - (token.timestamp || 0);
  //     const maxAge = ((token.expires_in || 3600) * 1000) - this.TOKEN_REFRESH_BUFFER;

  //     if (tokenAge >= maxAge) {
  //       console.log('⏰ Token will expire soon, attempting refresh...');
  //       return await this.refreshTokenAutomatically();
  //     }

  //     // Token is still valid
  //     return true;
  //   } catch (error) {
  //     console.error('❌ Error parsing token:', error);
  //     localStorage.removeItem('google_oauth_token');
  //     return false;
  //   }
  // }

  // Enhanced API request wrapper with auto-retry
  // private async makeAuthenticatedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  //   try {
  //     // Ensure token is valid before request
  //     if (!await this.ensureValidToken()) {
  //       throw new Error('Token validation failed - authentication required');
  //     }

  //     // Make the request
  //     return await requestFn();
  //   } catch (error: any) {
  //     // Handle authentication errors
  //     if (error.status === 401 || error.status === 403) {
  //       console.log('🔄 Auth error detected, trying to refresh token...');
        
  //       const refreshed = await this.refreshTokenAutomatically();
  //       if (refreshed) {
  //         console.log('✅ Token refreshed, retrying request...');
  //         return await requestFn(); // Retry once
  //       } else {
  //         console.log('❌ Token refresh failed, clearing auth state');
  //         this.isAuthenticated = false;
  //         localStorage.removeItem('google_oauth_token');
  //         throw new Error('Authentication failed - please login again');
  //       }
  //     }
      
  //     throw error;
  //   }
  // }

  // Update status hutang untuk contact di Google Sheets
  async updateStatusHutang(contactData: {
    contactId: string;
    contactName: string;
    contactType: string;
    totalHutang: number;
    totalTerbayar: number;
    sisaHutang: number;
    saldoBersih: number;
    status: string;
    terakhirHutang?: string;
    terakhirBayar?: string;
  }): Promise<boolean> {
    console.log('🔄 Updating StatusHutang for contact:', contactData.contactName);
    
    try {
      return await this.retryWithFreshToken(async () => {
        // Get or create StatusHutang sheet data
        const response = await this.getSheetData('StatusHutang');
        const rows = response.data || [];
        const dataRows = rows.slice(1); // Skip header
        
        // Find existing record
        const existingRowIndex = dataRows.findIndex((row: any[]) => {
          const existingContactId = row[0]?.toString().trim();
          const searchContactId = contactData.contactId?.toString().trim();
          return existingContactId === searchContactId;
        });
        
        const currentTime = new Date().toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        
        const rowData = [
          contactData.contactId,
          contactData.contactName,
          contactData.contactType,
          contactData.totalHutang,
          contactData.totalTerbayar,
          contactData.sisaHutang,
          contactData.saldoBersih,
          contactData.status,
          contactData.terakhirHutang || currentTime,
          contactData.terakhirBayar || '',
          existingRowIndex >= 0 ? dataRows[existingRowIndex][10] || currentTime : currentTime, // Created At
          currentTime // Updated At
        ];
        
        if (existingRowIndex >= 0) {
          // Update existing record
          const rowNumber = existingRowIndex + 2; // +1 for 0-based index, +1 for header row
          const updateResult = await this.updateSheetRow('StatusHutang', rowNumber, rowData);
          console.log(`✅ Updated existing StatusHutang record for ${contactData.contactName}`);
          return updateResult.success;
        } else {
          // Append new record
          const appendResult = await this.appendToSheet('StatusHutang', [rowData]);
          console.log(`✅ Created new StatusHutang record for ${contactData.contactName}`);
          return appendResult.success;
        }
      });
    } catch (error: any) {
      console.error('❌ Error updating StatusHutang:', error);
      return false;
    }
  }
}

// Export singleton instance
const googleSheetsService = new GoogleSheetsService();

export default googleSheetsService;
