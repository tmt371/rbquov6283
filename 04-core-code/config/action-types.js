// File: 04-core-code/config/action-types.js

/**
 * @fileoverview Defines all action types for the strict state management pattern.
 * This centralizes the "vocabulary" of possible state changes.
 */

export const UI_ACTION_TYPES = {
    // View & Navigation
    SET_CURRENT_VIEW: 'ui/setCurrentView',
    SET_VISIBLE_COLUMNS: 'ui/setVisibleColumns',
    SET_ACTIVE_TAB: 'ui/setActiveTab',
    
    // Input & Selection
    SET_ACTIVE_CELL: 'ui/setActiveCell',
    SET_INPUT_VALUE: 'ui/setInputValue',
    APPEND_INPUT_VALUE: 'ui/appendInputValue',
    DELETE_LAST_INPUT_CHAR: 'ui/deleteLastInputChar',
    CLEAR_INPUT_VALUE: 'ui/clearInputValue',
    TOGGLE_MULTI_SELECT_MODE: 'ui/toggleMultiSelectMode',
    TOGGLE_MULTI_SELECT_SELECTION: 'ui/toggleMultiSelectSelection',
    CLEAR_MULTI_SELECT_SELECTION: 'ui/clearMultiSelectSelection',

    // Left Panel Edit Modes
    SET_ACTIVE_EDIT_MODE: 'ui/setActiveEditMode',
    SET_TARGET_CELL: 'ui/setTargetCell',
    SET_LOCATION_INPUT_VALUE: 'ui/setLocationInputValue',

    // K2 (Fabric/LF) State
    TOGGLE_LF_SELECTION: 'ui/toggleLFSelection',
    CLEAR_LF_SELECTION: 'ui/clearLFSelection',

    // K4 (Drive/Accessories) & K5 (Dual/Chain) State
    SET_DUAL_CHAIN_MODE: 'ui/setDualChainMode',
    SET_DRIVE_ACCESSORY_MODE: 'ui/setDriveAccessoryMode',
    SET_DRIVE_ACCESSORY_COUNT: 'ui/setDriveAccessoryCount',
    SET_DRIVE_ACCESSORY_TOTAL_PRICE: 'ui/setDriveAccessoryTotalPrice',
    SET_DRIVE_GRAND_TOTAL: 'ui/setDriveGrandTotal',
    
    // --- [FIX] Add new action types for K5 view ---
    SET_DUAL_PRICE: 'ui/setDualPrice',
    CLEAR_DUAL_CHAIN_INPUT_VALUE: 'ui/clearDualChainInputValue',
    SET_SUMMARY_WINDER_PRICE: 'ui/setSummaryWinderPrice',
    SET_SUMMARY_MOTOR_PRICE: 'ui/setSummaryMotorPrice',
    SET_SUMMARY_REMOTE_PRICE: 'ui/setSummaryRemotePrice',
    SET_SUMMARY_CHARGER_PRICE: 'ui/setSummaryChargerPrice',
    SET_SUMMARY_CORD_PRICE: 'ui/setSummaryCordPrice',
    SET_SUMMARY_ACCESSORIES_TOTAL: 'ui/setSummaryAccessoriesTotal',
    
    // F1 Financial Overview State
    SET_F1_REMOTE_DISTRIBUTION: 'ui/setF1RemoteDistribution',
    SET_F1_DUAL_DISTRIBUTION: 'ui/setF1DualDistribution',
    SET_F1_DISCOUNT_PERCENTAGE: 'ui/setF1DiscountPercentage',

    // F2 Financial Summary State
    SET_F2_VALUE: 'ui/setF2Value',
    TOGGLE_F2_FEE_EXCLUSION: 'ui/toggleF2FeeExclusion',

    // Global UI State
    SET_SUM_OUTDATED: 'ui/setSumOutdated',
    RESET_UI: 'ui/reset',
};

export const QUOTE_ACTION_TYPES = {
    // Quote Data Root
    SET_QUOTE_DATA: 'quote/setQuoteData',
    RESET_QUOTE_DATA: 'quote/resetQuoteData',

    // Item Array Operations
    INSERT_ROW: 'quote/insertRow',
    DELETE_ROW: 'quote/deleteRow',
    CLEAR_ROW: 'quote/clearRow',
    DELETE_MULTIPLE_ROWS: 'quote/deleteMultipleRows',

    // Individual Item Properties
    UPDATE_ITEM_VALUE: 'quote/updateItemValue',
    UPDATE_ITEM_PROPERTY: 'quote/updateItemProperty',
    UPDATE_WINDER_MOTOR_PROPERTY: 'quote/updateWinderMotorProperty',
    CYCLE_K3_PROPERTY: 'quote/cycleK3Property',
    CYCLE_ITEM_TYPE: 'quote/cycleItemType',
    SET_ITEM_TYPE: 'quote/setItemType',

    // Batch Item Updates
    BATCH_UPDATE_PROPERTY: 'quote/batchUpdateProperty',
    BATCH_UPDATE_PROPERTY_BY_TYPE: 'quote/batchUpdatePropertyByType',
    BATCH_UPDATE_FABRIC_TYPE: 'quote/batchUpdateFabricType',
    BATCH_UPDATE_FABRIC_TYPE_FOR_SELECTION: 'quote/batchUpdateFabricTypeForSelection',
    BATCH_UPDATE_LF_PROPERTIES: 'quote/batchUpdateLFProperties',
    REMOVE_LF_PROPERTIES: 'quote/removeLFProperties',
    
    // Summary & Metadata
    UPDATE_ACCESSORY_SUMMARY: 'quote/updateAccessorySummary',
    ADD_LF_MODIFIED_ROWS: 'quote/addLFModifiedRows',
    REMOVE_LF_MODIFIED_ROWS: 'quote/removeLFModifiedRows',
};