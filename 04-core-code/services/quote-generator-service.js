// File: 04-core-code/services/quote-generator-service.js

import { paths } from '../config/paths.js';

/**
 * @fileoverview A new, single-responsibility service for generating the final quote HTML.
 * It pre-fetches and caches templates for better performance.
 */
export class QuoteGeneratorService {
    constructor({ calculationService }) {
        this.calculationService = calculationService;
        this.quoteTemplate = '';
        this.detailsTemplate = '';
        
        // [NEW] Store the action bar and script templates
        this.actionBarHtml = `
    <div id="action-bar">
        <button id="copy-html-btn">Copy HTML</button>
        <button id="print-btn">Print / Save PDF</button>
    </div>`;

        this.scriptHtml = `
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const copyBtn = document.getElementById('copy-html-btn');
            const printBtn = document.getElementById('print-btn');
            const actionBar = document.getElementById('action-bar');

            if (printBtn) {
                printBtn.addEventListener('click', function() {
                    window.print();
                });
            }

            if (copyBtn) {
                copyBtn.addEventListener('click', function() {
                    // 1. Temporarily hide the action bar
                    actionBar.style.display = 'none';

                    // 2. Get the entire HTML of the page, including doctype
                    const pageHtml = new XMLSerializer().serializeToString(document);

                    // 3. Copy to clipboard
                    navigator.clipboard.writeText(pageHtml)
                        .then(() => {
                            // 4. Show the action bar again
                            actionBar.style.display = 'flex';
                            alert('HTML copied to clipboard successfully!');
                        })
                        .catch(err => {
                            // 4. Show the action bar again even if it fails
                            actionBar.style.display = 'flex';
                            console.error('Failed to copy:', err);
                            alert('Failed to copy. Please check console for errors.');
                        });
                });
            }
        });
    <\/script>`;


        this._initialize();
        console.log("QuoteGeneratorService Initialized.");
    }

    async _initialize() {
        try {
            [this.quoteTemplate, this.detailsTemplate] = await Promise.all([
                fetch(paths.partials.quoteTemplate).then(res => res.text()),
                fetch(paths.partials.detailedItemList).then(res => res.text()),
            ]);
            console.log("QuoteGeneratorService: HTML templates pre-fetched and cached.");
        } catch (error) {
            console.error("QuoteGeneratorService: Failed to pre-fetch HTML templates:", error);
            // In a real-world scenario, you might want to publish an error event here.
        }
    }

    generateQuoteHtml(quoteData, ui, f3Data) {
        if (!this.quoteTemplate || !this.detailsTemplate) {
            console.error("QuoteGeneratorService: Templates are not loaded yet.");
            return null;
        }

        // [REFACTORED] Delegate all data preparation to CalculationService.
        const templateData = this.calculationService.getQuoteTemplateData(quoteData, ui, f3Data);

        // [REFACTORED] Generate HTML snippets using the prepared data.
        const populatedDataWithHtml = {
            ...templateData,
            customerInfoHtml: this._formatCustomerInfo(templateData),
            itemsTableBody: this._generatePageOneItemsTableHtml(templateData),
            rollerBlindsTable: this._generateItemsTableHtml(templateData)
        };
        
        const populatedDetailsPageHtml = this._populateTemplate(this.detailsTemplate, populatedDataWithHtml);

        const styleMatch = populatedDetailsPageHtml.match(/<style>([\s\S]*)<\/style>/i);
        const detailsBodyMatch = populatedDetailsPageHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);

        if (!detailsBodyMatch) {
            throw new Error("Could not find body content in the details template.");
        }

        const detailsStyleContent = styleMatch ? styleMatch[0] : '';
        const detailsBodyContent = detailsBodyMatch[1];

        let finalHtml = this.quoteTemplate.replace('</head>', `${detailsStyleContent}</head>`);
        finalHtml = finalHtml.replace('</body>', `${detailsBodyContent}</body>`);
        finalHtml = this._populateTemplate(finalHtml, populatedDataWithHtml);

        // [NEW] Inject the action bar and script into the final HTML
        finalHtml = finalHtml.replace(
            '<body>',
            `<body>${this.actionBarHtml}`
        );

        finalHtml = finalHtml.replace(
            '</body>',
            `${this.scriptHtml}</body>`
        );

