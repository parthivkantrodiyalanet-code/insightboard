const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('sample_dataset.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log("First 5 rows:");
    console.log(JSON.stringify(data.slice(0, 5), null, 2));

    if (data.length > 0) {
        const keys = Object.keys(data[0]);
        console.log("\nColumns:", keys);

        // Find likely date columns
        keys.forEach(key => {
            const val = data[0][key];
            console.log(`\nCol: "${key}", First Val: ${val} (Type: ${typeof val})`);
        });
    }
} catch (err) {
    console.error("Error reading file:", err);
}
