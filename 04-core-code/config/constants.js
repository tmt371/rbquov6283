// File: 04-core-code/config/constants.js

/**
 * @fileoverview Centralized constants for the application.
 * This file eliminates "magic strings" and provides a single source of truth
 * for event names, DOM IDs, storage keys, etc.
 */

export const EVENTS = {
    // --- App Lifecycle & Global ---
    APP_READY: 'appReady',
    STATE_CHANGED: 'stateChanged',
    INTERNAL_STATE_UPDATED: '_internalStateUpdated',
    OPERATION_SUCCESSFUL_AUTO_HIDE_PANEL: 'operationSuccessfulAutoHidePanel',

    // --- UI Notifications & Dialogs ---
    SHOW_NOTIFICATION: 'showNotification',
    SHOW_LOAD_CONFIRMATION_DIALOG: 'showLoadConfirmationDialog',
    SHOW_CONFIRMATION_DIALOG: 'showConfirmationDialog',
    FOCUS_ELEMENT: 'focusElement',

    // --- [NEW] Quote Preview Workflow ---
    USER_REQUESTED_PRINTABLE_QUOTE: 'userRequestedPrintableQuote',
    SHOW_QUOTE_PREVIEW: 'showQuotePreview',

    // --- User Actions: Quick Quote View ---
    NUMERIC_KEY_PRESSED: 'numericKeyPressed',
    USER_REQUESTED_INSERT_ROW: 'userRequestedInsertRow',
    USER_REQUESTED_DELETE_ROW: 'userRequestedDeleteRow',
    USER_REQUESTED_CLEAR_ROW: 'userRequestedClearRow',
    USER_MOVED_ACTIVE_CELL: 'userMovedActiveCell',
    USER_REQUESTED_CYCLE_TYPE: 'userRequestedCycleType',
    USER_REQUESTED_CALCULATE_AND_SUM: 'userRequestedCalculateAndSum',
    USER_TOGGLED_MULTI_SELECT_MODE: 'userToggledMultiSelectMode',
    USER_REQUESTED_MULTI_TYPE_SET: 'userRequestedMultiTypeSet',
    TYPE_CELL_LONG_PRESSED: 'typeCellLongPressed',
    TYPE_BUTTON_LONG_PRESSED: 'typeButtonLongPressed',

    // --- User Actions: Detail View ---
    USER_REQUESTED_FOCUS_MODE: 'userRequestedFocusMode',
    PANEL_INPUT_ENTER_PRESSED: 'panelInputEnterPressed',
    PANEL_INPUT_BLURRED: 'panelInputBlurred',
    LOCATION_INPUT_ENTER_PRESSED: 'locationInputEnterPressed',
    USER_REQUESTED_LF_EDIT_MODE: 'userRequestedLFEditMode',
    USER_REQUESTED_LF_DELETE_MODE: 'userRequestedLFDeleteMode',
    USER_TOGGLED_K3_EDIT_MODE: 'userToggledK3EditMode',
    USER_REQUESTED_BATCH_CYCLE: 'userRequestedBatchCycle',
    DUAL_CHAIN_MODE_CHANGED: 'dualChainModeChanged',
    CHAIN_ENTER_PRESSED: 'chainEnterPressed',
    DRIVE_MODE_CHANGED: 'driveModeChanged',
    ACCESSORY_COUNTER_CHANGED: 'accessoryCounterChanged',

    // --- User Actions: Panels & Navigation ---
    USER_TOGGLED_NUMERIC_KEYBOARD: 'userToggledNumericKeyboard',
    USER_NAVIGATED_TO_DETAIL_VIEW: 'userNavigatedToDetailView',
    USER_NAVIGATED_TO_QUICK_QUOTE_VIEW: 'userNavigatedToQuickQuoteView',
    USER_SWITCHED_TAB: 'userSwitchedTab',

    // --- User Actions: File Operations ---
    USER_REQUESTED_SAVE: 'userRequestedSave',
    USER_REQUESTED_EXPORT_CSV: 'userRequestedExportCSV',
    USER_REQUESTED_RESET: 'userRequestedReset',
    USER_REQUESTED_LOAD: 'userRequestedLoad',
    USER_CHOSE_SAVE_THEN_LOAD: 'userChoseSaveThenLoad',
    USER_CHOSE_LOAD_DIRECTLY: 'userChoseLoadDirectly',
    TRIGGER_FILE_LOAD: 'triggerFileLoad',
    FILE_LOADED: 'fileLoaded',

    // --- User Actions: F1/F2 Panels ---
    F1_TAB_ACTIVATED: 'f1TabActivated',
    F1_DISCOUNT_CHANGED: 'f1DiscountChanged',
    USER_REQUESTED_REMOTE_DISTRIBUTION: 'userRequestedRemoteDistribution',
    USER_REQUESTED_DUAL_DISTRIBUTION: 'userRequestedDualDistribution',
    F2_TAB_ACTIVATED: 'f2TabActivated',
    F2_VALUE_CHANGED: 'f2ValueChanged',
    F2_INPUT_ENTER_PRESSED: 'f2InputEnterPressed',
    TOGGLE_FEE_EXCLUSION: 'toggleFeeExclusion',

    // --- Cell/Row Interactions ---
    TABLE_CELL_CLICKED: 'tableCellClicked',
    SEQUENCE_CELL_CLICKED: 'sequenceCellClicked',
    FOCUS_CELL: 'focusCell',
};

