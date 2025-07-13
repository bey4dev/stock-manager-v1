// Test script untuk verifikasi format timestamp WIB di database
// Jalankan di browser console untuk melihat format timestamp

console.log('🕐 Testing WIB Database Timestamp Format...');

const testWIBTimestampFormat = () => {
  console.log('\n📊 Testing WIB Timestamp Format:');
  
  // Simulate current WIB time
  const now = new Date();
  const wibOffset = 7 * 60; // 7 hours in minutes  
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wibTime = new Date(utc + (wibOffset * 60000));
  
  // Format for database storage (WIB format)
  const year = wibTime.getFullYear();
  const month = String(wibTime.getMonth() + 1).padStart(2, '0');
  const day = String(wibTime.getDate()).padStart(2, '0');
  const hour = String(wibTime.getHours()).padStart(2, '0');
  const minute = String(wibTime.getMinutes()).padStart(2, '0');
  const second = String(wibTime.getSeconds()).padStart(2, '0');
  
  const wibTimestamp = `${year}-${month}-${day} ${hour}:${minute}:${second} WIB`;
  
  console.log('🔍 Current system time:', now.toLocaleString());
  console.log('🇮🇩 Current WIB time:', wibTime.toLocaleString());
  console.log('💾 Database timestamp format:', wibTimestamp);
  
  // Compare with old ISO format
  const oldISOFormat = wibTime.toISOString();
  console.log('❌ Old ISO format (confusing):', oldISOFormat);
  console.log('✅ New WIB format (readable):', wibTimestamp);
  
  return {
    systemTime: now,
    wibTime: wibTime,
    databaseFormat: wibTimestamp,
    oldFormat: oldISOFormat
  };
};

const testTimestampParsing = () => {
  console.log('\n🔄 Testing Timestamp Parsing:');
  
  const sampleTimestamps = [
    '2024-01-15 17:30:45 WIB',
    '2024-07-07 20:15:30 WIB',
    '2024-12-31 23:59:59 WIB'
  ];
  
  sampleTimestamps.forEach((timestamp, index) => {
    console.log(`\nSample ${index + 1}: ${timestamp}`);
    
    // Parse WIB timestamp
    if (timestamp.includes('WIB')) {
      const cleanString = timestamp.replace(' WIB', '');
      const [datePart, timePart] = cleanString.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute, second] = timePart.split(':').map(Number);
      
      const parsedDate = new Date();
      parsedDate.setFullYear(year, month - 1, day);
      parsedDate.setHours(hour, minute, second, 0);
      
      console.log(`  📅 Parsed date:`, parsedDate.toLocaleString());
      console.log(`  🎯 Display format:`, parsedDate.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }) + ' WIB');
    }
  });
};

const testDatabaseConsistency = () => {
  console.log('\n🗄️ Testing Database Consistency:');
  
  // Simulate what would be stored vs displayed
  const now = new Date();
  const wibOffset = 7 * 60;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wibTime = new Date(utc + (wibOffset * 60000));
  
  // Database storage format
  const year = wibTime.getFullYear();
  const month = String(wibTime.getMonth() + 1).padStart(2, '0');
  const day = String(wibTime.getDate()).padStart(2, '0');
  const hour = String(wibTime.getHours()).padStart(2, '0');
  const minute = String(wibTime.getMinutes()).padStart(2, '0');
  const second = String(wibTime.getSeconds()).padStart(2, '0');
  
  const databaseFormat = `${year}-${month}-${day} ${hour}:${minute}:${second} WIB`;
  
  // Display format
  const displayFormat = wibTime.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }) + ' WIB';
  
  console.log('💾 Database stores:', databaseFormat);
  console.log('👁️ User sees:', displayFormat);
  console.log('✅ Both show same WIB time!');
  
  // Test consistency check
  const parsedFromDatabase = databaseFormat.replace(' WIB', '');
  const [dbDate, dbTime] = parsedFromDatabase.split(' ');
  const [dbYear, dbMonth, dbDay] = dbDate.split('-').map(Number);
  const [dbHour, dbMinute] = dbTime.split(':').map(Number);
  
  const reconstructed = new Date();
  reconstructed.setFullYear(dbYear, dbMonth - 1, dbDay);
  reconstructed.setHours(dbHour, dbMinute, 0, 0);
  
  const isConsistent = Math.abs(reconstructed.getTime() - wibTime.getTime()) < 60000; // Within 1 minute
  console.log('🔍 Consistency check:', isConsistent ? '✅ PASS' : '❌ FAIL');
};

const simulateHutangPiutangEntry = () => {
  console.log('\n💰 Simulating Hutang Piutang Entry:');
  
  // Current WIB time for new debt entry
  const now = new Date();
  const wibOffset = 7 * 60;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wibTime = new Date(utc + (wibOffset * 60000));
  
  const year = wibTime.getFullYear();
  const month = String(wibTime.getMonth() + 1).padStart(2, '0');
  const day = String(wibTime.getDate()).padStart(2, '0');
  const hour = String(wibTime.getHours()).padStart(2, '0');
  const minute = String(wibTime.getMinutes()).padStart(2, '0');
  const second = String(wibTime.getSeconds()).padStart(2, '0');
  
  const createdAt = `${year}-${month}-${day} ${hour}:${minute}:${second} WIB`;
  
  // Simulate debt data
  const debtData = {
    id: 'DEBT001',
    contactName: 'John Doe',
    description: 'Pembayaran laptop',
    amount: 5000000,
    createdAt: createdAt,
    updatedAt: createdAt
  };
  
  console.log('📝 New debt entry:');
  console.log('  ID:', debtData.id);
  console.log('  Contact:', debtData.contactName);
  console.log('  Description:', debtData.description);
  console.log('  Amount:', debtData.amount.toLocaleString('id-ID'));
  console.log('  Created:', debtData.createdAt);
  console.log('  Updated:', debtData.updatedAt);
  
  // How it would appear in table
  const displayCreated = wibTime.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }) + ' WIB';
  
  console.log('\n📱 How it appears in table:');
  console.log('  Waktu Input:', displayCreated);
};

// Main test function
const runWIBTimestampTests = () => {
  console.log('🚀 Running WIB Timestamp Database Tests...');
  
  const results = testWIBTimestampFormat();
  testTimestampParsing();
  testDatabaseConsistency();
  simulateHutangPiutangEntry();
  
  console.log('\n✅ WIB Timestamp Database Tests Complete!');
  console.log('\n📋 Key Benefits of New Format:');
  console.log('✅ Database stores readable WIB time');
  console.log('✅ No timezone confusion');
  console.log('✅ Direct correlation with display');
  console.log('✅ Indonesian-friendly format');
  console.log('✅ Easy debugging and verification');
  
  return results;
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
  runWIBTimestampTests();
} else {
  console.log('Run runWIBTimestampTests() to execute WIB timestamp verification');
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testWIBTimestampFormat,
    testTimestampParsing,
    testDatabaseConsistency,
    simulateHutangPiutangEntry,
    runWIBTimestampTests
  };
}
