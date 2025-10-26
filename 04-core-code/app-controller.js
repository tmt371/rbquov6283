// File: 04-core-code/app-controller.js

import { EVENTS, STORAGE_KEYS } from './config/constants.js';
import * as uiActions from './actions/ui-actions.js';

const AUTOSAVE_INTERVAL_MS = 60000;

export class AppController {
    constructor({ eventAggregator, stateService, quickQuoteView, detailConfigView, workflowService }) {
        this.eventAggregator = eventAggregator;
        this.stateService = stateService; // Still needed for _getFullState and _handleAutoSave
        this.quickQuoteView = quickQuoteView;
        this.detailConfigView = detailConfigView;
        this.workflowService = workflowService;

        this.autoSaveTimerId = null;
        console.log("AppController (Refactored with grouped subscriptions) Initialized.");
        this.initialize();
    }

    initialize() {
        this._subscribeQuickQuoteEvents();
        this._subscribeDetailViewEvents();
        this._subscribeGlobalEvents();
        this._subscribeF1Events();
        this._subscribeF3Events();

        // This is the core of the reactive state update.
        // Any service that updates the state via StateService will trigger this,
        // which in turn re-renders the UI.
        this.eventAggregator.subscribe(EVENTS.INTERNAL_STATE_UPDATED, (newState) => {
            this.eventAggregator.publish(EVENTS.STATE_CHANGED, newState);
        });

        this._startAutoSave();
    }

