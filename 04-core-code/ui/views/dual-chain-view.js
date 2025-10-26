// File: 04-core-code/ui/views/dual-chain-view.js

import { EVENTS } from '../../config/constants.js';
import * as uiActions from '../../actions/ui-actions.js';
import * as quoteActions from '../../actions/quote-actions.js';

/**
 * @fileoverview A dedicated sub-view for handling all logic related to the Dual/Chain tab.
 */
export class DualChainView {
    constructor({ stateService, calculationService, eventAggregator }) {
        this.stateService = stateService;
        this.calculationService = calculationService;
        this.eventAggregator = eventAggregator;
        console.log("DualChainView Initialized.");
    }

    _getState() {
        return this.stateService.getState();
    }

    _getItems() {
        const { quoteData } = this._getState();
        return quoteData.products[quoteData.currentProduct].items;
    }

    _getCurrentProductType() {
        const { quoteData } = this._getState();
        return quoteData.currentProduct;
    }

    /**
     * Handles the toggling of modes (dual, chain).
     * Validation now ONLY runs when EXITING dual mode.
     */
    handleModeChange({ mode }) {
        const { ui } = this._getState();
        const currentMode = ui.dualChainMode;
        const newMode = currentMode === mode ? null : mode;

        if (currentMode === 'dual') {
            const isValid = this._validateDualSelection();
            if (!isValid) {
                return;
            }
        }

        this.stateService.dispatch(uiActions.setDualChainMode(newMode));

        if (newMode === 'dual') {
            this._calculateAndStoreDualPrice();
        }

        if (!newMode) {
            this.stateService.dispatch(uiActions.setTargetCell(null));
            this.stateService.dispatch(uiActions.clearDualChainInputValue());
        }
    }

    /**
     * [NEW] This method PURELY calculates the price and updates state. It contains NO validation logic.
     * This is the key to achieving real-time updates without premature warnings.
     */
    _calculateAndStoreDualPrice() {
        const items = this._getItems();
        const productType = this._getCurrentProductType();

        const price = this.calculationService.calculateAccessorySalePrice(productType, 'dual', { items });

        this.stateService.dispatch(quoteActions.updateAccessorySummary({ dualCostSum: price }));
        this.stateService.dispatch(uiActions.setDualPrice(price));

        this._updateSummaryAccessoriesTotal();
    }

    /**
     * [NEW] This method PURELY validates the selection. It does NOT calculate any price.
     * It is only called when the user tries to exit the dual mode.
     */
    _validateDualSelection() {
        const items = this._getItems();
        const selectedIndexes = items.reduce((acc, item, index) => {
            if (item.dual === 'D') {
                acc.push(index);
            }
            return acc;
        }, []);

        const dualCount = selectedIndexes.length;

        if (dualCount > 0 && dualCount % 2 !== 0) {
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, {
                message: 'The total count of Dual Brackets (D) must be an even number. Please correct the selection.',
                type: 'error'
            });
            return false;
        }

        for (let i = 0; i < dualCount; i += 2) {
            if (selectedIndexes[i + 1] !== selectedIndexes[i] + 1) {
                this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, {
                    message: 'Dual Brackets (D) must be set on adjacent items. Please check your selection.',
                    type: 'error'
                });
                return false;
            }
        }

        return true;
    }

    /**
     * Handles the Enter key press in the chain input box.
     */
    handleChainEnterPressed({ value }) {
        const { ui } = this._getState();
        const { targetCell: currentTarget } = ui;
        if (!currentTarget) return;

        const valueAsNumber = Number(value);
        if (value !== '' && (!Number.isInteger(valueAsNumber) || valueAsNumber <= 0)) {
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, {
                message: 'Only positive integers are allowed.',
                type: 'error'
            });
            return;
        }

        const valueToSave = value === '' ? null : valueAsNumber;
        this.stateService.dispatch(quoteActions.updateItemProperty(currentTarget.rowIndex, currentTarget.column, valueToSave));

        this.stateService.dispatch(uiActions.setTargetCell(null));
        this.stateService.dispatch(uiActions.clearDualChainInputValue());
    }

    /**
     * Handles clicks on table cells when a mode is active.
     */
    handleTableCellClick({ rowIndex, column }) {
        const { ui } = this._getState();
        const { dualChainMode } = ui;
        const items = this._getItems();
        const item = items[rowIndex];
        if (!item) return;

        const isLastRow = rowIndex === items.length - 1;
        if (isLastRow) return;

        if (dualChainMode === 'dual' && column === 'dual') {
            const newValue = item.dual === 'D' ? '' : 'D';
            this.stateService.dispatch(quoteActions.updateItemProperty(rowIndex, 'dual', newValue));

            this._calculateAndStoreDualPrice();
        }

        if (dualChainMode === 'chain' && column === 'chain') {
            this.stateService.dispatch(uiActions.setTargetCell({ rowIndex, column: 'chain' }));

            setTimeout(() => {
                const inputBox = document.getElementById('k4-input-display');
                inputBox?.focus();
                inputBox?.select();
            }, 50);
        }
    }

    /**
     * [REVISED] This method is called by the main DetailConfigView when the K5 tab becomes active.
     * It now correctly synchronizes all accessory prices from the K4 state.
     */
    activate() {
        this.stateService.dispatch(uiActions.setVisibleColumns(['sequence', 'fabricTypeDisplay', 'location', 'dual', 'chain']));

        const { ui, quoteData } = this._getState();
        const currentProductData = quoteData.products[quoteData.currentProduct];
        this.stateService.dispatch(uiActions.setSummaryWinderPrice(ui.driveWinderTotalPrice));
        this.stateService.dispatch(uiActions.setSummaryMotorPrice(ui.driveMotorTotalPrice));
        this.stateService.dispatch(uiActions.setSummaryRemotePrice(ui.driveRemoteTotalPrice));
        this.stateService.dispatch(uiActions.setSummaryChargerPrice(ui.driveChargerTotalPrice));
        this.stateService.dispatch(uiActions.setSummaryCordPrice(ui.driveCordTotalPrice));
        this.stateService.dispatch(uiActions.setDualPrice(currentProductData.summary.accessories.dualCostSum));

        this._updateSummaryAccessoriesTotal();
    }

    /**
     * Calculates the total of all accessories displayed on the K5 summary tab.
     */
    _updateSummaryAccessoriesTotal() {
        const { ui } = this._getState();

        const dualPrice = ui.dualPrice || 0;
        const winderPrice = ui.summaryWinderPrice || 0;
        const motorPrice = ui.summaryMotorPrice || 0;
        const remotePrice = ui.summaryRemotePrice || 0;
        const chargerPrice = ui.summaryChargerPrice || 0;
        const cordPrice = ui.summaryCordPrice || 0;

        const total = dualPrice + winderPrice + motorPrice + remotePrice + chargerPrice + cordPrice;

        this.stateService.dispatch(uiActions.setSummaryAccessoriesTotal(total));
    }
}