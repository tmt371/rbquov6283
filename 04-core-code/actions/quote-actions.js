// File: 04-core-code/actions/quote-actions.js

/**
 * @fileoverview Action creators for all quoteData-related state changes.
 */

import { QUOTE_ACTION_TYPES } from '../config/action-types.js';

// --- Quote Data Root ---
export const setQuoteData = (newQuoteData) => ({
    type: QUOTE_ACTION_TYPES.SET_QUOTE_DATA,
    payload: { newQuoteData },
});

export const resetQuoteData = () => ({
    type: QUOTE_ACTION_TYPES.RESET_QUOTE_DATA,
});

// --- Item Array Operations ---
export const insertRow = (selectedIndex) => ({
    type: QUOTE_ACTION_TYPES.INSERT_ROW,
    payload: { selectedIndex },
});

export const deleteRow = (selectedIndex) => ({
    type: QUOTE_ACTION_TYPES.DELETE_ROW,
    payload: { selectedIndex },
});

export const clearRow = (selectedIndex) => ({
    type: QUOTE_ACTION_TYPES.CLEAR_ROW,
    payload: { selectedIndex },
});

export const deleteMultipleRows = (indexesToDelete) => ({
    type: QUOTE_ACTION_TYPES.DELETE_MULTIPLE_ROWS,
    payload: { indexesToDelete },
});

// --- Individual Item Properties ---
export const updateItemValue = (rowIndex, column, value) => ({
    type: QUOTE_ACTION_TYPES.UPDATE_ITEM_VALUE,
    payload: { rowIndex, column, value },
});

export const updateItemProperty = (rowIndex, property, value) => ({
    type: QUOTE_ACTION_TYPES.UPDATE_ITEM_PROPERTY,
    payload: { rowIndex, property, value },
});

export const updateWinderMotorProperty = (rowIndex, property, value) => ({
    type: QUOTE_ACTION_TYPES.UPDATE_WINDER_MOTOR_PROPERTY,
    payload: { rowIndex, property, value },
});

export const cycleK3Property = (rowIndex, column) => ({
    type: QUOTE_ACTION_TYPES.CYCLE_K3_PROPERTY,
    payload: { rowIndex, column },
});

// [FIX] Add missing action creator
export const cycleItemType = (rowIndex) => ({
    type: QUOTE_ACTION_TYPES.CYCLE_ITEM_TYPE,
    payload: { rowIndex },
});

export const setItemType = (rowIndex, newType) => ({
    type: QUOTE_ACTION_TYPES.SET_ITEM_TYPE,
    payload: { rowIndex, newType },
});

// --- Batch Item Updates ---
export const batchUpdateProperty = (property, value) => ({
    type: QUOTE_ACTION_TYPES.BATCH_UPDATE_PROPERTY,
    payload: { property, value },
});

export const batchUpdatePropertyByType = (type, property, value, indexesToExclude) => ({
    type: QUOTE_ACTION_TYPES.BATCH_UPDATE_PROPERTY_BY_TYPE,
    payload: { type, property, value, indexesToExclude },
});

export const batchUpdateFabricType = (newType) => ({
    type: QUOTE_ACTION_TYPES.BATCH_UPDATE_FABRIC_TYPE,
    payload: { newType },
});

export const batchUpdateFabricTypeForSelection = (selectedIndexes, newType) => ({
    type: QUOTE_ACTION_TYPES.BATCH_UPDATE_FABRIC_TYPE_FOR_SELECTION,
    payload: { selectedIndexes, newType },
});

export const batchUpdateLFProperties = (rowIndexes, fabricName, fabricColor) => ({
    type: QUOTE_ACTION_TYPES.BATCH_UPDATE_LF_PROPERTIES,
    payload: { rowIndexes, fabricName, fabricColor },
});

export const removeLFProperties = (rowIndexes) => ({
    type: QUOTE_ACTION_TYPES.REMOVE_LF_PROPERTIES,
    payload: { rowIndexes },
});

// --- Summary & Metadata ---
export const updateAccessorySummary = (data) => ({
    type: QUOTE_ACTION_TYPES.UPDATE_ACCESSORY_SUMMARY,
    payload: { data },
});

export const addLFModifiedRows = (rowIndexes) => ({
    type: QUOTE_ACTION_TYPES.ADD_LF_MODIFIED_ROWS,
    payload: { rowIndexes },
});

export const removeLFModifiedRows = (rowIndexes) => ({
    type: QUOTE_ACTION_TYPES.REMOVE_LF_MODIFIED_ROWS,
    payload: { rowIndexes },
});