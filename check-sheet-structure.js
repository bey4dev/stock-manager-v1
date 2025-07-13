// Script sederhana untuk mengecek sheet yang ada di spreadsheet
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load service account key
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account-key.json');
const SPREADSHEET_ID = '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0';

async function checkSheetStructure() {
    try {
        console.log('🔍 Mengecek struktur spreadsheet...\n');

        // Authenticate
        const auth = new GoogleAuth({
            keyFile: SERVICE_ACCOUNT_FILE,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Get spreadsheet metadata
        const spreadsheetResponse = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID
        });

        const spreadsheet = spreadsheetResponse.data;
        console.log('📊 Spreadsheet Title:', spreadsheet.properties.title);
        console.log('📋 Available Sheets:');

        if (spreadsheet.sheets) {
            spreadsheet.sheets.forEach((sheet, index) => {
                console.log(`   ${index + 1}. ${sheet.properties.title}`);
            });
        }

        console.log('\n🔍 Mengecek data di sheet yang ada...\n');

        // Check each sheet for timestamp data
        for (const sheet of spreadsheet.sheets) {
            const sheetName = sheet.properties.title;
            console.log(`📄 Sheet: ${sheetName}`);
            
            try {
                const dataResponse = await sheets.spreadsheets.values.get({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `${sheetName}!A1:Z5` // Get first 5 rows, all columns
                });

                const data = dataResponse.data.values || [];
                
                if (data.length > 0) {
                    console.log('   Headers:', data[0]);
                    
                    // Show data rows
                    for (let i = 1; i < Math.min(3, data.length); i++) {
                        console.log(`   Row ${i}:`, data[i]);
                    }
                    
                    // Look for timestamp columns
                    const headers = data[0];
                    const timestampColumns = [];
                    headers.forEach((header, index) => {
                        if (header && (
                            header.toLowerCase().includes('date') ||
                            header.toLowerCase().includes('time') ||
                            header.toLowerCase().includes('created') ||
                            header.toLowerCase().includes('updated')
                        )) {
                            timestampColumns.push({ index, header });
                        }
                    });
                    
                    if (timestampColumns.length > 0) {
                        console.log('   🕐 Timestamp columns found:');
                        timestampColumns.forEach(col => {
                            console.log(`     Column ${col.index + 1}: ${col.header}`);
                            // Show sample data for this column
                            for (let i = 1; i < Math.min(3, data.length); i++) {
                                console.log(`       Row ${i}: ${data[i][col.index] || 'N/A'}`);
                            }
                        });
                    }
                } else {
                    console.log('   ⚠️  Sheet kosong');
                }
            } catch (error) {
                console.log(`   ❌ Error accessing sheet ${sheetName}:`, error.message);
            }
            
            console.log('');
        }

        console.log('✅ Struktur spreadsheet berhasil dianalisis!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Jalankan pengecekan
checkSheetStructure();
