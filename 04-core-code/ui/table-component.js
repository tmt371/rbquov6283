// File: 04-core-code/ui/table-component.js

/**
 * @fileoverview A dynamic component for rendering the results table header and body.
 */

const COLUMN_CONFIG = {
    sequence: { header: '#', className: 'col-sequence', dataColumn: 'sequence', cellType: 'td' },
    width: { header: 'W', className: 'col-w', dataColumn: 'width', cellType: 'td' },
    height: { header: 'H', className: 'col-h', dataColumn: 'height', cellType: 'td' },
    TYPE: { header: 'TYPE', className: 'col-type', dataColumn: 'TYPE', cellType: 'td' },
    Price: { 
        header: (state) => `<input type="text" class="input-display-cell" id="input-display-cell" value="${state.ui.inputValue || ''}" readonly>`, 
        className: 'input-display-header col-price', 
        dataColumn: 'Price',
        cellType: 'th'
    },
    location: { header: 'Location', className: 'col-location', dataColumn: 'location', cellType: 'td' },
    fabric: { header: 'F-Name', className: 'col-fabric', dataColumn: 'fabric', cellType: 'td' },
    color: { header: 'F-Color', className: 'col-color', dataColumn: 'color', cellType: 'td' },
    over: { header: 'Over', className: 'col-over', dataColumn: 'over', cellType: 'td' },
    oi: { header: 'O/I', className: 'col-oi', dataColumn: 'oi', cellType: 'td' },
    lr: { header: 'L/R', className: 'col-lr', dataColumn: 'lr', cellType: 'td' },
    fabricTypeDisplay: { header: 'Type', className: 'col-type', dataColumn: 'fabricType', cellType: 'td' },
    dual: { header: 'Dual', className: 'col-dual', dataColumn: 'dual', cellType: 'td' },
    chain: { header: 'Chain', className: 'col-chain', dataColumn: 'chain', cellType: 'td' },
    winder: { header: 'Winder', className: 'col-winder', dataColumn: 'winder', cellType: 'td' },
    motor: { header: 'Motor', className: 'col-motor', dataColumn: 'motor', cellType: 'td' },
};


export class TableComponent {
    constructor(tableElement) {
        if (!tableElement) {
            throw new Error("Table element is required for TableComponent.");
        }
        this.tableElement = tableElement;
        this.cellRenderers = this._createCellRenderers();
        console.log("TableComponent (Refactored with Renderer Strategy) Initialized.");
    }

    render(state) {
        const currentProductKey = state.quoteData.currentProduct;
        const items = state.quoteData.products[currentProductKey].items;

        const { visibleColumns, isLocationEditMode, targetCell } = state.ui;

        this.tableElement.innerHTML = '';

        const thead = this.tableElement.createTHead();
        const headerRow = thead.insertRow();
        visibleColumns.forEach(key => {
            const config = COLUMN_CONFIG[key];
            if (!config) return;

            const cell = document.createElement(config.cellType);
            cell.className = config.className;
            
            if (typeof config.header === 'function') {
                cell.innerHTML = config.header(state);
            } else {
                cell.innerHTML = config.header;
            }
            headerRow.appendChild(cell);
        });

        const tbody = this.tableElement.createTBody();
        if (items.length === 0 || (items.length === 1 && !items[0].width && !items[0].height)) {
            const row = tbody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = visibleColumns.length;
            cell.textContent = 'Enter dimensions to begin...';
            cell.style.textAlign = 'left';
            cell.style.color = '#888';
            return;
        }

        items.forEach((item, index) => {
            const row = tbody.insertRow();
            row.dataset.rowIndex = index;

            if (isLocationEditMode && targetCell && index === targetCell.rowIndex) {
                row.classList.add('target-row-highlight');
            }

            visibleColumns.forEach(key => {
                const config = COLUMN_CONFIG[key];
                if (!config) return;

                const cell = row.insertCell();
                cell.className = config.className;
                cell.dataset.column = config.dataColumn;
                
                this._renderCellContent(cell, key, item, index, state);
            });
        });
    }

