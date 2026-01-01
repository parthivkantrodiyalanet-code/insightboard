
/**
 * Parses a date from various formats including Excel serial numbers, strings, and Date objects.
 * Excel base date: Dec 30, 1899
 */
export function parseDate(value: any): Date | null {
  if (value === null || value === undefined) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // Handle Excel Serial Numbers
  if (typeof value === 'number') {
    if (value > 20000 && value < 80000) { 
       const date = new Date(Math.round((value - 25569) * 86400 * 1000));
       return isNaN(date.getTime()) ? null : date;
    }
    return null; 
  }

  // Handle Strings
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // 1. Try standard constructor (Handles ISO, MM/DD/YYYY, Month DD YYYY)
    let date = new Date(trimmed);
    if (!isNaN(date.getTime())) return date;
    
    // 2. Handle DD/MM/YYYY or DD-MM-YYYY (Common in non-US)
    // Regex for DD/MM/YYYY or DD-MM-YYYY
    const ddmmyyyy = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ddmmyyyy) {
       // Assume Day, Month, Year
       const d = parseInt(ddmmyyyy[1]);
       const m = parseInt(ddmmyyyy[2]);
       const y = parseInt(ddmmyyyy[3]);
       const dt = new Date(y, m - 1, d);
       if (!isNaN(dt.getTime())) return dt;
    }

    // 3. Handle Month names without year (e.g., "Jan", "January", "01-Jan")
    // If it contains a month name but standard parse failed (likely due to missing year or format)
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    if (months.some(m => trimmed.toLowerCase().includes(m))) {
        // Try appending current year if no year found
        if (!/\d{4}/.test(trimmed)) {
            const currentYear = new Date().getFullYear();
            const withYear = `${trimmed} ${currentYear}`;
            date = new Date(withYear);
            if (!isNaN(date.getTime())) return date;
        }
    }
  }

  return null;
}

/**
 * Checks if a column is likely a date column based on a sample of values
 */
export function isDateColumn(data: any[], col: string): boolean {
  if (!data || !data.length) return false;
  
  let validDates = 0;
  let checks = 0;
  const maxChecks = 10; // Check more rows for better accuracy

  for (const row of data) {
    const val = row[col];
    if (val === null || val === undefined) continue;
    
    if (checks >= maxChecks) break;
    checks++;

    const parsed = parseDate(val);
    if (parsed) validDates++;
  }

  if (checks === 0) return false;
  // If at least 40% are valid dates, assume it's a date column
  return (validDates / checks) >= 0.4;
}
