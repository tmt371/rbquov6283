// /04-core-code/utils/csv-parser.js

/**
 * @fileoverview Utility functions for parsing and stringifying CSV data.
 */

/**
 * Converts the application's quote data object into a comprehensive CSV formatted string,
 * including all detailed item properties and LF status.
 * @param {object} quoteData The application's quote data.
 * @returns {string} A string in CSV format.
 */
export function dataToCsv(quoteData) {
    const currentProductKey = quoteData?.currentProduct;
    const productData = quoteData?.products?.[currentProductKey];
    const lfModifiedRowIndexes = quoteData?.uiMetadata?.lfModifiedRowIndexes || [];

    if (!productData || !productData.items) return "";

    const headers = [
        '#', 'Width', 'Height', 'Type', 'Price', 
        'Location', 'F-Name', 'F-Color', 'Over', 'O/I', 'L/R', 
        'Dual', 'Chain', 'Winder', 'Motor', 'IsLF'
    ];
    
    const rows = productData.items.map((item, index) => {
        if (item.width || item.height) {
            const rowData = [
                index + 1,
                item.width || '',
                item.height || '',
                item.fabricType || '',
                item.linePrice !== null ? item.linePrice.toFixed(2) : '',
                item.location || '',
                item.fabric || '',
                item.color || '',
                item.over || '',
                item.oi || '',
                item.lr || '',
                item.dual || '',
                item.chain || '',
                item.winder || '',
                item.motor || '',
                lfModifiedRowIndexes.includes(index) ? 1 : 0
            ];
            return rowData.map(value => {
                const strValue = String(value);
                if (strValue.includes(',')) {
                    return `"${strValue}"`;
                }
                return strValue;
            }).join(',');
        }
        return null;
    }).filter(row => row !== null);

    const totalSum = productData.summary ? productData.summary.totalSum : null;
    let summaryRow = '';
    if (typeof totalSum === 'number') {
        summaryRow = `\n\nTotal,,,,${totalSum.toFixed(2)}`;
    }

    return [headers.join(','), ...rows].join('\n') + summaryRow;
}


/**
 * Converts a CSV formatted string into an object containing item objects and LF indexes.
 * This function is "pure" and has no external dependencies.
 * @param {string} csvString The string containing CSV data.
 * @returns {{items: Array<object>, lfIndexes: Array<number>}|null} An object with items and their LF status, or null if parsing fails.
 */
export function csvToData(csvString) {
    try {
        const lines = csvString.trim().split('\n');
        const headerIndex = lines.findIndex(line => line.trim() !== '');
        if (headerIndex === -1) return null;

        const dataLines = lines.slice(headerIndex + 1);

        const items = [];
        const lfIndexes = [];
        for (const line of dataLines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.toLowerCase().startsWith('total')) {
                continue;
            }
            
            const values = trimmedLine.split(',');

            const item = {
                itemId: `item-${Date.now()}-${items.length}`,
                width: parseInt(values[1], 10) || null,
                height: parseInt(values[2], 10) || null,
                fabricType: values[3] || null,
                linePrice: parseFloat(values[4]) || null,
                location: values[5] || '',
                fabric: values[6] || '',
                color: values[7] || '',
                over: values[8] || '',
                oi: values[9] || '',
                lr: values[10] || '',
                dual: values[11] || '',
                chain: parseInt(values[12], 10) || null,
                winder: values[13] || '',
                motor: values[14] || ''
            };
            items.push(item);
            
            const isLf = parseInt(values[15], 10) === 1;
            if (isLf) {
                lfIndexes.push(items.length - 1);
            }
        }

        return { items, lfIndexes };

    } catch (error) {
        console.error("Failed to parse CSV string:", error);
        return null;
    }
}