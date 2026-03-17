const xlsx = require('xlsx');
const workbook = xlsx.readFile('test_template.xlsx');

workbook.SheetNames.forEach(sheetName => {
    if (['History', 'Readme', 'FunctionList'].includes(sheetName)) return;
    
    console.log(`\n\n=== SHEET: ${sheetName} ===`);
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1, range: 0 }).slice(0, 30);
    
    rows.forEach((row, index) => {
        const cleanRow = row.slice(0, 15).map(cell => cell === undefined ? '' : cell);
        if(cleanRow.some(cell => cell !== '')) {
            console.log(`Row ${index}: ${JSON.stringify(cleanRow)}`);
        }
    });
});
