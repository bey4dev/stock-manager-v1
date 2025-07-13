// Utility functions for Indonesian date and time formatting (WIB timezone)

/**
 * Get current date and time in WIB timezone
 * @returns Date object adjusted to WIB (UTC+7)
 */
export const getCurrentWIBDate = (): Date => {
  const now = new Date();
  // WIB is UTC+7
  const wibOffset = 7 * 60; // 7 hours in minutes
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wibTime = new Date(utc + (wibOffset * 60000));
  return wibTime;
};

/**
 * Convert any date to WIB timezone
 * @param date - Date to convert
 * @returns Date object adjusted to WIB (UTC+7)
 */
export const toWIBDate = (date: Date | string): Date => {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  const wibOffset = 7 * 60; // 7 hours in minutes
  const utc = inputDate.getTime() + (inputDate.getTimezoneOffset() * 60000);
  const wibTime = new Date(utc + (wibOffset * 60000));
  return wibTime;
};

/**
 * Format date for display in Indonesian format
 * @param date - Date to format
 * @param options - Formatting options
 * @returns Formatted date string
 */
export const formatWIBDate = (
  date: Date | string, 
  options: {
    includeTime?: boolean;
    includeSeconds?: boolean;
    shortFormat?: boolean;
  } = {}
): string => {
  const { includeTime = false, includeSeconds = false, shortFormat = false } = options;
  
  let wibDate: Date;
  
  // Handle WIB timestamp string format
  if (typeof date === 'string' && date.includes('WIB')) {
    wibDate = parseWIBTimestamp(date);
  } else {
    wibDate = toWIBDate(date);
  }
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: shortFormat ? 'short' : 'long',
    day: 'numeric'
  };
  
  if (includeTime) {
    dateOptions.hour = '2-digit';
    dateOptions.minute = '2-digit';
    if (includeSeconds) {
      dateOptions.second = '2-digit';
    }
    dateOptions.hour12 = false; // Use 24-hour format
  }
  
  let formatted = wibDate.toLocaleDateString('id-ID', dateOptions);
  
  if (includeTime) {
    formatted += ' WIB';
  }
  
  return formatted;
};

/**
 * Format date for HTML input[type="date"]
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format (WIB adjusted)
 */
export const formatWIBDateForInput = (date?: Date | string): string => {
  const wibDate = date ? toWIBDate(date) : getCurrentWIBDate();
  
  const year = wibDate.getFullYear();
  const month = String(wibDate.getMonth() + 1).padStart(2, '0');
  const day = String(wibDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format datetime for HTML input[type="datetime-local"]
 * @param date - Date to format
 * @returns Datetime string in YYYY-MM-DDTHH:mm format (WIB adjusted)
 */
export const formatWIBDateTimeForInput = (date?: Date | string): string => {
  const wibDate = date ? toWIBDate(date) : getCurrentWIBDate();
  
  const year = wibDate.getFullYear();
  const month = String(wibDate.getMonth() + 1).padStart(2, '0');
  const day = String(wibDate.getDate()).padStart(2, '0');
  const hour = String(wibDate.getHours()).padStart(2, '0');
  const minute = String(wibDate.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

/**
 * Get WIB timestamp for database storage
 * @param date - Date to convert (optional, defaults to current time)
 * @returns String timestamp in WIB timezone format for database
 */
export const getWIBTimestamp = (date?: Date | string): string => {
  const wibDate = date ? toWIBDate(date) : getCurrentWIBDate();
  
  // Format as YYYY-MM-DD HH:mm:ss WIB for database readability
  const year = wibDate.getFullYear();
  const month = String(wibDate.getMonth() + 1).padStart(2, '0');
  const day = String(wibDate.getDate()).padStart(2, '0');
  const hour = String(wibDate.getHours()).padStart(2, '0');
  const minute = String(wibDate.getMinutes()).padStart(2, '0');
  const second = String(wibDate.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second} WIB`;
};

/**
 * Get WIB timestamp in ISO format for system processing
 * @param date - Date to convert (optional, defaults to current time)
 * @returns ISO string representing WIB time as if it were UTC
 */
export const getWIBTimestampISO = (date?: Date | string): string => {
  const wibDate = date ? toWIBDate(date) : getCurrentWIBDate();
  return wibDate.toISOString();
};

/**
 * Parse date from input and ensure it's in WIB
 * @param dateString - Date string from input
 * @returns Date object in WIB timezone
 */
export const parseInputDate = (dateString: string): Date => {
  // For date inputs (YYYY-MM-DD), treat as WIB midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    const wibDate = new Date();
    wibDate.setFullYear(year, month - 1, day);
    wibDate.setHours(0, 0, 0, 0);
    return toWIBDate(wibDate);
  }
  
  // For datetime inputs or other formats
  return toWIBDate(new Date(dateString));
};

/**
 * Get relative time in Indonesian
 * @param date - Date to compare
 * @returns Relative time string in Indonesian
 */
export const getRelativeTimeWIB = (date: Date | string): string => {
  const wibDate = toWIBDate(date);
  const now = getCurrentWIBDate();
  const diffMs = now.getTime() - wibDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) {
    return 'Baru saja';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} menit yang lalu`;
  } else if (diffHours < 24) {
    return `${diffHours} jam yang lalu`;
  } else if (diffDays < 7) {
    return `${diffDays} hari yang lalu`;
  } else {
    return formatWIBDate(wibDate, { shortFormat: true });
  }
};

/**
 * Parse WIB timestamp from database
 * @param wibTimestampString - WIB timestamp string from database (e.g., "2024-01-15 17:30:45 WIB")
 * @returns Date object representing the WIB time
 */
export const parseWIBTimestamp = (wibTimestampString: string): Date => {
  if (!wibTimestampString) {
    return getCurrentWIBDate();
  }
  
  // Handle different formats
  if (wibTimestampString.includes('WIB')) {
    // Format: "2024-01-15 17:30:45 WIB"
    const cleanString = wibTimestampString.replace(' WIB', '');
    const [datePart, timePart] = cleanString.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = (timePart || '00:00:00').split(':').map(Number);
    
    const date = new Date();
    date.setFullYear(year, month - 1, day);
    date.setHours(hour, minute, second || 0, 0);
    
    return date;
  } else if (wibTimestampString.includes('T')) {
    // ISO format - assume it's already WIB time stored as ISO
    return new Date(wibTimestampString);
  } else {
    // Try direct parsing as fallback
    const parsed = new Date(wibTimestampString);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    // Fallback - treat as current time
    console.warn('Could not parse date, using current time:', wibTimestampString);
    return getCurrentWIBDate();
  }
};

// Default export with all utilities
export default {
  getCurrentWIBDate,
  toWIBDate,
  formatWIBDate,
  formatWIBDateForInput,
  formatWIBDateTimeForInput,
  getWIBTimestamp,
  getWIBTimestampISO,
  parseInputDate,
  getRelativeTimeWIB,
  parseWIBTimestamp
};