    _renderCellContent(cell, key, item, index, state) {
        const { targetCell } = state.ui;
        const { lfModifiedRowIndexes } = state.quoteData.uiMetadata || { lfModifiedRowIndexes: [] };

        if (targetCell && index === targetCell.rowIndex && key === targetCell.column) {
            cell.classList.add('target-cell');
        }

        if (lfModifiedRowIndexes.includes(index) && (key === 'fabric' || key === 'color')) {
            cell.classList.add('is-lf-modified');
        }

        const renderer = this.cellRenderers[key] || this.cellRenderers.default;
        if (renderer) {
            renderer(cell, item, index, state);
        }
    }

    _createCellRenderers() {
        return {
            sequence: (cell, item, index, state) => {
                // [MODIFIED] Removed obsolete state flags 'selectedRowIndex' and 'isMultiSelectMode'
                const { multiSelectSelectedIndexes, lfSelectedRowIndexes } = state.ui;
                const currentProductKey = state.quoteData.currentProduct;
                const items = state.quoteData.products[currentProductKey].items;

                cell.textContent = index + 1;
                const isLastRowEmpty = (index === items.length - 1) && (!item.width && !item.height);
                
                // [MODIFIED] Simplified highlighting logic to rely only on multiSelectSelectedIndexes
                if (lfSelectedRowIndexes.includes(index)) {
                    cell.classList.add('lf-selection-highlight');
                } else if (isLastRowEmpty) {
                    cell.classList.add('selection-disabled');
                } else if (multiSelectSelectedIndexes.includes(index)) {
                    // Use a single, consistent class for any selection (single or multi)
                    cell.classList.add('selected-row-highlight');
                }
            },
            width: (cell, item, index, state) => {
                const { activeCell } = state.ui;
                cell.textContent = item.width || '';
                if (activeCell && index === activeCell.rowIndex && activeCell.column === 'width') cell.classList.add('active-input-cell');
            },
            height: (cell, item, index, state) => {
                const { activeCell } = state.ui;
                cell.textContent = item.height || '';
                if (activeCell && index === activeCell.rowIndex && activeCell.column === 'height') cell.classList.add('active-input-cell');
            },
            TYPE: (cell, item, index, state) => {
                const { activeCell } = state.ui;
                cell.textContent = (item.width || item.height) ? (item.fabricType || '') : '';
                
                const typeClassMap = {
                    'B2': 'type-b2', 'B3': 'type-b3', 'B4': 'type-b4',
                    'B5': 'type-b5', 'SN': 'type-sn'
                };
                if (typeClassMap[item.fabricType]) {
                    cell.classList.add(typeClassMap[item.fabricType]);
                }

                if (activeCell && index === activeCell.rowIndex && activeCell.column === 'TYPE') cell.classList.add('active-input-cell');
            },
            Price: (cell, item) => {
                cell.textContent = item.linePrice ? item.linePrice.toFixed(2) : '';
                cell.classList.add('price-cell');
            },
            fabricTypeDisplay: (cell, item) => {
                cell.textContent = item.fabricType || '';

                const typeClassMap = {
                    'B2': 'type-b2', 'B3': 'type-b3', 'B4': 'type-b4',
                    'B5': 'type-b5', 'SN': 'type-sn'
                };
                if (typeClassMap[item.fabricType]) {
                    cell.classList.add(typeClassMap[item.fabricType]);
                }
            },
            dual: (cell, item) => {
                cell.textContent = item.dual || '';
                cell.classList.toggle('dual-cell-active', item.dual === 'D');
            },
            winder: (cell, item) => {
                cell.textContent = item.winder || '';
                cell.classList.toggle('winder-cell-active', !!item.winder);
            },
            motor: (cell, item) => {
                cell.textContent = item.motor || '';
                cell.classList.toggle('motor-cell-active', !!item.motor);
            },
            default: (cell, item, index, state) => {
                const columnKey = cell.dataset.column;
                cell.textContent = item[columnKey] || '';
            }
        };
    }
}