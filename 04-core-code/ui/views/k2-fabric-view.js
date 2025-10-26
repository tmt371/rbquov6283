// File: 04-core-code/ui/views/k2-fabric-view.js

import { EVENTS } from '../../config/constants.js';
import * as uiActions from '../../actions/ui-actions.js';
import * as quoteActions from '../../actions/quote-actions.js';

/**
 * @fileoverview A dedicated sub-view for handling all logic related to the K2 (Fabric) tab.
 */
export class K2FabricView {
    constructor({ stateService, eventAggregator, publishStateChangeCallback }) {
        this.stateService = stateService;
        this.eventAggregator = eventAggregator;
        this.publish = publishStateChangeCallback;
        
        this.indexesToExcludeFromBatchUpdate = new Set();

        console.log("K2FabricView Initialized.");
    }

    _getState() {
        return this.stateService.getState();
    }

    _getItems() {
        const { quoteData } = this._getState();
        return quoteData.products[quoteData.currentProduct].items;
    }

    handleFocusModeRequest() {
        const { ui } = this._getState();
        const currentMode = ui.activeEditMode;
        const newMode = currentMode === 'K2' ? null : 'K2';

        if (newMode) {
            const items = this._getItems();
            const { lfModifiedRowIndexes } = this._getState().quoteData.uiMetadata;
            const eligibleTypes = ['B2', 'B3', 'B4'];
            
            const hasConflict = items.some((item, index) => 
                eligibleTypes.includes(item.fabricType) && lfModifiedRowIndexes.includes(index)
            );

            if (hasConflict) {
                this.eventAggregator.publish(EVENTS.SHOW_CONFIRMATION_DIALOG, {
                    message: 'Data Conflict: Some items (B2, B3, B4) already have Light-Filter settings. Continuing with a batch edit will overwrite this data. How would you like to proceed?',
                    closeOnOverlayClick: false,
                    layout: [
                        [
                            { 
                                type: 'button', text: 'Overwrite (L-Filter)', 
                                callback: () => {
                                    this.indexesToExcludeFromBatchUpdate.clear();
                                    this._enterFCMode(true);
                                } 
                            },
                            { 
                                type: 'button', text: 'Keep Existing (Skip L-Filter)', 
                                callback: () => {
                                    this.indexesToExcludeFromBatchUpdate = new Set(this._getState().quoteData.uiMetadata.lfModifiedRowIndexes);
                                    this._enterFCMode(false);
                                }
                            },
                            { type: 'button', text: 'Cancel', className: 'secondary', callback: () => {} }
                        ]
                    ]
                });
            } else {
                this._enterFCMode(false);
            }
        } else {
            this._exitAllK2Modes();
        }
    }

    _enterFCMode(isOverwriting) {
        if (isOverwriting) {
            const items = this._getItems();
            const { lfModifiedRowIndexes } = this._getState().quoteData.uiMetadata;
            const indexesToClear = [];
            const eligibleTypes = ['B2', 'B3', 'B4'];
            items.forEach((item, index) => {
                if (eligibleTypes.includes(item.fabricType) && lfModifiedRowIndexes.includes(index)) {
                    indexesToClear.push(index);
                }
            });
            if (indexesToClear.length > 0) {
                this.stateService.dispatch(quoteActions.removeLFModifiedRows(indexesToClear));
            }
        }
        this.stateService.dispatch(uiActions.setActiveEditMode('K2'));
        this._updatePanelInputsState(); 
        this.stateService.dispatch(uiActions.setActiveCell(null, null));
    }

    handlePanelInputBlur({ type, field, value }) {
        if (type === 'LF') {
            this._applyLFChanges();
        } else {
            this.stateService.dispatch(quoteActions.batchUpdatePropertyByType(type, field, value, this.indexesToExcludeFromBatchUpdate));
        }
    }

    handlePanelInputEnter() {
        const inputs = Array.from(document.querySelectorAll('.panel-input:not([disabled])'));
        const activeElement = document.activeElement;
        const currentIndex = inputs.indexOf(activeElement);
        const nextInput = inputs[currentIndex + 1];

        if (nextInput) {
            nextInput.focus();
            nextInput.select();
        } else {
            if (activeElement.dataset.type === 'LF' || (activeElement.dataset.type !== 'LF' && this._getState().ui.activeEditMode === 'K2')) {
                this._applyLFChanges();
            }
            this._exitAllK2Modes();
        }
    }

    handleSequenceCellClick({ rowIndex }) {
        const { activeEditMode } = this._getState().ui;

        if (activeEditMode === 'K2_LF_SELECT' || activeEditMode === 'K2_LF_DELETE_SELECT') {
            const item = this._getItems()[rowIndex];
            
            if (activeEditMode === 'K2_LF_DELETE_SELECT') {
                const { lfModifiedRowIndexes } = this._getState().quoteData.uiMetadata;
                if (!lfModifiedRowIndexes.includes(rowIndex)) {
                    this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: 'Only items with a Light-Filter setting (pink background) can be selected for deletion.', type: 'error' });
                    return;
                }
            }

