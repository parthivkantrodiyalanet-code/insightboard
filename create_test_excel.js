const XLSX = require('xlsx');
const path = require('path');

// 1. Define Sample Data
const data = [
    { Month: 'Jan', Sales: 150, Revenue: 15000, Customers: 50 },
    { Month: 'Feb', Sales: 230, Revenue: 23000, Customers: 75 },
    { Month: 'Mar', Sales: 180, Revenue: 18000, Customers: 60 },
    { Month: 'Apr', Sales: 320, Revenue: 32000, Customers: 110 },
    { Month: 'May', Sales: 450, Revenue: 45000, Customers: 140 },
    { Month: 'Jun', Sales: 410, Revenue: 41000, Customers: 135 },
    { Month: 'Jul', Sales: 520, Revenue: 52000, Customers: 180 },
    { Month: 'Aug', Sales: 580, Revenue: 58000, Customers: 200 },
    { Month: 'Sep', Sales: 490, Revenue: 49000, Customers: 160 },
    { Month: 'Oct', Sales: 610, Revenue: 61000, Customers: 210 },
    { Month: 'Nov', Sales: 750, Revenue: 75000, Customers: 250 },
    { Month: 'Dec', Sales: 800, Revenue: 80000, Customers: 280 },
];

// 2. Create Workbook and Worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(data);

// 3. Append Worksheet to Workbook
XLSX.utils.book_append_sheet(wb, ws, 'Sales Data');

// 4. Write to File
const outputPath = path.join(__dirname, 'sample_dataset.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`Successfully created sample Excel file at: ${outputPath}`);
