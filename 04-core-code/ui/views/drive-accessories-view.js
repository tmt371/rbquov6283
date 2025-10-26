// File: 04-core-code/ui/views/drive-accessories-view.js

import { EVENTS } from '../../config/constants.js';
import * as uiActions from '../../actions/ui-actions.js';
import * as quoteActions from '../../actions/quote-actions.js';

/**
 * @fileoverview A dedicated sub-view for handling all logic related to the Drive/Accessories tab.
 */
export class DriveAccessoriesView {
    constructor({ stateService, calculationService, eventAggregator }) {
        this.stateService = stateService;
        this.calculationService = calculationService;
        this.eventAggregator = eventAggregator;
        console.log("DriveAccessoriesView Initialized.");
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

    activate() {
        this.stateService.dispatch(uiActions.setVisibleColumns(['sequence', 'fabricTypeDisplay', 'location', 'winder', 'motor']));
    }

    handleModeChange({ mode }) {
        const { ui } = this._getState();
        const currentMode = ui.driveAccessoryMode;
        const newMode = currentMode === mode ? null : mode;

        if (currentMode) {
            this.recalculateAllDriveAccessoryPrices();
        }

        this.stateService.dispatch(uiActions.setDriveAccessoryMode(newMode));

        if (newMode) {
            if (newMode === 'remote' || newMode === 'charger') {
                const items = this._getItems();
                const hasMotor = items.some(item => !!item.motor);
                const currentCount = newMode === 'remote' ? ui.driveRemoteCount : ui.driveChargerCount;

                if (hasMotor && (currentCount === 0 || currentCount === null)) {
                    this.stateService.dispatch(uiActions.setDriveAccessoryCount(newMode, 1));
                }
            }

            const message = this._getHintMessage(newMode);
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message });
        }
    }

    handleTableCellClick({ rowIndex, column }) {
        const { ui } = this._getState();
        const { driveAccessoryMode } = ui;
        if (!driveAccessoryMode || (column !== 'winder' && column !== 'motor')) return;

        const item = this._getItems()[rowIndex];
        if (!item) return;

        const isActivatingWinder = driveAccessoryMode === 'winder' && column === 'winder';
        const isActivatingMotor = driveAccessoryMode === 'motor' && column === 'motor';

        if (isActivatingWinder) {
            if (item.motor) {
                this.eventAggregator.publish(EVENTS.SHOW_CONFIRMATION_DIALOG, {
                    message: 'This blind is set to Motor. Are you sure you want to change it to HD Winder?',
                    layout: [
                        [
                            { type: 'button', text: 'Confirm', callback: () => this._toggleWinder(rowIndex, true) },
                            { type: 'button', text: 'Cancel', className: 'secondary', callback: () => { } }
                        ]
                    ]
                });
            } else {
                this._toggleWinder(rowIndex, false);
            }
        } else if (isActivatingMotor) {
            if (item.winder) {
                this.eventAggregator.publish(EVENTS.SHOW_CONFIRMATION_DIALOG, {
                    message: 'This blind is set to HD Winder. Are you sure you want to change it to Motor?',
                    layout: [
                        [
                            { type: 'button', text: 'Confirm', callback: () => this._toggleMotor(rowIndex, true) },
                            { type: 'button', text: 'Cancel', className: 'secondary', callback: () => { } }
                        ]
                    ]
                });
            } else {
                this._toggleMotor(rowIndex, false);
            }
        }
    }

    handleCounterChange({ accessory, direction }) {
        const { ui } = this._getState();
        const counts = {
            remote: ui.driveRemoteCount,
            charger: ui.driveChargerCount,
            cord: ui.driveCordCount
        };
        let currentCount = counts[accessory];
        const newCount = direction === 'add' ? currentCount + 1 : Math.max(0, currentCount - 1);

        if (newCount === 0) {
            const items = this._getItems();
            const hasMotor = items.some(item => !!item.motor);
            if (hasMotor && (accessory === 'remote' || accessory === 'charger')) {
                const accessoryName = accessory === 'remote' ? 'Remote' : 'Charger';
                this.eventAggregator.publish(EVENTS.SHOW_CONFIRMATION_DIALOG, {
                    message: `Motors are present in the quote. Are you sure you want to set the ${accessoryName} quantity to 0?`,
                    layout: [
                        [
                            {
                                type: 'button', text: 'Confirm', callback: () => {
                                    this.stateService.dispatch(uiActions.setDriveAccessoryCount(accessory, 0));
                                }
                            },
                            { type: 'button', text: 'Cancel', className: 'secondary', callback: () => { } }
                        ]
                    ]
                });
                return;
            }
        }

        this.stateService.dispatch(uiActions.setDriveAccessoryCount(accessory, newCount));
    }

    _toggleWinder(rowIndex) {
        const item = this._getItems()[rowIndex];
        const newValue = item.winder ? '' : 'HD';
        this.stateService.dispatch(quoteActions.updateWinderMotorProperty(rowIndex, 'winder', newValue));
    }

    _toggleMotor(rowIndex) {
        const item = this._getItems()[rowIndex];
        const newValue = item.motor ? '' : 'Motor';
        this.stateService.dispatch(quoteActions.updateWinderMotorProperty(rowIndex, 'motor', newValue));
    }

    recalculateAllDriveAccessoryPrices() {
        const items = this._getItems();
        const state = this._getState().ui;
        const productType = this._getCurrentProductType();
        const summaryData = {};
        let grandTotal = 0;

        const winderCount = items.filter(item => item.winder === 'HD').length;
        const winderPrice = this.calculationService.calculateAccessorySalePrice(productType, 'winder', { count: winderCount });
        this.stateService.dispatch(uiActions.setDriveAccessoryTotalPrice('winder', winderPrice));
        summaryData.winder = { count: winderCount, price: winderPrice };
        grandTotal += winderPrice;

        const motorCount = items.filter(item => !!item.motor).length;
        const motorPrice = this.calculationService.calculateAccessorySalePrice(productType, 'motor', { count: motorCount });
        this.stateService.dispatch(uiActions.setDriveAccessoryTotalPrice('motor', motorPrice));
        summaryData.motor = { count: motorCount, price: motorPrice };
        grandTotal += motorPrice;

        const remoteCount = state.driveRemoteCount;
        const remotePrice = this.calculationService.calculateAccessorySalePrice(productType, 'remote', {
            count: remoteCount
        });
        this.stateService.dispatch(uiActions.setDriveAccessoryTotalPrice('remote', remotePrice));
        summaryData.remote = { type: 'standard', count: remoteCount, price: remotePrice };
        grandTotal += remotePrice;

        const chargerCount = state.driveChargerCount;
        const chargerPrice = this.calculationService.calculateAccessorySalePrice(productType, 'charger', { count: chargerCount });
        this.stateService.dispatch(uiActions.setDriveAccessoryTotalPrice('charger', chargerPrice));
        summaryData.charger = { count: chargerCount, price: chargerPrice };
        grandTotal += chargerPrice;

        const cordCount = state.driveCordCount;
        const cordPrice = this.calculationService.calculateAccessorySalePrice(productType, 'cord', { count: cordCount });
        this.stateService.dispatch(uiActions.setDriveAccessoryTotalPrice('cord', cordPrice));
        summaryData.cord3m = { count: cordCount, price: cordPrice };
        grandTotal += cordPrice;

        this.stateService.dispatch(uiActions.setDriveGrandTotal(grandTotal));
        this.stateService.dispatch(quoteActions.updateAccessorySummary({
            winderCostSum: winderPrice,
            motorCostSum: motorPrice,
            remoteCostSum: remotePrice,
            chargerCostSum: chargerPrice,
            cordCostSum: cordPrice
        }));
    }

    _getHintMessage(mode) {
        const hints = {
            winder: 'Click a cell under the Winder column to set HD.',
            motor: 'Click a cell under the Motor column to set Motor.',
            remote: 'Click + or - to increase or decrease the quantity of remotes.',
            charger: 'Click + or - to increase or decrease the quantity of chargers.',
            cord: 'Click + or - to increase or decrease the quantity of extension cords.'
        };
        return hints[mode] || 'Please make your selection.';
    }
}