    _subscribeQuickQuoteEvents() {
        const delegate = (handlerName, ...args) => this.quickQuoteView[handlerName](...args);

        this.eventAggregator.subscribe(EVENTS.NUMERIC_KEY_PRESSED, (data) => delegate('handleNumericKeyPress', data));
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_INSERT_ROW, () => delegate('handleInsertRow'));
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_DELETE_ROW, () => delegate('handleDeleteRow'));
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_SAVE, () => delegate('handleSaveToFile'));
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_EXPORT_CSV, () => delegate('handleExportCSV'));
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_RESET, () => delegate('handleReset'));
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_CLEAR_ROW, () => delegate('handleClearRow'));
        this.eventAggregator.subscribe(EVENTS.USER_MOVED_ACTIVE_CELL, (data) => delegate('handleMoveActiveCell', data));
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_CYCLE_TYPE, () => delegate('handleCycleType'));
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_CALCULATE_AND_SUM, () => delegate('handleCalculateAndSum'));
        this.eventAggregator.subscribe(EVENTS.USER_TOGGLED_MULTI_SELECT_MODE, () => delegate('handleToggleMultiSelectMode'));
        this.eventAggregator.subscribe(EVENTS.USER_CHOSE_SAVE_THEN_LOAD, () => delegate('handleSaveThenLoad'));
        this.eventAggregator.subscribe(EVENTS.TYPE_CELL_LONG_PRESSED, (data) => delegate('handleTypeCellLongPress', data));
        this.eventAggregator.subscribe(EVENTS.TYPE_BUTTON_LONG_PRESSED, (data) => delegate('handleTypeButtonLongPress', data));
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_MULTI_TYPE_SET, () => delegate('handleMultiTypeSet'));
    }

    _subscribeDetailViewEvents() {
        const delegate = (handlerName, data) => {
            const { ui } = this.stateService.getState();
            if (ui.currentView === 'DETAIL_CONFIG') {
                this.detailConfigView[handlerName](data);
            }
        };

        this.eventAggregator.subscribe(EVENTS.TABLE_CELL_CLICKED, (data) => {
            const { ui } = this.stateService.getState();
            if (ui.currentView === 'QUICK_QUOTE') {
                this.quickQuoteView.handleTableCellClick(data);
            } else {
                this.detailConfigView.handleTableCellClick(data);
            }
        });
        this.eventAggregator.subscribe(EVENTS.SEQUENCE_CELL_CLICKED, (data) => {
            const { ui } = this.stateService.getState();
            if (ui.currentView === 'QUICK_QUOTE') {
                this.quickQuoteView.handleSequenceCellClick(data);
            } else {
                this.detailConfigView.handleSequenceCellClick(data);
            }
        });

        // Detail Config View Specific Events
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_FOCUS_MODE, (data) => delegate('handleFocusModeRequest', data));
        this.eventAggregator.subscribe(EVENTS.PANEL_INPUT_ENTER_PRESSED, (data) => delegate('handlePanelInputEnter', data));
        this.eventAggregator.subscribe(EVENTS.PANEL_INPUT_BLURRED, (data) => delegate('handlePanelInputBlur', data));
        this.eventAggregator.subscribe(EVENTS.LOCATION_INPUT_ENTER_PRESSED, (data) => delegate('handleLocationInputEnter', data));
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_LF_EDIT_MODE, () => delegate('handleLFEditRequest'));
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_LF_DELETE_MODE, () => delegate('handleLFDeleteRequest'));
        this.eventAggregator.subscribe(EVENTS.USER_TOGGLED_K3_EDIT_MODE, () => delegate('handleToggleK3EditMode'));
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_BATCH_CYCLE, (data) => delegate('handleBatchCycle', data));

        this.eventAggregator.subscribe(EVENTS.DUAL_CHAIN_MODE_CHANGED, (data) => delegate('handleDualChainModeChange', data));
        this.eventAggregator.subscribe(EVENTS.CHAIN_ENTER_PRESSED, (data) => delegate('handleChainEnterPressed', data));
        this.eventAggregator.subscribe(EVENTS.DRIVE_MODE_CHANGED, (data) => delegate('handleDriveModeChange', data));
        this.eventAggregator.subscribe(EVENTS.ACCESSORY_COUNTER_CHANGED, (data) => delegate('handleAccessoryCounterChange', data));
    }

    _subscribeGlobalEvents() {
        this.eventAggregator.subscribe(EVENTS.USER_NAVIGATED_TO_DETAIL_VIEW, () => this.workflowService.handleNavigationToDetailView());
        this.eventAggregator.subscribe(EVENTS.USER_NAVIGATED_TO_QUICK_QUOTE_VIEW, () => this.workflowService.handleNavigationToQuickQuoteView());
        this.eventAggregator.subscribe(EVENTS.USER_SWITCHED_TAB, (data) => this.workflowService.handleTabSwitch(data));
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_LOAD, () => this.workflowService.handleUserRequestedLoad());
        this.eventAggregator.subscribe(EVENTS.USER_CHOSE_LOAD_DIRECTLY, () => this.workflowService.handleLoadDirectly());
        this.eventAggregator.subscribe(EVENTS.FILE_LOADED, (data) => this.workflowService.handleFileLoad(data));
    }

    _subscribeF1Events() {
        this.eventAggregator.subscribe(EVENTS.F1_TAB_ACTIVATED, () => this.workflowService.handleF1TabActivation());
        this.eventAggregator.subscribe(EVENTS.F1_DISCOUNT_CHANGED, (data) => this.workflowService.handleF1DiscountChange(data));
    }

    _subscribeF3Events() {
        this.eventAggregator.subscribe(EVENTS.USER_REQUESTED_PRINTABLE_QUOTE, () => this.workflowService.handlePrintableQuoteRequest());
    }

    // This is a special method used by AppContext to publish state, it needs access to stateService.
    _getFullState() {
        return this.stateService.getState();
    }

    publishInitialState() {
        const initialState = this._getFullState();
        this.eventAggregator.publish(EVENTS.STATE_CHANGED, initialState);

        // [NEW] Sync inputValue with the active cell's data after initial load/restore.
        const { ui, quoteData } = initialState;
        const { activeCell } = ui;
        const currentProductKey = quoteData.currentProduct;
        const items = quoteData.products[currentProductKey].items;

        if (activeCell && items[activeCell.rowIndex]) {
            const item = items[activeCell.rowIndex];
            const value = item[activeCell.column] || '';
            // Dispatch an action to update the inputValue in the UI state
            this.stateService.dispatch(uiActions.setInputValue(value));
        }
    }

    _startAutoSave() {
        if (this.autoSaveTimerId) { clearInterval(this.autoSaveTimerId); }
        this.autoSaveTimerId = setInterval(() => this._handleAutoSave(), AUTOSAVE_INTERVAL_MS);
    }

    _handleAutoSave() {
        try {
            const { quoteData } = this.stateService.getState();
            const items = quoteData.products[quoteData.currentProduct].items;
            if (!items) return;
            const hasContent = items.length > 1 || (items.length === 1 && (items[0].width || items[0].height));
            if (hasContent) {
                const dataToSave = JSON.stringify(quoteData);
                localStorage.setItem(STORAGE_KEYS.AUTOSAVE, dataToSave);
            }
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }
}