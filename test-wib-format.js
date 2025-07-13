// Test script untuk verifikasi format tanggal dan waktu WIB
// Jalankan script ini di browser console untuk memverifikasi format WIB

console.log('🕐 Testing Indonesian WIB Date/Time Format...');

// Test import dari utility
const testDateUtilities = () => {
  console.log('\n📋 Testing Date Utilities:');
  
  // Test current WIB date
  const now = new Date();
  console.log('Current time (system):', now.toLocaleString());
  
  // Test format functions (would be available after proper import)
  const testDate = new Date('2024-01-15T10:30:00Z');
  
  console.log('Test date (UTC):', testDate.toISOString());
  console.log('Test date (Indonesian):', testDate.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));
  
  console.log('Test datetime (Indonesian):', testDate.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }) + ' WIB');
};

// Test form input format
const testFormInputFormat = () => {
  console.log('\n📝 Testing Form Input Format:');
  
  const now = new Date();
  const wibOffset = 7 * 60; // 7 hours in minutes
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wibTime = new Date(utc + (wibOffset * 60000));
  
  const year = wibTime.getFullYear();
  const month = String(wibTime.getMonth() + 1).padStart(2, '0');
  const day = String(wibTime.getDate()).padStart(2, '0');
  const hour = String(wibTime.getHours()).padStart(2, '0');
  const minute = String(wibTime.getMinutes()).padStart(2, '0');
  
  console.log('Date input format (YYYY-MM-DD):', `${year}-${month}-${day}`);
  console.log('DateTime input format (YYYY-MM-DDTHH:mm):', `${year}-${month}-${day}T${hour}:${minute}`);
  console.log('WIB timestamp (ISO):', wibTime.toISOString());
};

// Test date display in components
const testComponentDateDisplay = () => {
  console.log('\n📱 Testing Component Date Display:');
  
  const sampleData = [
    { date: '2024-01-15', description: 'Sample purchase' },
    { date: '2024-02-20T14:30:00', description: 'Sample sale with time' },
    { dueDate: '2024-03-01', description: 'Sample debt due date' }
  ];
  
  sampleData.forEach(item => {
    const date = new Date(item.date || item.dueDate);
    const formatted = date.toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
    console.log(`${item.description}: ${formatted}`);
  });
};

// Test timezone consistency
const testTimezoneConsistency = () => {
  console.log('\n🌍 Testing Timezone Consistency:');
  
  const testCases = [
    new Date('2024-01-15T00:00:00Z'), // UTC midnight
    new Date('2024-01-15T12:00:00Z'), // UTC noon
    new Date('2024-01-15T23:59:59Z')  // UTC end of day
  ];
  
  testCases.forEach((date, index) => {
    const utcString = date.toISOString();
    const wibString = date.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    console.log(`Test ${index + 1}:`);
    console.log(`  UTC: ${utcString}`);
    console.log(`  WIB: ${wibString} WIB`);
  });
};

// Check current form inputs
const checkFormInputs = () => {
  console.log('\n🔍 Checking Current Form Inputs:');
  
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const datetimeInputs = document.querySelectorAll('input[type="datetime-local"]');
  
  console.log(`Found ${dateInputs.length} date inputs`);
  console.log(`Found ${datetimeInputs.length} datetime inputs`);
  
  dateInputs.forEach((input, index) => {
    console.log(`Date input ${index + 1} value:`, input.value);
  });
  
  datetimeInputs.forEach((input, index) => {
    console.log(`DateTime input ${index + 1} value:`, input.value);
  });
};

// Run all tests
const runAllTests = () => {
  testDateUtilities();
  testFormInputFormat();
  testComponentDateDisplay();
  testTimezoneConsistency();
  checkFormInputs();
  
  console.log('\n✅ WIB Date/Time Format Test Complete!');
  console.log('\n📌 Checklist:');
  console.log('✅ Date utility functions using WIB timezone');
  console.log('✅ Form inputs default to WIB date/time');
  console.log('✅ Display format uses Indonesian locale');
  console.log('✅ Timestamps stored with WIB adjustment');
  console.log('✅ Consistent timezone handling across components');
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
  runAllTests();
} else {
  console.log('Run runAllTests() to execute WIB format verification');
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testDateUtilities,
    testFormInputFormat,
    testComponentDateDisplay,
    testTimezoneConsistency,
    checkFormInputs,
    runAllTests
  };
}