            const eligibleTypes = ['B2', 'B3', 'B4'];
            if (activeEditMode === 'K2_LF_SELECT' && !eligibleTypes.includes(item.fabricType)) {
                this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: 'Only items with TYPE "B2", "B3", or "B4" can be selected.', type: 'error' });
                return;
            }
            this.stateService.dispatch(uiActions.toggleLFSelection(rowIndex));
            
            if (activeEditMode === 'K2_LF_SELECT') {
                this._updatePanelInputsState();
                const { lfSelectedRowIndexes } = this._getState().ui;
                if (lfSelectedRowIndexes.length > 0) {
                    setTimeout(() => {
                        const fnameInput = document.querySelector('input[data-type="LF"][data-field="fabric"]');
                        if (fnameInput) {
                            fnameInput.focus();
                            fnameInput.select();
                        }
                    }, 50);
                }
            }
        }
    }

    handleLFEditRequest() {
        const { activeEditMode } = this._getState().ui;
        
        if (activeEditMode === 'K2_LF_SELECT') {
            this._applyLFChanges();
            this._exitAllK2Modes();
        } else {
            this.stateService.dispatch(uiActions.setActiveEditMode('K2_LF_SELECT'));
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: 'Please select items with TYPE \'B2\', \'B3\', or \'B4\' to edit.' });
        }
    }

    handleLFDeleteRequest() {
        const { activeEditMode } = this._getState().ui;
        
        if (activeEditMode === 'K2_LF_DELETE_SELECT') {
            const { lfSelectedRowIndexes } = this._getState().ui;
            if (lfSelectedRowIndexes.length > 0) {
                this.stateService.dispatch(quoteActions.removeLFProperties(lfSelectedRowIndexes));
                this.stateService.dispatch(quoteActions.removeLFModifiedRows(lfSelectedRowIndexes));
                this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: 'Light-Filter settings have been cleared.' });
            }
            this._exitAllK2Modes();
        } else {
            this.stateService.dispatch(uiActions.setActiveEditMode('K2_LF_DELETE_SELECT'));
            this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: 'Please select the roller blinds for which you want to cancel the Light-Filter fabric setting. After selection, click the LF-Del button again.' });
        }
    }

    _exitAllK2Modes() {
        this.stateService.dispatch(uiActions.setActiveEditMode(null));
        this.stateService.dispatch(uiActions.clearMultiSelectSelection());
        this.stateService.dispatch(uiActions.clearLFSelection());
        
        this.indexesToExcludeFromBatchUpdate.clear();

        this._updatePanelInputsState();
    }

    _applyLFChanges() {
        const { lfSelectedRowIndexes } = this._getState().ui;
        if (lfSelectedRowIndexes.length === 0) return;

        const fNameInput = document.querySelector('input[data-type="LF"][data-field="fabric"]');
        const fColorInput = document.querySelector('input[data-type="LF"][data-field="color"]');
        
        if (fNameInput && fColorInput && fNameInput.value && fColorInput.value) {
            const fabricNameWithPrefix = `Light-filter ${fNameInput.value}`;
            this.stateService.dispatch(quoteActions.batchUpdateLFProperties(lfSelectedRowIndexes, fabricNameWithPrefix, fColorInput.value));
            this.stateService.dispatch(quoteActions.addLFModifiedRows(lfSelectedRowIndexes));
        }
    }

    _updatePanelInputsState() {
        const { ui, quoteData } = this._getState();
        const { activeEditMode, lfSelectedRowIndexes } = ui;
        const items = this._getItems();
        const { lfModifiedRowIndexes } = quoteData.uiMetadata;
        const presentTypes = new Set(items.map(item => item.fabricType).filter(Boolean));
        
        const allPanelInputs = document.querySelectorAll('.panel-input');
        let firstEnabledInput = null;
        
        if (activeEditMode === 'K2') {
            allPanelInputs.forEach(input => {
                const type = input.dataset.type;
                const field = input.dataset.field;

                if (type !== 'LF') {
                    const isEnabled = presentTypes.has(type);
                    input.disabled = !isEnabled;

                    if (isEnabled) {
                        if (!firstEnabledInput) {
                            firstEnabledInput = input;
                        }
                        const itemWithData = items.find((item, index) => 
                            item.fabricType === type && !this.indexesToExcludeFromBatchUpdate.has(index)
                        );
                        input.value = itemWithData ? itemWithData[field] : '';
                    } else {
                        input.value = '';
                    }
                } else {
                    input.disabled = true;
                }
            });

            if (firstEnabledInput) {
                setTimeout(() => {
                    firstEnabledInput.focus();
                    firstEnabledInput.select();
                }, 50);
            }
        } else if (activeEditMode === 'K2_LF_SELECT') {
            allPanelInputs.forEach(input => {
                const isLFRow = input.dataset.type === 'LF';
                const hasSelection = lfSelectedRowIndexes.length > 0;
                input.disabled = !(isLFRow && hasSelection);
            });
        } else {
             allPanelInputs.forEach(input => {
                input.disabled = true;
                input.value = '';
            });
        }
    }
    
    activate() {
        this.stateService.dispatch(uiActions.setVisibleColumns(['sequence', 'fabricTypeDisplay', 'fabric', 'color']));
    }
}