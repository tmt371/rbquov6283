// /04-core-code/services/focus-service.js
import * as uiActions from '../actions/ui-actions.js';

/**
 * @fileoverview Service for managing input focus and active cell logic.
 */
export class FocusService {
    /**
     * @param {object} dependencies - The service dependencies.
     * @param {StateService} dependencies.stateService - The main state management service.
     */
    constructor({ stateService }) {
        this.stateService = stateService;
        console.log("FocusService (Context-Aware) Initialized.");
    }

    /**
     * Finds the first empty cell for a given column ('width' or 'height') and sets focus.
     * @param {string} column - 'width' or 'height'.
     */
    focusFirstEmptyCell(column) {
        const { quoteData } = this.stateService.getState();
        const items = quoteData.products[quoteData.currentProduct].items;
        const firstEmptyIndex = items.findIndex(item => !item[column]);
        const targetIndex = (firstEmptyIndex !== -1) ? firstEmptyIndex : items.length - 1;

        this.stateService.dispatch(uiActions.setActiveCell(targetIndex, column));
        this.stateService.dispatch(uiActions.setInputValue(''));
    }

    /**
     * Moves focus to the next logical cell after a value is committed.
     */
    focusAfterCommit() {
        this.moveActiveCell('down');
    }

    /**
     * Moves focus to the width cell of the new last row after a deletion.
     */
    focusAfterDelete() {
        const { quoteData } = this.stateService.getState();
        const lastIndex = quoteData.products[quoteData.currentProduct].items.length - 1;
        this.stateService.dispatch(uiActions.setActiveCell(lastIndex, 'width'));
    }

    /**
     * [MODIFIED] Moves focus to the width cell of the cleared row using the correct state property.
     */
    focusAfterClear() {
        const { ui } = this.stateService.getState();
        const { multiSelectSelectedIndexes } = ui;
        
        if (multiSelectSelectedIndexes.length === 1) {
            const rowIndex = multiSelectSelectedIndexes[0];
            this.stateService.dispatch(uiActions.setActiveCell(rowIndex, 'width'));
        }
    }

    /**
     * Moves the active cell when an arrow key is pressed.
     * @param {string} direction - 'up', 'down', 'left', or 'right'.
     */
    moveActiveCell(direction) {
        const { ui, quoteData } = this.stateService.getState();
        const { activeCell } = ui;
        const items = quoteData.products[quoteData.currentProduct].items;
        let { rowIndex } = activeCell;
        let { column } = activeCell;
        
        const navigableColumns = ['width', 'height', 'TYPE'];
        let columnIndex = navigableColumns.indexOf(column);

        switch (direction) {
            case 'up': rowIndex = Math.max(0, rowIndex - 1); break;
            case 'down': rowIndex = Math.min(items.length - 1, rowIndex + 1); break;
            case 'left': columnIndex = Math.max(0, columnIndex - 1); break;
            case 'right': columnIndex = Math.min(navigableColumns.length - 1, columnIndex + 1); break;
        }
        
        column = navigableColumns[columnIndex];
        this.stateService.dispatch(uiActions.setActiveCell(rowIndex, column));
        this.stateService.dispatch(uiActions.clearMultiSelectSelection());
        
        const currentItem = items[rowIndex];
        if (currentItem && (column === 'width' || column === 'height')) {
            this.stateService.dispatch(uiActions.setInputValue(currentItem[column]));
        } else {
            this.stateService.dispatch(uiActions.setInputValue(''));
        }
    }
}