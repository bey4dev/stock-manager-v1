// Script untuk melihat data produk dan debugging form modal

import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load service account credentials
const serviceAccount = JSON.parse(fs.readFileSync('service-account-key.json', 'utf8'));

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0';

async function checkProductData() {
  try {
    console.log('🔍 Checking product data...');
    
    // Get products data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Products!A:H'
    });
    
    const rows = response.data.values || [];
    
    console.log('📋 Products data:');
    console.log('Header:', rows[0]);
    console.log('Data rows:', rows.length - 1);
    
    rows.slice(1).forEach((row, i) => {
      console.log(`${i+1}. ID: ${row[0]}, Name: ${row[1]}, Category: ${row[2]}, Price: ${row[3]}, Stock: ${row[4]}, Cost: ${row[5]}, Description: ${row[6]}, Status: ${row[7]}`);
    });
    
    // Check if products have Active status
    const activeProducts = rows.slice(1).filter(row => row[7] === 'Active');
    console.log(`\n✅ Active products: ${activeProducts.length}`);
    
    if (activeProducts.length === 0) {
      console.log('❌ No active products found! This is why the form is empty.');
      console.log('🔧 Fixing product status...');
      
      // Update all products to Active status
      const updateRows = rows.slice(1).map(row => {
        const updatedRow = [...row];
        updatedRow[7] = 'Active'; // Set status to Active
        return updatedRow;
      });
      
      if (updateRows.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Products!A2:H',
          valueInputOption: 'RAW',
          resource: { values: updateRows }
        });
        
        console.log('✅ All products updated to Active status');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking product data:', error);
  }
}

async function addSampleProductsIfNeeded() {
  try {
    console.log('🔍 Checking if sample products needed...');
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Products!A:H'
    });
    
    const rows = response.data.values || [];
    const dataRows = rows.slice(1);
    
    if (dataRows.length === 0) {
      console.log('📦 No products found. Adding sample products...');
      
      const sampleProducts = [
        ['PRD_001', 'Smartphone Premium', 'Electronics', 8000000, 50, 6000000, 'High-end smartphone with advanced features', 'Active'],
        ['PRD_002', 'Laptop Gaming', 'Electronics', 12000000, 25, 9000000, 'Gaming laptop with high performance', 'Active'],
        ['PRD_003', 'Wireless Headphones', 'Electronics', 1500000, 100, 1000000, 'Premium wireless headphones', 'Active'],
        ['PRD_004', 'Smart Watch', 'Electronics', 3500000, 75, 2500000, 'Fitness tracker smart watch', 'Active'],
        ['PRD_005', 'Tablet Pro', 'Electronics', 6000000, 40, 4500000, 'Professional tablet for work', 'Active']
      ];
      
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Products!A:H',
        valueInputOption: 'RAW',
        resource: { values: sampleProducts }
      });
      
      console.log('✅ Sample products added successfully');
    } else if (dataRows.length < 3) {
      console.log('📦 Few products found. Adding more sample products...');
      
      const additionalProducts = [
        ['PRD_006', 'Bluetooth Speaker', 'Electronics', 800000, 60, 500000, 'Portable bluetooth speaker', 'Active'],
        ['PRD_007', 'Power Bank', 'Electronics', 400000, 150, 250000, 'High capacity power bank', 'Active'],
        ['PRD_008', 'USB-C Cable', 'Electronics', 150000, 200, 75000, 'High-speed USB-C cable', 'Active']
      ];
      
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Products!A:H',
        valueInputOption: 'RAW',
        resource: { values: additionalProducts }
      });
      
      console.log('✅ Additional products added successfully');
    }
    
  } catch (error) {
    console.error('❌ Error adding sample products:', error);
  }
}

async function main() {
  console.log('🚀 Starting product data check and fix...');
  
  await checkProductData();
  await addSampleProductsIfNeeded();
  
  console.log('✅ Product data check and fix completed!');
  console.log('🔄 Please refresh the app to see the changes.');
}

main().catch(console.error);
