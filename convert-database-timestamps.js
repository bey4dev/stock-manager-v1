// Script untuk mengkonversi timestamp lama dari ISO UTC ke format WIB di database
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load service account key
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account-key.json');
const SPREADSHEET_ID = '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0';

// Utility function to convert ISO UTC to WIB format
function convertISOToWIB(isoTimestamp) {
    if (!isoTimestamp || !isoTimestamp.includes('T') || !isoTimestamp.includes('Z')) {
        return isoTimestamp; // Already in WIB format or invalid
    }
    
    try {
        const date = new Date(isoTimestamp);
        // Convert to WIB (UTC+7)
        const wibDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
        
        // Format as "YYYY-MM-DD HH:mm:ss WIB"
        const year = wibDate.getUTCFullYear();
        const month = String(wibDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(wibDate.getUTCDate()).padStart(2, '0');
        const hour = String(wibDate.getUTCHours()).padStart(2, '0');
        const minute = String(wibDate.getUTCMinutes()).padStart(2, '0');
        const second = String(wibDate.getUTCSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hour}:${minute}:${second} WIB`;
    } catch (error) {
        console.error('Error converting timestamp:', isoTimestamp, error);
        return isoTimestamp;
    }
}

async function convertDatabaseTimestamps() {
    try {
        console.log('🔄 Mengkonversi timestamp database dari ISO UTC ke format WIB...\n');

        // Authenticate
        const auth = new GoogleAuth({
            keyFile: SERVICE_ACCOUNT_FILE,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Define sheets and their timestamp columns
        const sheetsToConvert = [
            {
                name: 'Contacts',
                range: 'A:J',
                timestampColumns: [8, 9], // CreatedAt (I), UpdatedAt (J) - 0-indexed
                rowStart: 2 // Skip header
            },
            {
                name: 'Debts',
                range: 'A:R',
                timestampColumns: [15, 16], // CreatedAt (P), UpdatedAt (Q) - 0-indexed
                rowStart: 2
            },
            {
                name: 'DebtPayments',
                range: 'A:H',
                timestampColumns: [5, 7], // PaymentDate (F), CreatedAt (H) - 0-indexed
                rowStart: 2
            }
        ];

        for (const sheetConfig of sheetsToConvert) {
            console.log(`📊 Memproses sheet: ${sheetConfig.name}`);
            
            try {
                // Get current data
                const response = await sheets.spreadsheets.values.get({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `${sheetConfig.name}!${sheetConfig.range}`
                });

                const data = response.data.values || [];
                
                if (data.length <= 1) {
                    console.log(`   ⚠️  Sheet kosong atau hanya header`);
                    continue;
                }

                console.log(`   📋 Ditemukan ${data.length - 1} rows data`);
                
                const updates = [];
                let convertedCount = 0;

                // Process each data row (skip header)
                for (let rowIndex = sheetConfig.rowStart - 1; rowIndex < data.length; rowIndex++) {
                    const row = data[rowIndex];
                    let rowNeedsUpdate = false;
                    
                    // Check each timestamp column
                    for (const colIndex of sheetConfig.timestampColumns) {
                        const originalValue = row[colIndex];
                        
                        if (originalValue && originalValue.includes('T') && originalValue.includes('Z')) {
                            const convertedValue = convertISOToWIB(originalValue);
                            
                            if (convertedValue !== originalValue) {
                                // Prepare update for this cell
                                const cellAddress = String.fromCharCode(65 + colIndex) + (rowIndex + 1);
                                updates.push({
                                    range: `${sheetConfig.name}!${cellAddress}`,
                                    values: [[convertedValue]]
                                });
                                
                                console.log(`     📅 Row ${rowIndex + 1}, Col ${String.fromCharCode(65 + colIndex)}: ${originalValue} -> ${convertedValue}`);
                                rowNeedsUpdate = true;
                            }
                        }
                    }
                    
                    if (rowNeedsUpdate) {
                        convertedCount++;
                    }
                }

                if (updates.length > 0) {
                    console.log(`   🔄 Mengupdate ${updates.length} cells...`);
                    
                    // Batch update
                    await sheets.spreadsheets.values.batchUpdate({
                        spreadsheetId: SPREADSHEET_ID,
                        requestBody: {
                            valueInputOption: 'RAW',
                            data: updates
                        }
                    });
                    
                    console.log(`   ✅ Berhasil mengkonversi ${convertedCount} rows`);
                } else {
                    console.log(`   ✅ Tidak ada timestamp yang perlu dikonversi`);
                }
            } catch (error) {
                console.error(`   ❌ Error memproses sheet ${sheetConfig.name}:`, error.message);
            }
            
            console.log('');
        }

        console.log('🎉 Konversi timestamp database selesai!');
        console.log('\n📋 HASIL:');
        console.log('- Semua timestamp ISO UTC telah dikonversi ke format WIB');
        console.log('- Database sekarang konsisten dengan tampilan aplikasi');
        console.log('- Format: "YYYY-MM-DD HH:mm:ss WIB"');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Jalankan konversi
convertDatabaseTimestamps();
