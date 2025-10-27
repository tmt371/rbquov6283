// File: 04-core-code/reducers/ui-reducer.js
import { UI_ACTION_TYPES } from '../config/action-types.js';
import { initialState } from '../config/initial-state.js';

export function uiReducer(state, action) {
    switch (action.type) {
        case UI_ACTION_TYPES.SET_CURRENT_VIEW:
            return { ...state, currentView: action.payload.viewName };
        case UI_ACTION_TYPES.SET_VISIBLE_COLUMNS:
            return { ...state, visibleColumns: action.payload.columns };
        case UI_ACTION_TYPES.SET_ACTIVE_TAB:
            return { ...state, activeTabId: action.payload.tabId };
        case UI_ACTION_TYPES.SET_ACTIVE_CELL:
            return { ...state, activeCell: action.payload, inputMode: action.payload.column };
        case UI_ACTION_TYPES.SET_INPUT_VALUE:
            return { ...state, inputValue: String(action.payload.value || '') };
        case UI_ACTION_TYPES.APPEND_INPUT_VALUE:
            return { ...state, inputValue: state.inputValue + action.payload.key };
        case UI_ACTION_TYPES.DELETE_LAST_INPUT_CHAR:
            return { ...state, inputValue: state.inputValue.slice(0, -1) };
        case UI_ACTION_TYPES.CLEAR_INPUT_VALUE:
            return { ...state, inputValue: '' };
        case UI_ACTION_TYPES.TOGGLE_MULTI_SELECT_MODE: {
            const isEnteringMode = !state.isMultiSelectMode;
            const newSelectedIndexes = isEnteringMode && state.selectedRowIndex !== null ? [state.selectedRowIndex] : [];
            return { ...state, isMultiSelectMode: isEnteringMode, multiSelectSelectedIndexes: newSelectedIndexes, selectedRowIndex: null };
        }
        case UI_ACTION_TYPES.TOGGLE_MULTI_SELECT_SELECTION: {
            const selectedIndexes = new Set(state.multiSelectSelectedIndexes);
            if (selectedIndexes.has(action.payload.rowIndex)) {
                selectedIndexes.delete(action.payload.rowIndex);
            } else {
                selectedIndexes.add(action.payload.rowIndex);
            }
            return { ...state, multiSelectSelectedIndexes: Array.from(selectedIndexes) };
        }
        case UI_ACTION_TYPES.CLEAR_MULTI_SELECT_SELECTION:
            return { ...state, multiSelectSelectedIndexes: [] };
        case UI_ACTION_TYPES.SET_ACTIVE_EDIT_MODE:
            return { ...state, activeEditMode: action.payload.mode };
        case UI_ACTION_TYPES.SET_TARGET_CELL:
            return { ...state, targetCell: action.payload.cell };
        case UI_ACTION_TYPES.SET_LOCATION_INPUT_VALUE:
            return { ...state, locationInputValue: action.payload.value };
        case UI_ACTION_TYPES.TOGGLE_LF_SELECTION: {
            const selectedIndexes = new Set(state.lfSelectedRowIndexes);
            if (selectedIndexes.has(action.payload.rowIndex)) {
                selectedIndexes.delete(action.payload.rowIndex);
            } else {
                selectedIndexes.add(action.payload.rowIndex);
            }
            return { ...state, lfSelectedRowIndexes: Array.from(selectedIndexes) };
        }
        case UI_ACTION_TYPES.CLEAR_LF_SELECTION:
            return { ...state, lfSelectedRowIndexes: [] };
        case UI_ACTION_TYPES.SET_DUAL_CHAIN_MODE:
            return { ...state, dualChainMode: action.payload.mode };
        case UI_ACTION_TYPES.SET_DRIVE_ACCESSORY_MODE:
            return { ...state, driveAccessoryMode: action.payload.mode };
        case UI_ACTION_TYPES.SET_DRIVE_ACCESSORY_COUNT: {
            const { accessory, count } = action.payload;
            const newUi = { ...state };
            if (count >= 0) {
                switch (accessory) {
                    case 'remote': newUi.driveRemoteCount = count; break;
                    case 'charger': newUi.driveChargerCount = count; break;
                    case 'cord': newUi.driveCordCount = count; break;
                }
            }
            return newUi;
        }
        case UI_ACTION_TYPES.SET_DRIVE_ACCESSORY_TOTAL_PRICE: {
            const { accessory, price } = action.payload;
            const newUi = { ...state };
            switch(accessory) {
                case 'winder': newUi.driveWinderTotalPrice = price; break;
                case 'motor': newUi.driveMotorTotalPrice = price; break;
                case 'remote': newUi.driveRemoteTotalPrice = price; break;
                case 'charger': newUi.driveChargerTotalPrice = price; break;
                case 'cord': newUi.driveCordTotalPrice = price; break;
            }
            return newUi;
        }
        case UI_ACTION_TYPES.SET_DRIVE_GRAND_TOTAL:
            return { ...state, driveGrandTotal: action.payload.price };
        case UI_ACTION_TYPES.SET_DUAL_PRICE:
            return { ...state, dualPrice: action.payload.price };
        case UI_ACTION_TYPES.CLEAR_DUAL_CHAIN_INPUT_VALUE:
            return { ...state, dualChainInputValue: '' };
        case UI_ACTION_TYPES.SET_SUMMARY_WINDER_PRICE:
            return { ...state, summaryWinderPrice: action.payload.price };
        case UI_ACTION_TYPES.SET_SUMMARY_MOTOR_PRICE:
            return { ...state, summaryMotorPrice: action.payload.price };
        case UI_ACTION_TYPES.SET_SUMMARY_REMOTE_PRICE:
            return { ...state, summaryRemotePrice: action.payload.price };
        case UI_ACTION_TYPES.SET_SUMMARY_CHARGER_PRICE:
            return { ...state, summaryChargerPrice: action.payload.price };
        case UI_ACTION_TYPES.SET_SUMMARY_CORD_PRICE:
            return { ...state, summaryCordPrice: action.payload.price };
        case UI_ACTION_TYPES.SET_SUMMARY_ACCESSORIES_TOTAL:
            return { ...state, summaryAccessoriesTotal: action.payload.price };
        case UI_ACTION_TYPES.SET_F1_REMOTE_DISTRIBUTION:
            return { ...state, f1: { ...state.f1, remote_1ch_qty: action.payload.qty1, remote_16ch_qty: action.payload.qty16 } };
        case UI_ACTION_TYPES.SET_F1_DUAL_DISTRIBUTION:
            return { ...state, f1: { ...state.f1, dual_combo_qty: action.payload.comboQty, dual_slim_qty: action.payload.slimQty } };
        case UI_ACTION_TYPES.SET_F1_DISCOUNT_PERCENTAGE:
            return { ...state, f1: { ...state.f1, discountPercentage: action.payload.percentage } };
        case UI_ACTION_TYPES.SET_F2_VALUE: {
            const { key, value } = action.payload;
            if (state.f2.hasOwnProperty(key)) {
                return { ...state, f2: { ...state.f2, [key]: value } };
            }
            return state;
        }
        case UI_ACTION_TYPES.TOGGLE_F2_FEE_EXCLUSION: {
            const key = `${action.payload.feeType}FeeExcluded`;
            if (state.f2.hasOwnProperty(key)) {
                return { ...state, f2: { ...state.f2, [key]: !state.f2[key] } };
            }
            return state;
        }
        case UI_ACTION_TYPES.SET_SUM_OUTDATED:
            return { ...state, isSumOutdated: action.payload.isOutdated };
        case UI_ACTION_TYPES.RESET_UI:
            return JSON.parse(JSON.stringify(initialState.ui));
        default:
            return state;
    }
}