export const DOM_IDS = {
    // --- App & Core Containers ---
    APP: 'app',
    RESULTS_TABLE: 'results-table',
    NUMERIC_KEYBOARD_PANEL: 'numeric-keyboard-panel',
    FUNCTION_PANEL: 'function-panel',
    LEFT_PANEL: 'left-panel',
    TOAST_CONTAINER: 'toast-container',
    CONFIRMATION_DIALOG_OVERLAY: 'confirmation-dialog-overlay',
    FILE_LOADER: 'file-loader',
    QUOTE_PREVIEW_OVERLAY: 'quote-preview-overlay', // [NEW]

    // --- Numeric Keyboard & Top Controls ---
    NUMERIC_KEYBOARD: 'numeric-keyboard',
    PANEL_TOGGLE: 'panel-toggle',
    KEY_M_SET: 'key-m-set',
    TOTAL_SUM_VALUE: 'total-sum-value',
    KEY_INS_GRID: 'key-ins-grid',

    // --- Left Panel & Tabs ---
    LEFT_PANEL_TOGGLE: 'left-panel-toggle',
    LOCATION_INPUT_BOX: 'location-input-box',
    FABRIC_BATCH_TABLE: 'fabric-batch-table',

    // --- Right Panel & Tabs ---
    FUNCTION_PANEL_TOGGLE: 'function-panel-toggle',

    // --- F1 Panel Elements ---
    F1_QTY_WINDER: 'f1-qty-winder',
    F1_PRICE_WINDER: 'f1-price-winder',
    F1_QTY_MOTOR: 'f1-qty-motor',
    F1_PRICE_MOTOR: 'f1-price-motor',
    F1_QTY_REMOTE_1CH: 'f1-qty-remote-1ch',
    F1_PRICE_REMOTE_1CH: 'f1-price-remote-1ch',
    F1_QTY_REMOTE_16CH: 'f1-qty-remote-16ch',
    F1_PRICE_REMOTE_16CH: 'f1-price-remote-16ch',
    F1_QTY_CHARGER: 'f1-qty-charger',
    F1_PRICE_CHARGER: 'f1-price-charger',
    F1_QTY_3M_CORD: 'f1-qty-3m-cord',
    F1_PRICE_3M_CORD: 'f1-price-3m-cord',
    F1_QTY_DUAL_COMBO: 'f1-qty-dual-combo',
    F1_PRICE_DUAL_COMBO: 'f1-price-dual-combo',
    F1_QTY_SLIM: 'f1-qty-slim',
    F1_PRICE_SLIM: 'f1-price-slim',
    F1_PRICE_TOTAL: 'f1-price-total',
    F1_RB_RETAIL: 'f1-rb-retail',
    F1_RB_DISCOUNT_INPUT: 'f1-rb-discount-input',
    F1_RB_PRICE: 'f1-rb-price',
    F1_SUB_TOTAL: 'f1-sub-total',
    F1_GST: 'f1-gst',
    F1_FINAL_TOTAL: 'f1-final-total',

    // --- F3 Panel Elements ---
    BTN_ADD_QUOTE: 'btn-add-quote', // [NEW]

    // --- Dialog-specific Elements ---
    DIALOG_INPUT_1CH: 'dialog-input-1ch',
    DIALOG_INPUT_16CH: 'dialog-input-16ch',
    DIALOG_INPUT_COMBO: 'dialog-input-combo',
    DIALOG_INPUT_SLIM: 'dialog-input-slim',
};

export const STORAGE_KEYS = {
    AUTOSAVE: 'quoteAutoSaveData',
};