import { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import googleSheetsService from '../services/GoogleSheetsService';
import type { Product, Sale, Purchase, DashboardMetrics } from '../services/GoogleSheetsService';

// Extend Window interface to include gapi
declare global {
  interface Window {
    gapi: any;
  }
}

interface Contact {
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

interface AppState {
  // Authentication
  isAuthenticated: boolean;
  user: any;
  
  // Data
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  contacts: Contact[];
  dashboardMetrics: DashboardMetrics | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  currentPage: 'dashboard' | 'products' | 'sales' | 'purchases' | 'settings' | 'debug';
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTHENTICATED'; payload: { isAuthenticated: boolean; user?: any } }
  | { type: 'SET_CURRENT_PAGE'; payload: AppState['currentPage'] }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_SALES'; payload: Sale[] }
  | { type: 'SET_PURCHASES'; payload: Purchase[] }
  | { type: 'SET_CONTACTS'; payload: Contact[] }
  | { type: 'SET_DASHBOARD_METRICS'; payload: DashboardMetrics }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'ADD_PURCHASE'; payload: Purchase }
  | { type: 'ADD_CONTACT'; payload: Contact };

const initialState: AppState = {
  isAuthenticated: false,
  user: null,
  products: [],
  sales: [],
  purchases: [],
  contacts: [],
  dashboardMetrics: null,
  loading: false,
  error: null,
  currentPage: 'dashboard',
};

// Check for saved authentication state
const getInitialAuthState = (): { isAuthenticated: boolean; user: any } => {
  console.log('🔍 [INIT] Getting initial auth state...');
  try {
    const savedAuth = localStorage.getItem('stockmanager_auth');
    console.log('🔍 [INIT] Raw localStorage data:', savedAuth);
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      console.log('🔍 [INIT] Parsed auth data:', authData);
      console.log('🔍 [INIT] User from localStorage:', authData.user);
      console.log('🔍 [INIT] IsAuthenticated from localStorage:', authData.isAuthenticated);
      return {
        isAuthenticated: authData.isAuthenticated || false,
        user: authData.user || null
      };
    } else {
      console.log('🔍 [INIT] No saved auth data found');
    }
  } catch (error) {
    console.error('🔍 [INIT] Error loading auth state:', error);
  }
  console.log('🔍 [INIT] Returning default auth state: { isAuthenticated: false, user: null }');
  return { isAuthenticated: false, user: null };
};

const authState = getInitialAuthState();
console.log('🔍 [INIT] Retrieved auth state:', authState);

const initialStateWithAuth: AppState = {
  ...initialState,
  isAuthenticated: authState.isAuthenticated,
  user: authState.user,
};

console.log('🔍 [INIT] Initial state with auth:', {
  isAuthenticated: initialStateWithAuth.isAuthenticated,
  user: initialStateWithAuth.user,
  hasUser: !!initialStateWithAuth.user
});

function appReducer(state: AppState, action: AppAction): AppState {
  console.log('🔄 [REDUCER] Action dispatched:', action.type, action.payload);
  
  switch (action.type) {
    case 'SET_LOADING':
      console.log('🔄 [REDUCER] SET_LOADING:', action.payload);
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      console.log('🔄 [REDUCER] SET_ERROR:', action.payload);
      return { ...state, error: action.payload };
    case 'SET_AUTHENTICATED':
      console.log('🔄 [REDUCER] SET_AUTHENTICATED:', action.payload);
      const newState = { 
        ...state, 
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user || null
      };
      console.log('🔄 [REDUCER] New auth state:', {
        isAuthenticated: newState.isAuthenticated,
        user: newState.user
      });
      return newState;
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_SALES':
      return { ...state, sales: action.payload };
    case 'SET_PURCHASES':
      return { ...state, purchases: action.payload };
    case 'SET_CONTACTS':
      return { ...state, contacts: action.payload };
    case 'SET_DASHBOARD_METRICS':
      return { ...state, dashboardMetrics: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'ADD_SALE':
      return { ...state, sales: [...state.sales, action.payload] };
    case 'ADD_PURCHASE':
      return { ...state, purchases: [...state.purchases, action.payload] };
    case 'ADD_CONTACT':
      return { ...state, contacts: [...state.contacts, action.payload] };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  // Auth actions
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  
  // Navigation
  setCurrentPage: (page: AppState['currentPage']) => void;
  
  // Data actions
  loadAllData: () => Promise<void>;
  loadProducts: () => Promise<void>;
  loadSales: () => Promise<void>;
  loadPurchases: () => Promise<void>;
  loadContacts: () => Promise<void>;
  loadDashboardMetrics: () => Promise<void>;
  
  // CRUD actions
  addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  addSale: (sale: Omit<Sale, 'id'>) => Promise<boolean>;
  addPurchase: (purchase: Omit<Purchase, 'id'>) => Promise<boolean>;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Contact | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialStateWithAuth);
  const [isInitialized, setIsInitialized] = useState(false);
  const dataLoadedForUser = useRef<string | null>(null); // Track which user has data loaded

  console.log('🔍 [PROVIDER] AppProvider render - current state:', {
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    hasUser: !!state.user,
    isInitialized
  });

  // Initial setup effect
  useEffect(() => {
    console.log('🚀 [PROVIDER] Initial setup effect running...');
    
    // Add small delay to ensure everything is properly initialized
    const timer = setTimeout(() => {
      console.log('✅ [PROVIDER] Initialization complete');
      setIsInitialized(true);
    }, 100); // Very small delay
    
    return () => clearTimeout(timer);
  }, []);

  // Authentication
  const signIn = async (): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      console.log('🔐 Starting authentication...');
      const success = await googleSheetsService.authenticate();
      
      if (success) {
        console.log('✅ Authentication successful, getting user profile...');
        
        // Get user profile with fallback
        let userProfile;
        try {
          console.log('🔍 [DEBUG] Calling getUserProfile...');
          userProfile = await googleSheetsService.getUserProfile();
          console.log('👤 [DEBUG] User profile retrieved:', userProfile);
        } catch (profileError) {
          console.log('⚠️ Profile fetch failed, using fallback:', profileError);
          userProfile = { name: 'Google User', email: 'user@gmail.com' };
        }
        
        const authData = { 
          isAuthenticated: true, 
          user: userProfile
        };
        
        console.log('💾 [DEBUG] Auth data to save:', authData);
        console.log('💾 [DEBUG] User name to save:', userProfile.name);
        console.log('💾 [DEBUG] User email to save:', userProfile.email);
        
        dispatch({ 
          type: 'SET_AUTHENTICATED', 
          payload: authData
        });
        
        // Save to localStorage
        localStorage.setItem('stockmanager_auth', JSON.stringify(authData));
        console.log('💾 [DEBUG] Saved to localStorage');
        
        // Verify localStorage save
        const saved = localStorage.getItem('stockmanager_auth');
        console.log('💾 [DEBUG] Verification - saved data:', saved);
        
        console.log('📊 Loading data from Google Sheets...');
        try {
          // Ensure token is set before loading data
          console.log('🔑 [SIGNIN] Verifying token is set for data loading...');
          const currentToken = window.gapi?.client?.getToken();
          if (!currentToken || !currentToken.access_token) {
            console.log('⚠️ [SIGNIN] No token in gapi client, restoring from localStorage...');
            const savedToken = localStorage.getItem('google_oauth_token');
            if (savedToken) {
              try {
                const tokenData = JSON.parse(savedToken);
                window.gapi.client.setToken(tokenData);
                console.log('✅ [SIGNIN] Token restored before data loading');
              } catch (e) {
                console.error('❌ [SIGNIN] Failed to restore token before data loading:', e);
              }
            }
          } else {
            console.log('✅ [SIGNIN] Token already available in gapi client');
          }
          
          await loadAllData();
          console.log('✅ Data loaded successfully');
        } catch (dataError) {
          console.error('❌ Data loading failed:', dataError);
          // Don't fail the entire signIn process if data loading fails
          // User is still authenticated, just show a warning
          dispatch({ type: 'SET_ERROR', payload: 'Autentikasi berhasil, tetapi gagal memuat data. Silakan coba refresh halaman.' });
        }
      } else {
        console.log('❌ Authentication failed');
      }
      return success;
    } catch (error) {
      console.error('❌ Authentication error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Gagal melakukan autentikasi' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signOut = async () => {
    console.log('🚪 [SIGNOUT] Starting sign out process...');
    
    try {
      // Sign out from Google API
      await googleSheetsService.signOut();
      console.log('✅ [SIGNOUT] Google API sign out completed');
      
      // Clear all localStorage data
      localStorage.removeItem('stockmanager_auth');
      localStorage.removeItem('google_oauth_token');
      console.log('🗑️ [SIGNOUT] Cleared localStorage');
      
      // Reset data loaded flag
      dataLoadedForUser.current = null;
      console.log('🔄 [SIGNOUT] Reset data loaded flag');
      
      // Reset authentication state
      dispatch({ 
        type: 'SET_AUTHENTICATED', 
        payload: { isAuthenticated: false, user: null }
      });
      console.log('🔄 [SIGNOUT] Reset auth state');
      
      // Clear all data from state
      dispatch({ type: 'SET_PRODUCTS', payload: [] });
      dispatch({ type: 'SET_SALES', payload: [] });
      dispatch({ type: 'SET_PURCHASES', payload: [] });
      dispatch({ type: 'SET_DASHBOARD_METRICS', payload: {
        totalProducts: 0,
        totalRevenue: 0,
        totalSales: 0,
        totalPurchases: 0,
        lowStockProducts: 0,
        totalCost: 0,
        profit: 0,
        totalCustomers: 0,
        monthlySales: [],
        topProducts: []
      }});
      console.log('🗑️ [SIGNOUT] Cleared all data from state');
      
      // Clear any errors
      dispatch({ type: 'SET_ERROR', payload: null });
      
      console.log('✅ [SIGNOUT] Sign out completed successfully');
    } catch (error) {
      console.error('❌ [SIGNOUT] Error during sign out:', error);
    }
  };

  const refreshUserProfile = async () => {
    if (!state.isAuthenticated) {
      console.log('❌ Not authenticated, cannot refresh profile');
      return;
    }

    try {
      console.log('🔄 Refreshing user profile...');
      const newProfile = await googleSheetsService.getUserProfile();
      console.log('📋 New profile data:', newProfile);

      // Update state
      const authData = { 
        isAuthenticated: true, 
        user: newProfile
      };

      dispatch({ 
        type: 'SET_AUTHENTICATED', 
        payload: authData
      });

      // Save to localStorage
      localStorage.setItem('stockmanager_auth', JSON.stringify(authData));
      console.log('✅ Profile refreshed and saved');
    } catch (error) {
      console.error('❌ Error refreshing profile:', error);
    }
  };

  // Navigation
  const setCurrentPage = (page: AppState['currentPage']) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  };

  // Data loading
  const loadAllData = async () => {
    console.log('📊 [DATA] Starting loadAllData...');
    
    // Ensure token is available
    const tokenAvailable = await ensureTokenAvailable();
    if (!tokenAvailable) {
      console.error('❌ [DATA] No valid token available for data loading');
      throw new Error('No valid token available');
    }
    
    // Ensure Google API is ready before loading data
    try {
      let retries = 0;
      const maxRetries = 3;
      
      while ((!window.gapi || !window.gapi.client) && retries < maxRetries) {
        console.log(`⏳ [DATA] Waiting for Google API... (${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries++;
      }
      
      if (!window.gapi || !window.gapi.client) {
        console.error('❌ [DATA] Google API not ready, cannot load data');
        throw new Error('Google API not ready');
      }
      
      console.log('📊 [DATA] Google API ready, loading all data...');
      await Promise.all([
        loadProducts(),
        loadSales(),
        loadPurchases(),
        loadContacts(),
        loadDashboardMetrics()
      ]);
      console.log('✅ [DATA] All data loaded successfully');
      
    } catch (error) {
      console.error('❌ [DATA] Error in loadAllData:', error);
      throw error;
    }
  };

  const loadProducts = async () => {
    try {
      console.log('📦 [PRODUCTS] Loading products...');
      
      // Ensure Google API is ready
      if (!window.gapi?.client) {
        console.log('⏳ [PRODUCTS] Google API not ready, waiting...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const products = await googleSheetsService.getProducts();
      dispatch({ type: 'SET_PRODUCTS', payload: products });
      console.log(`✅ [PRODUCTS] Loaded ${products.length} products`);
    } catch (error: any) {
      console.error('❌ [PRODUCTS] Error loading products:', error);
      
      // Check if it's an authentication error
      if (error.status === 403 || error.status === 401) {
        console.log('🔄 [PRODUCTS] Authentication error detected, user may need to re-login');
        // Don't show error for auth issues, just log it
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Gagal memuat data produk' });
      }
      
      // Set empty array as fallback
      dispatch({ type: 'SET_PRODUCTS', payload: [] });
    }
  };

  const loadSales = async () => {
    try {
      console.log('📈 [SALES] Loading sales...');
      
      // Ensure Google API is ready
      if (!window.gapi?.client) {
        console.log('⏳ [SALES] Google API not ready, waiting...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const sales = await googleSheetsService.getSales();
      dispatch({ type: 'SET_SALES', payload: sales });
      console.log(`✅ [SALES] Loaded ${sales.length} sales`);
    } catch (error: any) {
      console.error('❌ [SALES] Error loading sales:', error);
      
      if (error.status === 403 || error.status === 401) {
        console.log('🔄 [SALES] Authentication error detected for sales');
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Gagal memuat data penjualan' });
      }
      
      dispatch({ type: 'SET_SALES', payload: [] });
    }
  };

  const loadPurchases = async () => {
    try {
      console.log('🛒 [PURCHASES] Loading purchases...');
      
      // Ensure Google API is ready
      if (!window.gapi?.client) {
        console.log('⏳ [PURCHASES] Google API not ready, waiting...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const purchases = await googleSheetsService.getPurchases();
      dispatch({ type: 'SET_PURCHASES', payload: purchases });
      console.log(`✅ [PURCHASES] Loaded ${purchases.length} purchases`);
    } catch (error: any) {
      console.error('❌ [PURCHASES] Error loading purchases:', error);
      
      if (error.status === 403 || error.status === 401) {
        console.log('🔄 [PURCHASES] Authentication error detected for purchases');
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Gagal memuat data pembelian' });
      }
      
      dispatch({ type: 'SET_PURCHASES', payload: [] });
    }
  };

  const loadContacts = async () => {
    try {
      console.log('👥 [CONTACTS] Loading contacts...');
      
      // Ensure Google API is ready
      if (!window.gapi?.client) {
        console.log('⏳ [CONTACTS] Google API not ready, waiting...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const response = await googleSheetsService.getSheetData('Contacts');
      if (response.success && response.data) {
        const contactsData = response.data.map((row: any[], index: number) => ({
          id: row[0] || `contact_${index + 1}`,
          name: row[1] || '',
          type: row[2] || 'supplier',
          email: row[3] || '',
          phone: row[4] || '',
          address: row[5] || '',
          company: row[6] || '',
          notes: row[7] || '',
          createdAt: row[8] || '',
          updatedAt: row[9] || ''
        }));
        dispatch({ type: 'SET_CONTACTS', payload: contactsData });
        console.log(`✅ [CONTACTS] Loaded ${contactsData.length} contacts`);
      } else {
        dispatch({ type: 'SET_CONTACTS', payload: [] });
      }
    } catch (error: any) {
      console.error('❌ [CONTACTS] Error loading contacts:', error);
      
      if (error.status === 403 || error.status === 401) {
        console.log('🔄 [CONTACTS] Authentication error detected for contacts');
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Gagal memuat data kontak' });
      }
      
      dispatch({ type: 'SET_CONTACTS', payload: [] });
    }
  };

  const loadDashboardMetrics = async () => {
    try {
      console.log('📊 [METRICS] Loading dashboard metrics...');
      
      // Ensure Google API is ready
      if (!window.gapi?.client) {
        console.log('⏳ [METRICS] Google API not ready, waiting...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const metrics = await googleSheetsService.getDashboardMetrics();
      dispatch({ type: 'SET_DASHBOARD_METRICS', payload: metrics });
      console.log('✅ [METRICS] Loaded dashboard metrics');
    } catch (error: any) {
      console.error('❌ [METRICS] Error loading dashboard metrics:', error);
      
      if (error.status === 403 || error.status === 401) {
        console.log('🔄 [METRICS] Authentication error detected for metrics');
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Gagal memuat metrics dashboard' });
      }
      
      // Set default metrics as fallback
      const defaultMetrics = {
        totalProducts: 0,
        totalRevenue: 0,
        totalSales: 0,
        totalPurchases: 0,
        lowStockProducts: 0,
        totalCost: 0,
        profit: 0,
        totalCustomers: 0,
        monthlySales: [],
        topProducts: []
      };
      dispatch({ type: 'SET_DASHBOARD_METRICS', payload: defaultMetrics });
    }
  };

  // CRUD operations
  const addProduct = async (productData: Omit<Product, 'id'>): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const success = await googleSheetsService.addProduct(productData);
      if (success) {
        await loadProducts();
        await loadDashboardMetrics();
      }
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Gagal menambah produk' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProduct = async (productData: Product): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const success = await googleSheetsService.updateProduct(productData);
      if (success) {
        await loadProducts();
        await loadDashboardMetrics();
      }
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Gagal mengupdate produk' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    console.log('🗑️ [CONTEXT] Starting product deletion:', id);
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('🗑️ [CONTEXT] Calling GoogleSheetsService.deleteProduct...');
      const success = await googleSheetsService.deleteProduct(id);
      console.log('🗑️ [CONTEXT] Delete result:', success);
      
      if (success) {
        console.log('🗑️ [CONTEXT] Delete successful, reloading products...');
        await loadProducts();
        console.log('🗑️ [CONTEXT] Products reloaded, updating dashboard...');
        await loadDashboardMetrics();
        console.log('🗑️ [CONTEXT] Dashboard updated');
      } else {
        console.error('❌ [CONTEXT] Delete failed');
      }
      return success;
    } catch (error) {
      console.error('❌ [CONTEXT] Delete error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Gagal menghapus produk' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addSale = async (saleData: Omit<Sale, 'id'>): Promise<boolean> => {
    console.log('💾 [CONTEXT] addSale called:', saleData);
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const success = await googleSheetsService.addSale(saleData);
      console.log('📊 [CONTEXT] addSale result:', success);
      
      if (success) {
        console.log('🔄 [CONTEXT] Reloading sales, products, and dashboard...');
        await loadSales();
        await loadProducts(); // 🔥 TAMBAHAN: Reload products karena stok berubah setelah sale
        await loadDashboardMetrics();
        console.log('✅ [CONTEXT] Sales, products, and dashboard reloaded');
      }
      return success;
    } catch (error) {
      console.error('❌ [CONTEXT] addSale error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Gagal menambah penjualan' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addPurchase = async (purchaseData: Omit<Purchase, 'id'>): Promise<boolean> => {
    console.log('💾 [CONTEXT] addPurchase called:', purchaseData);
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const success = await googleSheetsService.addPurchase(purchaseData);
      console.log('📊 [CONTEXT] addPurchase result:', success);
      
      if (success) {
        console.log('🔄 [CONTEXT] Reloading purchases, products, and dashboard...');
        await loadPurchases();
        await loadProducts(); // 🔥 TAMBAHAN: Reload products karena stok berubah setelah purchase
        await loadDashboardMetrics();
        console.log('✅ [CONTEXT] Purchases, products, and dashboard reloaded');
      }
      return success;
    } catch (error) {
      console.error('❌ [CONTEXT] addPurchase error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Gagal menambah pembelian' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addContact = async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact | null> => {
    console.log('💾 [CONTEXT] addContact called:', contactData);
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const success = await googleSheetsService.addContact(contactData);
      console.log('📊 [CONTEXT] addContact result:', success);
      
      if (success) {
        console.log('🔄 [CONTEXT] Reloading contacts...');
        await loadContacts();
        console.log('✅ [CONTEXT] Contacts reloaded');
        
        // Return the newly created contact
        const newContact = state.contacts.find(c => c.name === contactData.name && c.type === contactData.type);
        return newContact || null;
      }
      return null;
    } catch (error) {
      console.error('❌ [CONTEXT] addContact error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Gagal menambah kontak' });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Helper function to ensure token is available for API calls
  const ensureTokenAvailable = async (): Promise<boolean> => {
    console.log('🔑 [TOKEN] Checking token availability...');
    
    try {
      // Check if Google API is ready
      if (!window.gapi?.client) {
        console.log('⚠️ [TOKEN] Google API not ready');
        return false;
      }
      
      // Check current token
      const currentToken = window.gapi.client.getToken();
      if (currentToken && currentToken.access_token) {
        console.log('✅ [TOKEN] Valid token already available');
        return true;
      }
      
      // Try to restore from localStorage
      console.log('🔄 [TOKEN] Attempting to restore token from localStorage...');
      const savedToken = localStorage.getItem('google_oauth_token');
      if (!savedToken) {
        console.log('❌ [TOKEN] No saved token found');
        return false;
      }
      
      try {
        const tokenData = JSON.parse(savedToken);
        
        // Check if token is not expired
        const now = Date.now();
        const tokenAge = now - (tokenData.timestamp || 0);
        const maxAge = 55 * 60 * 1000; // 55 minutes
        
        if (tokenAge >= maxAge) {
          console.log('⚠️ [TOKEN] Token expired, removing from localStorage');
          localStorage.removeItem('google_oauth_token');
          return false;
        }
        
        // Set token in gapi client
        window.gapi.client.setToken(tokenData);
        console.log('✅ [TOKEN] Token restored successfully');
        return true;
      } catch (parseError) {
        console.error('❌ [TOKEN] Error parsing saved token:', parseError);
        localStorage.removeItem('google_oauth_token');
        return false;
      }
    } catch (error) {
      console.error('❌ [TOKEN] Error ensuring token:', error);
      return false;
    }
  };

  // Auto-load data on mount if authenticated
  useEffect(() => {
    // Only run after initialization is complete
    if (!isInitialized) {
      console.log('⏳ [EFFECT] Waiting for initialization...');
      return;
    }
    
    let isMounted = true;
    
    const initializeApp = async () => {
      console.log('🚀 [EFFECT] useEffect triggered - Initializing app...');
      console.log('🔍 [EFFECT] Current state.isAuthenticated:', state.isAuthenticated);
      console.log('🔍 [EFFECT] Current state.user:', state.user);
      console.log('🔍 [EFFECT] isMounted:', isMounted);
      
      // Check if user is authenticated and we haven't loaded data for this user yet
      const currentUserEmail = state.user?.email;
      const shouldLoadData = state.isAuthenticated && 
                           state.user && 
                           isMounted && 
                           dataLoadedForUser.current !== currentUserEmail;
      
      if (shouldLoadData) {
        console.log('✅ [EFFECT] User authenticated, loading data...');
        console.log('🔍 [EFFECT] User email:', currentUserEmail);
        console.log('🔍 [EFFECT] Previous loaded user:', dataLoadedForUser.current);
        
        try {
          // Add delay to ensure Google API is fully ready
          console.log('⏳ [EFFECT] Waiting for Google API to be fully ready...');
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
          
          // Ensure token is available before loading data
          console.log('🔑 [EFFECT] Checking token availability...');
          const tokenAvailable = await ensureTokenAvailable();
          if (!tokenAvailable) {
            console.log('⚠️ [EFFECT] Token not available, cannot load data');
            return;
          }
          
          // Load data
          console.log('📊 [EFFECT] Loading data...');
          await loadAllData();
          
          // Mark data as loaded for this user
          dataLoadedForUser.current = currentUserEmail;
          console.log('✅ [EFFECT] Data loaded successfully for user:', currentUserEmail);
        } catch (dataError) {
          console.error('❌ [EFFECT] Error loading data:', dataError);
          
          // Only if data loading fails with auth error, then check Google API
          if ((dataError as any)?.status === 401 || (dataError as any)?.status === 403) {
            console.log('⚠️ [EFFECT] Auth error detected, checking Google API...');
            
            try {
              const isGoogleAuthenticated = await googleSheetsService.checkAuthenticationStatus();
              
              if (!isGoogleAuthenticated) {
                console.log('❌ [EFFECT] Google API authentication invalid, clearing auth state...');
                localStorage.removeItem('stockmanager_auth');
                localStorage.removeItem('google_oauth_token');
                dataLoadedForUser.current = null; // Reset data loaded flag
                dispatch({ 
                  type: 'SET_AUTHENTICATED', 
                  payload: { isAuthenticated: false, user: null }
                });
              }
            } catch (checkError) {
              console.error('❌ [EFFECT] Error checking Google API:', checkError);
            }
          } else {
            console.log('⚠️ [EFFECT] Data loading failed but keeping auth state (non-auth error)');
          }
        }
      } else {
        console.log('🔍 [EFFECT] Not loading data. Reasons:');
        console.log('  - isAuthenticated:', state.isAuthenticated);
        console.log('  - user exists:', !!state.user);
        console.log('  - isMounted:', isMounted);
        console.log('  - currentUserEmail:', currentUserEmail);
        console.log('  - dataLoadedForUser:', dataLoadedForUser.current);
        console.log('  - shouldLoadData:', shouldLoadData);
      }
    };
    
    console.log('🚀 [EFFECT] Starting initializeApp...');
    initializeApp();
    
    return () => {
      console.log('🔄 [EFFECT] useEffect cleanup - setting isMounted to false');
      isMounted = false;
    };
  }, [isInitialized, state.isAuthenticated, state.user?.email]); // React to auth state changes

  const contextValue: AppContextType = {
    state,
    signIn,
    signOut,
    refreshUserProfile,
    setCurrentPage,
    loadAllData,
    loadProducts,
    loadSales,
    loadPurchases,
    loadContacts,
    loadDashboardMetrics,
    addProduct,
    updateProduct,
    deleteProduct,
    addSale,
    addPurchase,
    addContact,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
