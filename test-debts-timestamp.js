// Test script untuk verifikasi tampilan waktu di Hutang Piutang
// Jalankan di browser console setelah buka halaman Debts

console.log('🕐 Testing Debts Timestamp Display...');

const testDebtsTimestampDisplay = () => {
  console.log('\n📱 Testing Debts Component Timestamp Display:');
  
  // Check if we're on debts page
  const currentUrl = window.location.href;
  console.log('Current URL:', currentUrl);
  
  // Look for debts table
  const desktopTable = document.querySelector('table');
  if (desktopTable) {
    console.log('✅ Desktop table found');
    
    // Check for timestamp column header
    const headers = Array.from(desktopTable.querySelectorAll('th')).map(th => th.textContent?.trim());
    console.log('Table headers:', headers);
    
    const hasTimestampColumn = headers.some(header => 
      header?.toLowerCase().includes('waktu') || 
      header?.toLowerCase().includes('input') ||
      header?.toLowerCase().includes('time')
    );
    
    if (hasTimestampColumn) {
      console.log('✅ Timestamp column found in headers');
    } else {
      console.log('❌ Timestamp column not found in headers');
    }
    
    // Check timestamp cells
    const timestampCells = desktopTable.querySelectorAll('td');
    const timestampTexts = Array.from(timestampCells)
      .map(cell => cell.textContent?.trim())
      .filter(text => 
        text?.includes('WIB') || 
        text?.includes('Jan') || 
        text?.includes('Feb') ||
        text?.match(/\d{1,2}:\d{2}/)
      );
    
    console.log('Found timestamp texts:', timestampTexts);
    
  } else {
    console.log('⚠️ Desktop table not found');
  }
  
  // Check mobile cards
  const mobileCards = document.querySelectorAll('.lg\\:hidden');
  if (mobileCards.length > 0) {
    console.log('✅ Mobile cards container found');
    
    // Look for timestamp sections
    const timestampSections = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = el.textContent?.toLowerCase() || '';
      return text.includes('input:') || text.includes('update:') || text.includes('wib');
    });
    
    console.log(`Found ${timestampSections.length} potential timestamp sections`);
    timestampSections.forEach((section, index) => {
      console.log(`Timestamp section ${index + 1}:`, section.textContent?.trim());
    });
    
  } else {
    console.log('⚠️ Mobile cards not found');
  }
};

const testWIBFormat = () => {
  console.log('\n🌍 Testing WIB Format:');
  
  // Test current WIB time
  const now = new Date();
  const wibOffset = 7 * 60; // 7 hours in minutes
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wibTime = new Date(utc + (wibOffset * 60000));
  
  console.log('Current system time:', now.toLocaleString());
  console.log('Current WIB time:', wibTime.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }) + ' WIB');
  
  // Test sample debt timestamps
  const sampleTimestamps = [
    '2024-01-15T10:30:00.000Z',
    '2024-07-07T06:00:00.000Z',
    new Date().toISOString()
  ];
  
  sampleTimestamps.forEach((timestamp, index) => {
    const date = new Date(timestamp);
    const formatted = date.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ' WIB';
    
    console.log(`Sample ${index + 1}: ${timestamp} → ${formatted}`);
  });
};

const checkDebtsPageNavigation = () => {
  console.log('\n🧭 Checking Debts Page Navigation:');
  
  // Look for navigation to debts
  const navButtons = Array.from(document.querySelectorAll('button, a')).filter(el => {
    const text = el.textContent?.toLowerCase() || '';
    return text.includes('hutang') || text.includes('debt') || text.includes('piutang');
  });
  
  console.log(`Found ${navButtons.length} navigation elements for debts`);
  navButtons.forEach((btn, index) => {
    console.log(`Nav ${index + 1}:`, btn.textContent?.trim());
  });
  
  // Check if currently on debts page
  const pageIndicators = Array.from(document.querySelectorAll('*')).filter(el => {
    const text = el.textContent?.toLowerCase() || '';
    return text.includes('manajemen hutang') || text.includes('hutang piutang');
  });
  
  if (pageIndicators.length > 0) {
    console.log('✅ Currently on debts page');
  } else {
    console.log('ℹ️ Not currently on debts page - navigate to see timestamp display');
  }
};

const testResponsiveDesign = () => {
  console.log('\n📱 Testing Responsive Design:');
  
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  console.log('Current viewport:', viewport);
  
  let deviceType = 'desktop';
  if (viewport.width < 768) {
    deviceType = 'mobile';
  } else if (viewport.width < 1024) {
    deviceType = 'tablet';
  }
  
  console.log('Device type:', deviceType);
  
  // Check for responsive classes
  const responsiveElements = document.querySelectorAll('.lg\\:block, .lg\\:hidden, .md\\:grid-cols-2, .hidden');
  console.log(`Found ${responsiveElements.length} responsive elements`);
  
  // Check visible/hidden elements based on screen size
  const hiddenOnMobile = document.querySelectorAll('.hidden.lg\\:block');
  const hiddenOnDesktop = document.querySelectorAll('.lg\\:hidden');
  
  console.log(`Elements hidden on mobile: ${hiddenOnMobile.length}`);
  console.log(`Elements hidden on desktop: ${hiddenOnDesktop.length}`);
};

// Main test function
const runDebtsTimestampTests = () => {
  console.log('🚀 Running Debts Timestamp Tests...');
  
  testDebtsTimestampDisplay();
  testWIBFormat();
  checkDebtsPageNavigation();
  testResponsiveDesign();
  
  console.log('\n✅ Debts Timestamp Tests Complete!');
  console.log('\n📋 Manual Testing Steps:');
  console.log('1. Navigate to Hutang Piutang page');
  console.log('2. Check desktop table for "Waktu Input" column');
  console.log('3. Check mobile cards for timestamp section');
  console.log('4. Create new debt → verify timestamp display');
  console.log('5. Edit existing debt → verify update timestamp');
  console.log('6. Test responsive behavior (resize window)');
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
  runDebtsTimestampTests();
} else {
  console.log('Run runDebtsTimestampTests() to execute timestamp verification');
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testDebtsTimestampDisplay,
    testWIBFormat,
    checkDebtsPageNavigation,
    testResponsiveDesign,
    runDebtsTimestampTests
  };
}
