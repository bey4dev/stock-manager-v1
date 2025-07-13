// Script untuk verifikasi format timestamp WIB di database Google Sheets
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load service account key
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account-key.json');
const SPREADSHEET_ID = '1mjF6-l7iLTHG8PuF2sUGLTHBdT5b2Z7BKw1vwBM7xno';

async function verifyDatabaseWIBFormat() {
    try {
        console.log('🔍 Memverifikasi format timestamp WIB di database...\n');

        // Authenticate
        const auth = new GoogleAuth({
            keyFile: SERVICE_ACCOUNT_FILE,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Check Debts sheet for timestamp format
        console.log('📊 Mengecek sheet "Debts"...');
        const debtsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Debts!A:Q'
        });

        const debtsData = debtsResponse.data.values || [];
        
        if (debtsData.length > 1) {
            console.log('   Headers:', debtsData[0]);
            console.log('   Sample data rows:');
            
            // Show first 3 data rows (skip header)
            for (let i = 1; i < Math.min(4, debtsData.length); i++) {
                const row = debtsData[i];
                console.log(`   Row ${i}:`);
                console.log(`     ID: ${row[0] || 'N/A'}`);
                console.log(`     Contact: ${row[2] || 'N/A'}`);
                console.log(`     Description: ${row[5] || 'N/A'}`);
                console.log(`     CreatedAt (col 15): ${row[15] || 'N/A'}`);
                console.log(`     UpdatedAt (col 16): ${row[16] || 'N/A'}`);
                console.log('');
            }
        } else {
            console.log('   ⚠️  Sheet kosong atau tidak ada data');
        }

        // Check Debt_Payments sheet for timestamp format
        console.log('💰 Mengecek sheet "Debt_Payments"...');
        try {
            const paymentsResponse = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Debt_Payments!A:H'
            });

            const paymentsData = paymentsResponse.data.values || [];
            
            if (paymentsData.length > 1) {
                console.log('   Headers:', paymentsData[0]);
                console.log('   Sample payment data:');
                
                for (let i = 1; i < Math.min(4, paymentsData.length); i++) {
                    const row = paymentsData[i];
                    console.log(`   Payment ${i}:`);
                    console.log(`     ID: ${row[0] || 'N/A'}`);
                    console.log(`     Debt ID: ${row[1] || 'N/A'}`);
                    console.log(`     Payment Date (col 5): ${row[5] || 'N/A'}`);
                    console.log(`     Created At (col 7): ${row[7] || 'N/A'}`);
                    console.log('');
                }
            } else {
                console.log('   ⚠️  Sheet kosong atau tidak ada data');
            }
        } catch (error) {
            console.log('   ⚠️  Sheet Debt_Payments belum ada atau error:', error.message);
        }

        // Check other sheets with timestamps
        console.log('📦 Mengecek sheet "Purchases"...');
        try {
            const purchasesResponse = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Purchases!A:I'
            });

            const purchasesData = purchasesResponse.data.values || [];
            
            if (purchasesData.length > 1) {
                const lastRow = purchasesData[purchasesData.length - 1];
                console.log('   Last purchase entry:');
                console.log(`     Date (col 2): ${lastRow[1] || 'N/A'}`);
                console.log(`     Supplier: ${lastRow[2] || 'N/A'}`);
                console.log(`     Product: ${lastRow[3] || 'N/A'}`);
                console.log('');
            }
        } catch (error) {
            console.log('   ⚠️  Error mengakses Purchases:', error.message);
        }

        console.log('✅ Verifikasi selesai!');
        console.log('\n📋 ANALISIS:');
        console.log('- Periksa apakah timestamp menggunakan format "YYYY-MM-DD HH:mm:ss WIB"');
        console.log('- Jika masih ISO format atau UTC, perlu perbaikan pada GoogleSheetsService');
        console.log('- Data baru harus disimpan dengan format WIB yang konsisten');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Jalankan verifikasi
verifyDatabaseWIBFormat();
