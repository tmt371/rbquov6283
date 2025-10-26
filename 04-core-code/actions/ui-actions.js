// File: 04-core-code/actions/ui-actions.js

/**
 * @fileoverview Action creators for all UI-related state changes.
 */

import { UI_ACTION_TYPES } from '../config/action-types.js';

// --- View & Navigation ---
export const setCurrentView = (viewName) => ({
    type: UI_ACTION_TYPES.SET_CURRENT_VIEW,
    payload: { viewName },
});

export const setVisibleColumns = (columns) => ({
    type: UI_ACTION_TYPES.SET_VISIBLE_COLUMNS,
    payload: { columns },
});

export const setActiveTab = (tabId) => ({
    type: UI_ACTION_TYPES.SET_ACTIVE_TAB,
    payload: { tabId },
});

// --- Input & Selection ---
export const setActiveCell = (rowIndex, column) => ({
    type: UI_ACTION_TYPES.SET_ACTIVE_CELL,
    payload: { rowIndex, column },
});

export const setInputValue = (value) => ({
    type: UI_ACTION_TYPES.SET_INPUT_VALUE,
    payload: { value },
});

export const appendInputValue = (key) => ({
    type: UI_ACTION_TYPES.APPEND_INPUT_VALUE,
    payload: { key },
});

export const deleteLastInputChar = () => ({
    type: UI_ACTION_TYPES.DELETE_LAST_INPUT_CHAR,
});

export const clearInputValue = () => ({
    type: UI_ACTION_TYPES.CLEAR_INPUT_VALUE,
});

export const toggleMultiSelectMode = () => ({
    type: UI_ACTION_TYPES.TOGGLE_MULTI_SELECT_MODE,
});

export const toggleMultiSelectSelection = (rowIndex) => ({
    type: UI_ACTION_TYPES.TOGGLE_MULTI_SELECT_SELECTION,
    payload: { rowIndex },
});

export const clearMultiSelectSelection = () => ({
    type: UI_ACTION_TYPES.CLEAR_MULTI_SELECT_SELECTION,
});


// --- Left Panel Edit Modes ---
export const setActiveEditMode = (mode) => ({
    type: UI_ACTION_TYPES.SET_ACTIVE_EDIT_MODE,
    payload: { mode },
});

export const setTargetCell = (cell) => ({
    type: UI_ACTION_TYPES.SET_TARGET_CELL,
    payload: { cell },
});

export const setLocationInputValue = (value) => ({
    type: UI_ACTION_TYPES.SET_LOCATION_INPUT_VALUE,
    payload: { value },
});

// --- K2 (Fabric/LF) State ---
export const toggleLFSelection = (rowIndex) => ({
    type: UI_ACTION_TYPES.TOGGLE_LF_SELECTION,
    payload: { rowIndex },
});

export const clearLFSelection = () => ({
    type: UI_ACTION_TYPES.CLEAR_LF_SELECTION,
});

// --- K4 & K5 State ---
export const setDualChainMode = (mode) => ({
    type: UI_ACTION_TYPES.SET_DUAL_CHAIN_MODE,
    payload: { mode },
});

export const setDriveAccessoryMode = (mode) => ({
    type: UI_ACTION_TYPES.SET_DRIVE_ACCESSORY_MODE,
    payload: { mode },
});

export const setDriveAccessoryCount = (accessory, count) => ({
    type: UI_ACTION_TYPES.SET_DRIVE_ACCESSORY_COUNT,
    payload: { accessory, count },
});

export const setDriveAccessoryTotalPrice = (accessory, price) => ({
    type: UI_ACTION_TYPES.SET_DRIVE_ACCESSORY_TOTAL_PRICE,
    payload: { accessory, price },
});

export const setDriveGrandTotal = (price) => ({
    type: UI_ACTION_TYPES.SET_DRIVE_GRAND_TOTAL,
    payload: { price },
});

// --- [FIX] Add new action creators for K5 view ---
export const setDualPrice = (price) => ({
    type: UI_ACTION_TYPES.SET_DUAL_PRICE,
    payload: { price },
});

export const clearDualChainInputValue = () => ({
    type: UI_ACTION_TYPES.CLEAR_DUAL_CHAIN_INPUT_VALUE,
});

export const setSummaryWinderPrice = (price) => ({
    type: UI_ACTION_TYPES.SET_SUMMARY_WINDER_PRICE,
    payload: { price },
});

export const setSummaryMotorPrice = (price) => ({
    type: UI_ACTION_TYPES.SET_SUMMARY_MOTOR_PRICE,
    payload: { price },
});

export const setSummaryRemotePrice = (price) => ({
    type: UI_ACTION_TYPES.SET_SUMMARY_REMOTE_PRICE,
    payload: { price },
});

export const setSummaryChargerPrice = (price) => ({
    type: UI_ACTION_TYPES.SET_SUMMARY_CHARGER_PRICE,
    payload: { price },
});

export const setSummaryCordPrice = (price) => ({
    type: UI_ACTION_TYPES.SET_SUMMARY_CORD_PRICE,
    payload: { price },
});

export const setSummaryAccessoriesTotal = (price) => ({
    type: UI_ACTION_TYPES.SET_SUMMARY_ACCESSORIES_TOTAL,
    payload: { price },
});


// --- F1/F2 State ---
export const setF1RemoteDistribution = (qty1, qty16) => ({
    type: UI_ACTION_TYPES.SET_F1_REMOTE_DISTRIBUTION,
    payload: { qty1, qty16 },
});

export const setF1DualDistribution = (comboQty, slimQty) => ({
    type: UI_ACTION_TYPES.SET_F1_DUAL_DISTRIBUTION,
    payload: { comboQty, slimQty },
});

export const setF1DiscountPercentage = (percentage) => ({
    type: UI_ACTION_TYPES.SET_F1_DISCOUNT_PERCENTAGE,
    payload: { percentage },
});

export const setF2Value = (key, value) => ({
    type: UI_ACTION_TYPES.SET_F2_VALUE,
    payload: { key, value },
});

export const toggleF2FeeExclusion = (feeType) => ({
    type: UI_ACTION_TYPES.TOGGLE_F2_FEE_EXCLUSION,
    payload: { feeType },
});

// --- Global UI State ---
export const setSumOutdated = (isOutdated) => ({
    type: UI_ACTION_TYPES.SET_SUM_OUTDATED,
    payload: { isOutdated },
});

export const resetUi = () => ({
    type: UI_ACTION_TYPES.RESET_UI,
});