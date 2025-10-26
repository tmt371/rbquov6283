// File: 04-core-code/ui/views/quick-quote-view.js

import { EVENTS } from '../../config/constants.js';
import * as uiActions from '../../actions/ui-actions.js';
import * as quoteActions from '../../actions/quote-actions.js';

/**
 * @fileoverview View module responsible for all logic related to the Quick Quote screen.
 */
export class QuickQuoteView {
    constructor({ stateService, calculationService, focusService, fileService, eventAggregator, productFactory, configManager }) {
        this.stateService = stateService;
        this.calculationService = calculationService;
        this.focusService = focusService;
        this.fileService = fileService;
        this.eventAggregator = eventAggregator;
        this.productFactory = productFactory;
        this.configManager = configManager;
        this.currentProduct = 'rollerBlind';
    }

    _getItems() {
        const { quoteData } = this.stateService.getState();
        const productKey = quoteData.currentProduct;
        return quoteData.products[productKey] ? quoteData.products[productKey].items : [];
    }

    handleSequenceCellClick({ rowIndex }) {
        const items = this._getItems();
        const item = items[rowIndex];
        const isLastRowEmpty = (rowIndex === items.length - 1) && (!item.width && !item.height);

        if (isLastRowEmpty) {
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: "Cannot select the final empty row.", type: 'error' });
            return;
        }

        this.stateService.dispatch(uiActions.toggleMultiSelectSelection(rowIndex));
    }

    handleDeleteRow() {
        const { ui } = this.stateService.getState();
        const { multiSelectSelectedIndexes } = ui;

        if (multiSelectSelectedIndexes.length > 1) {
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: 'Only one item can be deleted at a time.', type: 'error' });
            return;
        }

        if (multiSelectSelectedIndexes.length === 0) {
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: 'Please select an item to delete.' });
            return;
        }

        const selectedIndex = multiSelectSelectedIndexes[0];
        this.stateService.dispatch(quoteActions.deleteRow(selectedIndex));

        this.stateService.dispatch(uiActions.clearMultiSelectSelection());
        this.stateService.dispatch(uiActions.setSumOutdated(true));
        this.focusService.focusAfterDelete();

        this.eventAggregator.publish(EVENTS.OPERATION_SUCCESSFUL_AUTO_HIDE_PANEL);
    }

    handleInsertRow() {
        const { ui } = this.stateService.getState();
        const { multiSelectSelectedIndexes } = ui;

        if (multiSelectSelectedIndexes.length > 1) {
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: 'A new item can only be inserted below a single selection.', type: 'error' });
            return;
        }

        if (multiSelectSelectedIndexes.length === 0) {
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: 'Please select a position to insert the new item.' });
            return;
        }

        const selectedIndex = multiSelectSelectedIndexes[0];
        const items = this._getItems();
        const isLastRow = selectedIndex === items.length - 1;

        if (isLastRow) {
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: "Cannot insert after the last row.", type: 'error' });
            return;
        }
        const nextItem = items[selectedIndex + 1];
        const isNextRowEmpty = !nextItem.width && !nextItem.height && !nextItem.fabricType;
        if (isNextRowEmpty) {
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: "Cannot insert before an empty row.", type: 'error' });
            return;
        }

        this.stateService.dispatch(quoteActions.insertRow(selectedIndex));
        // The rowIndex of the new row is selectedIndex + 1
        this.stateService.dispatch(uiActions.setActiveCell(selectedIndex + 1, 'width'));
        this.stateService.dispatch(uiActions.clearMultiSelectSelection());
        this.eventAggregator.publish(EVENTS.OPERATION_SUCCESSFUL_AUTO_HIDE_PANEL);
    }

    handleNumericKeyPress({ key }) {
        if (!isNaN(parseInt(key))) {
            this.stateService.dispatch(uiActions.appendInputValue(key));
        } else if (key === 'DEL') {
            this.stateService.dispatch(uiActions.deleteLastInputChar());
        } else if (key === 'W' || key === 'H') {
            this.focusService.focusFirstEmptyCell(key === 'W' ? 'width' : 'height');
        } else if (key === 'ENT') {
            this._commitValue();
            return;
        }
    }

    _commitValue() {
        const { ui } = this.stateService.getState();
        const { inputValue, inputMode, activeCell } = ui;
        const value = inputValue === '' ? null : parseInt(inputValue, 10);
        const productStrategy = this.productFactory.getProductStrategy(this.currentProduct);
        const validationRules = productStrategy.getValidationRules();
        const rule = validationRules[inputMode];

        if (rule && value !== null && (isNaN(value) || value < rule.min || value > rule.max)) {
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: `${rule.name} must be between ${rule.min} and ${rule.max}.`, type: 'error' });
            this.stateService.dispatch(uiActions.clearInputValue());
            return;
        }
        this.stateService.dispatch(quoteActions.updateItemValue(activeCell.rowIndex, activeCell.column, value));
        this.stateService.dispatch(uiActions.setSumOutdated(true));
        this.focusService.focusAfterCommit();
    }

    handleSaveToFile() {
        const { quoteData } = this.stateService.getState();
        const result = this.fileService.saveToJson(quoteData);
        const notificationType = result.success ? 'info' : 'error';
        this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: result.message, type: notificationType });
    }

    handleExportCSV() {
        const { quoteData } = this.stateService.getState();
        const result = this.fileService.exportToCsv(quoteData);
        const notificationType = result.success ? 'info' : 'error';
        this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: result.message, type: notificationType });
    }

    handleReset() {
        if (window.confirm("This will clear all data. Are you sure?")) {
            this.stateService.dispatch(quoteActions.resetQuoteData());
            this.stateService.dispatch(uiActions.resetUi());
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: 'Quote has been reset.' });
        }
    }

    handleClearRow() {
        const { ui } = this.stateService.getState();
        const { multiSelectSelectedIndexes } = ui;

        if (multiSelectSelectedIndexes.length !== 1) {
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, {
                message: 'Please select a single item to use this function.',
                type: 'error'
            });
            return;
        }

        const selectedIndex = multiSelectSelectedIndexes[0];
        const itemNumber = selectedIndex + 1;

        this.eventAggregator.publish(EVENTS.SHOW_CONFIRMATION_DIALOG, {
            message: `Row #${itemNumber}: What would you like to do?`,
            layout: [
                [
                    {
                        type: 'button',
                        text: 'Clear Fields (W,H,Type)',
                        callback: () => {
                            this.stateService.dispatch(quoteActions.clearRow(selectedIndex));
                            this.stateService.dispatch(uiActions.clearMultiSelectSelection());
                            this.stateService.dispatch(uiActions.setSumOutdated(true));
                            this.focusService.focusAfterClear();
                        }
                    },
                    {
                        type: 'button',
                        text: 'Delete Row',
                        callback: () => {
                            this.stateService.dispatch(quoteActions.deleteRow(selectedIndex));
                            this.stateService.dispatch(uiActions.clearMultiSelectSelection());
                            this.stateService.dispatch(uiActions.setSumOutdated(true));
                            this.focusService.focusAfterDelete();
                        }
                    },
                    {
                        type: 'button',
                        text: 'Cancel',
                        className: 'secondary',
                        callback: () => { }
                    }
                ]
            ]
        });
    }

    handleMoveActiveCell({ direction }) {
        this.focusService.moveActiveCell(direction);
    }

    handleTableCellClick({ rowIndex, column }) {
        const item = this._getItems()[rowIndex];
        if (!item) return;

        this.stateService.dispatch(uiActions.clearMultiSelectSelection());

        if (column === 'width' || column === 'height') {
            this.stateService.dispatch(uiActions.setActiveCell(rowIndex, column));
            this.stateService.dispatch(uiActions.setInputValue(item[column]));
        } else if (column === 'TYPE') {
            this.stateService.dispatch(uiActions.setActiveCell(rowIndex, column));
            this.stateService.dispatch(quoteActions.cycleItemType(rowIndex));
            this.stateService.dispatch(uiActions.setSumOutdated(true));
        }
    }

    handleCycleType() {
        const items = this._getItems();
        const eligibleItems = items.filter(item => item.width && item.height);
        if (eligibleItems.length === 0) return;

        this.stateService.dispatch(quoteActions.batchUpdateFabricType());
        this.stateService.dispatch(uiActions.setSumOutdated(true));
    }

    _showFabricTypeDialog(callback, dialogTitle = 'Select a fabric type:') {
        const fabricTypes = this.configManager.getFabricTypeSequence();
        if (fabricTypes.length === 0) return;

        const layout = fabricTypes.map(type => {
            const matrix = this.configManager.getPriceMatrix(type);
            const name = matrix ? matrix.name : 'Unknown';

            return [
                { type: 'button', text: type, callback: () => callback(type), colspan: 1 },
                { type: 'text', text: name, colspan: 2 }
            ];
        });

        layout.push([
            { type: 'text', text: '', colspan: 2 },
            { type: 'button', text: 'Cancel', className: 'secondary cancel-cell', callback: () => { }, colspan: 1 }
        ]);

        this.eventAggregator.publish(EVENTS.SHOW_CONFIRMATION_DIALOG, {
            message: dialogTitle,
            layout: layout,
            position: 'bottomThird'
        });
    }

    handleTypeCellLongPress({ rowIndex }) {
        const item = this._getItems()[rowIndex];
        if (!item || (!item.width && !item.height)) {
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: 'Cannot set type for an empty row.', type: 'error' });
            return;
        }
        this._showFabricTypeDialog((newType) => {
            this.stateService.dispatch(quoteActions.setItemType(rowIndex, newType));
            this.stateService.dispatch(uiActions.setSumOutdated(true));
            return true;
        }, `Set fabric type for Row #${rowIndex + 1}:`);
    }

    handleTypeButtonLongPress() {
        this._showFabricTypeDialog((newType) => {
            this.stateService.dispatch(quoteActions.batchUpdateFabricType(newType));
            this.stateService.dispatch(uiActions.setSumOutdated(true));
            return true;
        }, 'Set fabric type for ALL rows:');
    }

    handleMultiTypeSet() {
        const { ui } = this.stateService.getState();
        const { multiSelectSelectedIndexes } = ui;

        if (multiSelectSelectedIndexes.length <= 1) {
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: 'Please select multiple items first.', type: 'error' });
            return;
        }

        const title = `Set fabric type for ${multiSelectSelectedIndexes.length} selected rows:`;
        this._showFabricTypeDialog((newType) => {
            this.stateService.dispatch(quoteActions.batchUpdateFabricTypeForSelection(multiSelectSelectedIndexes, newType));
            this.stateService.dispatch(uiActions.clearMultiSelectSelection());
            this.stateService.dispatch(uiActions.setSumOutdated(true));
            return true;
        }, title);
    }

    handleCalculateAndSum() {
        const { quoteData } = this.stateService.getState();
        const productStrategy = this.productFactory.getProductStrategy(this.currentProduct);
        const { updatedQuoteData, firstError } = this.calculationService.calculateAndSum(quoteData, productStrategy);

        this.stateService.dispatch(quoteActions.setQuoteData(updatedQuoteData));

        if (firstError) {
            this.stateService.dispatch(uiActions.setSumOutdated(true));
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: firstError.message, type: 'error' });
            this.stateService.dispatch(uiActions.setActiveCell(firstError.rowIndex, firstError.column));
        } else {
            this.stateService.dispatch(uiActions.setSumOutdated(false));
        }
    }

    handleSaveThenLoad() {
        this.handleSaveToFile();
        this.eventAggregator.publish(EVENTS.TRIGGER_FILE_LOAD);
    }
}