        return finalHtml;
    }

    _populateTemplate(template, data) {
        return template.replace(/\{\{\{?([\w\-]+)\}\}\}?/g, (match, key) => {
            return data.hasOwnProperty(key) ? data[key] : match;
        });
    }

    _formatCustomerInfo(templateData) {
        let html = `<strong>${templateData.customerName || ''}</strong><br>`;
        if (templateData.customerAddress) html += `${templateData.customerAddress.replace(/\n/g, '<br>')}<br>`;
        if (templateData.customerPhone) html += `Phone: ${templateData.customerPhone}<br>`;
        if (templateData.customerEmail) html += `Email: ${templateData.customerEmail}`;
        return html;
    }

    _generateItemsTableHtml(templateData) {
        const { items, mulTimes } = templateData;
        const headers = ['#', 'F-NAME', 'F-COLOR', 'Location', 'HD', 'Dual', 'Motor', 'Price'];
    
        const rows = items
            .filter(item => item.width && item.height)
            .map((item, index) => {
                let fabricClass = '';
                if (item.fabric && item.fabric.toLowerCase().includes('light-filter')) {
                    fabricClass = 'bg-light-filter';
                } else if (item.fabricType === 'SN') {
                    fabricClass = 'bg-screen';
                } else if (['B1', 'B2', 'B3', 'B4', 'B5'].includes(item.fabricType)) {
                    fabricClass = 'bg-blockout';
                }
    
                const finalPrice = (item.linePrice || 0) * mulTimes;

                const cell = (dataLabel, content, cssClass = '') => {
                    const isEmpty = !content;
                    const finalClass = `${cssClass} ${isEmpty ? 'is-empty-cell' : ''}`.trim();
                    return `<td data-label="${dataLabel}" class="${finalClass}">${content}</td>`;
                };
    
                const cells = [
                    cell('#', index + 1, 'text-center'),
                    cell('F-NAME', item.fabric || '', fabricClass),
                    cell('F-COLOR', item.color || '', fabricClass),
                    cell('Location', item.location || ''),
                    cell('HD', item.winder === 'HD' ? '✔' : '', 'text-center'),
                    cell('Dual', item.dual === 'D' ? '✔' : '', 'text-center'),
                    cell('Motor', item.motor ? '✔' : '', 'text-center'),
                    cell('Price', `$${finalPrice.toFixed(2)}`, 'text-right')
                ].join('');
    
                return `<tr>${cells}</tr>`;
            })
            .join('');
    
        return `
            <table class="detailed-list-table">
                <colgroup>
                    <col style="width: 5%;">
                    <col style="width: 20%;">
                    <col style="width: 15%;">
                    <col style="width: 12%;">
                    <col style="width: 9%;">
                    <col style="width: 9%;">
                    <col style="width: 9%;">
                    <col style="width: 13%;">
                </colgroup>
                <thead>
                    <tr class="table-title">
                        <th colspan="${headers.length}">Roller Blinds - Detailed List</th>
                    </tr>
                    <tr>
                        ${headers.map(h => `<th>${h}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    _generatePageOneItemsTableHtml(templateData) {
        const { summaryData, uiState, items } = templateData;
        const rows = [];
        const validItemCount = items.filter(i => i.width && i.height).length;

        rows.push(`
            <tr>
                <td data-label="NO">1</td>
                <td data-label="Description" class="description">Roller Blinds</td>
                <td data-label="QTY" class="align-right">${validItemCount}</td>
                <td data-label="Price" class="align-right">
                    <span class="original-price">$${(summaryData.firstRbPrice || 0).toFixed(2)}</span>
                </td>
                <td data-label="Discounted Price" class="align-right">
                    <span class="discounted-price">$${(summaryData.disRbPrice || 0).toFixed(2)}</span>
                </td>
            </tr>
        `);

        let itemNumber = 2;

        if (summaryData.acceSum > 0) {
            rows.push(`
                <tr>
                    <td data-label="NO">${itemNumber++}</td>
                    <td data-label="Description" class="description">Installation Accessories</td>
                    <td data-label="QTY" class="align-right">NA</td>
                    <td data-label="Price" class="align-right">$${(summaryData.acceSum || 0).toFixed(2)}</td>
                    <td data-label="Discounted Price" class="align-right">$${(summaryData.acceSum || 0).toFixed(2)}</td>
                </tr>
            `);
        }

        if (summaryData.eAcceSum > 0) {
            rows.push(`
                <tr>
                    <td data-label="NO">${itemNumber++}</td>
                    <td data-label="Description" class="description">Motorised Accessories</td>
                    <td data-label="QTY" class="align-right">NA</td>
                    <td data-label="Price" class="align-right">$${(summaryData.eAcceSum || 0).toFixed(2)}</td>
                    <td data-label="Discounted Price" class="align-right">$${(summaryData.eAcceSum || 0).toFixed(2)}</td>
                </tr>
            `);
        }

        const deliveryExcluded = uiState.f2.deliveryFeeExcluded;
        const deliveryPriceClass = deliveryExcluded ? 'class="align-right is-excluded"' : 'class="align-right"';
        const deliveryDiscountedPrice = deliveryExcluded ? 0 : (summaryData.deliveryFee || 0);
        rows.push(`
            <tr>
                <td data-label="NO">${itemNumber++}</td>
                <td data-label="Description" class="description">Delivery</td>
                <td data-label="QTY" class="align-right">${uiState.f2.deliveryQty || 1}</td>
                <td data-label="Price" ${deliveryPriceClass}>$${(summaryData.deliveryFee || 0).toFixed(2)}</td>
                <td data-label="Discounted Price" class="align-right">$${deliveryDiscountedPrice.toFixed(2)}</td>
            </tr>
        `);

        const installExcluded = uiState.f2.installFeeExcluded;
        const installPriceClass = installExcluded ? 'class="align-right is-excluded"' : 'class="align-right"';
        const installDiscountedPrice = installExcluded ? 0 : (summaryData.installFee || 0);
        rows.push(`
            <tr>
                <td data-label="NO">${itemNumber++}</td>
                <td data-label="Description" class="description">Installation</td>
                <td data-label="QTY" class="align-right">${validItemCount}</td>
                <td data-label="Price" ${installPriceClass}>$${(summaryData.installFee || 0).toFixed(2)}</td>
                <td data-label="Discounted Price" class="align-right">$${installDiscountedPrice.toFixed(2)}</td>
            </tr>
        `);

        const removalExcluded = uiState.f2.removalFeeExcluded;
        const removalPriceClass = removalExcluded ? 'class="align-right is-excluded"' : 'class="align-right"';
        const removalDiscountedPrice = removalExcluded ? 0 : (summaryData.removalFee || 0);
        rows.push(`
            <tr>
                <td data-label="NO">${itemNumber++}</td>
                <td data-label="Description" class="description">Removal</td>
                <td data-label="QTY" class="align-right">${uiState.f2.removalQty || 0}</td>
                <td data-label="Price" ${removalPriceClass}>$${(summaryData.removalFee || 0).toFixed(2)}</td>
                <td data-label="Discounted Price" class="align-right">$${removalDiscountedPrice.toFixed(2)}</td>
            </tr>
        `);

        return rows.join('');
    }
}